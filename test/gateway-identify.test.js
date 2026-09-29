'use strict';

const assert = require('node:assert/strict');
const EventEmitter = require('node:events');
const test = require('node:test');
const { Collection } = require('@discordjs/collection');
const Client = require('../src/client/Client');
const WebSocketManager = require('../src/client/websocket/WebSocketManager');
const WebSocketShard = require('../src/client/websocket/WebSocketShard');
const { Events, ShardEvents } = require('../src/util/Constants');
const Intents = require('../src/util/Intents');
const Options = require('../src/util/Options');

test('default gateway version is v10', () => {
  assert.equal(Options.createDefault().ws.version, 10);
});

test('intent flags include v14 moderation, expression, and poll intents', () => {
  assert.equal(Intents.FLAGS.GUILD_MODERATION, 1 << 2);
  assert.equal(Intents.FLAGS.GUILD_EXPRESSIONS, 1 << 3);
  assert.equal(Intents.FLAGS.GUILD_MESSAGE_POLLS, 1 << 24);
  assert.equal(Intents.FLAGS.DIRECT_MESSAGE_POLLS, 1 << 25);
  assert.ok(Intents.ALL & Intents.FLAGS.DIRECT_MESSAGE_POLLS);
});

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

test('invalid gateway API version disconnects without reconnect loop', async () => {
  const manager = Object.create(WebSocketManager.prototype);
  const shard = new EventEmitter();
  Object.assign(shard, { id: 0, eventsAttached: false, sessionId: 'session', connect: async () => {} });
  const client = new EventEmitter();
  const disconnected = [];
  let reconnects = 0;
  client.on(Events.SHARD_DISCONNECT, (...args) => disconnected.push(args));
  Object.assign(manager, {
    client,
    shardQueue: new Set([shard]),
    shards: new Collection(),
    debug() {},
    reconnect() {
      reconnects++;
    },
    checkShardsReady() {},
  });

  await manager.createShards();
  shard.emit(ShardEvents.CLOSE, { code: 4012 });

  assert.equal(disconnected.length, 1);
  assert.equal(reconnects, 0);
});

test('not-authenticated close clears session before reconnect', async () => {
  const manager = Object.create(WebSocketManager.prototype);
  const shard = new EventEmitter();
  Object.assign(shard, { id: 0, eventsAttached: false, sessionId: 'stale', connect: async () => {} });
  Object.assign(manager, {
    client: new EventEmitter(),
    shardQueue: new Set([shard]),
    shards: new Collection(),
    debug() {},
    reconnect() {},
    checkShardsReady() {},
  });

  await manager.createShards();
  shard.emit(ShardEvents.CLOSE, { code: 4003 });

  assert.equal(shard.sessionId, null);
});
