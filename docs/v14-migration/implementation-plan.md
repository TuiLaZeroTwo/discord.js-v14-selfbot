# discord.js v14 Selfbot Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Port every v14-compatible API/runtime subsystem into the existing selfbot client while preserving CommonJS and user-account behavior.

**Architecture:** Keep current single-package CommonJS layout. Port v14 mechanisms into existing REST, websocket, structure, manager, voice, utility and typings modules instead of importing the upstream monorepo. Each subsystem commit includes runtime/type parity and focused native tests.

**Tech Stack:** Node.js >=24.17.0, CommonJS, discord-api-types v10, undici, ws, node:test, TypeScript declarations and tsd.

**Spec:** `docs/v14-migration/spec.md`

## Global Constraints

- Work on `js-v14-selfbot`; do not push unless explicitly requested.
- Preserve the existing CommonJS package/runtime convention.
- Require Node.js >=24.17.0.
- Preserve selfbot auth, browser headers, captcha/MFA, user-account gateway, RemoteAuth and compatible voice behavior.
- Do not import bot-only restrictions or remove existing selfbot behavior without an explicit incompatibility.
- Do not add DAVE/E2EE voice support unless selfbot interoperability is proven.
- Update runtime and declarations together.
- Keep commits subsystem-sized; run `npm test` after integration boundaries.

---

## File Ownership Map

- `src/rest/APIRouter.js`, `RESTManager.js`, `APIRequest.js`, `RequestHandler.js`, `RateLimitError.js`: route IDs, bucket mapping, request execution, throttles and v14 REST semantics.
- `src/client/websocket/WebSocketManager.js`, `WebSocketShard.js`, `src/client/websocket/handlers/**`, `src/util/Constants.js`, `Options.js`: gateway config, identify/resume, dispatch and reconnect.
- `src/structures/**`, `src/managers/**`, `src/index.js`, `typings/index.d.ts`, `typings/rawDataTypes.d.ts`: public model/API parity.
- `src/client/voice/**`, `src/util/RemoteAuth.js`: compatible voice and selfbot auth behavior.
- `package.json`, `docs/**`, `typings/index.test-d.ts`, `test/**`: metadata, docs and checks.

## Task 1: REST Route Normalization And Bucket Hashes

**Files:** REST router/manager/request/handler; new `test/rest-routing.test.js`.

- [ ] Add failing route tests for major IDs: channel, guild, webhook ID+token, interaction callback, reaction subroutes, and old-message delete bucket exception.
- [ ] Port v14 `generateRouteData` rules into the existing route builder. Return `bucketRoute`, `majorParameter`, and original route.
- [ ] Cache server bucket hashes by method + generalized route + auth identity only for credentials the current API can actually select; do not invent a public custom-token option.
- [ ] Keep webhook ID+token as major identity so unrelated webhook credentials never share handler queues.
- [ ] Verify hash updates retroactively affect subsequent calls while active handlers drain safely.
- [ ] Run `node --test test/rest-routing.test.js`, `npm run lint`, `npm run test:typescript`.
- [ ] Commit `feat: align REST bucket routing with v14`.

## Task 2: REST Sublimit Queue And Cancellation

**Files:** `src/rest/RequestHandler.js`, `src/rest/APIRequest.js`, `src/rest/RESTManager.js`, `typings/index.d.ts`, new `test/rest-sublimit.test.js`.

- [ ] Add failing tests for a shared route where one endpoint sublimits: sublimited requests serialize while unrelated route requests continue.
- [ ] Add failing tests showing an already-aborted signal rejects while waiting in the queue and does not consume a request slot.
- [ ] Port v14's standard/sublimit queue separation and avoid shifting a queue twice during retry paths.
- [ ] Pass `AbortSignal` through request options and queue waits; preserve request timeout/abort retry policy for internally generated timeout signals.
- [ ] Run focused tests, `npm test`, and ensure captcha/MFA retry tests/behavior remain intact.
- [ ] Commit `feat: port v14 REST sublimit queues`.

## Task 3: REST Response Semantics

**Files:** `src/rest/RequestHandler.js`, `RateLimitError.js`, typings, new `test/rest-rate-limit.test.js`.

- [ ] Test rate-limit `scope` values from headers and fallback behavior for absent headers.
- [ ] Test global rate limits apply across handlers; shared limits do not incorrectly mark a user-global bucket.
- [ ] Align invalid-request counts, retry-after offsets and v14 response parsing with upstream `Shared.ts` behavior.
- [ ] Keep selfbot captcha solving, MFA token exchange, cookie jar, browser headers, TLS cipher configuration and webhook unauthenticated requests unchanged.
- [ ] Run REST focused checks and `npm test`.
- [ ] Commit `feat: align REST response handling with v14`.

