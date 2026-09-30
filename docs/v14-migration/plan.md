# v14 Migration Plan

1. **Foundation:** completed. Pin the v14 `discord-api-types` range, repair declaration imports, upgrade docgen, and expose rate-limit scope.
2. **REST routing and buckets:** port v14 route normalization, major parameters, bucket-hash mapping and hash sweeping. Keep per-major request sequencing and selfbot webhook token behavior.
3. **REST sublimits and cancellations:** port the v14 isolated sublimit queue and `AbortSignal` queue cancellation. Preserve captcha/MFA retries, cookies, browser headers, custom proxy and TLS behavior. Test shared-route requests, concurrent sublimits and aborts.
4. **REST response/error handling:** port v14 parsing of rate-limit scope, global/shared limits, invalid-request tracking and retry semantics while keeping selfbot-specific authorization paths.
5. **Gateway configuration:** port v14 intent and capability values, identify property types, gateway query construction and identify throttling. Verify selfbot token identify does not acquire bot-only restrictions.
6. **Gateway lifecycle:** port heartbeat, session resume, invalid-session handling, close-code recovery and dispatch behavior. Add tests for resume/reidentify and representative v14 dispatch payloads.
7. **Structures/managers, part 1:** update users, guilds, channels, roles, members, messages, attachments, embeds and components; update their raw data and type tests together.
8. **Structures/managers, part 2:** update polls, application commands/interactions, scheduled events, subscriptions, entitlements, soundboard and remaining v14 exports. Compare `src/index.js` and `typings/index.d.ts` to the v14 public surface.
9. **Voice and ancillary modules:** port compatible voice packet/transport changes, builders, formatters, utilities, errors and sharding. Preserve RemoteAuth and selfbot video/audio paths. Keep DAVE/E2EE excluded unless selfbot interoperability is proven.
10. **Release compatibility:** align runtime dependencies and public exports; set Node.js engine to >=24.17.0; update package version and documentation after all runtime/types checks pass.
11. **Final verification:** run focused tests, `npm test`, API export/type parity checks, and inspect the full branch diff. Keep `js-v14-selfbot` local unless explicitly asked to push.

Each subsystem step is a separate local commit. Stop at incompatible assumptions rather than silently dropping selfbot behavior. Run the smallest affected test first, then full suite after each integration boundary.

## Status

- REST routing/buckets, sublimit queues, abort signals, and rate-limit scope: complete.
- Gateway identify/intents v10, modern intent flags, close-code handling, and 17 new dispatches: complete.
- Structures: message metadata, channel helpers, attachment/embed, monetization structures (entitlement, SKU, soundboard sound, subscription), root exports/aliases: complete.
- Managers: `GuildSoundboardSoundManager` wired; `EntitlementManager`/`SubscriptionManager` exported (application-context only): complete.
- Voice: DAVE/E2EE intentionally excluded; boundary documented in `voice.md`: complete.
- Package: Node.js `>=24.17.0`, version `4.0.0`, README compatibility notes: complete.
- Remaining niceties (specialized select/interaction subclasses, `PartialGroupDMChannel`, docs site) may be ported incrementally.
