# discord.js v14 Selfbot Migration

## Goal

Move this CommonJS selfbot client from its discord.js v13-derived API surface to discord.js v14 API and runtime behavior, porting every compatible v14 subsystem while retaining user-account gateway support and selfbot-only behavior.

## Constraints

- Keep migration on `js-v14-selfbot`; do not push this branch without explicit request.
- Preserve CommonJS package/runtime conventions.
- Require Node.js >=24.17.0, matching the v14 reference package.
- Keep the existing CommonJS package/runtime convention; do not convert the package to ESM.
- Do not copy the upstream monorepo wholesale. Port v14 behavior into existing package structure.
- Preserve selfbot authentication, browser request headers, captcha/MFA flows, user-account gateway behavior, RemoteAuth, and selfbot voice where compatible with v14.
- Do not add bot-only restrictions that prevent user-account gateway or REST use.
- Do not add DAVE/E2EE voice support unless it is compatible with the selfbot voice protocol; document any excluded behavior.
- Update runtime and TypeScript declarations together.
- Make subsystem-sized commits with focused verification.

## Migration Boundaries

1. REST: v14 route normalization, bucket-hash mapping, major parameters, sublimit queues, rate-limit scope, cancellation, error parsing, and retry semantics. Retain selfbot headers/auth, cookies, captcha, MFA, and custom dispatcher behavior.
2. Gateway: v14 intents/capabilities, identify properties and throttling, payload handling, heartbeat/resume/reconnect, and dispatch compatibility. Retain user-account identify behavior.
3. Structures/managers/API: port v14 API fields, components, polls, scheduled events, users, messages, managers, constants and public exports, with runtime and typings changed together.
4. Voice: port compatible transport/packet changes and preserve selfbot voice. Exclude DAVE/E2EE unless compatibility is demonstrated.
5. Ancillary APIs: align builders, formatters, utilities, errors, sharding, docs and package metadata with v14 where present in this package.
6. Release surface: finalize dependency versions, Node.js engine, package version, docs and compatibility notes after runtime and declarations agree.

## Completed Foundation

The dependency baseline uses `discord-api-types@^0.38.56`. Documentation generation uses `@discordjs/docgen@^0.12.1`; `docs:test` now passes without JSDoc warnings. REST rate-limit events/errors expose v14 `scope` metadata. Full subsystem migration remains.

## Migration Method

- Complete each subsystem with focused native tests before moving to the next.
- Keep commits subsystem-sized and run `npm test` after integration points.
- Treat v14 as source of API behavior, not permission to remove selfbot compatibility.
- When upstream behavior conflicts with explicit selfbot requirements, port the compatible mechanism and test the selfbot variant.

## Acceptance

- Full repository `npm test` and focused runtime tests pass after each subsystem increment.
- `discord-api-types` and declaration changes are reviewed as one API surface.
- Runtime requirements declare Node.js >=24.17.0.
- Public v14-compatible runtime exports and TypeScript declarations agree.
- No `.superpowers/` or `docs/superpowers/` files enter commits.
- Migration branch stays local until separately approved for push.
