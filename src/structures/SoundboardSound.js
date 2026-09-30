'use strict';

const Base = require('./Base');
const { Emoji } = require('./Emoji');
const SnowflakeUtil = require('../util/SnowflakeUtil');

/**
 * Represents a soundboard sound.
 * @extends {Base}
 */
class SoundboardSound extends Base {
  constructor(client, data) {
    super(client);

    /**
     * The id of this soundboard sound
     * @type {Snowflake|string}
     */
    this.soundId = data.sound_id;

    this._patch(data);
  }

  _patch(data) {
    if ('available' in data) {
      /**
       * Whether this soundboard sound is available
       * @type {?boolean}
       */
      this.available = data.available;
    } else {
      this.available ??= null;
    }

    if ('name' in data) {
      /**
       * The name of this soundboard sound
       * @type {?string}
       */
      this.name = data.name;
    } else {
      this.name ??= null;
    }

    if ('volume' in data) {
      /**
       * The volume (a double) of this soundboard sound, from 0 to 1
       * @type {?number}
       */
      this.volume = data.volume;
    } else {
      this.volume ??= null;
    }

    if ('emoji_id' in data) {
      /**
       * The raw emoji data of this soundboard sound
       * @type {?Object}
       * @private
       */
      this._emoji = {
        id: data.emoji_id,
        name: data.emoji_name,
      };
    } else {
      this._emoji ??= null;
    }

    if ('guild_id' in data) {
      /**
       * The guild id of this soundboard sound
       * @type {?Snowflake}
       */
      this.guildId = data.guild_id;
    } else {
      this.guildId ??= null;
    }

    if ('user' in data) {
      /**
       * The user who created this soundboard sound
       * @type {?User}
       */
      this.user = this.client.users._add(data.user);
    } else {
      this.user ??= null;
    }
  }

  /**
   * The timestamp this soundboard sound was created at
   * @type {number}
   * @readonly
   */
  get createdTimestamp() {
    return SnowflakeUtil.timestampFrom(this.soundId);
  }

  /**
   * The time this soundboard sound was created at
   * @type {Date}
   * @readonly
   */
  get createdAt() {
    return new Date(this.createdTimestamp);
  }

  /**
   * The emoji of this soundboard sound
   * @type {?Emoji}
   * @readonly
   */
  get emoji() {
    if (!this._emoji) return null;

    return this.guild?.emojis.cache.get(this._emoji.id) ?? new Emoji(this.client, this._emoji);
  }

  /**
   * The guild this soundboard sound is part of
   * @type {?Guild}
   * @readonly
   */
  get guild() {
    return this.client.guilds.cache.get(this.guildId) ?? null;
  }

  /**
   * Edits this soundboard sound.
   * @param {GuildSoundboardSoundEditOptions} options The options to provide
   * @returns {Promise<SoundboardSound>}
   */
  async edit(options) {
    if (!this.guildId) throw new Error('This soundboard sound is not part of a guild, so it cannot be edited.');
    return this.guild.soundboardSounds.edit(this, options);
  }

  /**
   * Deletes this soundboard sound.
   * @param {string} [reason] Reason for deleting this soundboard sound
   * @returns {Promise<SoundboardSound>}
   */
  async delete(reason) {
    if (!this.guildId) throw new Error('This soundboard sound is not part of a guild, so it cannot be deleted.');
    await this.guild.soundboardSounds.delete(this, reason);
    return this;
  }

  /**
   * Whether this soundboard sound is the same as another one.
   * @param {SoundboardSound|Object} other The soundboard sound to compare it to
   * @returns {boolean}
   */
  equals(other) {
    if (other instanceof SoundboardSound) {
      return (
        this.soundId === other.soundId &&
        this.available === other.available &&
        this.name === other.name &&
        this.volume === other.volume &&
        this._emoji?.id === other._emoji?.id &&
        this._emoji?.name === other._emoji?.name &&
        this.guildId === other.guildId &&
        this.user?.id === other.user?.id
      );
    }

    return (
      this.soundId === other.sound_id &&
      this.available === other.available &&
      this.name === other.name &&
      this.volume === other.volume &&
      (this._emoji?.id ?? null) === other.emoji_id &&
      (this._emoji?.name ?? null) === other.emoji_name &&
      this.guildId === other.guild_id &&
      this.user?.id === other.user?.id
    );
  }
}

module.exports = SoundboardSound;
