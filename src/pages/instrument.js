import "../styles.css";
import { GestureRecognizer } from "@mediapipe/tasks-vision";
import * as Tone from "tone";
import { attachCamera, requestMedia, stopMedia } from "../shared/camera.js";
import { MODEL_URLS } from "../shared/constants.js";
import { fitCanvasToVideo, drawMirroredVideo, drawHandSkeleton } from "../shared/canvas-utils.js";
import { createDetectionLoop } from "../shared/detection-loop.js";
import { createErrorBoundary, classifyRuntimeError } from "../shared/error-boundary.js";
import { formatBytes } from "../shared/format.js";
import { detectVisionBackend, renderBackendBadge } from "../shared/backend-badge.js";
import { createMediaRecorder } from "../shared/recorder.js";
import { RecordPreviewFlow } from "../shared/record-preview-download.js";
import { fetchModelAsset, getVisionFileset } from "../shared/task-loader.js";
import { bindPageTeardown, registerDisposer, registerTask } from "../shared/task-lifecycle.js";
import { MonotonicTimestamp } from "../shared/timestamp-counter.js";

bindPageTeardown();
const $ = (selector) => document.querySelector(selector);
const video = /** @type {HTMLVideoElement} */ ($("#video"));
const canvas = /** @type {HTMLCanvasElement} */ ($("#display-canvas"));
const context = canvas.getContext("2d");
const errorBoundary = createErrorBoundary($("#error-panel"));
const timestamp = new MonotonicTimestamp();
const notes = ["C3","D3","E3","G3","A3","C4","D4","E4","G4","A4","C5","D5"];
const voices = [
  { name: "Synth", gesture: "Victory", create: () => new Tone.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: .02, decay: .18, sustain: .35, release: .25 } }) },
  { name: "Violin-style", gesture: "Thumb_Up", create: () => new Tone.FMSynth({ harmonicity: 1.8, modulationIndex: 3, envelope: { attack: .18, decay: .2, sustain: .75, release: .7 } }) },
  { name: "Pad", gesture: "Open_Palm", create: () => new Tone.AMSynth({ harmonicity: .7, envelope: { attack: .5, decay: .2, sustain: .8, release: 1.4 } }) },
  { name: "Bass", gesture: "Closed_Fist", create: () => new Tone.MonoSynth({ oscillator: { type: "square" }, filter: { Q: 2, type: "lowpass", rolloff: -24 }, envelope: { attack: .02, decay: .2, sustain: .5, release: .3 } }) },
  { name: "Pluck", gesture: "Pointing_Up", create: () => new Tone.PluckSynth({ attackNoise: 1, dampening: 3500, resonance: .88 }) },
];
let recognizer;
let synth;
let filter;
let reverb;
let master;
let destination;
let audioReady = false;
let currentVoice = 0;
let currentNote;
let activeGesture = "None";
let lastGestureSwitch = 0;
let lastVideoTime = -1;
let micStream;
let micSource;

const flow = new RecordPreviewFlow({
  recordButton: $("#record-button"),
  stopButton: $("#stop-button"),
  indicator: $("#recording-indicator"),
  timer: $("#recording-timer"),
  previewBox: $("#preview-box"),
  preview: $("#preview"),
}, { kind: "audio", filename: "gesture-synth-performance.webm" });
$("#download-recording").onclick = () => flow.download();
$("#retake").onclick = () => flow.reset();
$("#record-button").onclick = () => flow.start();
$("#stop-button").onclick = () => flow.stop().catch((error) => errorBoundary.show(error));

function setVoice(index) {
  if (!audioReady || index === currentVoice && synth) return;
  synth?.triggerRelease?.();
  synth?.dispose?.();
  currentVoice = index;
  synth = voices[index].create().connect(filter);
  $("#instrument-name").textContent = voices[index].name;
}

async function startAudio() {
  try {
    await Tone.start();
    filter = new Tone.Filter(Number($("#filter").value), "lowpass");
    reverb = new Tone.Reverb({ decay: 2.5, wet: Number($("#reverb").value) });
    master = new Tone.Volume(Number($("#volume").value));
    destination = Tone.getContext().rawContext.createMediaStreamDestination();
    filter.connect(reverb);
    reverb.connect(master);
    master.connect(Tone.getDestination());
    master.connect(destination);
    audioReady = true;
    currentVoice = -1;
    setVoice(0);
    flow.setRecorder(createMediaRecorder(destination.stream, { kind: "audio" }));
    $("#record-button").disabled = false;
    $("#audio-button").textContent = "Audio ready";
    $("#audio-button").disabled = true;
  } catch (error) {
    errorBoundary.show(error);
  }
}

