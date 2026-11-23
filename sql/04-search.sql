\set ON_ERROR_STOP on
\timing on
\set query '明るい部屋の読書コーナーに合う北欧風の椅子'

WITH q AS MATERIALIZED (
    SELECT ai.embed(text => :'query', model => 'default-embedding',
                    dimensions => 1536)::vector AS embedding
)
SELECT p.id, p.title_ja, p.embedding <=> q.embedding AS cosine_distance
FROM workshop.products AS p CROSS JOIN q
ORDER BY p.embedding <=> q.embedding LIMIT 5;

SELECT p.id, p.title_ja, s.match_type, s.score
FROM ai.search(
    query => 'reading chair', source_table => 'workshop.products',
    search_type => 'fulltext', content_column => 'content',
    top_k => 5, rerank => false
) AS s JOIN workshop.products AS p ON p.ctid = s.ctid
ORDER BY s.score DESC, p.id;

SELECT p.id, p.title_ja, s.match_type, s.score
FROM ai.search(
    query => 'comfortable reading chair in a bright Scandinavian room',
    source_table => 'workshop.products', search_type => 'hybrid',
    content_column => 'content', embedding_column => 'embedding',
    embedding_model => 'default-embedding', top_k => 5, rerank => false
) AS s JOIN workshop.products AS p ON p.ctid = s.ctid
ORDER BY s.score DESC, p.id;

SELECT p.id, p.title_ja, s.match_type, s.score
FROM ai.search(
    query => 'comfortable reading chair in a bright Scandinavian room',
    source_table => 'workshop.products', search_type => 'hybrid',
    content_column => 'content', embedding_column => 'embedding',
    embedding_model => 'default-embedding', rerank_model => 'default-reranker',
    top_k => 5, rerank => true
) AS s JOIN workshop.products AS p ON p.ctid = s.ctid
ORDER BY s.score DESC, p.id;

SELECT p.id, p.title_ja, p.price, s.score
FROM ai.search(
    query => 'comfortable reading chair', source_table => 'workshop.products',
    search_type => 'hybrid', top_k => 18, rerank => false
) AS s JOIN workshop.products AS p ON p.ctid = s.ctid
WHERE p.category = 'seating' AND p.price <= 200
ORDER BY s.score DESC, p.id LIMIT 3;
