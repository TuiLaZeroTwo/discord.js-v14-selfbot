'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const APIRequest = require('../src/rest/APIRequest');
const buildRoute = require('../src/rest/APIRouter');
const RESTManager = require('../src/rest/RESTManager');

function captureRoute(callback) {
  let request;
  const route = buildRoute({
    versioned: true,
    request(...args) {
      request = args;
      return args;
    },
  });
  callback(route);
  return request;
}

test('route buckets retain channel and guild IDs only as major parameters', () => {
  const channel = captureRoute(route => route.channels('123456789012345678').messages('223456789012345678').get());
  const guild = captureRoute(route => route.guilds('123456789012345678').members('223456789012345678').get());

  assert.equal(channel[2].route, '/channels/:id/messages/:id');
  assert.equal(guild[2].route, '/guilds/:id/members/:id');
  assert.equal(channel[2].majorParameter, '123456789012345678');
  assert.equal(guild[2].majorParameter, '123456789012345678');
});

test('all reaction routes share same route bucket', () => {
  const first = captureRoute(route =>
    route.channels('123456789012345678').messages('223456789012345678').reactions('🔥').get(),
  );
  const second = captureRoute(route =>
    route
      .channels('123456789012345678')
      .messages('223456789012345678')
      .reactions('✅')
      .users('323456789012345678')
      .get(),
  );

  assert.equal(first[2].route, '/channels/:id/messages/:id/reactions/:reaction');
  assert.equal(second[2].route, first[2].route);
});

test('webhook token remains part of major parameter', () => {
  const request = captureRoute(route =>
    route.webhooks('123456789012345678', 'secret-token').messages('223456789012345678').get(),
  );

  assert.equal(request[2].route, '/webhooks/:id/:token/messages/:id');
  assert.equal(request[2].majorParameter, '123456789012345678/secret-token');
});

test('routes sharing server bucket hash reuse handler per major parameter', async () => {
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
    listenerCount: () => 0,
    emit() {},
  };
  const manager = new RESTManager(client);
  const originalMake = APIRequest.prototype.make;
  APIRequest.prototype.make = async () =>
    new Response(null, { status: 204, headers: { 'x-ratelimit-bucket': 'shared-bucket' } });

  try {
    await manager.api.channels('123456789012345678').messages.get();
    await manager.api.channels('123456789012345678').pins.get();
    assert.equal(manager.handlers.has('Global(get:/channels/:id/messages):123456789012345678'), true);
    assert.equal(manager.handlers.has('Global(get:/channels/:id/pins):123456789012345678'), true);

    await manager.api.channels('123456789012345678').pins.get();

    assert.equal(manager.handlers.has('shared-bucket:123456789012345678'), true);
    assert.equal(manager.hashes.get('get:/channels/:id/pins'), 'shared-bucket');
  } finally {
    APIRequest.prototype.make = originalMake;
    clearInterval(manager.sweepInterval);
  }
});
