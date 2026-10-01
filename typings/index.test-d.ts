import {
  Client,
  GuildManager,
  GuildMemberManager,
  MessageManager,
  Message,
  AuthorizingIntegrationOwners,
  Attachment,
  Colors,
  Embed,
  Events,
  Partials,
  ActionRow,
  BaseInteraction,
  ButtonComponent,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  StringSelectMenuComponent,
  StringSelectMenuInteraction,
  Entitlement,
  SKU,
  Subscription,
  SoundboardSound,
  GuildSoundboardSoundManager,
  EntitlementManager,
  SubscriptionManager,
  flatten,
  parseEmoji,
  resolveColor,
  DiscordjsError,
  PartialGroupDMChannel,
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
declare const entitlement: Entitlement;
entitlement.isActive();
entitlement.guildId satisfies string | null;
declare const sku: SKU;
sku.flags.has('AVAILABLE');
declare const subscription: Subscription;
subscription.currentPeriodStartAt satisfies Date;
declare const soundboardSound: SoundboardSound;
soundboardSound.volume satisfies number | null;
declare const soundboardManager: GuildSoundboardSoundManager;
soundboardManager.fetch();
declare const entitlementManager: EntitlementManager;
entitlementManager.consume('123456789012345678');
declare const subscriptionManager: SubscriptionManager;
subscriptionManager.fetch({ sku: '123456789012345678' });
flatten({ nested: { a: 1 } });
parseEmoji('<:name:123456789012345678>');
resolveColor('#5865F2');
new DiscordjsError('TokenInvalid');
declare const partialGroupDM: PartialGroupDMChannel;
partialGroupDM.type satisfies string;
Colors.BLURPLE satisfies number;
Events.CLIENT_READY satisfies string;
Partials.MESSAGE satisfies string;
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
