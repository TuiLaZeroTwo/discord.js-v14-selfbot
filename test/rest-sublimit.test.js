'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { setImmediate, setTimeout: delay } = require('node:timers/promises');
const { AsyncQueue } = require('@sapphire/async-queue');
const APIRequest = require('../src/rest/APIRequest');
const RESTManager = require('../src/rest/RESTManager');
const RequestHandler = require('../src/rest/RequestHandler');

test('handler stays active while sublimit queue has pending work', async () => {
  const handler = new RequestHandler({ client: { options: {} } });
  handler.sublimitedQueue = new AsyncQueue();
  await handler.sublimitedQueue.wait();

  assert.equal(handler._inactive, false);
  handler.sublimitedQueue.shift();
});

test('aborted REST request rejects while waiting for a route queue', async () => {
  const manager = {
    globalLimit: 50,
    globalRemaining: 50,
    globalReset: 0,
    globalDelay: null,
    client: {
      options: { restTimeOffset: 0, rejectOnRateLimit: null },
      listenerCount: () => 0,
      emit() {},
    },
  };
  const handler = new RequestHandler(manager);
  let releaseFirst;
  const firstRequest = {
    method: 'GET',
    path: '/channels/123/messages',
    route: '/channels/:id/messages',
    options: {},
    retries: 0,
    make: () => new Promise(resolve => (releaseFirst = resolve)),
  };
  const first = handler.push(firstRequest);
  await setImmediate();

  const controller = new AbortController();
  const secondRequest = {
    ...firstRequest,
    options: { signal: controller.signal },
  };
  const second = handler.push(secondRequest);
  controller.abort();

  await assert.rejects(
    Promise.race([
      second,
      delay(50).then(() => {
        throw new Error('request stayed queued');
      }),
    ]),
    error => error.message === 'Request aborted manually',
  );

  releaseFirst(new Response(null, { status: 204 }));
  await first;
});

test('sublimited request does not block unrelated route in same bucket', async () => {
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
  let patchAttempts = 0;
  let notifyPatchLimit;
  const patchLimited = new Promise(resolve => (notifyPatchLimit = resolve));
  APIRequest.prototype.make = async function make() {
    if (this.method === 'patch') {
      patchAttempts++;
      if (patchAttempts === 2 || patchAttempts === 3) {
        if (patchAttempts === 2) notifyPatchLimit();
        return new Response(JSON.stringify({ message: 'slow down' }), {
          status: 429,
          headers: {
            'content-type': 'application/json',
            'retry-after': '0.4',
            'x-ratelimit-bucket': 'shared-bucket',
          },
        });
      }
    }
    return new Response(null, { status: 204, headers: { 'x-ratelimit-bucket': 'shared-bucket' } });
  };

  try {
    const route = manager.api.channels('123456789012345678');
    await route.get();
    await route.patch({ data: { name: 'warm' } });
    const limited = route.patch({ data: { name: 'sublimited' } });
    await patchLimited;
    const startedAt = Date.now();
    await route.get();

    assert.ok(Date.now() - startedAt < 200);
    await limited;
  } finally {
    APIRequest.prototype.make = originalMake;
    clearInterval(manager.sweepInterval);
  }
});
