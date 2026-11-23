\set ON_ERROR_STOP on
\pset pager off

SHOW azure.extensions;
SHOW shared_preload_libraries;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_diskann;
CREATE EXTENSION IF NOT EXISTS pg_textsearch;
CREATE EXTENSION IF NOT EXISTS azure_ai;
CREATE EXTENSION IF NOT EXISTS pg_durable;
CREATE EXTENSION IF NOT EXISTS age;

SELECT extname, extversion FROM pg_extension ORDER BY extname;
SELECT alias, model_name, status FROM model_registry.model_list_all()
WHERE alias IN ('default-embedding', 'default-reranker', 'default-chat');

SELECT p.oid::regprocedure AS signature, pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc AS p JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'ai' AND p.proname IN
    ('embed', 'rank', 'generate', 'extract', 'is_true', 'search', 'embed_step', 'create_pipeline');

DO $$
DECLARE
    installed text;
BEGIN
    SELECT extversion INTO installed FROM pg_extension WHERE extname = 'azure_ai';
    IF string_to_array(installed, '.')::integer[] < ARRAY[2, 5, 6] THEN
        RAISE EXCEPTION 'azure_ai >= 2.5.6 required; installed: %. See the migration guide.', installed;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc AS p JOIN pg_namespace AS n ON n.oid = p.pronamespace
        WHERE n.nspname = 'ai' AND p.proname = 'search'
          AND p.proargnames @> ARRAY['embedding_model', 'rerank_model', 'ctid']
    ) THEN
        RAISE EXCEPTION 'Native ai.search with the documented ctid API is required. Ask the instructor to check service availability.';
    END IF;
    IF (SELECT count(*) FROM model_registry.model_list_all()
        WHERE alias IN ('default-embedding', 'default-reranker', 'default-chat')) <> 3 THEN
        RAISE EXCEPTION 'Enable AI Model Management and wait for all three managed models.';
    END IF;
END $$;

ALTER TABLE workshop.products ADD COLUMN embedding vector(1536);
