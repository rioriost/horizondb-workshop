import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('the provided PostgreSQL exercise imports the CSV and preserves rollback behavior', async () => {
  const db = new PGlite();
  try {
    const csv = await readFile(new URL('../data/products.csv', import.meta.url), 'utf8');
    const source = await readFile(new URL('../sql/01-postgresql.sql', import.meta.url), 'utf8');
    const [setup, exercise] = source.split(/^\\copy.*$/m);
    await db.exec(setup.replace(/^\\.*$/gm, ''));
    await db.exec("COPY workshop.products FROM '/dev/blob' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');",
      { blob: new Blob([csv]) });
    const results = await db.exec(exercise.replace(/^\\.*$/gm, ''));
    assert.equal(results.at(-1).rows[0].restored_price, '180.00');
    const grouped = results.find(result => result.rows[0]?.average_price !== undefined).rows;
    assert.equal(grouped.length, 6);
    assert.ok(grouped.every(row => row.products === 3));
    const joined = results.find(result => result.rows[0]?.subtotal !== undefined).rows;
    assert.deepEqual(joined.map(row => row.subtotal), ['360.00', '120.00']);
    const json = results.find(result => result.rows[0]?.product !== undefined).rows[0].product;
    assert.deepEqual(json, { name: 'オークの読書チェア', price: 180 });
    assert.equal((await db.query("SELECT to_regclass('workshop.orders') AS orders")).rows[0].orders, null);
  } finally {
    await db.close();
  }
});
