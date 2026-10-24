// Participant/agent extension point.
//
// Add code-backed behaviours to this array, then associate them with a profile
// in the Testing Bay. Hardware is read-only and fixed by hardware-spec.js.
// A behaviour factory returns an isolated controller with:
//   step({ world, sensors, command, limits, setStatus, emitAction, dt })
// `world` is supplied by the swappable perception adapter; `command` is the
// same [forward, strafe, yaw] command path used by manual and official modes.
// `sensors` exposes the fixed hardware contract and live simulated readings.
// For local camera inference, call sensors.camera.render(renderer, camera),
// then read the renderer canvas into the bundled/local vision model.
// Local vision models may be imported here, but Mission blocks all networking.
export const CUSTOM_AUTONOMOUS_BEHAVIORS = [];
