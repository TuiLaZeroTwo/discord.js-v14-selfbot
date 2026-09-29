'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { AuthorizingIntegrationOwners } = require('../src');
const Client = require('../src/client/Client');
const { Message } = require('../src/structures/Message');

test('message v14 role-subscription and shared-theme fields are camel-cased', () => {
  const client = new Client({ intents: 0 });
  const message = new Message(client, {
    id: '123456789012345678',
    channel_id: '223456789012345678',
    timestamp: '2024-01-01T00:00:00.000Z',
    role_subscription_data: {
      role_subscription_listing_id: '323456789012345678',
      tier_name: 'Gold',
      total_months_subscribed: 4,
      is_renewal: true,
    },
    shared_client_theme: {
      colors: ['#ffffff'],
      gradient_angle: 90,
      base_mix: 25,
      base_theme: 1,
    },
    interaction_metadata: {
      id: '423456789012345678',
      type: 2,
      user: { id: '523456789012345678', username: 'invoker' },
      authorizing_integration_owners: { 0: '623456789012345678', 1: '523456789012345678' },
      original_response_message_id: '723456789012345678',
      target_user: { id: '823456789012345678', username: 'target' },
      target_message_id: '923456789012345678',
      triggering_interaction_metadata: {
        id: '423456789012345679',
        type: 3,
        user: { id: '523456789012345678', username: 'invoker' },
        authorizing_integration_owners: { 1: '523456789012345678' },
      },
    },
  });

  assert.deepEqual(message.roleSubscriptionData, {
    roleSubscriptionListingId: '323456789012345678',
    tierName: 'Gold',
    totalMonthsSubscribed: 4,
    isRenewal: true,
  });
  assert.deepEqual(message.sharedClientTheme, {
    colors: ['#ffffff'],
    gradientAngle: 90,
    baseMix: 25,
    baseTheme: 1,
  });
  assert.equal(message.interactionMetadata.originalResponseMessageId, '723456789012345678');
  assert.equal(message.interactionMetadata.targetUser.id, '823456789012345678');
  assert.equal(message.interactionMetadata.authorizingIntegrationOwners.guildId, '623456789012345678');
  assert.equal(message.interactionMetadata.triggeringInteractionMetadata.id, '423456789012345679');
  assert.ok(message.interactionMetadata.authorizingIntegrationOwners instanceof AuthorizingIntegrationOwners);
  client.destroy();
});
