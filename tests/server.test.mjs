import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../app/server.mjs';

async function serve(t, pool) {
  const server = createApp(pool).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  return `http://127.0.0.1:${server.address().port}`;
}

test('health reports incomplete database setup as unavailable', async t => {
  const base = await serve(t, {
    async query() { return { rows: [{ products: '18', embedded: '17', graph_ready: true }] }; },
  });
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).status, 'incomplete');
});

test('API validates input and exposes database failure without mock results or secret leakage', async t => {
  t.mock.method(console, 'error', () => {});
  const base = await serve(t, {
    async connect() { throw new Error('private-connection-detail'); },
  });
  const request = body => fetch(`${base}/api/design-room`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const invalid = await request({ budget: -1 });
  assert.equal(invalid.status, 400);
  const failed = await request({ budget: 2000 });
  assert.equal(failed.status, 500);
  const body = await failed.json();
  assert.match(body.error, /Database or AI request failed/);
  assert.equal(body.products, undefined);
  assert.ok(!JSON.stringify(body).includes('private-connection-detail'));
});
