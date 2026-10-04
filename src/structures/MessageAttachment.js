'use strict';

const AttachmentFlags = require('../util/AttachmentFlags');
const Util = require('../util/Util');

/**
 * Represents an attachment in a message.
 */
class MessageAttachment {
  /**
   * @param {BufferResolvable|Stream} attachment The file
   * @param {string} [name=null] The name of the file, if any
   * @param {APIAttachment} [data] Extra data
   */
  constructor(attachment, name = null, data) {
    this.attachment = attachment;
    /**
     * The name of this attachment
     * @type {?string}
     */
    this.name = name;
    if (data) this._patch(data);
  }

  /**
   * Sets the description of this attachment.
   * @param {string} description The description of the file
   * @returns {MessageAttachment} This attachment
   */
  setDescription(description) {
    this.description = description;
    return this;
  }

  /**
   * Sets the file of this attachment.
   * @param {BufferResolvable|Stream} attachment The file
   * @param {string} [name=null] The name of the file, if any
   * @returns {MessageAttachment} This attachment
   */
  setFile(attachment, name = null) {
    this.attachment = attachment;
    this.name = name;
    return this;
  }

  /**
   * Sets the name of this attachment.
   * @param {string} name The name of the file
   * @returns {MessageAttachment} This attachment
   */
  setName(name) {
    this.name = name;
    return this;
  }

  /**
   * Sets whether this attachment is a spoiler
   * @param {boolean} [spoiler=true] Whether the attachment should be marked as a spoiler
   * @returns {MessageAttachment} This attachment
   */
  setSpoiler(spoiler = true) {
    if (spoiler === this.spoiler) return this;

    if (!spoiler) {
      while (this.spoiler) {
        this.name = this.name.slice('SPOILER_'.length);
      }
      return this;
    }
    this.name = `SPOILER_${this.name}`;
    return this;
  }

  _patch(data) {
    /**
     * The attachment's id
     * @type {Snowflake}
     */
    this.id = data.id;

    if ('size' in data) {
      /**
       * The size of this attachment in bytes
       * @type {number}
       */
      this.size = data.size;
    }

    if ('url' in data) {
      /**
       * The URL to this attachment
       * @type {string}
       */
      this.url = data.url;
    }

    if ('proxy_url' in data) {
      /**
       * The Proxy URL to this attachment
       * @type {string}
       */
      this.proxyURL = data.proxy_url;
    }

    if ('height' in data) {
      /**
       * The height of this attachment (if an image or video)
       * @type {?number}
       */
      this.height = data.height;
    } else {
      this.height ??= null;
    }

    if ('width' in data) {
      /**
       * The width of this attachment (if an image or video)
       * @type {?number}
       */
      this.width = data.width;
    } else {
      this.width ??= null;
    }

    if ('content_type' in data) {
      /**
       * The media (MIME) type of this attachment
       * @type {?string}
       * @see {@link https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types}
       */
      this.contentType = data.content_type;
    } else {
      this.contentType ??= null;
    }

    if ('description' in data) {
      /**
       * The description (alt text) of this attachment
       * @type {?string}
       */
      this.description = data.description;
    } else {
      this.description ??= null;
    }

    /**
     * Whether this attachment is ephemeral
     * @type {boolean}
     */
    this.ephemeral = data.ephemeral ?? false;

    if ('duration_secs' in data) {
      /**
       * The duration of this attachment in seconds
       * <info>This will only be available if the attachment is an audio file.</info>
       * @type {?number}
       */
      this.duration = data.duration_secs;
    } else {
      this.duration ??= null;
    }

    if ('waveform' in data) {
      /**
       * The base64 encoded byte array representing a sampled waveform
       * <info>This will only be available if the attachment is an audio file.</info>
       * @type {?string}
       */
      this.waveform = data.waveform;
    } else {
      this.waveform ??= null;
    }

    if ('flags' in data) {
      /**
       * The flags of this attachment
       * @type {Readonly<AttachmentFlags>}
       */
      this.flags = new AttachmentFlags(data.flags).freeze();
    } else {
      this.flags ??= new AttachmentFlags().freeze();
    }

    if ('title' in data) {
      /**
       * The title of this attachment
       * <info>This will only be available if the attachment name contains special characters.</info>
       * @type {?string}
       */
      this.title = data.title;
    } else {
      this.title ??= null;
    }

    if ('placeholder' in data) {
      /**
       * The ThumbHash placeholder for this attachment.
       * @type {?string}
       */
      this.placeholder = data.placeholder;
    } else {
      this.placeholder ??= null;
    }

    if ('placeholder_version' in data) {
      /**
       * The version of the ThumbHash placeholder.
       * @type {?number}
       */
      this.placeholderVersion = data.placeholder_version;
    } else {
      this.placeholderVersion ??= null;
    }
  }

  /**
   * Whether or not this attachment has been marked as a spoiler
   * @type {boolean}
   * @readonly
   */
  get spoiler() {
    return Boolean(
      this.flags?.has(AttachmentFlags.FLAGS.SPOILER) ||
      (this.url ?? this.name)?.split('/').pop()?.startsWith('SPOILER_'),
    );
  }

  get isSpoiler() {
    return this.spoiler;
  }

  toJSON() {
    return Util.flatten(this);
  }
}

module.exports = MessageAttachment;

/**
 * @external APIAttachment
 * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object}
 */
