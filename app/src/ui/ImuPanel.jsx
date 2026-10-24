import { useEffect } from "react";
import Box from "@mui/material/Box";
import { imuApi } from "../game/imu-sensor.js";
import { useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

const axes = ["X", "Y", "Z"];
const VectorRow = ({ label, values, unit }) => (
  <Box sx={{ py: .35, borderTop: "1px solid rgba(250,248,242,.12)" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", color: "rgba(250,248,242,.52)",
      fontFamily: MONO, fontSize: ".47rem", letterSpacing: ".07em" }}>
      <span>{label}</span><span>{unit}</span>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: .4, mt: .2 }}>
      {values.map((value, index) => <Box key={axes[index]} sx={{ fontFamily: MONO,
        fontSize: ".56rem", color: CREAM, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: ORANGE }}>{axes[index]}</span> {Number(value).toFixed(2)}
      </Box>)}
    </Box>
  </Box>
);

function ImuCard({ sensor, label, top }) {
  const imu = useGame((state) => state.imu[sensor]);
  if (!imu.enabled) return (
    <Box component="button" type="button" onClick={() => imuApi.setEnabled(sensor, true)}
      sx={{ position: "fixed", top, left: "1.5rem", zIndex: 11, border: `2px solid ${CREAM}`,
        background: "rgba(8,8,12,.82)", color: CREAM, fontFamily: ANTON,
        letterSpacing: ".08em", px: 1, py: .6, cursor: "pointer" }}>Show {label} IMU</Box>
  );
  return (
    <Box sx={{ position: "fixed", top, left: "1.5rem", zIndex: 11, width: 260,
      border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.88)",
      boxShadow: `3px 3px 0 ${COMIC_INK}`, boxSizing: "border-box", p: "7px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".11em", color: ORANGE }}>
          {label} IMU · 6-AXIS
        </Box>
        <Box component="button" type="button" aria-label={`Hide ${label} IMU`}
          onClick={() => imuApi.setEnabled(sensor, false)} sx={{ border: 0, background: "transparent",
            color: CREAM, fontFamily: ANTON, cursor: "pointer" }}>×</Box>
      </Box>
      <VectorRow label="ACCELEROMETER" values={imu.acceleration} unit="M/S²" />
      <VectorRow label="GYROSCOPE" values={imu.angularVelocity} unit="RAD/S" />
      <VectorRow label="ORIENTATION" values={imu.orientation} unit="DEG" />
    </Box>
  );
}

export default function ImuPanel() {
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const sensorsVisible = useGame((state) => state.sensorsVisible);
  useEffect(() => imuApi.subscribe((imu) => useGame.setState({ imu })), []);
  if (!entered || menuOpen || !sensorsVisible) return null;
  return <><ImuCard sensor="body" label="BODY" top="5.2rem" />
    <ImuCard sensor="head" label="HEAD" top="15.2rem" /></>;
}
