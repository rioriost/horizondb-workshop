import test from 'node:test';
import assert from 'node:assert/strict';
import { InputError, runAgent, selectPicks, validateBrief } from '../app/agent.mjs';

const chair = {
  id: 1, title: 'Reading chair', content: 'Comfortable chair', price: '180.00',
  rating: 4.7, category: 'seating', style: 'scandinavian', rank: 1,
};
const lamp = {
  id: 7, title: 'Reading lamp', content: 'Warm lamp', price: '90.00',
  rating: 4.7, category: 'lighting', style: 'scandinavian', rank: 2,
};

test('selection never exceeds budget and takes only the first ranked product per chosen category', () => {
  const duplicateChair = { ...chair, id: 2, rank: 3 };
  const result = selectPicks([chair, lamp, duplicateChair], 270, ['seating', 'lighting']);
  assert.deepEqual(result.products.map(product => product.id), [1, 7]);
  assert.equal(result.totalCost, 270);
  assert.deepEqual(selectPicks([chair, lamp], 269.99, ['seating', 'lighting']).products.map(product => product.id), [1]);
  assert.deepEqual(selectPicks([chair, lamp], 1000, ['lighting']).products.map(product => product.id), [7]);
});

test('invalid inputs are rejected instead of quietly using defaults', () => {
  for (const body of [{ budget: -1 }, { budget: Infinity }, { budget: '2000' },
    { theme: '' }, { priorities: [] }, { priorities: ['unsupported'] }]) {
    assert.throws(() => validateBrief(body), InputError);
  }
  assert.deepEqual(validateBrief({ priorities: ['seating', 'seating'] }).priorities, ['seating']);
});

function clientWithResponses(responses) {
  return {
    async query() {
      const response = responses.shift();
      if (response instanceof Error) throw response;
      assert.ok(response, 'unexpected extra database query');
      return { rows: response };
    },
  };
}

function responses(ranked = [{ id: 7, rank: 1, score: 0.9 }, { id: 1, rank: 2, score: 0.8 }]) {
  return [
    [{ analysis: { style: 'scandinavian', colors: ['cream'], gaps: ['chair'], mood: 'calm' } }],
    [{ column_name: 'content', comment: 'Search description' }],
    [chair, lamp].map(product => ({ ...product, match_type: 'vector+fulltext' })),
    [],
    [chair, lamp],
    ranked,
  ];
}

test('agent returns the actual six-stage trace and reranker order', async () => {
  const result = await runAgent(clientWithResponses(responses()),
    validateBrief({ budget: 2000, priorities: ['seating', 'lighting'] }));
  assert.equal(result.trace.length, 6);
  assert.deepEqual(result.products.map(product => product.id), [7, 1]);
  assert.equal(result.trace.at(-1).output.total_cost, 270);
});

test('model failures and incomplete reranking cannot produce success-shaped products', async () => {
  await assert.rejects(runAgent(clientWithResponses([new Error('model unavailable')]), validateBrief({})),
    /analyze_room_brief.*failed/);
  await assert.rejects(runAgent(clientWithResponses(responses([{ id: 7, rank: 1, score: 0.9 }])),
    validateBrief({})), /incomplete or invalid/);
});
