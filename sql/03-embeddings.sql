\set ON_ERROR_STOP on
\timing on

SELECT array_length(ai.embed(
    text => '明るい読書コーナーに置く小さな椅子',
    model => 'default-embedding', dimensions => 1536
), 1) AS embedding_dimensions;

SELECT array_length(embedding, 1) AS embedding_dimensions
FROM ai.embed(
    text => ARRAY['A comfortable reading chair', 'A warm reading lamp'],
    model => 'default-embedding', dimensions => 1536
);

UPDATE workshop.products
SET embedding = ai.embed(
    text => content, model => 'default-embedding', dimensions => 1536
)::vector(1536)
WHERE embedding IS NULL;

CREATE INDEX products_embedding_diskann_idx ON workshop.products
USING diskann (embedding vector_cosine_ops);
CREATE INDEX products_content_bm25_idx ON workshop.products
USING bm25 (content) WITH (text_config = 'english');
ANALYZE workshop.products;

SELECT count(*) AS products, count(embedding) AS embedded,
       min(vector_dims(embedding)) AS min_dimensions,
       max(vector_dims(embedding)) AS max_dimensions
FROM workshop.products;

DO $$
BEGIN
    IF (SELECT count(*) FROM workshop.products
        WHERE embedding IS NOT NULL AND vector_dims(embedding) = 1536) <> 18 THEN
        RAISE EXCEPTION 'Expected all 18 products to have 1536-dimensional embeddings.';
    END IF;
END $$;
