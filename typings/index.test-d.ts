import {
  Client,
  GuildManager,
  GuildMemberManager,
  MessageManager,
  MessagePayload,
  Options,
  RoleManager,
  Formatters,
  formatTimestamp,
} from './index';

const client = new Client();
const clientWithV14Intents = new Client({ intents: 0 });
const options = Options.createDefault();

client.guilds satisfies GuildManager;
clientWithV14Intents.guilds satisfies GuildManager;
client.options = options;
client.guilds.fetch('123456789012345678');

declare const members: GuildMemberManager;
members.fetchByMemberSafety(5_000);

declare const roles: RoleManager;
roles.fetchMemberCounts();

declare const messages: MessageManager;
messages.endPoll('123456789012345678');
messages.fetchPinned();

declare const payload: MessagePayload;
payload.resolveData();
payload.resolveFiles();

formatTimestamp(new Date(), 'R');
Formatters.formatTimestamp(1_618_935_630_000, 'F');
