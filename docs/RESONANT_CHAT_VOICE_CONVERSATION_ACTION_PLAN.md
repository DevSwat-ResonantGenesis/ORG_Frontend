# Resonant Chat Real-Time Voice Conversation Action Plan

## Goal

Implement true duplex voice conversation (user speaks live, Resonant responds with natural voice) using the existing mic-circle entry point in the input bar, while keeping chat safety, observability, and multilingual support.

## Current State (as implemented now)

- Mic circle UI exists in chat input.
- Browser speech-to-text / text-to-speech tools are partially available.
- No dedicated backend conversation streaming engine yet.
- No turn-management state machine for continuous live conversation.

## Target Experience

1. User taps mic circle.
2. User speaks naturally in EN/RU/UK/AR.
3. Partial transcript appears live in input area.
4. On pause/end-of-turn, transcript is sent to Resonant backend.
5. Assistant response starts rendering (optionally live typing visual).
6. Assistant voice plays naturally in selected/detected language.
7. User can interrupt assistant and continue speaking (barge-in).
8. Conversation persists in regular chat history and analytics.

---

## Architecture Recommendation

### A) New service: `voice_gateway_service` (recommended)

A dedicated service keeps complexity isolated and reduces risk to existing chat endpoints.

Responsibilities:

- Manage low-latency bidirectional audio sessions over WebSocket.
- Perform streaming ASR (speech-to-text).
- Detect language and confidence per utterance.
- Manage turn-taking and VAD (voice activity detection).
- Forward finalized user turns to existing Resonant chat backend.
- Stream assistant text chunks back to frontend.
- Stream TTS audio chunks back to frontend.
- Support barge-in/cancel.

### B) Integrations

- **Auth**: JWT via gateway middleware (same owner/user auth model already used).
- **Chat backend**: reuse current `sendResonantMessage` or streaming equivalent.
- **TTS provider abstraction**: pluggable provider layer (OpenAI/Microsoft/Google/ElevenLabs/local).
- **ASR provider abstraction**: pluggable provider layer (Whisper/Vosk/Deepgram/Google STT/etc).
- **Persistence**: write finalized turns into existing conversation store.

---

## Session Protocol (WebSocket)

`/api/v1/voice/session`

Client -> server event types:

- `session.start` (conversation_id, preferred_lang, voice_profile)
- `audio.chunk` (PCM/Opus frame)
- `turn.end` (optional manual finalize)
- `assistant.interrupt`
- `session.stop`

Server -> client event types:

- `session.ready`
- `transcript.partial`
- `transcript.final`
- `assistant.text.chunk`
- `assistant.text.final`
- `assistant.audio.chunk`
- `assistant.audio.end`
- `error`

---

## Turn Management / State Machine

States:

- `idle`
- `listening`
- `processing_user_turn`
- `assistant_speaking`
- `interrupted`

Rules:

1. VAD silence threshold finalizes user turn automatically.
2. In `assistant_speaking`, user voice above threshold triggers `assistant.interrupt` and moves to `listening`.
3. Any fatal ASR/TTS failure falls back to text-only mode with visible warning.

---

## Multilingual Requirements (EN/RU/UK/AR)

1. Detect language at transcript level and confirm confidence.
2. Keep per-session language lock with optional auto-switch if confidence is strong for repeated turns.
3. Maintain fallback chain:
   - preferred locale voice (`ar-SA`, `uk-UA`, `ru-RU`, `en-US`)
   - same language family
   - default neural voice
4. Expose voice selector in settings with preview and speed/pitch controls.

---

## Safety / Compliance

- Keep existing content moderation pipeline for transcript + model output.
- Strip/avoid logging raw audio unless explicit debug mode enabled.
- Store only required text transcripts + metadata by default.
- Add per-session consent flag for voice capture.

---

## Frontend Work Breakdown

1. **Mic Circle Controller**
   - Add explicit states: idle/listening/thinking/speaking/error.
   - Add interrupt affordance while assistant audio plays.
2. **Live Transcript UI**
   - Show interim transcript in input with subtle style.
   - Lock finalized transcript into outgoing message.
3. **Playback Layer**
   - Queue and play streamed audio chunks.
   - Handle buffer underrun and reconnect gracefully.
4. **Settings**
   - Language preference mode (auto/manual).
   - Voice profile selection.
   - Speed and pitch sliders.

---

## Backend Work Breakdown

1. Create `voice_gateway_service` skeleton + health endpoint.
2. Add WS endpoint and session lifecycle manager.
3. Add ASR adapter interface + one provider implementation.
4. Add TTS adapter interface + one provider implementation.
5. Connect finalized transcript turn to Resonant chat generation.
6. Emit assistant text and audio streams to client.
7. Persist transcript/assistant turns to existing chat history.
8. Add observability (latency, ASR confidence, TTS time-to-first-audio).

---

## Metrics / SLOs

- Time to first transcript token: < 700ms target
- Turn finalize to first assistant text chunk: < 1200ms target
- Turn finalize to first assistant audio chunk: < 1700ms target
- ASR word error rate trend by language
- Session success rate / interruption rate / fallback rate

---

## Rollout Plan

### Phase 1 (MVP)

- Push-to-talk only (manual start/stop).
- Final transcript only (no partials).
- TTS response only after full answer.
- EN + RU initially.

### Phase 2

- Auto end-of-turn with VAD.
- Partial transcript updates.
- Streaming text + streaming audio.
- Add UK + AR.

### Phase 3

- True barge-in and full duplex behavior.
- Advanced voice personas and per-agent voice mapping.
- Quality tuning and cost optimization.

---

## Testing Strategy

- Unit tests for state machine transitions.
- Integration tests for WS protocol events.
- Language coverage tests (EN/RU/UK/AR fixtures).
- Network degradation tests (high latency, packet loss).
- Browser compatibility tests (Chrome/Safari/Edge mobile + desktop).

---

## Risks and Mitigations

1. **Provider instability**
   - Mitigation: adapter fallback chain + circuit breakers.
2. **Latency spikes**
   - Mitigation: region pinning + streaming-first architecture.
3. **Language mis-detection**
   - Mitigation: confidence threshold + manual override.
4. **Cost growth**
   - Mitigation: session limits, caching, adaptive quality.

---

## Immediate Next Implementation Tasks

1. Add frontend `voice session` hook scaffold (state machine only).
2. Add backend `voice_gateway_service` WS skeleton behind gateway auth.
3. Wire mic circle to start/stop session events (no provider yet).
4. Add protocol contract document and sample payloads in `docs/`.
5. Ship behind feature flag: `RESONANT_VOICE_LIVE_CONVERSATION`.
