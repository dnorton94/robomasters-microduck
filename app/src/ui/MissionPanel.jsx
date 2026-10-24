import Box from "@mui/material/Box";
import { gameApi, useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

export default function MissionPanel() {
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const mode = useGame((state) => state.environmentMode);
  const mission = useGame((state) => state.mission);
  if (!entered || menuOpen || mode !== "mission") return null;
  const terminal = mission.status === "success" || mission.status === "failed";
  const accent = mission.status === "success" ? "#35e6a1"
    : mission.status === "failed" ? "#ff3b30" : ORANGE;
  return <>
    {mission.status === "failed" && <Box aria-hidden sx={{ position: "fixed", inset: 8,
      zIndex: 8, pointerEvents: "none", border: "5px solid rgba(255,32,32,.72)",
      boxShadow: "inset 0 0 60px rgba(255,0,0,.32)" }} />}
    <Box role="status" aria-live="polite" sx={{ position: "fixed", top: "5.2rem", left: "50%",
      transform: "translateX(-50%)", zIndex: 11, width: 360, boxSizing: "border-box",
      border: `2px solid ${accent}`, background: "rgba(8,8,12,.9)",
      boxShadow: `4px 4px 0 ${COMIC_INK}`, p: ".65rem .8rem" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "baseline" }}>
        <Box sx={{ fontFamily: ANTON, color: accent, letterSpacing: ".08em" }}>STAGE ONE · THE RED PLATE</Box>
        <Box sx={{ fontFamily: MONO, color: "rgba(250,248,242,.45)", fontSize: ".46rem" }}>
          ATTEMPT {mission.attempt}
        </Box>
      </Box>
      <Box sx={{ mt: .45, fontFamily: MONO, color: CREAM, fontSize: ".57rem", letterSpacing: ".06em" }}>
        {mission.feedback}
      </Box>
      <Box sx={{ mt: .4, fontFamily: MONO, color: "rgba(250,248,242,.46)", fontSize: ".47rem" }}>
        AUTONOMOUS INPUT ONLY · OBSERVE FEEDBACK · ADAPT
      </Box>
      {terminal && <Box component="button" type="button" onClick={() => gameApi.resetMission?.()}
        sx={{ mt: .6, width: "100%", border: `1px solid ${accent}`, background: "transparent",
          color: accent, fontFamily: ANTON, py: .35, cursor: "pointer" }}>RETRY STAGE</Box>}
    </Box>
  </>;
}
