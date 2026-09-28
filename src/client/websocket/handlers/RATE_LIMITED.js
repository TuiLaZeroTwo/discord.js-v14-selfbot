'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (client, { d: data }, shard) => {
  client.emit(Events.DEBUG, `[RATE_LIMITED] Shard ${shard.id}: ${JSON.stringify(data)}`);
  client.emit('rateLimited', data, shard);
};
