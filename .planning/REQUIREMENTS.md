# Requirements: MediaPipe Playground

**Defined:** 2026-07-27
**Core Value:** Every one of the 5 showcases must load a real MediaPipe model in-browser and produce a working, recordable/downloadable result from the user's own camera/mic/keyboard input — with zero server round-trips.

## v1 Requirements

### Platform (shared infrastructure — every demo depends on these)

- [ ] **PLAT-01**: User can land on a hub/home page and see all 5 showcases presented as distinct cards with name, one-line description, and a launch link
- [ ] **PLAT-02**: User navigates from the hub to any demo as a full page load (separate HTML entry point per demo, not client-side routing) so only one demo's ML runtime is ever loaded at a time
- [ ] **PLAT-03**: Every camera/mic-based demo requests `getUserMedia` permission with a clear explanation of why it's needed before the browser prompt appears
- [ ] **PLAT-04**: If camera/mic permission is denied or no device is present, the user sees a specific, actionable error message (not a silent failure or generic crash)
- [ ] **PLAT-05**: Every demo shows a loading state while its MediaPipe model downloads/initializes, including a progress indicator for any model file over a few MB
- [ ] **PLAT-06**: Every demo shows which hardware backend is active (WebGPU accelerated vs WASM/CPU fallback) — except the Chat demo, which has no WASM fallback at all (see CHAT-08) and instead shows a clear "WebGPU required" capability check before allowing model download to start
- [ ] **PLAT-07**: If a demo's model fails to download (network error, CORS block, 404) or the browser runs out of memory, the user sees a specific error message explaining what happened, not a blank page or unhandled exception
- [ ] **PLAT-08**: Every demo cleanly releases its camera/mic stream and MediaPipe task instances when the user navigates away (no dangling camera-on indicator, no memory leak across repeated visits)
- [ ] **PLAT-09**: Every recording/download action (image or video/audio file) completes as a real local file save via the browser's download mechanism, with no server upload involved

### Chat (On-Device AI Chat demo)

- [ ] **CHAT-01**: User can pick between at least 3 model size tiers (small ~250-300MB, medium ~700MB-1GB, large ~2-3GB) before initializing the engine
- [ ] **CHAT-02**: User clicks an explicit "Initialize" action that downloads the selected model with a visible progress bar (percent + bytes transferred)
- [ ] **CHAT-03**: Once initialized, the model is cached (Cache API) so revisiting the page does not re-download it
- [ ] **CHAT-04**: User can type a question into a text input and submit it
- [ ] **CHAT-05**: The response streams into the UI token-by-token/chunk-by-chunk as it's generated, not all at once at the end
- [ ] **CHAT-06**: User can see a time-to-first-token indicator after asking a question
- [ ] **CHAT-07**: User can cancel an in-progress generation
- [ ] **CHAT-08**: Before offering the model picker, the page checks for WebGPU support and shows a clear "WebGPU required, not available in this browser" message with no way to proceed if it's missing — this demo has no WASM/CPU fallback path (unlike the 4 vision demos), so the check must be explicit and block early rather than fail confusingly mid-download

### Synth (Gesture Synth Instrument demo)

- [ ] **SYNTH-01**: User's hand position controls pitch (mapped to a musical scale, not raw unquantized frequency, so any hand position sounds musically coherent)
- [ ] **SYNTH-02**: User's other hand (or a second axis) controls volume or filter cutoff, giving expressive control beyond a single on/off note
- [ ] **SYNTH-03**: User can switch between at least 4 distinct instrument voices (e.g. Synth, Violin-style, Pad, Bass, Pluck/Bell) using a recognized hand gesture, without touching the keyboard/mouse
- [ ] **SYNTH-04**: The current instrument name and the note currently being played are visibly displayed
- [ ] **SYNTH-05**: User can enable their microphone to sing/speak alongside the instrument
- [ ] **SYNTH-06**: User can start and stop a recording that mixes the instrument audio and mic input into a single track
- [ ] **SYNTH-07**: User can download the finished recording as a standard audio file
- [ ] **SYNTH-08**: User has manual controls (sliders/knobs) for at least: master volume, a filter parameter, and one time-based effect (reverb or delay) — the instrument is not a bare fixed-parameter theremin
- [ ] **SYNTH-09**: `Tone.start()` (or equivalent AudioContext unlock) is triggered by an explicit user gesture (e.g. clicking "Start"), and the UI clearly indicates before that click that audio hasn't started yet

