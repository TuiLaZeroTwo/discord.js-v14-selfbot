# v14 Migration Plan

1. Align `discord-api-types` to v14 reference and repair type imports/aliases exposed by TypeScript and `tsd`.
2. Inventory and port REST route/request behavior; preserve selfbot authorization and rate-limit behavior.
3. Port gateway protocol and dispatch changes; add focused payload/dispatch tests.
4. Port structures/managers in feature groups, updating declarations and type tests alongside runtime.
5. Audit voice against v14 changes without adding DAVE/E2EE; preserve current selfbot voice paths.
6. Run `npm test`, review package metadata and API compatibility, then prepare release/version changes separately.

Each step is a separate local commit. Stop at incompatible assumptions rather than silently dropping selfbot behavior.
