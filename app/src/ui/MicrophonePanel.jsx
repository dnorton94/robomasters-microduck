import { useEffect } from "react";
import Box from "@mui/material/Box";
import { microphoneApi } from "../game/microphone.js";
import { useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

export default function MicrophonePanel() {
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const mic = useGame((s) => s.microphone);

  useEffect(() => microphoneApi.subscribe((next) => useGame.setState({ microphone: next })), []);
  useEffect(() => () => microphoneApi.stop(), []);
  if (!entered || menuOpen) return null;

  const listening = mic.status === "listening";
  const requesting = mic.status === "requesting";
  return (
    <Box sx={{ position: "fixed", top: "16.5rem", right: "1.5rem", zIndex: 11,
      width: 280, border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.82)",
      boxShadow: `3px 3px 0 ${COMIC_INK}`, boxSizing: "border-box", p: "6px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box component="button" type="button" disabled={requesting}
          onClick={() => listening ? microphoneApi.stop() : microphoneApi.start()}
          sx={{ border: 0, background: listening ? "#d83b32" : ORANGE, color: listening ? CREAM : COMIC_INK,
            fontFamily: ANTON, letterSpacing: ".08em", px: 1.1, py: .65, cursor: "pointer" }}>
          {requesting ? "Allow mic…" : listening ? "Stop mic" : "Enable mic"}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontFamily: MONO, color: listening ? CREAM : "rgba(250,248,242,.62)",
            fontSize: ".58rem", letterSpacing: ".1em", mb: .45 }}>
            {listening ? `MICROPHONE · LEVEL ${Math.round(mic.level * 100)}%` : "MICROPHONE SENSOR · OFF"}
          </Box>
          <Box sx={{ height: 5, background: "rgba(250,248,242,.15)" }}>
            <Box sx={{ width: `${mic.level * 100}%`, height: "100%", background: ORANGE,
              transition: "width 60ms linear" }} />
          </Box>
        </Box>
      </Box>
      {mic.error && <Box role="alert" sx={{ mt: .65, fontFamily: MONO, fontSize: ".56rem", color: "#ff766e" }}>{mic.error}</Box>}
      <Box sx={{ mt: .55, fontFamily: MONO, fontSize: ".48rem", color: "rgba(250,248,242,.38)" }}>
        LOCAL INPUT · NOT RECORDED OR SENT
      </Box>
    </Box>
  );
}

