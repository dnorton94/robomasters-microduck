const SENSOR_LOAD = Object.freeze({ camera: 0.0015, tof: 0.0006, imu: 0.0002,
  nfc: 0.0001, microphone: 0.0015, speaker: 0.001 });

export function normalizeResourceProfile(resources = {}) {
  const numberOr = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Object.freeze({
    standby: Math.max(0, numberOr(resources.standby, 0.02)),
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
