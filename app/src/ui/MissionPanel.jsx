import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { useState } from "react";
import { gameApi, useGame } from "../store.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import { MONO, ORANGE } from "../theme.js";
import { STAGE_THREE_CODE, STAGE_TWO_CODE } from "../game/missions/stage-two.js";

const plateFlash = keyframes`
  0%, 100% { opacity: .08; }
  50% { opacity: .3; }
`;

export default function MissionPanel() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const mode = useGame((state) => state.environmentMode);
  const mission = useGame((state) => state.mission);
  if (!entered || menuOpen || mode !== "mission") return null;
  const standing = mission.status === "timing" || mission.status === "armed";
  const activate = () => {
    const accepted = gameApi.activateMissionStage?.(code);
    setCodeError(!accepted);
    if (accepted) setCode("");
  };
  return <>
    {standing && <Box aria-hidden sx={{ position: "fixed", inset: 0, zIndex: 8,
      pointerEvents: "none", background: "#20ff87", mixBlendMode: "screen",
      animation: `${plateFlash} .55s ease-in-out infinite` }} />}
    {mission.status === "failed" && <Box aria-hidden sx={{ position: "fixed", inset: 8,
      zIndex: 8, pointerEvents: "none", border: "5px solid rgba(255,32,32,.72)",
      boxShadow: "inset 0 0 60px rgba(255,0,0,.32)" }} />}
    {mission.stage === 1 && mission.status === "success" && <Box role="dialog" aria-label="Stage two activation"
      sx={{ position: "fixed", zIndex: 20, left: "50%", top: "18%", transform: "translateX(-50%)",
        width: 390, maxWidth: "calc(100vw - 2rem)", p: 2, border: `3px solid ${CREAM}`,
        background: "rgba(7,8,12,.96)", boxShadow: `7px 7px 0 ${COMIC_INK}` }}>
      <Box sx={{ fontFamily: ANTON, color: "#38ef91", fontSize: "1.25rem", letterSpacing: ".06em" }}>
        STAGE ONE COMPLETE
      </Box>
      <Box sx={{ mt: .5, color: CREAM, fontFamily: MONO, fontSize: ".7rem" }}>STAGE TWO ACCESS CODE</Box>
      <Box sx={{ my: 1, p: 1, color: ORANGE, border: `1px solid ${ORANGE}`, textAlign: "center",
        fontFamily: MONO, fontSize: "1rem", letterSpacing: ".12em" }}>{STAGE_TWO_CODE}</Box>
      <Box sx={{ display: "flex", gap: .7 }}>
        <Box component="input" aria-label="Stage access code" value={code}
          onChange={(event) => { setCode(event.target.value); setCodeError(false); }}
          onKeyDown={(event) => { if (event.key === "Enter") activate(); }} placeholder="Enter access code"
          sx={{ flex: 1, minWidth: 0, p: .8, border: `1px solid ${codeError ? "#ff5b52" : CREAM}`,
            background: "#111", color: CREAM, fontFamily: MONO }} />
        <Box component="button" type="button" onClick={activate}
          sx={{ px: 1.4, border: 0, background: ORANGE, color: COMIC_INK, fontFamily: ANTON }}>ACTIVATE</Box>
      </Box>
      {codeError && <Box role="alert" sx={{ mt: .6, color: "#ff746a", fontFamily: MONO, fontSize: ".62rem" }}>
        ACCESS CODE NOT RECOGNISED
      </Box>}
    </Box>}
    {mission.stage === 2 && mission.status === "active" && <Box sx={{ position: "fixed", zIndex: 9, top: 82, left: "50%",
      transform: "translateX(-50%)", px: 1.4, py: .7, border: `2px solid ${ORANGE}`,
      background: "rgba(7,8,12,.88)", color: CREAM, fontFamily: MONO, fontSize: ".68rem",
      letterSpacing: ".06em" }}>STAGE TWO · THE THREE CORES</Box>}
    {mission.stage === 2 && mission.status === "success" && <Box role="status"
      sx={{ position: "fixed", zIndex: 20, left: "50%", top: "18%", transform: "translateX(-50%)",
        p: 2, border: "3px solid #38ef91", background: "rgba(7,8,12,.96)", color: "#38ef91",
        fontFamily: ANTON, textAlign: "center", fontSize: "1.3rem", letterSpacing: ".08em" }}>
      STAGE TWO COMPLETE
      <Box sx={{ mt: 1, p: .8, border: `1px solid ${ORANGE}`, color: ORANGE,
        fontFamily: MONO, fontSize: ".9rem" }}>{STAGE_THREE_CODE}</Box>
    </Box>}
    {mission.stage === 3 && <Box role="status" sx={{ position: "fixed", zIndex: 9, top: 82, left: "50%",
      transform: "translateX(-50%)", px: 1.4, py: .7, border: `2px solid ${ORANGE}`,
      background: "rgba(7,8,12,.88)", color: CREAM, fontFamily: MONO, fontSize: ".68rem",
      letterSpacing: ".06em" }}>STAGE THREE · THE VOICE OF A.R.I.A.</Box>}
  </>;
}
