'use strict';

const MessageAttachment = require('./MessageAttachment');

/**
 * Represents an attachment received from Discord.
 * @extends {MessageAttachment}
 */
class Attachment extends MessageAttachment {
  constructor(data) {
    super(data.url, data.filename, data);
  }
}

module.exports = Attachment;
