// Participant/agent extension point.
//
// Add code-backed behaviours to this array, then associate them with a profile
// in the Testing Bay. Hardware is read-only and fixed by hardware-spec.js.
// A behaviour factory returns an isolated controller with:
//   step({ world, sensors, command, limits, setStatus, emitAction, reportWork, dt })
// `world` is supplied by the swappable perception adapter; `command` is the
// same [forward, strafe, yaw] command path used by manual and official modes.
// `sensors` exposes the fixed hardware contract and live simulated readings.
// For local camera inference, call sensors.camera.render(renderer, camera),
// then read the renderer canvas into the bundled/local vision model.
// Stage Two accepts a decoded observation through:
//   emitAction("reportQr", { color: "RED", payload: decodedQrText })
// The mission validates that report against camera pose, range and the QR.
// The fixed speaker accepts locally synthesized mono PCM through:
//   await sensors.speaker.play({ samples: float32Pcm, sampleRateHz: 16000 })
// Missions observe that emitted waveform, never a participant-claimed text.
// Local vision models may be imported here, but Mission blocks all networking.
// Declare realistic continuous resource use on each registry entry:
//   resources: { standby: 0.03, compute: 0.7, updateRateHz: 10,
//                sensors: ["camera", "tof"] }
// Expensive bursts should be reported when they actually happen:
//   reportWork({ compute: 0.9, durationS: 0.12 }) // one OCR/inference call
export const CUSTOM_AUTONOMOUS_BEHAVIORS = [];
