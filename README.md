# MediaPipe Playground

A single website hosting five creative, on-device AI demos — each one running Google's MediaPipe entirely inside your browser. No backend, no API keys, no accounts, no telemetry. Every demo ends with something real you can download: a recording, an image, or an audio file.

> **Status:** Planning complete, implementation not yet started. See [Project Status](#project-status) below.

## The 5 Showcases

| Demo | What it does | MediaPipe capability |
|------|---------------|------------------------|
| **On-Device AI Chat** | Ask anything, get a streamed answer from an LLM running fully in-browser. Pick a small/medium/large model tier. | `@mediapipe/tasks-genai` (`LlmInference`) |
| **Gesture Synth Instrument** | Play a real synthesizer with your hands — pitch, volume/filter, and instrument voice all controlled by gesture. Sing along and download the recording. | `@mediapipe/tasks-vision` (`GestureRecognizer`) + Tone.js |
| **Air Canvas** | Draw in mid-air with a pinch gesture. Download your art as a PNG. | `@mediapipe/tasks-vision` (`HandLandmarker`) |
| **Magic Mirror Face Filters** | Real-time AR filters (glasses, hats, and more) tracked to your face, drawn live with code. Snapshot or record and download. | `@mediapipe/tasks-vision` (`FaceLandmarker`) |
| **Green Screen Studio** | Replace or blur your background with no physical green screen. Record and download the result. | `@mediapipe/tasks-vision` (`ImageSegmenter`) |

## Tech Stack

Vite (multi-page app, no framework) + Tailwind CSS v4 + `@mediapipe/tasks-vision` / `@mediapipe/tasks-genai` + Tone.js. Full rationale and version pins: [`.planning/research/STACK.md`](.planning/research/STACK.md).

## Project Structure

```
.
├── docs/                  Product spec — read these first
│   ├── PRD.md              What we're building and why
│   ├── UI-SPEC.md           Design system + per-page layout spec
│   └── FLOW.md              Sitemap and user journeys
├── .planning/               GSD planning artifacts (source of truth for scope/sequencing)
│   ├── PROJECT.md            Context, constraints, key decisions
│   ├── REQUIREMENTS.md       44 testable v1 requirements
│   ├── ROADMAP.md            6 phases: shared infra → 5 independent demos
│   ├── research/             Stack/features/architecture/pitfalls research
│   └── phases/01-.../06-.../ One folder per phase, each with its own resources/
├── TODO.md                  Phase-by-phase execution checklist
├── CLAUDE.md                 Claude Code / GSD workflow guide
└── AGENTS.md                 Guide for any other AI coding agent working in this repo
```

## Project Status

Everything above `TODO.md` exists as planning documentation only — no application code has been written yet. The build proceeds phase by phase per [`.planning/ROADMAP.md`](.planning/ROADMAP.md):

1. **Shared Infrastructure** — hub page, camera/mic handling, model-loading + progress, backend/capability badges, recording→download flow, cleanup — required before any demo
2. **Air Canvas**
3. **Gesture Synth Instrument**
4. **Magic Mirror Face Filters**
5. **Green Screen Studio**
6. **AI Chat**

Phases 2-6 are mutually independent once Phase 1 is done. See [`TODO.md`](TODO.md) for the full technical checklist, or [`.planning/ROADMAP.md`](.planning/ROADMAP.md) for success criteria per phase.

## Getting Started

Not yet runnable — `package.json` / `vite.config.js` land in Phase 1. Once they exist:

```bash
npm install
npm run dev       # local dev server
npm run build && npm run preview   # production build (verify this too, not just dev)
```

## Principles

- **Zero server, always.** Every demo runs entirely in your browser. Model files are fetched once, cached locally (Cache API), and never uploaded anywhere.
- **No dead ends.** Every demo produces something you can keep — a file on your disk, not just a screen you watch.
- **Fail clearly.** Camera/mic denied, unsupported browser, model download failure — every case gets a specific, readable message, never a silent crash.
