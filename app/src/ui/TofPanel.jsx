import { useEffect } from "react";
import Box from "@mui/material/Box";
import { tofApi } from "../game/tof-sensor.js";
import { useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

const cellColor = (distance, range) => {
  if (distance == null) return "rgba(38,55,70,.72)";
  const u = Math.max(0, Math.min(1, distance / range));
  const hue = 12 + u * 195; // near orange/red -> far blue
  return `hsl(${hue} 78% ${38 + u * 12}%)`;
};

export default function TofPanel() {
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const tof = useGame((s) => s.tof);
  useEffect(() => tofApi.subscribe((next) => useGame.setState({ tof: next })), []);
  if (!entered || menuOpen) return null;

  if (!tof.enabled) return (
    <Box component="button" type="button" onClick={() => tofApi.setEnabled(true)}
      sx={{ position: "fixed", top: "20.7rem", right: "1.5rem", zIndex: 11,
        border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.82)", color: CREAM,
        fontFamily: ANTON, letterSpacing: ".08em", px: 1, py: .6, cursor: "pointer" }}>Show ToF</Box>
  );

  return (
    <Box sx={{ position: "fixed", top: "20.7rem", right: "1.5rem", zIndex: 11,
      width: 280, border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.88)",
      boxShadow: `3px 3px 0 ${COMIC_INK}`, boxSizing: "border-box", p: "7px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: .6 }}>
        <Box sx={{ fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".11em", color: ORANGE }}>
          8×8 TOF · DISTANCE (M)
        </Box>
        <Box component="button" type="button" aria-label="Hide ToF sensor"
          onClick={() => tofApi.setEnabled(false)} sx={{ border: 0, background: "transparent",
            color: CREAM, fontFamily: ANTON, cursor: "pointer" }}>×</Box>
      </Box>
      <Box aria-label="8 by 8 time-of-flight distance grid" sx={{ display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)", gap: "2px" }}>
        {tof.distancesM.map((distance, i) => (
          <Box key={i} title={distance == null ? "No return" : `${distance.toFixed(3)} m`}
            sx={{ aspectRatio: "1", display: "grid", placeItems: "center",
              background: cellColor(distance, tof.rangeM), color: CREAM,
              fontFamily: MONO, fontSize: ".46rem", fontVariantNumeric: "tabular-nums",
              textShadow: "0 1px 2px #000" }}>
            {distance == null ? "—" : distance.toFixed(1)}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: .6,
        fontFamily: MONO, fontSize: ".46rem", color: "rgba(250,248,242,.48)" }}>
        <span>NEAR · ORANGE</span><span>NO RETURN · —</span><span>FAR · BLUE</span>
      </Box>
    </Box>
  );
}

