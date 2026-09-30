'use strict';

const { Collection } = require('@discordjs/collection');
const CachedManager = require('./CachedManager');
const { TypeError } = require('../errors');
const Entitlement = require('../structures/Entitlement');
const SKU = require('../structures/SKU');

function resolveSKUId(sku) {
  if (sku instanceof SKU) return sku.id;
  if (typeof sku === 'string') return sku;
  return null;
}

/**
 * Manages API methods for entitlements and stores their cache.
 *
 * <info>Entitlements are application-owned and require an application context
 * (available to bot accounts). Plain user accounts cannot use these routes.</info>
 * @extends {CachedManager}
 */
class EntitlementManager extends CachedManager {
  constructor(client, iterable) {
    super(client, Entitlement, iterable);
  }

  /**
   * The cache of this manager
   * @type {Collection<Snowflake, Entitlement>}
   * @name EntitlementManager#cache
   */

  /**
   * Data that resolves to give an Entitlement object. This can be:
   * * An Entitlement object
   * * A Snowflake
   * @typedef {Entitlement|Snowflake} EntitlementResolvable
   */

  /**
   * Data that resolves to give a SKU object. This can be:
   * * A SKU object
   * * A Snowflake
   * @typedef {SKU|Snowflake} SKUResolvable
   */

  /**
   * Fetches entitlements for this application.
   * @param {EntitlementResolvable|FetchEntitlementsOptions} [options] Options for fetching entitlement(s)
   * @returns {Promise<Entitlement|Collection<Snowflake, Entitlement>>}
   */
  async fetch(options) {
    if (!options) return this._fetchMany(options);
    const { entitlement, cache, force } = options;
    const resolvedEntitlement = this.resolveId(entitlement ?? options);

    if (resolvedEntitlement) return this._fetchSingle({ entitlement: resolvedEntitlement, cache, force });
    return this._fetchMany(options);
  }

  async _fetchSingle({ entitlement, cache, force = false }) {
    if (!force) {
      const existing = this.cache.get(entitlement);
      if (existing) return existing;
    }

    const data = await this.client.api.applications(this.client.application.id).entitlements(entitlement).get();
    return this._add(data, cache);
  }

  async _fetchMany({ limit, guild, user, skus, excludeEnded, excludeDeleted, cache, before, after } = {}) {
    const query = {
      limit,
      guild_id: guild && this.client.guilds.resolveId(guild),
      user_id: user && this.client.users.resolveId(user),
      sku_ids: skus?.map(sku => resolveSKUId(sku)).join(','),
      exclude_ended: excludeEnded,
      exclude_deleted: excludeDeleted,
      before,
      after,
    };

    const entitlements = await this.client.api.applications(this.client.application.id).entitlements.get({ query });

    return entitlements.reduce(
      (coll, entitlement) => coll.set(entitlement.id, this._add(entitlement, cache)),
      new Collection(),
    );
  }

  /**
   * Creates a test entitlement.
   * <info>Either `guild` or `user` must be provided, but not both.</info>
   * @param {EntitlementCreateOptions} options Options for creating the test entitlement
   * @returns {Promise<Entitlement>}
   */
  async createTest({ sku, guild, user }) {
    const skuId = resolveSKUId(sku);
    if (!skuId) throw new TypeError('INVALID_TYPE', 'sku', 'SKUResolvable');

    if ((guild && user) || (!guild && !user)) throw new TypeError('INVALID_TYPE', 'owner', 'guild or user');

    const resolved = guild ? this.client.guilds.resolveId(guild) : this.client.users.resolveId(user);
    if (!resolved) {
      throw new TypeError('INVALID_TYPE', guild ? 'guild' : 'user', guild ? 'GuildResolvable' : 'UserResolvable');
    }

    const entitlement = await this.client.api.applications(this.client.application.id).entitlements.post({
      data: {
        sku_id: skuId,
        owner_id: resolved,
        owner_type: guild ? 1 : 2,
      },
    });
    return new Entitlement(this.client, entitlement);
  }

  /**
   * Deletes a test entitlement.
   * @param {EntitlementResolvable} entitlement The entitlement to delete
   * @returns {Promise<void>}
   */
  async deleteTest(entitlement) {
    const resolved = this.resolveId(entitlement);
    if (!resolved) throw new TypeError('INVALID_TYPE', 'entitlement', 'EntitlementResolvable');

    await this.client.api.applications(this.client.application.id).entitlements(resolved).delete();
  }

  /**
   * Marks an entitlement as consumed.
   * <info>Only available for One-Time Purchase consumable SKUs.</info>
   * @param {Snowflake} entitlementId The id of the entitlement to consume
   * @returns {Promise<void>}
   */
  async consume(entitlementId) {
    await this.client.api.applications(this.client.application.id).entitlements(entitlementId).consume.post();
  }
}

module.exports = EntitlementManager;
