# discord.js v14 Selfbot Migration

## Goal

Move this CommonJS selfbot client from its discord.js v13-derived API surface to discord.js v14-compatible API and runtime behavior while retaining user-account gateway support and selfbot voice features.

## Constraints

- Keep migration on `js-v14-selfbot`; do not push this branch without explicit request.
- Preserve CommonJS package/runtime conventions.
- Keep Node.js >=20.18 until upstream v14 runtime requirements are audited against actual code dependencies.
- Do not copy the upstream monorepo wholesale or import bot-only behavior that breaks user-account operation.
- Keep selfbot voice and RemoteAuth behavior unless a v14 incompatibility requires focused changes.
- Update runtime and TypeScript declarations together.
- Make subsystem-sized commits with focused verification.

## Migration Boundaries

1. API type baseline: align `discord-api-types` and repair declarations against the v14 type exports.
2. REST: compare v14 REST and route behavior, then port compatible request handling without losing selfbot-specific authentication.
3. Gateway: port v14 gateway intents, payloads, dispatch handling, and identify behavior while retaining selfbot gateway semantics.
4. Structures/managers: update public classes and managers to v14 fields and methods.
5. Voice: retain existing selfbot voice support; port only compatible v14 changes and explicitly exclude DAVE/E2EE implementation.
6. Release surface: update version metadata, docs, and compatibility notes only after runtime and declarations agree.

## First Increment

Update the `discord-api-types` dependency to the version used by the vendored v14 reference, then run TypeScript and `tsd`. Resolve only type export/API mismatches exposed by that update. Do not change runtime dependencies or package Node engine in this increment.

## Acceptance

- Full repository `npm test` passes after each increment where applicable.
- `discord-api-types` and declaration changes are reviewed as one API surface.
- No `.superpowers/` or `docs/superpowers/` files enter commits.
- Migration branch stays local until separately approved for push.
