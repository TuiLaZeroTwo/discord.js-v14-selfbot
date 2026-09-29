'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const APIRequest = require('../src/rest/APIRequest');
const RESTManager = require('../src/rest/RESTManager');
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

test('429 response scope reaches RateLimitError', async () => {
  const client = {
    token: 'token',
    options: {
      restGlobalRateLimit: 50,
      restSweepInterval: 0,
      restTimeOffset: 0,
      retryLimit: 0,
      invalidRequestWarningInterval: 0,
      rejectOnRateLimit: () => true,
      http: {
        api: 'https://discord.com/api',
        cdn: 'https://cdn.discordapp.com',
        version: 10,
        headers: { 'User-Agent': 'test' },
      },
      ws: { properties: {} },
    },
    listenerCount: () => 0,
    emit() {},
  };
  const manager = new RESTManager(client);
  const originalMake = APIRequest.prototype.make;
  APIRequest.prototype.make = async () =>
    new Response(JSON.stringify({ message: 'rate limited' }), {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': '0.1',
        'x-ratelimit-scope': 'shared',
      },
    });

  try {
    await assert.rejects(manager.api.channels('123456789012345678').get(), error => {
      assert.ok(error instanceof RateLimitError);
      assert.equal(error.scope, 'shared');
      return true;
    });
  } finally {
    APIRequest.prototype.make = originalMake;
    clearInterval(manager.sweepInterval);
  }
});

test('preemptive rateLimit event retains learned rate limit scope', async () => {
  const client = {
    token: 'token',
    options: {
      restGlobalRateLimit: 50,
      restSweepInterval: 0,
      restTimeOffset: 0,
      retryLimit: 0,
      invalidRequestWarningInterval: 0,
      http: {
        api: 'https://discord.com/api',
        cdn: 'https://cdn.discordapp.com',
        version: 10,
        headers: { 'User-Agent': 'test' },
      },
      ws: { properties: {} },
    },
    listenerCount: event => (event === 'rateLimit' ? 1 : 0),
    emit(event, data) {
      if (event === 'rateLimit') this.lastRateLimit = data;
    },
  };
  const manager = new RESTManager(client);
  const originalMake = APIRequest.prototype.make;
  APIRequest.prototype.make = async () =>
    new Response(null, {
      status: 204,
      headers: {
        'x-ratelimit-limit': '1',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset-after': '0.5',
        'x-ratelimit-scope': 'shared',
      },
    });

  try {
    const route = manager.api.channels('123456789012345678');
    await route.get();
    await route.get();

    assert.equal(client.lastRateLimit.scope, 'shared');
  } finally {
    APIRequest.prototype.make = originalMake;
    clearInterval(manager.sweepInterval);
  }
});