## Task 4: Gateway Configuration And Identify

**Files:** websocket manager/shard, `src/util/Constants.js`, `Options.js`, raw typings and focused gateway tests.

- [ ] Add tests for intent bitfields, identify payload properties, capabilities, encoding/compression query values, and selfbot identify authentication.
- [ ] Compare `based/packages/ws/src/ws/WebSocketManager.ts` and `WebSocketShard.ts`; port compatible identify properties/options and throttling.
- [ ] Preserve desktop client properties and user-account identify flow. Do not require bot token/application endpoints.
- [ ] Align close codes and gateway capability/intent constants with v14 `discord-api-types/v10`.
- [ ] Run gateway focused tests, `npm test`.
- [ ] Commit `feat: align gateway identify with v14`.

## Task 5: Gateway Lifecycle And Dispatch

**Files:** `WebSocketManager.js`, `WebSocketShard.js`, `handlers/**`, tests.

- [ ] Write tests for heartbeat ACK timeout, sequence persistence, resume URL, invalid session, session reset and reconnect close-code classes.
- [ ] Port v14 lifecycle changes without replacing selfbot gateway opcodes/dispatches that are intentionally unsupported by bot clients.
- [ ] Update READY/RESUMED and new v14 dispatch handlers; unknown dispatches remain safely ignored and surfaced via raw event.
- [ ] Test identify/resume limits and shard queue concurrency.
- [ ] Run full suite and commit `feat: align gateway lifecycle with v14`.

## Task 6: Core Structures And Managers, Part 1

**Files:** User, Guild, GuildMember, Channel, Role, Message, Attachment, Embed, component structures/managers, raw typings and type tests.

- [ ] For each class group, add failing runtime or `tsd` assertions for v14 fields/methods before implementation.
- [ ] Compare each class with `based/packages/discord.js/src/structures/**` and relevant manager implementation.
- [ ] Port fields, enum values, cache semantics and methods without deleting selfbot-only APIs.
- [ ] Update serialization/raw payload types and `typings/index.test-d.ts` in same change.
- [ ] Run `node --test`, `npx tsc --noEmit`, `npx tsd`, then `npm test`.
- [ ] Commit this part as focused feature-group commits, not a monolithic structures patch.

## Task 7: Core Structures And Managers, Part 2

**Files:** polls, interactions/application commands, scheduled events, subscriptions/entitlements/soundboard, manager exports, declarations.

- [ ] Add type tests and behavior tests for each exported API group before porting.
- [ ] Port v14 payload/model semantics from the vendored reference.
- [ ] Verify public runtime exports in `src/index.js` exactly match intended declaration exports.
- [ ] Run full checks and commit independently reviewable feature groups.

## Task 8: Voice And Ancillary APIs

**Files:** `src/client/voice/**`, `src/util/RemoteAuth.js`, utility/formatter/builder modules, docs and tests.

- [ ] Add packet tests for v14-compatible voice transport changes and preserve existing user-account voice handshake.
- [ ] Port only compatible voice protocol changes; do not adopt DAVE/E2EE unless a selfbot-compatible handshake and encryption path can be tested.
- [ ] Compare builders, formatters, utility constants, errors and sharding APIs with v14; port public behavior where present.
- [ ] Run focused voice tests plus `npm test`.
- [ ] Commit voice and ancillary changes separately.

## Task 9: Runtime, Package And Release Surface

**Files:** `package.json`, package exports, documentation and compatibility tests.

- [ ] Set `engines.node` to `>=24.17.0` and align runtime dependencies to versions required by the completed port.
- [ ] Update project/package version only after API surface is complete; keep repository package identity and CommonJS type unchanged.
- [ ] Add public API smoke tests for exports, Client construction, REST configuration and gateway options.
- [ ] Run full `npm test`, runtime test suite, package build and package export smoke check on Node.js 24.17+.
- [ ] Review branch diff for accidental removal of selfbot features and commit final compatibility/docs changes.

## Task 10: Final Audit

- [ ] Compare v14 public exports to `src/index.js` and `typings/index.d.ts`; explain deliberate selfbot-only deviations in docs.
- [ ] Verify all targeted tests pass and `npm test` is clean.
- [ ] Review `git status`, commit history and complete branch diff.
- [ ] Leave branch local; push only after explicit request.
