// Course-owned hardware contract. Autonomous behaviours may consume these
// devices but must not add, remove, resize, or reconfigure them.
export const MICRODUCK_HARDWARE = Object.freeze({
  camera: Object.freeze({ count: 1, mount: "head", fovDeg: 72 }),
  tof: Object.freeze({ count: 1, mount: "head", width: 8, height: 8, rangeM: 2, hz: 10 }),
  imu: Object.freeze({ count: 2, mounts: Object.freeze(["body", "head"]), axes: 6 }),
  nfc: Object.freeze({ count: 2, mounts: Object.freeze(["head", "beak"]) }),
  microphone: Object.freeze({ count: 1, source: "local-browser-input" }),
  speaker: Object.freeze({ count: 1, mount: "head", channels: 1, sampleRateHz: 16000 }),
});
