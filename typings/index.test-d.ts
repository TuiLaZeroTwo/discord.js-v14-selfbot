import {
  Client,
  GuildManager,
  GuildMemberManager,
  MessageManager,
  Message,
  AuthorizingIntegrationOwners,
  Attachment,
  Embed,
  ActionRow,
  BaseInteraction,
  ButtonComponent,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  StringSelectMenuComponent,
  StringSelectMenuInteraction,
  BaseChannel,
  IntentsBitField,
  MessagePayload,
  Options,
  RoleManager,
  Formatters,
  formatTimestamp,
} from './index';

const client = new Client();
const clientWithV14Intents = new Client({
  intents: 0,
  ws: {
    capabilities: 0,
    client_state: { guild_versions: { '123456789012345678': 1 } },
    large_threshold: 50,
    version: 10,
  },
});
const options = Options.createDefault();
declare const message: Message;
declare const integrationOwners: AuthorizingIntegrationOwners;

client.guilds satisfies GuildManager;
clientWithV14Intents.guilds satisfies GuildManager;
declare const baseChannel: BaseChannel;
baseChannel.isTextBased();
new IntentsBitField(0).has('GUILDS');
declare const actionRow: ActionRow;
declare const interaction: BaseInteraction;
declare const button: ButtonComponent;
declare const chatInputInteraction: ChatInputCommandInteraction;
declare const contextInteraction: ContextMenuCommandInteraction;
declare const selectComponent: StringSelectMenuComponent;
declare const selectInteraction: StringSelectMenuInteraction;
client.options = options;
client.guilds.fetch('123456789012345678');
client.channels.cache.forEach(channel => {
  channel.isTextBased();
  channel.isDMBased();
  channel.isVoiceBased();
  channel.isSendable();
});
message.roleSubscriptionData!.tierName satisfies string;
message.sharedClientTheme!.gradientAngle satisfies number;
declare const attachment: Attachment;
attachment.duration satisfies number | null;
declare const embed: Embed;
embed.setTitle('v14 compatible');
message.interactionMetadata!.authorizingIntegrationOwners satisfies AuthorizingIntegrationOwners;
integrationOwners.guildId satisfies string | null;
client.on('interactionCreate', data => {
  data satisfies Record<string, unknown>;
});
client.on('guildSoundboardSoundCreate', data => {
  data satisfies Record<string, unknown>;
});

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
