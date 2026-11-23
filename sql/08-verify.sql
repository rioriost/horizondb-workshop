\set ON_ERROR_STOP on
\pset pager off

SELECT current_database(), current_user;
SELECT count(*) AS products, count(embedding) AS embedded,
       min(vector_dims(embedding)) AS min_dimensions,
       max(vector_dims(embedding)) AS max_dimensions FROM workshop.products;
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'workshop' AND tablename = 'products';
SELECT alias, model_name, status FROM model_registry.model_list_all()
WHERE alias IN ('default-chat', 'default-embedding', 'default-reranker');
SELECT * FROM ai.status('workshop_embeddings');
SELECT count(*) AS chunks, count(embedding) AS embedded,
       min(vector_dims(embedding)) AS min_dimensions,
       max(vector_dims(embedding)) AS max_dimensions FROM workshop.pipeline_output;
SET search_path = ag_catalog, public;
SELECT * FROM ag_catalog.cypher('workshop_style', $$
    MATCH (p:Product) RETURN count(p)
$$) AS (products ag_catalog.agtype);
SET search_path = public;
