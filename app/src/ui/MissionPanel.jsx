import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { gameApi, useGame } from "../store.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import { MONO, ORANGE } from "../theme.js";
import { STAGE_THREE_CODE, STAGE_TWO_CODE } from "../game/missions/stage-two.js";
import { selectMissionEnding } from "../game/missions/mission-ending.js";

const plateFlash = keyframes`
  0%, 100% { opacity: .08; }
  50% { opacity: .3; }
`;

const STAGE_BRIEFINGS = {
  1: {
    title: "THE OUTER SEAL",
    copy: "The Vault's outer systems are dark. A dormant access chamber lies ahead, its safeguards still active. A.R.I.A. remains silent.",
  },
  2: {
    title: "THE CORE CHAMBER",
    copy: "Beyond the first seal, three experimental energy cores wait inside a fractured verification chamber. The blackout has scrambled the facility's records.",
  },
  3: {
    title: "THE SILENT GUARDIAN",
    copy: "At the heart of The Vault, A.R.I.A.'s final chamber is still drawing power. Whatever happened here left one last channel open.",
  },
};

export default function MissionPanel() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [showContainment, setShowContainment] = useState(false);
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const mode = useGame((state) => state.environmentMode);
  const mission = useGame((state) => state.mission);
  useEffect(() => {
    if (mode !== "mission" || !mission.containment) {
      setShowContainment(false);
      return undefined;
    }
    setShowContainment(true);
    const hideTimer = window.setTimeout(() => setShowContainment(false), 2800);
    return () => window.clearTimeout(hideTimer);
  }, [mode, mission.stage, mission.containment]);
  if (!entered || menuOpen || mode !== "mission") return null;
  const standing = mission.status === "timing" || mission.status === "armed";
  const stability = Math.max(0, 100 - (mission.containment ?? 0));
  const activate = () => {
    const accepted = gameApi.activateMissionStage?.(code);
    setCodeError(!accepted);
    if (accepted) setCode("");
  };
  const briefing = STAGE_BRIEFINGS[mission.stage] ?? STAGE_BRIEFINGS[1];
  const ending = selectMissionEnding({ batteryPct: useGame.getState().battery.levelPct,
    containment: mission.containment });
  const leaveMission = () => {
    useGame.setState({ environmentMode: "testing", policiesVisible: false });
    gameApi.setEnvironmentMode?.("testing");
  };
  return <>
    {mission.status === "briefing" && <Box role="dialog" aria-modal="true" aria-label={`Stage ${mission.stage} briefing`}
      sx={{ position: "fixed", zIndex: 30, inset: 0, display: "grid", placeItems: "center",
        p: 2, background: "rgba(3,5,9,.78)", backdropFilter: "blur(4px)" }}>
      <Box sx={{ width: 460, maxWidth: "calc(100vw - 2rem)", p: 2.4,
        border: `3px solid ${CREAM}`, background: "rgba(7,8,12,.98)",
        boxShadow: `9px 9px 0 ${COMIC_INK}` }}>
        <Box sx={{ color: ORANGE, fontFamily: MONO, fontSize: ".66rem", letterSpacing: ".16em" }}>
          MISSION BRIEFING · STAGE {mission.stage}
        </Box>
        <Box sx={{ mt: .7, color: CREAM, fontFamily: ANTON, fontSize: "1.7rem", letterSpacing: ".06em" }}>
          {briefing.title}
        </Box>
        <Box sx={{ mt: 1, color: "rgba(250,248,242,.82)", fontFamily: MONO,
          fontSize: ".76rem", lineHeight: 1.65 }}>{briefing.copy}</Box>
        <Box component="button" type="button" autoFocus onClick={() => gameApi.enterMissionStage?.()}
          sx={{ mt: 2, width: "100%", py: 1, border: 0, background: ORANGE,
            color: COMIC_INK, fontFamily: ANTON, fontSize: "1.05rem", letterSpacing: ".08em" }}>
          ENTER STAGE
        </Box>
      </Box>
    </Box>}
    {showContainment && mission.status !== "success" && mission.status !== "breach" &&
      <Box role="status" aria-live="polite" sx={{ position: "fixed", zIndex: 9, top: 82, left: "50%",
        transform: "translateX(-50%)", px: 1.4, py: .75, border: `2px solid ${stability <= 30 ? "#ff5b52" : ORANGE}`,
        background: "rgba(7,8,12,.92)", color: CREAM, fontFamily: MONO, fontSize: ".68rem",
        letterSpacing: ".08em", pointerEvents: "none" }}>
        CONTAINMENT STABILITY · {stability}%
      </Box>}
    {standing && <Box aria-hidden sx={{ position: "fixed", inset: 0, zIndex: 8,
      pointerEvents: "none", background: "#20ff87", mixBlendMode: "screen",
      animation: `${plateFlash} .55s ease-in-out infinite` }} />}
    {(mission.status === "failed" || mission.status === "breach") && <Box aria-hidden sx={{ position: "fixed", inset: 8,
      zIndex: 8, pointerEvents: "none", border: "5px solid rgba(255,32,32,.72)",
      boxShadow: "inset 0 0 60px rgba(255,0,0,.32)" }} />}
    {mission.status === "breach" && mission.attemptsRemaining === 0 &&
      <Box role="alertdialog" aria-label="Containment breach" sx={{ position: "fixed", zIndex: 22,
        left: "50%", top: "22%", transform: "translateX(-50%)", width: 390,
        maxWidth: "calc(100vw - 2rem)", p: 2, border: "3px solid #ff5b52",
        background: "rgba(12,3,4,.97)", boxShadow: `8px 8px 0 ${COMIC_INK}`, textAlign: "center" }}>
        <Box sx={{ fontFamily: ANTON, color: "#ff5b52", fontSize: "1.7rem", letterSpacing: ".1em" }}>
          CONTAINMENT BREACH
        </Box>
        <Box sx={{ mt: .6, color: CREAM, fontFamily: MONO, fontSize: ".68rem", lineHeight: 1.55 }}>
          {mission.stage === 2 ? "CORE VALIDATION HAS COLLAPSED. REVIEW YOUR PERCEPTION AND NAVIGATION SYSTEM."
            : mission.stage === 3 ? "A.R.I.A. HAS REJECTED FURTHER TRANSMISSIONS. REVIEW YOUR VOICE PIPELINE."
            : "THE VAULT HAS LOCKED DOWN. REVIEW YOUR SYSTEM AND BEGIN A NEW MISSION RUN."}
        </Box>
        <Box sx={{ display: "flex", gap: .7, mt: 1.2 }}>
          <Box component="button" type="button" onClick={() => gameApi.resetMission?.()}
            sx={{ flex: 1, py: .75, border: `1px solid ${CREAM}`, background: "transparent",
              color: CREAM, fontFamily: ANTON, fontSize: ".9rem" }}>RESTART STAGE</Box>
          <Box component="button" type="button" onClick={() => gameApi.restartEntireMission?.()}
            sx={{ flex: 1, py: .75, border: 0, background: "#ff5b52",
              color: CREAM, fontFamily: ANTON, fontSize: ".9rem" }}>RESTART ENTIRE MISSION</Box>
        </Box>
      </Box>}
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
      letterSpacing: ".06em" }}>{mission.status === "evaluating"
        ? "A.R.I.A. IS LISTENING · LOCAL ANALYSIS"
        : "STAGE THREE · THE VOICE OF A.R.I.A."}</Box>}
    {mission.stage === 3 && mission.status === "success" &&
      <Box role="dialog" aria-modal="true" aria-label="Mission outcome"
        sx={{ position: "fixed", zIndex: 31, inset: 0, display: "grid", placeItems: "center",
          p: 2, background: "rgba(3,5,9,.82)", backdropFilter: "blur(5px)" }}>
        <Box sx={{ width: 500, maxWidth: "calc(100vw - 2rem)", p: 2.5,
          border: "3px solid #38ef91", background: "rgba(7,8,12,.98)",
          boxShadow: `9px 9px 0 ${COMIC_INK}` }}>
          <Box sx={{ color: "#38ef91", fontFamily: MONO, fontSize: ".66rem", letterSpacing: ".16em" }}>
            MISSION COMPLETE · FINAL OUTCOME
          </Box>
          <Box sx={{ mt: .7, color: CREAM, fontFamily: ANTON, fontSize: "1.75rem", letterSpacing: ".055em" }}>
            {ending.title}
          </Box>
          <Box sx={{ mt: 1, color: "rgba(250,248,242,.84)", fontFamily: MONO,
            fontSize: ".76rem", lineHeight: 1.7 }}>{ending.copy}</Box>
          <Box sx={{ display: "flex", gap: 1, mt: 1.5, color: ORANGE, fontFamily: MONO,
            fontSize: ".68rem", letterSpacing: ".06em" }}>
            <Box sx={{ flex: 1, p: .8, border: `1px solid ${ORANGE}` }}>
              BATTERY · {Math.round(useGame.getState().battery.levelPct)}%
            </Box>
            <Box sx={{ flex: 1, p: .8, border: `1px solid ${ORANGE}` }}>
              STABILITY · {Math.max(0, 100 - (mission.containment ?? 0))}%
            </Box>
          </Box>
          <Box component="button" type="button" autoFocus onClick={leaveMission}
            sx={{ mt: 1.5, width: "100%", py: 1, border: 0, background: "#38ef91",
              color: COMIC_INK, fontFamily: ANTON, fontSize: "1.05rem", letterSpacing: ".08em" }}>
            RETURN TO TESTING BAY
          </Box>
        </Box>
      </Box>}
  </>;
}
