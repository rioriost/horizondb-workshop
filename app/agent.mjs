export const categories = ['seating', 'tables', 'lighting', 'rugs', 'storage', 'decor'];

export class InputError extends Error {
  status = 400;
}

export function validateBrief(body) {
  const { theme = 'scandinavian', budget = 2000, priorities = categories } = body;
  if (typeof theme !== 'string' || !theme.trim() || theme.length > 80) {
    throw new InputError('Theme must contain between 1 and 80 characters.');
  }
  if (typeof budget !== 'number' || !Number.isFinite(budget) || budget < 1 || budget > 10000) {
    throw new InputError('Budget must be between 1 and 10000 USD.');
  }
  if (!Array.isArray(priorities) || priorities.length === 0
      || priorities.some(category => !categories.includes(category))) {
    throw new InputError('Choose at least one supported furniture category.');
  }
  return { theme: theme.trim(), budget, priorities: [...new Set(priorities)] };
}

export function selectPicks(rankedProducts, budget, priorities) {
  const picks = [];
  const selectedCategories = new Set();
  const budgetCents = Math.round(budget * 100);
  let totalCents = 0;
  for (const product of rankedProducts) {
    const priceCents = Math.round(Number(product.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      throw new Error(`Invalid catalog price for product ${product.id}.`);
    }
    if (!priorities.includes(product.category) || selectedCategories.has(product.category)
        || totalCents + priceCents > budgetCents) continue;
    picks.push({
      id: product.id,
      name: product.title,
      brand: 'Zava Workshop',
      price: priceCents / 100,
      category: product.category,
      rating: product.rating,
      reviews: 0,
      image: '/sample-product.svg',
      reason: `AI rerank position ${product.rank}; fictional ${product.style} catalog product.`,
    });
    selectedCategories.add(product.category);
    totalCents += priceCents;
  }
  return { products: picks, totalCost: totalCents / 100 };
}

const roomSchema = {
  name: 'room_brief',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      style: { type: 'string' },
      colors: { type: 'array', items: { type: 'string' } },
      gaps: { type: 'array', items: { type: 'string' } },
      mood: { type: 'string' },
    },
    required: ['style', 'colors', 'gaps', 'mood'],
    additionalProperties: false,
  },
};

