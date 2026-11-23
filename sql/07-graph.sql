\set ON_ERROR_STOP on
SET search_path = ag_catalog, public;

SELECT ag_catalog.create_graph('workshop_style');
SELECT * FROM ag_catalog.cypher('workshop_style', $$
    CREATE (:Style {name: 'scandinavian'}),
           (:Style {name: 'mid-century'}),
           (:Style {name: 'industrial'})
$$) AS (node ag_catalog.agtype);

DO $$
DECLARE
    product record;
    statement text;
BEGIN
    FOR product IN SELECT id, style FROM workshop.products ORDER BY id LOOP
        statement := format(
            'MATCH (s:Style {name: %s}) CREATE (:Product {id: %s})-[:HAS_STYLE]->(s)',
            to_json(product.style)::text, product.id
        );
        EXECUTE format(
            'SELECT * FROM ag_catalog.cypher(%L, $cypher$%s$cypher$) AS (node ag_catalog.agtype)',
            'workshop_style', statement
        );
    END LOOP;
END $$;

SELECT * FROM ag_catalog.cypher('workshop_style', $$
    MATCH (a:Style {name: 'scandinavian'}), (b:Style {name: 'mid-century'}),
          (c:Style {name: 'industrial'})
    CREATE (a)-[:SIMILAR_TO]->(b), (b)-[:SIMILAR_TO]->(c)
$$) AS (edge ag_catalog.agtype);

SELECT p.id, p.title_ja, p.category
FROM ag_catalog.cypher('workshop_style', $$
    MATCH (seed:Product {id: 1})-[:HAS_STYLE]->(s:Style)
          -[:SIMILAR_TO]-(related:Style)<-[:HAS_STYLE]-(rec:Product)
    RETURN DISTINCT rec.id
$$) AS g(id ag_catalog.agtype)
JOIN workshop.products AS p ON p.id = (g.id::text)::integer
ORDER BY p.id;

SELECT * FROM ag_catalog.cypher('workshop_style', $$
    MATCH (p:Product) RETURN count(p)
$$) AS (products ag_catalog.agtype);
SET search_path = public;
