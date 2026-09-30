'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { Entitlement, SKU, SKUFlags, SoundboardSound, Subscription } = require('../src');
const Client = require('../src/client/Client');

test('Entitlement maps v14 fields and activity helpers', () => {
  const client = new Client({ intents: 0 });
  const entitlement = new Entitlement(client, {
    id: '123456789012345678',
    sku_id: '223456789012345678',
    user_id: '323456789012345678',
    guild_id: '423456789012345678',
    application_id: '523456789012345678',
    type: 8,
    deleted: false,
    starts_at: '2024-01-01T00:00:00.000Z',
    ends_at: '2024-02-01T00:00:00.000Z',
    consumed: false,
  });

  assert.equal(entitlement.skuId, '223456789012345678');
  assert.equal(entitlement.userId, '323456789012345678');
  assert.equal(entitlement.guildId, '423456789012345678');
  assert.equal(entitlement.type, 8);
  assert.equal(entitlement.isTest(), false);
  assert.equal(entitlement.isGuildSubscription(), true);
  assert.equal(entitlement.isUserSubscription(), false);
  assert.ok(entitlement.startsAt instanceof Date);
  assert.equal(entitlement.isActive(), false);
  client.destroy();
});

test('Entitlement test entitlement has null start and counts as test', () => {
  const client = new Client({ intents: 0 });
  const entitlement = new Entitlement(client, {
    id: '123456789012345678',
    sku_id: '223456789012345678',
    user_id: '323456789012345678',
    application_id: '523456789012345678',
    type: 4,
  });

  assert.equal(entitlement.guildId, null);
  assert.equal(entitlement.startsTimestamp, null);
  assert.equal(entitlement.isTest(), true);
  assert.equal(entitlement.isUserSubscription(), true);
  client.destroy();
});

test('SKU maps v14 fields and flags', () => {
  const client = new Client({ intents: 0 });
  const sku = new SKU(client, {
    id: '123456789012345678',
    type: 5,
    application_id: '223456789012345678',
    name: 'Premium',
    slug: 'premium',
    flags: SKUFlags.FLAGS.GUILD_SUBSCRIPTION | SKUFlags.FLAGS.USER_SUBSCRIPTION,
  });

  assert.equal(sku.type, 5);
  assert.equal(sku.name, 'Premium');
  assert.equal(sku.slug, 'premium');
  assert.equal(sku.flags.has(SKUFlags.FLAGS.GUILD_SUBSCRIPTION), true);
  assert.equal(sku.flags.has(SKUFlags.FLAGS.USER_SUBSCRIPTION), true);
  client.destroy();
});

test('Subscription maps v14 period and status fields', () => {
  const client = new Client({ intents: 0 });
  const subscription = new Subscription(client, {
    id: '123456789012345678',
    user_id: '223456789012345678',
    sku_ids: ['323456789012345678'],
    entitlement_ids: ['423456789012345678'],
    current_period_start: '2024-01-01T00:00:00.000Z',
    current_period_end: '2024-02-01T00:00:00.000Z',
    status: 0,
    renewal_sku_ids: ['323456789012345678'],
    canceled_at: '2024-01-15T00:00:00.000Z',
    country: 'US',
  });

  assert.equal(subscription.userId, '223456789012345678');
  assert.deepEqual(subscription.skuIds, ['323456789012345678']);
  assert.equal(subscription.status, 0);
  assert.equal(subscription.country, 'US');
  assert.ok(subscription.currentPeriodStartAt instanceof Date);
  assert.ok(subscription.canceledAt instanceof Date);
  client.destroy();
});

test('SoundboardSound maps v14 fields and equals raw payload', () => {
  const client = new Client({ intents: 0 });
  const data = {
    sound_id: '123456789012345678',
    name: 'boop',
    volume: 0.5,
    emoji_id: '223456789012345678',
    emoji_name: 'boop',
    guild_id: '323456789012345678',
    available: true,
  };
  const sound = new SoundboardSound(client, data);

  assert.equal(sound.soundId, '123456789012345678');
  assert.equal(sound.name, 'boop');
  assert.equal(sound.volume, 0.5);
  assert.equal(sound.guildId, '323456789012345678');
  assert.equal(sound.available, true);
  assert.ok(sound.createdTimestamp > 0);
  assert.equal(sound.equals(data), true);
  client.destroy();
});
