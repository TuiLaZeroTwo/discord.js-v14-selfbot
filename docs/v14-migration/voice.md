# Voice And DAVE/E2EE Boundary

## Summary

The vendored v14 reference (`based/packages/voice`) enables the DAVE protocol
(end-to-end encryption) by default: `daveEncryption` defaults to `true`, and
`VoiceConnection` creates a `DAVESession` via the optional native dependency
`@snazzah/davey`. It also reads `max_dave_protocol_version` during the voice
gateway handshake and processes `DAVE_PREPARE_TRANSITION`,
`DAVE_EXECUTE_TRANSITION`, `DAVE_PREPARE_EPOCH`, and binary DAVE opcodes.

The current selfbot voice implementation (`src/client/voice/**`) is a
CommonJS user-account transport:

- Voice gateway protocol `v: 8`.
- Legacy transport encryption via `aead_aes256_gcm_rtpsize` and
  `aead_xchacha20_poly1305_rtpsize` using the `secret_key` from
  `SESSION_DESCRIPTION`.
- No DAVE group session, no `@snazzah/davey` dependency, no DAVE opcodes.

## Decision

Do not add DAVE/E2EE support in this migration.

Rationale:

- DAVE requires a new native dependency and a full group-session state machine
  (proposals, commits, welcomes, epochs, transitions) that is not present in the
  selfbot transport.
- The selfbot voice path is a user-account implementation, not the v14 bot
  `VoiceConnection`; the DAVE handshake and frame transforms cannot be dropped
  in without reworking the entire connection lifecycle.
- Wrapping DAVE around the legacy path would produce a hybrid that is neither
  proven correct nor testable without a live encrypted voice session.

## Preserved Behavior

The following remain unchanged and compatible with the v14 non-DAVE encryption
modes:

- `Secretbox` XChaCha20-Poly1305 helpers in `src/client/voice/util/Secretbox.js`.
- AES-256-GCM and XChaCha20-Poly1305 RTP payload encryption in
  `src/client/voice/dispatcher/BaseDispatcher.js`.
- AES-256-GCM and XChaCha20-Poly1305 RTP payload decryption in
  `src/client/voice/receiver/PacketHandler.js`.
- Recovery and heartbeat behavior in
  `src/client/voice/networking/VoiceWebSocket.js`.

## Re-evaluation Criteria

Only revisit DAVE support if all of the following hold:

1. A maintained, installable DAVE library is available for the supported Node
   version.
2. The user-account voice handshake can be extended without breaking legacy
   `secret_key` transport for servers that do not use DAVE.
3. An automated or reproducible integration test can prove an encrypted voice
   session works end to end.
