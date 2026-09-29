'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const RateLimitError = require('../src/rest/RateLimitError');

test('RateLimitError exposes v14 rate limit scope', () => {
  const error = new RateLimitError({
    timeout: 1_000,
    limit: 5,
    method: 'POST',
    path: '/channels/123/messages',
    route: '/channels/:id/messages',
    global: false,
    scope: 'shared',
  });

  assert.equal(error.scope, 'shared');
});
