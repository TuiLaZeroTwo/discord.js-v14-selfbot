'use strict';

const Message = require('./Message').Message;

/**
 * Represents the resource that was created by the interaction response.
 */
class InteractionCallbackResource {
  constructor(client, data) {
    /**
     * The client that instantiated this
     * @name InteractionCallbackResource#client
     * @type {Client}
     * @readonly
     */
    Object.defineProperty(this, 'client', { value: client });

    /**
     * The interaction callback type
     * @type {InteractionResponseType}
     */
    this.type = data.type;

    /**
     * Represents the Activity launched by this interaction
     * @type {?Object}
     */
    this.activityInstance = data.activity_instance ?? null;

    if ('message' in data) {
      /**
       * The message created by the interaction
       * @type {?Message}
       */
      this.message =
        this.client.channels.cache.get(data.message.channel_id)?.messages._add(data.message) ??
        new Message(client, data.message);
    } else {
      this.message = null;
    }
  }
}

module.exports = InteractionCallbackResource;
