\set ON_ERROR_STOP on
\pset pager off
\encoding UTF8
\timing on

SELECT version(), current_database(), current_user;
SHOW transaction_read_only;

CREATE SCHEMA workshop;

CREATE TABLE workshop.products (
    id integer PRIMARY KEY,
    title text NOT NULL,
    title_ja text NOT NULL,
    category text NOT NULL CHECK (category IN
        ('seating', 'tables', 'lighting', 'rugs', 'storage', 'decor')),
    price numeric(10, 2) NOT NULL CHECK (price > 0),
    rating real NOT NULL CHECK (rating BETWEEN 0 AND 5),
    style text NOT NULL CHECK (style IN
        ('scandinavian', 'mid-century', 'industrial')),
    content text NOT NULL
);

COMMENT ON TABLE workshop.products IS 'Original fictional furniture catalog for the HorizonDB workshop.';
COMMENT ON COLUMN workshop.products.content IS 'English searchable description; Japanese display title is title_ja.';

\copy workshop.products FROM 'data/products.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')

SELECT count(*) AS products FROM workshop.products;
SELECT category, count(*) AS products, round(avg(price), 2) AS average_price
FROM workshop.products GROUP BY category ORDER BY category;

SELECT title_ja, price, rating FROM workshop.products
WHERE category = 'seating' AND price <= 200 ORDER BY rating DESC;

SELECT jsonb_build_object('name', title_ja, 'price', price) AS product
FROM workshop.products WHERE id = 1;

BEGIN;
CREATE TABLE workshop.orders (product_id integer REFERENCES workshop.products(id), quantity integer);
INSERT INTO workshop.orders VALUES (1, 2), (4, 1);
SELECT p.title_ja, o.quantity, p.price * o.quantity AS subtotal
FROM workshop.orders AS o JOIN workshop.products AS p ON p.id = o.product_id
ORDER BY p.id;
UPDATE workshop.products SET price = price + 10 WHERE id = 1;
SELECT price FROM workshop.products WHERE id = 1;
DELETE FROM workshop.orders WHERE product_id = 4;
ROLLBACK;
SELECT price AS restored_price FROM workshop.products WHERE id = 1;
