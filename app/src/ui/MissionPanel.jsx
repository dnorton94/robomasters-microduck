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
  const [intent, setIntent] = useState({ priority: "safety", route: "balanced" });
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const mode = useGame((state) => state.environmentMode);
  const mission = useGame((state) => state.mission);
  const profileId = useGame((state) => state.autonomyProfileId);
  const profiles = useGame((state) => state.autonomyProfiles);
  if (!entered || menuOpen || mode !== "mission") return null;
  const standing = mission.status === "timing" || mission.status === "armed";
  const activeProfile = profiles.find((profile) => profile.id === profileId);
  const moduleCount = Math.max(1, activeProfile?.behaviors?.length ?? 1);
  const deploy = () => gameApi.configureMissionIntent?.(intent);
  const activate = () => {
    const accepted = gameApi.activateMissionStage?.(code);
    setCodeError(!accepted);
    if (accepted) setCode("");
  };
  return <>
    {mission.stage === 1 && !mission.intent?.configured && <Box role="dialog" aria-label="Mission Intent"
      sx={{ position: "fixed", inset: 0, zIndex: 25, display: "grid", placeItems: "center",
        background: "rgba(2,5,9,.78)" }}>
      <Box sx={{ width: 560, maxWidth: "calc(100vw - 2rem)", border: `3px solid ${CREAM}`,
        background: "rgba(7,8,12,.98)", boxShadow: `8px 8px 0 ${COMIC_INK}`, p: 2 }}>
        <Box sx={{ fontFamily: ANTON, color: ORANGE, fontSize: "1.45rem", letterSpacing: ".08em" }}>
          MISSION INTENT
        </Box>
        <Box sx={{ mt: .4, color: CREAM, fontFamily: MONO, fontSize: ".68rem", lineHeight: 1.55 }}>
          You set the priorities and acceptable trade-offs. MicroDuck controls its actions within those boundaries.
        </Box>
        <Box sx={{ mt: 1.3, color: "rgba(250,248,242,.55)", fontFamily: MONO, fontSize: ".57rem" }}>
          PRIMARY PRIORITY
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: .6, mt: .5 }}>
          {[['safety','Safety first'],['speed','Speed first'],['learning','Learning first']].map(([value,label]) =>
            <Box key={value} component="button" type="button" aria-pressed={intent.priority === value}
              onClick={() => setIntent({ ...intent, priority: value })}
              sx={{ p: .8, border: `1px solid ${intent.priority === value ? ORANGE : CREAM}`,
                background: intent.priority === value ? ORANGE : "transparent",
                color: intent.priority === value ? COMIC_INK : CREAM, fontFamily: ANTON }}>{label}</Box>)}
        </Box>
        <Box sx={{ mt: 1.3, color: "rgba(250,248,242,.55)", fontFamily: MONO, fontSize: ".57rem" }}>
          NAVIGATION COMMITMENT
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: .6, mt: .5 }}>
          {[['direct','Direct','Low energy · high risk'],['balanced','Balanced','Moderate energy · risk'],
            ['cautious','Cautious','High energy · low risk']].map(([value,label,detail]) =>
            <Box key={value} component="button" type="button" aria-pressed={intent.route === value}
              onClick={() => setIntent({ ...intent, route: value })}
              sx={{ p: .75, border: `1px solid ${intent.route === value ? ORANGE : CREAM}`,
                background: intent.route === value ? "rgba(255,122,47,.18)" : "transparent", color: CREAM }}>
              <Box sx={{ fontFamily: ANTON, color: intent.route === value ? ORANGE : CREAM }}>{label}</Box>
              <Box sx={{ mt: .25, fontFamily: MONO, fontSize: ".5rem", color: "rgba(250,248,242,.58)" }}>{detail}</Box>
            </Box>)}
        </Box>
        <Box sx={{ mt: 1.2, p: 1, border: "1px solid rgba(250,248,242,.2)", color: CREAM,
          fontFamily: MONO, fontSize: ".62rem", display: "flex", justifyContent: "space-between" }}>
          <span>{moduleCount} ACTIVE MODULE{moduleCount === 1 ? "" : "S"}</span>
          <span>MORE MODULES INCREASE POWER DRAW</span>
          <span>4 ATTEMPTS</span>
        </Box>
        <Box component="button" type="button" onClick={deploy}
          sx={{ width: "100%", mt: 1.2, py: .8, border: 0, background: ORANGE,
            color: COMIC_INK, fontFamily: ANTON, fontSize: "1rem" }}>APPROVE INTENT & DEPLOY</Box>
      </Box>
    </Box>}
    {mission.stage === 1 && mission.intent?.configured && mission.status !== "success" &&
      <Box role="status" sx={{ position: "fixed", zIndex: 9, top: 82, left: "50%", transform: "translateX(-50%)",
        width: 430, maxWidth: "calc(100vw - 2rem)", px: 1.2, py: .75, border: `2px solid ${ORANGE}`,
        background: "rgba(7,8,12,.9)", color: CREAM, fontFamily: MONO, fontSize: ".6rem" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>{mission.intent.priority.toUpperCase()} · {mission.intent.route.toUpperCase()} ROUTE</span>
          <span>{mission.attemptsRemaining} ATTEMPTS LEFT</span>
        </Box>
        <Box sx={{ mt: .5, height: 6, background: "rgba(250,248,242,.14)" }}>
          <Box sx={{ width: `${mission.containment ?? 0}%`, height: "100%",
            background: (mission.containment ?? 0) >= 70 ? "#ff5b52" : ORANGE }} />
        </Box>
        <Box sx={{ mt: .25, display: "flex", justifyContent: "space-between",
          color: "rgba(250,248,242,.55)" }}><span>CONTAINMENT INSTABILITY</span><span>{mission.containment ?? 0}%</span></Box>
      </Box>}
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