export async function runAgent(client, brief) {
  const trace = [];
  async function step(tool, sql, params, input, describe) {
    const started = performance.now();
    try {
      const { rows } = await client.query(sql, params);
      trace.push({
        tool, sql, input, output: describe(rows),
        duration: Math.round(performance.now() - started),
      });
      return rows;
    } catch (cause) {
      throw new Error(`Stage "${tool}" failed. Check database setup, managed models and server logs.`, { cause });
    }
  }

  const analysisRows = await step('analyze_room_brief', `
    SELECT ai.generate(
      prompt => $1, json_schema => $2::jsonb, model => 'default-chat',
      system_prompt => 'Create an English interior design brief from text only. Do not claim to see a photo.'
    ) AS analysis
  `, [`Style: ${brief.theme}. Furnish a living room with ${brief.priorities.join(', ')}.`,
    JSON.stringify(roomSchema)], { theme: brief.theme, mode: 'text-only; no image inference' },
  rows => rows[0].analysis);
  const analysis = analysisRows[0].analysis;
  if (!analysis || typeof analysis.style !== 'string' || !Array.isArray(analysis.colors)
      || !Array.isArray(analysis.gaps) || typeof analysis.mood !== 'string') {
    throw new Error('Managed chat model returned an invalid room brief.');
  }
  const roomDescription = `${analysis.style}; ${analysis.colors.join(' ')}; ${analysis.mood}`;
  const searchQuery = `${brief.theme} ${roomDescription} living room furniture`;

  await step('get_semantic_context', `
    SELECT a.attname AS column_name,
           pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
           col_description(a.attrelid, a.attnum) AS comment
    FROM pg_attribute AS a
    WHERE a.attrelid = 'workshop.products'::regclass
      AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum
  `, [], { table: 'workshop.products' }, rows => ({
    columns_inspected: rows.length,
    key_columns: rows.filter(row => row.comment).map(row => `${row.column_name}: ${row.comment}`),
  }));

  const retrieved = await step('hybrid_search_products', `
    SELECT p.*, s.match_type, s.score
    FROM ai.search(
      query => $1, source_table => 'workshop.products', search_type => 'hybrid',
      content_column => 'content', embedding_column => 'embedding',
      embedding_model => 'default-embedding', top_k => 18, rerank => false
    ) AS s JOIN workshop.products AS p ON p.ctid = s.ctid
    ORDER BY s.score DESC, p.id
  `, [searchQuery], { query: searchQuery, rerank: false, top_k: 18 },
  rows => ({
    total_results: rows.length,
    match_types: [...new Set(rows.map(row => row.match_type))],
    method: 'BM25 + DiskANN + RRF; ai.rank runs at the final stage',
  }));
  if (retrieved.length === 0) throw new Error('Hybrid search returned no candidates. Check embeddings and indexes.');

  const seedIds = retrieved.slice(0, 5).map(row => row.id);
  if (seedIds.some(id => !Number.isSafeInteger(id) || id < 1)) {
    throw new Error('Graph seeds must be positive integer catalog IDs.');
  }
  // AGE requires a constant Cypher string; only validated integer IDs are interpolated.
  const related = await step('find_related_products_graph', `
    SELECT p.* FROM ag_catalog.cypher('workshop_style', $cypher$
      MATCH (seed:Product)-[:HAS_STYLE]->(s:Style)
            -[:SIMILAR_TO]-(related:Style)<-[:HAS_STYLE]-(rec:Product)
      WHERE seed.id IN [${seedIds.join(',')}] AND NOT rec.id IN [${seedIds.join(',')}]
      RETURN DISTINCT rec.id
    $cypher$) AS g(id ag_catalog.agtype)
    JOIN workshop.products AS p ON p.id = (g.id::text)::integer
    ORDER BY p.id
  `, [], { source_product_ids: seedIds }, rows => ({
    related_found: rows.length, method: 'Actual Apache AGE SIMILAR_TO graph traversal',
  }));

  const ids = [...new Set([...retrieved, ...related].map(row => row.id))];
  const eligible = await step('filter_products', `
    SELECT id, title, price, rating, category, style, content FROM workshop.products
    WHERE id = ANY($1::integer[]) AND category = ANY($2::text[])
      AND price <= $3 AND rating >= 4.0 ORDER BY id
  `, [ids, brief.priorities, brief.budget / brief.priorities.length],
  { budget: brief.budget, categories: brief.priorities, min_rating: 4.0 },
  rows => ({ matched: rows.length, filtered_out: ids.length - rows.length }));
  if (eligible.length === 0) {
    throw new InputError('No catalog products fit this budget and category selection. Increase the budget.');
  }

  const ranked = await step('curate_room_picks', `
    SELECT * FROM ai.rank(
      query => $1, data => $2::text[], ids => $3::integer[], model => 'default-reranker'
    ) ORDER BY rank
  `, [roomDescription, eligible.map(row => row.content), eligible.map(row => row.id)],
  { candidates: eligible.length, room_style: roomDescription },
  rows => ({ ranked_candidates: rows.length, method: 'Managed semantic reranker; no boosted IDs' }));
  const catalog = new Map(eligible.map(row => [row.id, row]));
  if (ranked.length !== eligible.length || new Set(ranked.map(row => row.id)).size !== eligible.length
      || ranked.some(row => !catalog.has(row.id) || !Number.isFinite(Number(row.score)))) {
    throw new Error('Reranker returned an incomplete or invalid candidate set.');
  }
  const selection = selectPicks(ranked.map(row => ({ ...catalog.get(row.id), rank: row.rank })),
    brief.budget, brief.priorities);
  if (selection.products.length === 0) throw new InputError('No products fit the budget.');
  trace.at(-1).output = {
    ...trace.at(-1).output,
    final_picks: selection.products.length,
    total_cost: selection.totalCost,
  };
  return { products: selection.products, trace, searchQuery, roomDescription };
}
