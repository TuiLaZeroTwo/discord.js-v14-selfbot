'use strict';

const { Collection } = require('@discordjs/collection');
const CachedManager = require('./CachedManager');
const { TypeError } = require('../errors');
const SKU = require('../structures/SKU');
const Subscription = require('../structures/Subscription');

function resolveSKUId(sku) {
  if (sku instanceof SKU) return sku.id;
  if (typeof sku === 'string') return sku;
  return null;
}

/**
 * Manages API methods for subscriptions and stores their cache.
 *
 * <info>Subscriptions are application-owned and require an application context
 * (available to bot accounts). Plain user accounts cannot use these routes.</info>
 * @extends {CachedManager}
 */
class SubscriptionManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Subscription, iterable);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, Subscription>}
   * @name SubscriptionManager#cache
   */

  /**
   * Fetches subscriptions for this application.
   * @param {FetchSubscriptionOptions|FetchSubscriptionsOptions} [options={}] Options for fetching the subscription(s)
   * @returns {Promise<Subscription|Collection<Snowflake, Subscription>>}
   */
  async fetch(options = {}) {
    if (typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);

    const { after, before, cache, limit, sku, subscriptionId, user } = options;

    const skuId = resolveSKUId(sku);
    if (!skuId) throw new TypeError('INVALID_TYPE', 'sku', 'SKUResolvable');

    if (subscriptionId) {
      const subscription = await this.client.api.skus(skuId).subscriptions(subscriptionId).get();
      return this._add(subscription, cache);
    }

    const query = {
      limit,
      user_id: this.client.users.resolveId(user) ?? undefined,
      sku_id: skuId,
      before,
      after,
    };

    const subscriptions = await this.client.api.skus(skuId).subscriptions.get({ query });

    return subscriptions.reduce(
      (coll, subscription) => coll.set(subscription.id, this._add(subscription, cache)),
      new Collection(),
    );
  }
}

module.exports = SubscriptionManager;
