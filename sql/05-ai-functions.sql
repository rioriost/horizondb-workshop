\set ON_ERROR_STOP on
\timing on

WITH q AS MATERIALIZED (
    SELECT ai.embed(text => 'a comfortable chair for a bright reading corner',
                    model => 'default-embedding', dimensions => 1536)::vector AS embedding
), candidates AS MATERIALIZED (
    SELECT p.id, p.title_ja, p.content FROM workshop.products AS p CROSS JOIN q
    ORDER BY p.embedding <=> q.embedding LIMIT 10
), ranked AS (
    SELECT * FROM ai.rank(
        query => 'a comfortable chair for a bright reading corner',
        data => ARRAY(SELECT content FROM candidates ORDER BY id),
        ids => ARRAY(SELECT id FROM candidates ORDER BY id),
        top_n => 5, model => 'default-reranker'
    )
)
SELECT c.id, c.title_ja, r.rank, r.score
FROM ranked AS r JOIN candidates AS c ON c.id = r.id ORDER BY r.rank;

SELECT ai.extract(
    text => content,
    data => ARRAY['material: string - the main material',
                  'style: string - the interior design style'],
    model => 'default-chat'
) AS attributes FROM workshop.products WHERE id = 1;

SELECT ai.is_true(
    statement => 'This description mentions seating suitable for reading: ' || content,
    model => 'default-chat'
) AS suitable_for_reading FROM workshop.products WHERE id = 1;

SELECT ai.generate(
    prompt => '次の架空の商品情報だけを使い、読書コーナーへの提案理由を日本語で2文にしてください。情報にない機能は追加しないでください。' || content,
    model => 'default-chat',
    system_prompt => 'You are a furniture advisor. Use only the supplied catalog information.'
) AS recommendation FROM workshop.products WHERE id = 1;
