\set ON_ERROR_STOP on

CREATE TABLE workshop.pipeline_source (
    id integer PRIMARY KEY,
    content text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO workshop.pipeline_source (id, content)
SELECT id, content FROM workshop.products WHERE id <= 3;

SELECT ai.create_pipeline(
    name => 'workshop_embeddings',
    source => ai.table_source(
        table_name => 'pipeline_source', schema_name => 'workshop',
        incremental_column => 'updated_at'
    ),
    steps => ARRAY[
        ai.chunk_step(input => 'content', chunk_size => 512, overlap => 64),
        ai.embed_step(input => 'chunk_text', model => 'default-embedding', dimensions => 1536)
    ],
    sink => ai.table_sink(table_name => 'pipeline_output', schema_name => 'workshop'),
    trigger => 'manual'
);
SELECT ai.explain('workshop_embeddings');
SELECT ai.run('workshop_embeddings');
SELECT * FROM ai.status('workshop_embeddings');
