const SENSOR_LOAD = Object.freeze({ camera: 0.0015, tof: 0.0006, imu: 0.0002,
  nfc: 0.0001, microphone: 0.0015, speaker: 0.001 });
const MINIMUM_STANDBY = 0.02;

export function hasCompleteResourceDeclaration(resources) {
  if (!resources || typeof resources !== "object" || Array.isArray(resources)) return false;
  if (!["standby", "compute", "updateRateHz", "sensors"].every((key) =>
    Object.hasOwn(resources, key))) return false;
  if (!Array.isArray(resources.sensors) || resources.sensors.some((sensor) =>
    !(sensor in SENSOR_LOAD))) return false;
  const standby = Number(resources.standby);
  const compute = Number(resources.compute);
  const updateRateHz = Number(resources.updateRateHz);
  return Number.isFinite(standby) && standby >= 0 && Number.isFinite(compute) &&
    compute >= 0 && compute <= 1 && Number.isFinite(updateRateHz) && updateRateHz >= 0;
}

export function normalizeResourceProfile(resources = {}) {
  const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Object.freeze({
    standby: Math.max(MINIMUM_STANDBY, numberOr(resources.standby, MINIMUM_STANDBY)),
    compute: Math.max(0, Math.min(1, numberOr(resources.compute, 0))),
    updateRateHz: Math.max(0, numberOr(resources.updateRateHz, 0)),
    sensors: Object.freeze([...new Set(Array.isArray(resources.sensors) ? resources.sensors : [])]
      .filter((sensor) => sensor in SENSOR_LOAD)),
  });
}

export function batteryDrainPerSecond({ movementLoad = 0, activeProfile, attachedProfiles = [],
  runtimeCompute = 0, speakerPlaying = false } = {}) {
  const active = normalizeResourceProfile(activeProfile);
  const standby = attachedProfiles.reduce((sum, profile) => sum + normalizeResourceProfile(profile).standby, 0);
  const sensorLoad = active.sensors.reduce((sum, sensor) => sum + SENSOR_LOAD[sensor], 0) +
    (speakerPlaying ? SENSOR_LOAD.speaker : 0);
  const sustainedCompute = active.compute * Math.min(1, active.updateRateHz / 30);
  return 0.0025 + Math.max(0, Math.min(1, movementLoad)) * 0.012 + standby * 0.00025 +
    sensorLoad + sustainedCompute * 0.004 +
    Math.max(0, Math.min(4, runtimeCompute)) * 0.008;
}