async function toggleMic() {
  try {
    if ($("#mic-toggle").checked) {
      micStream = await requestMedia({ audio: { echoCancellation: true }, video: false }, "Microphone");
      micSource = Tone.getContext().rawContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
    } else {
      micSource?.disconnect();
      stopMedia(micStream);
      micStream = undefined;
    }
  } catch (error) {
    $("#mic-toggle").checked = false;
    errorBoundary.show(error);
  }
}

$("#audio-button").onclick = startAudio;
$("#mic-toggle").onchange = toggleMic;
$("#volume").oninput = () => { if (master) master.volume.rampTo(Number($("#volume").value), .08); };
$("#filter").oninput = () => { if (filter) filter.frequency.rampTo(Number($("#filter").value), .08); };
$("#reverb").oninput = () => { if (reverb) reverb.wet.rampTo(Number($("#reverb").value), .08); };

const loop = createDetectionLoop(() => {
  if (!recognizer || video.readyState < 2 || !context) return;
  if (!fitCanvasToVideo(canvas, video)) return;
  drawMirroredVideo(context, video, canvas.width, canvas.height);
  if (video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;
  const result = recognizer.recognizeForVideo(video, timestamp.next());
  const hands = result.landmarks ?? [];
  if (!hands.length) {
    $("#viewport-placeholder").classList.remove("hidden");
    if (currentNote && synth) synth.triggerRelease?.();
    currentNote = undefined;
    $("#note-name").textContent = "—";
    return;
  }
  $("#viewport-placeholder").classList.add("hidden");
  hands.forEach((hand) => drawHandSkeleton(context, hand, canvas.width, canvas.height));
  const primary = hands[0][8];
  const noteIndex = Math.max(0, Math.min(notes.length - 1, Math.round((1 - primary.y) * (notes.length - 1))));
  const note = notes[noteIndex];
  $("#note-name").textContent = note;

  if (audioReady && note !== currentNote) {
    synth?.triggerRelease?.();
    synth?.triggerAttack?.(note);
    currentNote = note;
  }
  if (filter) {
    const expression = hands[1]?.[8]?.y ?? primary.x;
    filter.frequency.rampTo(300 + (1 - expression) * 6000, .08);
  }

  const gesture = result.gestures?.[0]?.[0]?.categoryName ?? "None";
  if (gesture !== activeGesture) {
    activeGesture = gesture;
    const voiceIndex = voices.findIndex((voice) => voice.gesture === gesture);
    if (voiceIndex >= 0 && performance.now() - lastGestureSwitch > 650) {
      setVoice(voiceIndex);
      lastGestureSwitch = performance.now();
    }
  }
});

async function start() {
  errorBoundary.hide();
  $("#permission-panel").classList.add("hidden");
  $("#loading-panel").classList.remove("hidden");
  try {
    await attachCamera(video);
    const backend = await detectVisionBackend();
    renderBackendBadge($("#backend-badge"), backend);
    const asset = await fetchModelAsset(MODEL_URLS.gesture, {
      onProgress: ({ loaded, total, percent, fromCache }) => {
        $("#progress-fill").style.width = `${percent}%`;
        $("#progress-percent").textContent = total ? `${Math.round(percent)}%` : formatBytes(loaded);
        $("#progress-label").textContent = fromCache ? "Loaded from browser cache" : `${formatBytes(loaded)} / ${total ? formatBytes(total) : "unknown"}`;
      },
    });
    registerDisposer(asset.revoke);
    recognizer = registerTask(await GestureRecognizer.createFromOptions(await getVisionFileset(), {
      baseOptions: { modelAssetPath: asset.url, delegate: backend.backend === "WebGPU" ? "GPU" : "CPU" },
      runningMode: "VIDEO",
      numHands: 2,
    }));
    $("#loading-panel").classList.add("hidden");
    $("#demo").classList.remove("hidden");
    loop.start();
  } catch (error) {
    $("#loading-panel").classList.add("hidden");
    errorBoundary.show(classifyRuntimeError(error), { onRetry: start });
  }
}
$("#start-button").onclick = start;
registerDisposer(() => {
  loop.stop();
  synth?.dispose?.(); filter?.dispose?.(); reverb?.dispose?.(); master?.dispose?.();
});
