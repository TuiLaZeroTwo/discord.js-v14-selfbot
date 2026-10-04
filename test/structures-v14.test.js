'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { Collection } = require('@discordjs/collection');
const {
  ActivityInstance,
  ActivityLocation,
  Entitlement,
  InteractionCallback,
  InteractionCallbackResource,
  InteractionCallbackResponse,
  SKU,
  SKUFlags,
  SoundboardSound,
  Subscription,
} = require('../src');
const Client = require('../src/client/Client');
const GuildSoundboardSoundManager = require('../src/managers/GuildSoundboardSoundManager');
const buildRoute = require('../src/rest/APIRouter');

function makeSoundboardClient(soundId) {
  const requests = [];
  const client = {
    options: { makeCache: () => new Collection() },
    _cleanups: new Set(),
    _finalizers: { register() {} },
  };
  Object.defineProperty(client, 'api', {
    get: () =>
      buildRoute({
        versioned: true,
        request(method, url, options) {
          requests.push({ method, url, route: options.route, data: options.data });
          if (method === 'get' && !/soundboard-sounds\/\d/.test(url)) {
            return Promise.resolve({ items: [{ sound_id: soundId, name: 'boop', volume: 0.5 }] });
          }
          if (method === 'delete') return Promise.resolve();
          return Promise.resolve({ sound_id: soundId, name: 'boop', volume: 0.5 });
        },
      }),
  });
  return { client, requests };
}

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

test('InteractionCallback response structures map v14 fields', () => {
  const client = new Client({ intents: 0 });
  const callback = new InteractionCallback(client, {
    id: '123456789012345678',
    type: 2,
    activity_instance_id: 'instance-id',
    response_message_id: '223456789012345678',
    response_message_loading: true,
    response_message_ephemeral: false,
  });
  const resource = new InteractionCallbackResource(client, { type: 4, activity_instance: { id: 'instance-id' } });
  const response = new InteractionCallbackResponse(client, {
    interaction: { id: '123456789012345678', type: 2 },
    resource: { type: 4, activity_instance: { id: 'instance-id' } },
  });

  assert.equal(callback.type, 2);
  assert.equal(callback.activityInstanceId, 'instance-id');
  assert.equal(callback.responseMessageLoading, true);
  assert.ok(callback.createdTimestamp > 0);
  assert.equal(resource.type, 4);
  assert.equal(resource.activityInstance.id, 'instance-id');
  assert.ok(response.interaction instanceof InteractionCallback);
  assert.ok(response.resource instanceof InteractionCallbackResource);
  client.destroy();
});

test('v14 specialized select components and interactions are exported', () => {
  const api = require('../src');

  for (const name of [
    'BaseSelectMenuComponent',
    'ChannelSelectMenuComponent',
    'MentionableSelectMenuComponent',
    'RoleSelectMenuComponent',
    'StringSelectMenuComponent',
    'UserSelectMenuComponent',
  ]) {
    assert.equal(api[name], api.MessageSelectMenu);
  }

  for (const name of [
    'ChannelSelectMenuInteraction',
    'MentionableSelectMenuInteraction',
    'RoleSelectMenuInteraction',
    'StringSelectMenuInteraction',
    'UserSelectMenuInteraction',
  ]) {
    assert.equal(api[name], api.SelectMenuInteraction);
  }
});

test('ActivityLocation and ActivityInstance map v14 fields', () => {
  const client = new Client({ intents: 0 });
  const location = new ActivityLocation(client, {
    id: 'location-id',
    kind: 0,
    channel_id: '123456789012345678',
    guild_id: '223456789012345678',
  });
  const instance = new ActivityInstance(client, {
    application_id: '323456789012345678',
    instance_id: 'instance-id',
    launch_id: '423456789012345678',
    location: { id: 'location-id', kind: 0, channel_id: '123456789012345678' },
    users: ['523456789012345678'],
  });

  assert.equal(location.channelId, '123456789012345678');
  assert.equal(location.guildId, '223456789012345678');
  assert.equal(instance.applicationId, '323456789012345678');
  assert.equal(instance.instanceId, 'instance-id');
  assert.ok(instance.location instanceof ActivityLocation);
  assert.deepEqual(instance.users, ['523456789012345678']);
  client.destroy();
});

test('v14 error classes and PartialGroupDMChannel are exported', () => {
  const api = require('../src');
  const errors = require('../src/errors');

  assert.equal(api.DiscordjsError, errors.Error);
  assert.equal(api.DiscordjsTypeError, errors.TypeError);
  assert.equal(api.DiscordjsRangeError, errors.RangeError);
  assert.equal(api.PartialGroupDMChannel, api.GroupDMChannel);
});

test('v14 root util helpers and thread managers are exported', () => {
  const api = require('../src');

  assert.equal(api.flatten, api.Util.flatten);
  assert.equal(api.parseEmoji, api.Util.parseEmoji);
  assert.equal(api.resolveColor, api.Util.resolveColor);
  assert.equal(api.discordSort, api.Util.discordSort);
  assert.equal(api.cleanContent, api.Util.cleanContent);
  assert.equal(api.cleanCodeBlockContent, api.Util.cleanCodeBlockContent);
  assert.equal(api.verifyString, api.Util.verifyString);
  assert.equal(typeof api.GuildTextThreadManager, 'function');
  assert.equal(typeof api.GuildForumThreadManager, 'function');
});

test('GuildSoundboardSoundManager routes v14 soundboard endpoints', async () => {
  const soundId = '123456789012345678';
  const { client, requests } = makeSoundboardClient(soundId);
  const guild = { id: '323456789012345678', client };
  const manager = new GuildSoundboardSoundManager(guild);

  const sounds = await manager.fetch();
  assert.equal(sounds.size, 1);
  assert.equal(sounds.get(soundId).name, 'boop');

  const single = await manager.fetch({ soundboardSound: soundId, force: true });
  assert.equal(single.soundId, soundId);

  await manager.edit(soundId, { name: 'renamed' });
  await manager.delete(soundId, 'cleanup');

  assert.ok(requests.some(r => r.method === 'get' && r.route === '/guilds/:id/soundboard-sounds'));
  assert.ok(requests.some(r => r.method === 'get' && r.route === '/guilds/:id/soundboard-sounds/:id'));
  assert.ok(requests.some(r => r.method === 'patch' && r.route === '/guilds/:id/soundboard-sounds/:id'));
  assert.ok(requests.some(r => r.method === 'delete' && r.route === '/guilds/:id/soundboard-sounds/:id'));
});
