'use strict';

const BitField = require('./BitField');

/**
 * Data structure that makes it easy to interact with a {@link SKU#flags} bitfield.
 * @extends {BitField}
 */
class SKUFlags extends BitField {}

/**
 * @name SKUFlags
 * @kind constructor
 * @memberof SKUFlags
 * @param {BitFieldResolvable} [bits=0] Bit(s) to read from
 */

/**
 * Numeric SKU flags. All available properties:
 * * `AVAILABLE`
 * * `GUILD_SUBSCRIPTION`
 * * `USER_SUBSCRIPTION`
 * @type {Object}
 * @see {@link https://discord.com/developers/docs/resources/monetization#sku-object-sku-flags}
 */
SKUFlags.FLAGS = {
  AVAILABLE: 1 << 2,
  GUILD_SUBSCRIPTION: 1 << 7,
  USER_SUBSCRIPTION: 1 << 8,
};

/**
 * Data that can be resolved to give a SKU flag bitfield. This can be:
 * * A string (see {@link SKUFlags.FLAGS})
 * * A SKU flag
 * * An instance of SKUFlags
 * * An Array of SKUFlagsResolvable
 * @typedef {string|number|SKUFlags|SKUFlagsResolvable[]} SKUFlagsResolvable
 */

module.exports = SKUFlags;