### Canvas (Air Canvas demo)

- [ ] **CANVAS-01**: User can draw a continuous line in the air by pinching thumb and index finger together and moving their hand, tracked live via webcam
- [ ] **CANVAS-02**: Releasing the pinch stops drawing (lifts the "pen") without erasing existing strokes
- [ ] **CANVAS-03**: User can change the drawing color (via on-screen swatch or gesture)
- [ ] **CANVAS-04**: User can clear the entire canvas with one explicit action
- [ ] **CANVAS-05**: User can download the current drawing as a PNG image file

### Filters (Magic Mirror Face Filters demo)

- [ ] **FILT-01**: User sees at least 3 selectable AR filters (e.g. glasses, top hat, mustache, dog nose/ears) rendered live, tracked to their face position/orientation via webcam
- [ ] **FILT-02**: Filters are drawn with canvas primitives, not external image assets
- [ ] **FILT-03**: User can switch between filters without reloading the page or losing camera access
- [ ] **FILT-04**: User can take a snapshot of the current filtered view and download it as a PNG
- [ ] **FILT-05**: User can start/stop a video recording of the filtered view (with audio) and download it as a video file

### GreenScreen (Green Screen Studio demo)

- [ ] **GREEN-01**: User's background is separated from their body in real time via webcam with no physical green screen required
- [ ] **GREEN-02**: User can choose from at least: background blur, a solid color, and a preset gradient
- [ ] **GREEN-03**: User can upload their own image to use as the replacement background
- [ ] **GREEN-04**: User can start/stop a recording of the composited (background-replaced) view and download it as a video file

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extended Showcases

- **SHOW-01**: Sign Language Speller (hand-shape-to-letter recognition, spells words on screen)
- **SHOW-02**: Pose Dance Mirror / Rep Counter (skeleton overlay, squat/pushup rep counting)

### Polish

- **POLISH-01**: Shareable direct links to a specific demo's current state (e.g. selected filter, selected instrument)
- **POLISH-02**: Real sampled-instrument audio (actual violin/etc. recordings) instead of tuned synth approximations
- **POLISH-03**: Mobile-responsive touch-friendly controls for demos currently assuming a webcam-equipped desktop/laptop

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Server-side inference or any cloud/API-key-gated AI | Violates the entire zero-server, on-device Core Value |
| User accounts, saved galleries, cloud storage of recordings | Everything downloads locally; nothing is persisted server-side |
| Native mobile apps | Web-only for v1 |
| Real sampled-instrument audio for the synth demo | No royalty-free sample source lined up; synth approximation is honest and immediate (see POLISH-02 for future) |
| Sign Language Speller / Pose Dance Mirror as v1 showcases | Considered during scoping, deliberately deferred to v2 in favor of the 5 selected demos |
| SPA/client-side routing between demos | Multi-page architecture chosen instead, to avoid loading 5 concurrent WASM/ML runtimes |

## Traceability

Which phases cover which requirements. Will be finalized by the roadmapper; draft mapping below reflects the intended 1-phase-shared-infra + 1-phase-per-showcase structure.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 through PLAT-09 | Phase 1 (Shared Infrastructure) | Pending |
| CHAT-01 through CHAT-08 | Phase 2 (AI Chat) | Pending |
| SYNTH-01 through SYNTH-09 | Phase 3 (Gesture Synth Instrument) | Pending |
| CANVAS-01 through CANVAS-05 | Phase 4 (Air Canvas) | Pending |
| FILT-01 through FILT-05 | Phase 5 (Magic Mirror Face Filters) | Pending |
| GREEN-01 through GREEN-04 | Phase 6 (Green Screen Studio) | Pending |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 44 (draft — subject to roadmapper finalization)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-27*
*Last updated: 2026-07-27 after initial definition*
