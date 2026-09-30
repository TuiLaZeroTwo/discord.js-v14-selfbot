'use strict';

/**
 * The type of Structure allowed to be a partial:
 * * `USER`
 * * `CHANNEL`
 * * `GUILD_MEMBER`
 * * `MESSAGE`
 * * `REACTION`
 * * `GUILD_SCHEDULED_EVENT`
 * @type {Object}
 * @see {@link https://discord.com/developers/docs/topics/gateway#caching}
 */
class Partials extends null {}

Partials.USER = 'USER';
Partials.CHANNEL = 'CHANNEL';
Partials.GUILD_MEMBER = 'GUILD_MEMBER';
Partials.MESSAGE = 'MESSAGE';
Partials.REACTION = 'REACTION';
Partials.GUILD_SCHEDULED_EVENT = 'GUILD_SCHEDULED_EVENT';

module.exports = Partials;
