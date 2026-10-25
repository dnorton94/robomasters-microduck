import Box from "@mui/material/Box";
import { batteryApi } from "../game/battery-sensor.js";
import { useGame } from "../store.js";
import { MONO, ORANGE } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import SensorEye from "./SensorEye.jsx";

export default function BatteryPanel() {
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const sensorsVisible = useGame((state) => state.sensorsVisible);
  const battery = useGame((state) => state.battery);
  if (!entered || menuOpen || !sensorsVisible) return null;
  if (!battery.enabled) return <Box component="button" type="button" aria-label="Show battery sensor"
    onClick={() => batteryApi.setEnabled(true)} sx={{ position: "fixed", top: "25.2rem", left: "1.5rem",
      zIndex: 11, border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.82)", color: CREAM,
      fontFamily: ANTON, px: 1, py: .6, cursor: "pointer" }}><SensorEye visible={false} /></Box>;

  const level = Math.max(0, Math.min(100, battery.levelPct));
  const levelColor = level <= 15 ? "#ff5b52" : level <= 35 ? ORANGE : "#38ef91";
  return <Box sx={{ position: "fixed", top: "25.2rem", left: "1.5rem", zIndex: 11, width: 260,
    border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.88)", boxShadow: `3px 3px 0 ${COMIC_INK}`,
    boxSizing: "border-box", p: "7px" }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box sx={{ fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".11em", color: ORANGE }}>
        BATTERY · POWER
      </Box>
      <Box component="button" type="button" aria-label="Hide battery sensor"
        onClick={() => batteryApi.setEnabled(false)} sx={{ border: 0, background: "transparent", color: CREAM,
          cursor: "pointer", display: "grid", placeItems: "center", width: 24, height: 24 }}>
        <SensorEye visible />
      </Box>
    </Box>
    <Box sx={{ mt: .35, height: 12, border: `1px solid ${CREAM}`, p: "2px", boxSizing: "border-box" }}>
      <Box sx={{ width: `${level}%`, height: "100%", background: levelColor, transition: "width .3s linear" }} />
    </Box>
    <Box sx={{ mt: .45, display: "flex", justifyContent: "space-between", fontFamily: MONO,
      fontSize: ".58rem", color: CREAM, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ color: levelColor }}>{level.toFixed(1)}%</span>
      <span>{battery.voltageV.toFixed(2)} V</span>
      <span>~{battery.estimatedMinutes} MIN</span>
    </Box>
  </Box>;
}
