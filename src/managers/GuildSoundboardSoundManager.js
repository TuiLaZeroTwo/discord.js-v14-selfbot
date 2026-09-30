'use strict';

const { Buffer } = require('node:buffer');
const { Collection } = require('@discordjs/collection');
const CachedManager = require('./CachedManager');
const { TypeError } = require('../errors');
const SoundboardSound = require('../structures/SoundboardSound');
const DataResolver = require('../util/DataResolver');

/**
 * Manages API methods for Soundboard Sounds and stores their cache.
 * @extends {CachedManager}
 */
class GuildSoundboardSoundManager extends CachedManager {
  constructor(guild, iterable) {
    super(guild.client, SoundboardSound, iterable);

    /**
     * The guild this manager belongs to
     * @type {Guild}
     */
    this.guild = guild;
  }

  /**
   * The cache of Soundboard Sounds
   * @type {Collection<Snowflake, SoundboardSound>}
   * @name GuildSoundboardSoundManager#cache
   */

  _add(data, cache) {
    return super._add(data, cache, { extras: [this.guild], id: data.sound_id });
  }

  /**
   * Data that resolves to give a SoundboardSound object. This can be:
   * * A SoundboardSound object
   * * A Snowflake
   * @typedef {SoundboardSound|Snowflake} SoundboardSoundResolvable
   */

  /**
   * Resolves a SoundboardSoundResolvable to a SoundboardSound id.
   * @param {SoundboardSoundResolvable} soundboardSound The soundboard sound resolvable to resolve
   * @returns {?Snowflake}
   */
  resolveId(soundboardSound) {
    if (soundboardSound instanceof this.holds) return soundboardSound.soundId;
    if (typeof soundboardSound === 'string') return soundboardSound;
    return null;
  }

  /**
   * Creates a new guild soundboard sound.
   * @param {GuildSoundboardSoundCreateOptions} options Options for creating a guild soundboard sound
   * @returns {Promise<SoundboardSound>} The created soundboard sound
   */
  async create({ contentType, emojiId, emojiName, file, name, reason, volume }) {
    const resolvedFile = await DataResolver.resolveFile(file);
    const buffer = Buffer.isBuffer(resolvedFile) ? resolvedFile : await DataResolver.resolveFileAsBuffer(resolvedFile);
    const type = contentType ?? 'audio/mpeg';
    const sound = DataResolver.resolveBase64(buffer).replace('data:image/jpg;base64,', `data:${type};base64,`);

    const data = await this.client.api
      .guilds(this.guild.id)
      ['soundboard-sounds'].post({ data: { emoji_id: emojiId, emoji_name: emojiName, name, sound, volume }, reason });

    return this._add(data);
  }

  /**
   * Edits a soundboard sound.
   * @param {SoundboardSoundResolvable} soundboardSound The soundboard sound to edit
   * @param {GuildSoundboardSoundEditOptions} [options={}] The new data for the soundboard sound
   * @returns {Promise<SoundboardSound>}
   */
  async edit(soundboardSound, { emojiId, emojiName, name, reason, volume } = {}) {
    const soundId = this.resolveId(soundboardSound);
    if (!soundId) throw new TypeError('INVALID_TYPE', 'soundboardSound', 'SoundboardSoundResolvable');

    const data = await this.client.api
      .guilds(this.guild.id)
      ['soundboard-sounds'](soundId)
      .patch({ data: { emoji_id: emojiId, emoji_name: emojiName, name, volume }, reason });

    const existing = this.cache.get(soundId);
    if (existing) {
      const clone = existing._clone();
      clone._patch(data);
      return clone;
    }
    return this._add(data);
  }

  /**
   * Deletes a soundboard sound.
   * @param {SoundboardSoundResolvable} soundboardSound The soundboard sound to delete
   * @param {string} [reason] Reason for deleting this soundboard sound
   * @returns {Promise<void>}
   */
  async delete(soundboardSound, reason) {
    const soundId = this.resolveId(soundboardSound);
    if (!soundId) throw new TypeError('INVALID_TYPE', 'soundboardSound', 'SoundboardSoundResolvable');

    await this.client.api.guilds(this.guild.id)['soundboard-sounds'](soundId).delete({ reason });
  }

  /**
   * Obtains one or more soundboard sounds from Discord, or the soundboard sound cache if they're already available.
   * @param {SoundboardSoundResolvable|BaseFetchOptions} [options] Options for fetching soundboard sound(s)
   * @returns {Promise<SoundboardSound|Collection<Snowflake, SoundboardSound>>}
   */
  async fetch(options) {
    if (!options) return this._fetchMany();
    const { cache, force, soundboardSound } = options;
    const resolvedSoundboardSound = this.resolveId(soundboardSound ?? options);
    if (resolvedSoundboardSound) return this._fetchSingle({ cache, force, soundboardSound: resolvedSoundboardSound });
    return this._fetchMany({ cache });
  }

  async _fetchSingle({ soundboardSound, cache, force = false } = {}) {
    if (!force) {
      const existing = this.cache.get(soundboardSound);
      if (existing) return existing;
    }

    const data = await this.client.api.guilds(this.guild.id)['soundboard-sounds'](soundboardSound).get();
    return this._add(data, cache);
  }

  async _fetchMany({ cache } = {}) {
    const data = await this.client.api.guilds(this.guild.id)['soundboard-sounds'].get();

    return data.items.reduce((coll, sound) => coll.set(sound.sound_id, this._add(sound, cache)), new Collection());
  }
}

module.exports = GuildSoundboardSoundManager;
