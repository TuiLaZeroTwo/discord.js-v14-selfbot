'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const Client = require('../src/client/Client');
const WebSocketShard = require('../src/client/websocket/WebSocketShard');
const Intents = require('../src/util/Intents');

test('identify payload includes v14 intents and shard data with selfbot state', () => {
  let payload;
  const client = {
    token: 'user-token',
    options: {
      intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_MESSAGES,
      shards: [2],
      shardCount: 4,
      ws: {
        capabilities: 0,
        properties: { os: 'Windows', browser: 'Discord Client' },
        client_state: { guild_versions: { '123456789012345678': 1 } },
        compress: false,
        version: 9,
        agent: {},
      },
    },
  };
  const shard = Object.create(WebSocketShard.prototype);
  shard.manager = { client };
  shard.id = 2;
  shard.debug = () => {};
  shard.send = packet => {
    payload = packet;
  };

  shard.identifyNew();

  assert.equal(payload.op, 2);
  assert.equal(payload.d.token, 'user-token');
  assert.equal(payload.d.intents, client.options.intents);
  assert.deepEqual(payload.d.shard, [2, 4]);
  assert.equal(payload.d.capabilities, 0);
  assert.deepEqual(payload.d.client_state, client.options.ws.client_state);
  assert.equal(payload.d.version, undefined);
  assert.equal(payload.d.agent, undefined);
});

test('client retains configured v14 intents', () => {
  const client = new Client({ intents: 0 });

  assert.equal(client.options.intents, 0);
  client.destroy();
});
