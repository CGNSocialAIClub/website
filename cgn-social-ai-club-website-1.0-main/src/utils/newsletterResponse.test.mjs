import test from 'node:test';
import assert from 'node:assert/strict';
import { readNewsletterResponse, requestNewsletterConfirmation } from './newsletterResponse.mjs';

test('empty, HTML and malformed API responses report an unavailable service', async () => {
  for (const body of ['', '<html>Preview</html>', '{', 'null', '[]', '{}']) {
    for (const status of [200, 404, 503]) {
      await assert.rejects(readNewsletterResponse(new Response(body, { status }), 'Service unavailable'), { message: 'Service unavailable' });
    }
  }
});

test('valid API responses retain success messages and actionable API errors', async () => {
  assert.equal((await readNewsletterResponse(Response.json({ message: 'Check your inbox' }, { status: 202 }), 'Unavailable')).message, 'Check your inbox');
  await assert.rejects(readNewsletterResponse(Response.json({ error: 'Please wait before retrying.' }, { status: 429 }), 'Unavailable'), { message: 'Please wait before retrying.' });
});


test('automatic confirmation shares concurrent requests and allows retry after failure', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  let resolve;
  globalThis.fetch = () => { calls++; return new Promise(done => { resolve = done; }); };
  try {
    const first = requestNewsletterConfirmation('mock-token', 'Unavailable');
    const second = requestNewsletterConfirmation('mock-token', 'Unavailable');
    assert.equal(first, second);
    assert.equal(calls, 1);
    resolve(Response.json({ error: 'Could not save' }, { status: 503 }));
    await assert.rejects(first, { message: 'Could not save' });
    const retry = requestNewsletterConfirmation('mock-token', 'Unavailable');
    assert.equal(calls, 2);
    resolve(Response.json({ message: 'Confirmed' }));
    assert.equal((await retry).message, 'Confirmed');
  } finally { globalThis.fetch = original; }
});
