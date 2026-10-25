// In-game HUD: Back (top-left), pre-order button (top-right, label flips
// to "Pre-order pack" while rollers are selected - the rollers ship in the
// accessory pack), quickbar (bottom-left: colour palette + loco switch),
// telemetry stack (bottom-right) and the LOADING ROLLERS line while the
// roller stack streams in.
//
// Chrome reads as small comic PANELS: each group sits in a thick cream
// keyline frame on a dark glass plate (1px ink inset between glass and
// frame), with a caption box (cartouche) overlapping the frame's corner -
// flat cream (orange for the shop CTA) fill, ink keyline, hard 2px offset
// shadow, half in / half out like a caption on a comic panel's edge. Same
// tokens as the landing (Anton, orange, cream), zero radius everywhere.
// Title-menu CTAs stay ComicButton.
//
// Whole HUD is hidden while the title/pause overlay is up; touch mode
// strips it down to the thumbs + Back.
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { useGame, gameApi } from "../store.js";
import { VARIANT_LABELS, VARIANT_SWATCH_HEX } from "../game/variants.js";
import { uiClick, isMuted, setMuted } from "../game/audio.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import { listAutonomousBehaviors } from "../game/autonomy/behavior-registry.js";

const recBlink = keyframes`
  0%, 58% { opacity: 1; }
  59%, 100% { opacity: 0.12; }
`;

const chipPop = keyframes`
  0% { transform: scale(0.86); }
  55% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const HUD_H = 48;
const FRAME_W = 2; // cream keyline thickness
const PANEL_PAD = 5; // air between the frame and the printed content
// Height left for the cells inside frame + padding; colour swatches use it
// as their width too so they stay square.
const CELL_H = HUD_H - 2 * (FRAME_W + PANEL_PAD);
const CELL_GAP = 4; // gap between cells; the glass ground shows through
const FRAME = "rgba(250, 248, 242, 0.9)";
const GLASS = "rgba(8, 8, 12, 0.6)";

// The panel frame: a thick cream keyline (comic ink weight, HUD read)
// around a dark glass plate, with a 1px ink inset between frame and glass
// so it reads like a printed panel, and a few px of glass padding so the
// content has air inside the frame (the glass ground fills the padding).
// The inset is a pseudo-element so it draws over the cells (an inset
// box-shadow would be painted under them). Overflow clipping lives on the
// inner content wrapper, not the plate, so the caption box can hang over
// the frame's corner.
const plateSx = {
  position: "relative",
  display: "inline-flex",
  height: HUD_H,
  boxSizing: "border-box",
  border: `${FRAME_W}px solid ${FRAME}`,
  padding: `${PANEL_PAD}px`,
  borderRadius: 0,
  background: GLASS,
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2,
    boxShadow: `inset 0 0 0 1px ${COMIC_INK}`,
  },
};

// Caption box (cartouche) printed over the panel's top corner, half in /
// half out - the landing's print language: flat fill, ink keyline, hard
// offset shadow, zero radius. Decorative only: no pointer events, no
// layout footprint (absolute over the frame).
const CAPTION_FILLS = { cream: CREAM, orange: ORANGE };
const captionBaseSx = {
  position: "absolute",
  top: -9,
  zIndex: 3,
  pointerEvents: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
  fontFamily: ANTON,
  fontSize: "0.58rem",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  lineHeight: 1,
  padding: "3px 6px 2px",
  color: COMIC_INK,
  border: `2px solid ${COMIC_INK}`,
  borderRadius: 0,
  boxShadow: `2px 2px 0 ${COMIC_INK}`,
};

function HudPlate({ caption, captionSide = "left", captionFill = "cream", children, sx }) {
  return (
    <Box sx={{ ...plateSx, ...sx }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "stretch",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
      {caption ? (
        <Box
          aria-hidden
          sx={{
            ...captionBaseSx,
            background: CAPTION_FILLS[captionFill],
            ...(captionSide === "right" ? { right: -8 } : { left: -8 }),
          }}
        >
          {caption}
        </Box>
      ) : null}
    </Box>
  );
}

// Speaker icon in the same square-stroke language as the back arrow:
// body + cone always, waves when live, a hard ink cross when muted.
function SpeakerIcon({ muted }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      sx={{ width: "1.05em", height: "1.05em", display: "block", flex: "none" }}
    >
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      {muted ? (
        <path d="M16 9l6 6M22 9l-6 6" />
      ) : (
        <>
          <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
          <path d="M18.5 7a7 7 0 0 1 0 10" />
        </>
      )}
    </Box>
  );
}

function BackArrowIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="square"
      strokeLinejoin="miter"
      sx={{ width: "0.95em", height: "0.95em", display: "block", flex: "none" }}
    >
      <path d="M20 12H6" />
      <path d="M12 5l-7 7 7 7" />
    </Box>
  );
}

const hudHitSx = {
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.45em",
  height: "100%",
  px: "0.95rem",
  margin: 0,
  border: "none",
  borderRadius: 0,
  background: "transparent",
  color: CREAM,
  cursor: "pointer",
  fontFamily: ANTON,
  fontSize: "0.92rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  textDecoration: "none",
  lineHeight: 1,
  whiteSpace: "nowrap",
  WebkitTapHighlightColor: "transparent",
  userSelect: "none",
  transition: "background 0.15s ease, color 0.15s ease, filter 0.15s ease",
  "&:focus-visible": {
    outline: `2px dashed ${CREAM}`,
    outlineOffset: -5,
  },
};

function BackButton() {
  return (
    <HudPlate
      caption="Nav"
      sx={{ position: "fixed", top: "1.25rem", left: "1.5rem", zIndex: 10 }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => { uiClick(); useGame.setState({ menuOpen: true }); }}
        sx={{
          ...hudHitSx,
          "&:hover": {
            color: ORANGE,
            background: "rgba(255, 122, 47, 0.12)",
          },
          "&:active": { filter: "brightness(0.92)" },
        }}
      >
        <BackArrowIcon /> Back
      </Box>
    </HudPlate>
  );
}

// Exported: the title/pause overlay renders the same plate in the same
// spot, so the pause fade reads as the button staying put.
export function SensorsButton({ sx }) {
  const visible = useGame((s) => s.sensorsVisible);
  return (
    <HudPlate
      caption="View"
      captionSide="right"
      captionFill="orange"
      sx={{ position: "fixed", top: "1.25rem", right: "1.5rem", zIndex: 10, ...sx }}
    >
      <Box
        component="button"
        type="button"
        aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} sensor displays`}
        onClick={() => { uiClick(); useGame.setState({ sensorsVisible: !visible }); }}
        sx={{
          ...hudHitSx,
          background: visible ? ORANGE : "transparent",
          color: visible ? COMIC_INK : CREAM,
          "&:hover": { filter: "brightness(1.07)" },
          "&:active": { filter: "brightness(0.92)" },
        }}
      >
        Sensors
      </Box>
    </HudPlate>
  );
}

function PoliciesButton() {
  const visible = useGame((s) => s.policiesVisible);
  const mission = useGame((s) => s.environmentMode === "mission");
  if (mission) return null;
  return (
    <HudPlate caption="Moves" captionSide="right"
      sx={{ position: "fixed", top: "1.25rem", right: "9.2rem", zIndex: 10 }}>
      <Box component="button" type="button" aria-pressed={visible}
        aria-label={`${visible ? "Hide" : "Show"} available policies`}
        onClick={() => { uiClick(); useGame.setState({ policiesVisible: !visible }); }}
        sx={{ ...hudHitSx, background: visible ? ORANGE : "transparent",
          color: visible ? COMIC_INK : CREAM }}>
        Policies
      </Box>
    </HudPlate>
  );
}

const OFFICIAL_DUCK_SOUNDS = [
  ["chirp", "Chirp"], ["wheee", "Wheee"],
];

function SpeakButton() {
  const mission = useGame((s) => s.environmentMode === "mission");
  const [open, setOpen] = useState(false);
  if (mission) return null;
  return <HudPlate caption="Voice" captionSide="right"
    sx={{ position: "fixed", top: "1.25rem", right: "26.5rem", zIndex: 10 }}>
    <Box component="button" type="button" aria-expanded={open} aria-label="Speak with official MicroDuck sounds"
      onClick={() => { uiClick(); setOpen(!open); }} sx={{ ...hudHitSx, color: open ? COMIC_INK : CREAM,
        background: open ? ORANGE : "transparent" }}>Speak</Box>
    {open && <Box role="menu" aria-label="Official MicroDuck sounds"
      sx={{ position: "absolute", top: "calc(100% + 7px)", right: 0, width: 138,
        border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.96)", boxShadow: `4px 4px 0 ${COMIC_INK}` }}>
      {OFFICIAL_DUCK_SOUNDS.map(([id, label]) => <Box key={id} component="button" type="button" role="menuitem"
        onClick={() => gameApi.playOfficialSound?.(id)} sx={{ ...hudHitSx, width: "100%", textAlign: "left",
          px: .8, color: CREAM, borderBottom: "1px solid rgba(250,248,242,.16)",
          "&:hover": { color: ORANGE, background: "rgba(255,122,47,.1)" } }}>{label}</Box>)}
    </Box>}
  </HudPlate>;
}

function EnvironmentButton() {
  const mode = useGame((s) => s.environmentMode);
  const mission = mode === "mission";
  const [stageCode, setStageCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const toggle = () => {
    const next = mission ? "testing" : "mission";
    uiClick();
    useGame.setState({ environmentMode: next, policiesVisible: false });
    gameApi.setEnvironmentMode?.(next);
  };
  const jumpToStage = () => {
    uiClick();
    const accepted = gameApi.activateMissionStage?.(stageCode);
    setCodeError(!accepted);
    if (accepted) setStageCode("");
  };
  return (
    <HudPlate caption="Area" captionSide="right"
      sx={{ position: "fixed", top: "1.25rem", right: "17.15rem", zIndex: 10 }}>
      {mission && <Box component="input" aria-label="Mission stage code" value={stageCode}
        onChange={(event) => { setStageCode(event.target.value); setCodeError(false); }}
        onKeyDown={(event) => { if (event.key === "Enter") jumpToStage(); }}
        placeholder="Stage code"
        sx={{ width: 130, px: .8, border: 0, borderRight: `1px solid ${codeError ? "#ff5b52" : "rgba(250,248,242,.25)"}`,
          outline: codeError ? "1px solid #ff5b52" : "none", outlineOffset: -1,
          background: "rgba(0,0,0,.35)", color: CREAM, fontFamily: MONO, fontSize: ".58rem",
          textTransform: "uppercase", "&::placeholder": { color: "rgba(250,248,242,.45)" } }} />}
      {mission && <Box component="button" type="button" aria-label="Activate mission stage code"
        onClick={jumpToStage} sx={{ ...hudHitSx, px: ".55rem", color: ORANGE }}>↵</Box>}
      <Box component="button" type="button" aria-pressed={mission}
        aria-label={`Switch to ${mission ? "Testing Bay" : "Mission"}`}
        onClick={toggle}
        sx={{ ...hudHitSx, minWidth: 112, background: mission ? ORANGE : "transparent",
          color: mission ? COMIC_INK : CREAM }}>
        {mission ? "Mission" : "Testing Bay"}
      </Box>
    </HudPlate>
  );
}

const OFFICIAL_POLICIES = [
  { id: "walk", label: "Walk / Drive", checkpoint: "BEST_alpha_walking.onnx", loco: "both" },
  { id: "sit", label: "Sit / Stand", checkpoint: "BEST_alpha_sitstand.onnx", loco: "legs" },
  { id: "roll", label: "Roll & Recover", checkpoint: "roulade.onnx", loco: "legs" },
  { id: "kickL", label: "Kick Left", checkpoint: "ball_kick_left.onnx", loco: "legs" },
  { id: "kickR", label: "Kick Right", checkpoint: "ball_kick_right.onnx", loco: "legs" },
  { id: "groundpick", label: "Ground Pick", checkpoint: "alpha_ground_pick.onnx", loco: "legs" },
  { id: "crouch", label: "Crouch Glide", checkpoint: "BEST_roller_crouch.onnx", loco: "rollers" },
];

function PoliciesPanel() {
  const visible = useGame((s) => s.policiesVisible);
  const mission = useGame((s) => s.environmentMode === "mission");
  const loco = useGame((s) => s.loco);
  const active = useGame((s) => s.modeLabel);
  const custom = useGame((s) => s.customPolicy);
  if (!visible || mission) return null;
  const policies = custom?.status === "active"
    ? [...OFFICIAL_POLICIES, { id: "custom", label: custom.title || custom.name,
      checkpoint: `Community · ${custom.slot}`, loco: custom.slot === "walk" ? "legs" : "both" }]
    : OFFICIAL_POLICIES;
  return (
    <Box role="dialog" aria-label="Available movement policies"
      sx={{ position: "fixed", top: "5.2rem", right: "9.2rem", zIndex: 12, width: 330,
        border: `3px solid ${CREAM}`, background: "rgba(8,8,12,.94)",
        boxShadow: `4px 4px 0 ${COMIC_INK}`, p: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: .7 }}>
        <Box>
          <Box sx={{ fontFamily: ANTON, color: ORANGE, letterSpacing: ".08em" }}>AVAILABLE POLICIES</Box>
          <Box sx={{ fontFamily: MONO, color: "rgba(250,248,242,.5)", fontSize: ".52rem" }}>
            {loco.toUpperCase()} · ACTIVE: {active.toUpperCase()}
          </Box>
        </Box>
        <Box component="button" type="button" aria-label="Close policies"
          onClick={() => useGame.setState({ policiesVisible: false })}
          sx={{ border: 0, background: "transparent", color: CREAM, fontFamily: ANTON,
            fontSize: "1rem", cursor: "pointer" }}>×</Box>
      </Box>
      <Box sx={{ display: "grid", gap: "4px", maxHeight: "calc(100vh - 9rem)", overflowY: "auto" }}>
        {policies.map((policy) => {
          const available = policy.loco === "both" || policy.loco === loco;
          return (
            <Box key={policy.id} sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1,
              alignItems: "center", border: "1px solid rgba(250,248,242,.18)", p: ".45rem .55rem",
              opacity: available ? 1 : .38 }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontFamily: ANTON, color: CREAM, fontSize: ".78rem", letterSpacing: ".04em" }}>
                  {policy.label}
                </Box>
                <Box title={policy.checkpoint} sx={{ fontFamily: MONO, color: "rgba(250,248,242,.48)",
                  fontSize: ".48rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {policy.checkpoint}
                </Box>
              </Box>
              <Box component="button" type="button" disabled={!available}
                onClick={() => { uiClick(); gameApi.triggerPolicy?.(policy.id); }}
                sx={{ border: `1px solid ${ORANGE}`, background: "transparent", color: ORANGE,
                  fontFamily: ANTON, fontSize: ".66rem", px: .8, py: .35,
                  cursor: available ? "pointer" : "not-allowed" }}>
                Trigger
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function Quickbar() {
  const variant = useGame((s) => s.variant);
  const locoWant = useGame((s) => s.locoWant);
  const mission = useGame((s) => s.environmentMode === "mission");
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "1.25rem",
        left: "1.5rem",
        zIndex: 10,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: "0.85rem",
        maxWidth: "calc(100vw - 14.5rem)",
      }}
    >
      <HudPlate caption="Color">
        <Box
          role="group"
          aria-label="Duck colours"
          sx={{
            display: "inline-flex",
            alignItems: "stretch",
            height: "100%",
            gap: `${CELL_GAP}px`,
          }}
        >
          {Object.entries(VARIANT_SWATCH_HEX).map(([name, hex]) => {
            const selected = name === variant;
            const label = VARIANT_LABELS[name] ?? name;
            return (
              <Box
                key={name}
                component="button"
                type="button"
                title={label}
                aria-label={`${label} colours`}
                aria-pressed={selected}
                onClick={() => { uiClick(); gameApi.setVariant?.(name); }}
                sx={{
                  appearance: "none",
                  width: CELL_H, // square cell inside frame + padding
                  height: "100%",
                  p: 0,
                  background: hex,
                  border: "none",
                  borderRadius: 0,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: selected ? `inset 0 0 0 2px ${CREAM}` : "none",
                  opacity: selected ? 1 : 0.7,
                  animation: selected ? `${chipPop} 0.28s ease` : "none",
                  transition: "opacity 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { opacity: 1 },
                  "&:active": { animation: "none", filter: "brightness(0.92)" },
                  "&:focus-visible": {
                    outline: `2px dashed ${CREAM}`,
                    outlineOffset: -5,
                  },
                  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                }}
              />
            );
          })}
        </Box>
      </HudPlate>
      <HudPlate caption="Mode">
        <Box
          role="group"
          aria-label="Locomotion mode"
          sx={{
            display: "inline-flex",
            alignItems: "stretch",
            height: "100%",
            gap: `${CELL_GAP}px`,
          }}
        >
          {[
            { name: "legs", label: "Feet" },
            { name: "rollers", label: "Rollers" },
          ].map(({ name, label }) => {
            const selected = locoWant === name;
            return (
              <Box
                key={name}
                component="button"
                type="button"
                disabled={mission}
                aria-pressed={selected}
                onClick={() => { uiClick(); gameApi.requestLoco?.(name); }}
                sx={{
                  ...hudHitSx,
                  px: "1.05rem",
                  cursor: mission ? "not-allowed" : "pointer",
                  opacity: mission ? 0.35 : 1,
                  background: selected ? ORANGE : "transparent",
                  color: selected ? COMIC_INK : "rgba(250, 248, 242, 0.72)",
                  "&:hover": {
                    color: selected ? COMIC_INK : CREAM,
                    background: selected ? ORANGE : "rgba(255, 122, 47, 0.12)",
                  },
                  "&:active": { filter: "brightness(0.92)" },
                }}
              >
                {label}
              </Box>
            );
          })}
        </Box>
      </HudPlate>
      <PolicyChip />
      <AutonomyPanel />
      <ObstaclePanel />
      {/* Sound is fully disabled for now (SOUND_DISABLED in audio.js) -
          the mute toggle comes back with the finished sound design. */}
      {/* <SoundToggle /> */}
    </Box>
  );
}

function ObstaclePanel() {
  const mission = useGame((s) => s.environmentMode === "mission");
  const placing = useGame((s) => s.obstaclePlacement);
  const count = useGame((s) => s.obstacleCount);
  if (mission) return null;
  return (
    <HudPlate caption="Cubes">
      <Box sx={{ display: "inline-flex", alignItems: "stretch", height: "100%" }}>
        <Box component="button" type="button" aria-pressed={placing}
          onClick={() => { uiClick(); gameApi.setObstaclePlacement?.(!placing); }}
          sx={{ ...hudHitSx, px: "0.7rem", background: placing ? ORANGE : "transparent",
            color: placing ? COMIC_INK : CREAM }}>
          {placing ? "Click arena" : "Place cube"}
        </Box>
        <Box sx={{ ...hudHitSx, cursor: "default", px: "0.55rem", color: "rgba(250,248,242,.65)" }}>
          {count}/8
        </Box>
        <Box component="button" type="button" disabled={!count}
          onClick={() => { uiClick(); gameApi.clearObstacles?.(); }}
          sx={{ ...hudHitSx, px: "0.6rem", opacity: count ? 1 : 0.35 }}>
          Clear
        </Box>
      </Box>
    </HudPlate>
  );
}

function AutonomyPanel() {
  const behaviorCatalog = listAutonomousBehaviors();
  const mission = useGame((s) => s.environmentMode === "mission");
  const enabled = useGame((s) => s.autonomyEnabled);
  const mode = useGame((s) => s.autonomyMode);
  const status = useGame((s) => s.autonomyStatus);
  const profiles = useGame((s) => s.autonomyProfiles);
  const profileId = useGame((s) => s.autonomyProfileId);
  const behaviorId = useGame((s) => s.autonomyBehaviorId);
  const [editor, setEditor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const persistProfiles = (next, extra = {}) => {
    localStorage.setItem("microduck-autonomy-profiles", JSON.stringify(next));
    useGame.setState({ autonomyProfiles: next, ...extra });
  };
  const set = (nextEnabled, nextMode = mode, nextProfileId = null, nextBehaviorId = null) => {
    uiClick();
    gameApi.setAutonomy?.({ enabled: nextEnabled, mode: nextMode,
      profileId: nextProfileId, behaviorId: nextBehaviorId });
  };
  const openNew = () => {
    setConfirmDelete(false);
    setEditor({ id: null, name: "", behaviors: [] });
  };
  const openProfile = (profile) => {
    setConfirmDelete(false);
    setEditor(structuredClone(profile));
  };
  const saveEditor = () => {
    const name = editor.name.trim();
    if (!name) return;
    if (!editor.id) {
      const created = { ...editor, id: crypto.randomUUID?.() ?? String(Date.now()), name };
      persistProfiles([...profiles, created]);
    } else {
      const saved = { ...editor, name, behaviors: editor.behaviors.filter((item) => item.name.trim()) };
      const next = profiles.map((item) => item.id === saved.id ? saved : item);
      persistProfiles(next);
      if (profileId === saved.id) {
        const active = saved.behaviors.find((item) => item.id === behaviorId);
        if (active) set(true, active.behavior, saved.id, active.id);
        else set(true, "roam", null, null);
      }
    }
    setEditor(null);
  };
  const deleteEditor = () => {
    const next = profiles.filter((item) => item.id !== editor.id);
    const active = profileId === editor.id;
    persistProfiles(next, active ? { autonomyProfileId: null, autonomyBehaviorId: null } : {});
    if (active) set(true, "roam", null, null);
    setEditor(null);
  };
  const addBehavior = () => setEditor((current) => ({ ...current, behaviors: [...current.behaviors,
    { id: crypto.randomUUID?.() ?? String(Date.now()), name: "New behaviour", behavior: "roam" }] }));
  return (
    <><HudPlate caption="Pilot">
      <Box sx={{ display: "inline-flex", alignItems: "stretch", height: "100%" }}>
        <Box
          component="button" type="button" aria-pressed={enabled}
          disabled={mission}
          onClick={() => set(!enabled)}
          sx={{ ...hudHitSx, px: "0.75rem", color: enabled ? COMIC_INK : CREAM,
            background: enabled ? ORANGE : "transparent" }}
        >
          {mission ? "Autonomous Mission" : enabled ? "Autonomous" : "Manual"}
        </Box>
        {enabled && !mission && [
          ["roam", "Roam"], ["chase", "Chase ball"],
        ].map(([value, label]) => (
          <Box key={value} component="button" type="button" aria-pressed={mode === value}
            onClick={() => set(true, value, null, null)}
            sx={{ ...hudHitSx, px: "0.65rem", color: mode === value ? ORANGE : "rgba(250,248,242,.65)" }}>
            {label}
          </Box>
        ))}
        {enabled && !mission && profiles.map((profile) => (
          <Box key={profile.id} sx={{ display: "inline-flex", borderLeft: "1px solid rgba(250,248,242,.18)" }}>
            <Box component="button" type="button" disabled={!profile.behaviors.length}
              aria-pressed={profileId === profile.id}
              onClick={() => { const behavior = profile.behaviors[0];
                set(true, behavior.behavior, profile.id, behavior.id); }} title={profile.name}
              sx={{ ...hudHitSx, px: ".55rem", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis",
                opacity: profile.behaviors.length ? 1 : .4,
                color: profileId === profile.id ? ORANGE : "rgba(250,248,242,.65)" }}>
              {profile.name}
            </Box>
            <Box component="button" type="button" aria-label={`Edit ${profile.name}`} onClick={() => openProfile(profile)}
              sx={{ ...hudHitSx, px: ".4rem", color: CREAM }}>⚙</Box>
          </Box>
        ))}
        {enabled && !mission && <Box component="button" type="button" aria-label="Add autonomous profile"
          onClick={openNew} sx={{ ...hudHitSx, px: ".55rem", color: ORANGE }}>＋</Box>}
        {!mission && <Box sx={{ ...hudHitSx, cursor: "default", px: "0.7rem", minWidth: "8rem", color: "rgba(250,248,242,.72)", fontFamily: MONO, fontSize: "0.58rem" }}>
          {status}
        </Box>}
        {!mission && <Box component="button" type="button" aria-label="Stop autonomous control"
          onClick={() => { uiClick(); gameApi.stopAutonomy?.(); }}
          sx={{ ...hudHitSx, px: "0.7rem", background: "#d83b32", color: CREAM }}>
          Stop
        </Box>}
      </Box>
    </HudPlate>
    {editor && <Box role="dialog" aria-label={editor.id ? "Edit autonomous profile" : "Create autonomous profile"}
      sx={{ position: "fixed", inset: 0, zIndex: 30, display: "grid", placeItems: "center",
        background: "rgba(0,0,0,.72)" }}>
      <Box sx={{ width: 430, maxWidth: "calc(100vw - 2rem)", border: `3px solid ${CREAM}`,
        background: "#08080c", boxShadow: `6px 6px 0 ${COMIC_INK}`, p: 1.5 }}>
        <Box sx={{ fontFamily: ANTON, color: ORANGE, letterSpacing: ".08em", mb: 1 }}>
          {editor.id ? "AUTONOMOUS PROFILE" : "CREATE PROFILE"}
        </Box>
        <Box component="input" aria-label="Profile name" value={editor.name}
          onChange={(event) => setEditor({ ...editor, name: event.target.value })}
          placeholder="Profile name" sx={{ width: "100%", boxSizing: "border-box", p: .8,
            border: `1px solid ${CREAM}`, background: "#111", color: CREAM, fontFamily: MONO }} />
        {editor.id && <>
          <Box sx={{ fontFamily: MONO, color: "rgba(250,248,242,.55)", fontSize: ".58rem", my: 1 }}>
            ADD BEHAVIOURS TO THIS PROFILE
          </Box>
          {editor.behaviors.map((behavior, index) => <Box key={behavior.id}
            sx={{ display: "grid", gridTemplateColumns: "1fr 110px 34px", gap: .5, mb: .5 }}>
            <Box component="input" aria-label={`Behaviour ${index + 1} name`} value={behavior.name}
              onChange={(event) => setEditor({ ...editor, behaviors: editor.behaviors.map((item) =>
                item.id === behavior.id ? { ...item, name: event.target.value } : item) })}
              sx={{ p: .6, border: "1px solid #555", background: "#111", color: CREAM, fontFamily: MONO }} />
            <Box component="select" aria-label={`Behaviour ${index + 1} code`} value={behavior.behavior}
              onChange={(event) => setEditor({ ...editor, behaviors: editor.behaviors.map((item) =>
                item.id === behavior.id ? { ...item, behavior: event.target.value } : item) })}
              sx={{ background: "#111", color: CREAM, border: "1px solid #555", fontFamily: MONO }}>
              {behaviorCatalog.map((item) => <option key={item.id} value={item.id}>{item.label.toUpperCase()}</option>)}
            </Box>
            <Box component="button" type="button" aria-label={`Delete behaviour ${behavior.name}`}
              onClick={() => setEditor({ ...editor, behaviors: editor.behaviors.filter((item) => item.id !== behavior.id) })}
              sx={{ border: "1px solid #ff746a", background: "transparent", color: "#ff746a" }}>×</Box>
          </Box>)}
          <Box component="button" type="button" onClick={addBehavior}
            sx={{ width: "100%", border: `1px solid ${ORANGE}`, background: "transparent",
              color: ORANGE, fontFamily: ANTON, py: .5, mt: .4 }}>＋ ADD BEHAVIOUR</Box>
        </>}
        <Box sx={{ display: "flex", gap: .7, mt: 1 }}>
          <Box component="button" type="button" onClick={() => setEditor(null)}
            sx={{ flex: 1, border: `1px solid ${CREAM}`, background: "transparent", color: CREAM,
              fontFamily: ANTON, py: .6 }}>CANCEL</Box>
          <Box component="button" type="button" disabled={!editor.name.trim()} onClick={saveEditor}
            sx={{ flex: 1, border: `1px solid ${ORANGE}`, background: ORANGE, color: COMIC_INK,
              opacity: editor.name.trim() ? 1 : .4, fontFamily: ANTON, py: .6 }}>
            {editor.id ? "SAVE PROFILE" : "CREATE PROFILE"}
          </Box>
        </Box>
        {editor.id && <Box component="button" type="button"
          onClick={() => confirmDelete ? deleteEditor() : setConfirmDelete(true)}
          sx={{ width: "100%", mt: .7, border: "1px solid #ff746a", background: "transparent",
            color: "#ff746a", fontFamily: ANTON, py: .45 }}>
          {confirmDelete ? "CONFIRM DELETE PROFILE" : "DELETE PROFILE"}
        </Box>}
      </Box>
    </Box>}
    </>
  );
}

// Active community move chip: rides the quickbar row in the same panel
// language. "PLAYING: <prompt or name> by <owner>" (Academy moves carry
// their prompt and author in manifest.academy), a hint on the key that
// plays a trick / script, and an X that swaps the official slot back in
// (gameApi.clearCustomPolicy).
function PolicyChip() {
  const cp = useGame((s) => s.customPolicy);
  const mission = useGame((s) => s.environmentMode === "mission");
  if (mission || cp?.status !== "active") return null;
  const title = cp.title || cp.name;
  const by = cp.author ? ` by ${cp.author}` : "";
  const hint = cp.slot === "trick" || cp.slot === "script" || cp.slot === "sitstand" ? " \u00b7 R" : "";
  return (
    <HudPlate caption="Playing" captionFill="orange">
      <Box sx={{ display: "inline-flex", alignItems: "stretch", height: "100%" }}>
        <Box
          sx={{
            ...hudHitSx,
            px: "0.85rem",
            cursor: "default",
            color: ORANGE,
            maxWidth: "22rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
            lineHeight: `${CELL_H}px`,
          }}
          title={`${cp.ref}${cp.kind ? ` (${cp.kind})` : ""}`}
        >
          {`${title}${by}${hint}`}
        </Box>
        <Box
          component="button"
          type="button"
          aria-label={`Unload move ${cp.name}`}
          onClick={() => { uiClick(); gameApi.clearCustomPolicy?.(); }}
          sx={{
            ...hudHitSx,
            px: "0.6rem",
            color: "rgba(250, 248, 242, 0.72)",
            "&:hover": {
              color: ORANGE,
              background: "rgba(255, 122, 47, 0.12)",
            },
            "&:active": { filter: "brightness(0.92)" },
          }}
        >
          {"\u2715"}
        </Box>
      </Box>
    </HudPlate>
  );
}

// Mute / unmute panel: same cartouche language as the other groups. The
// toggle ramps audio.js's master gain (~50 ms) and persists; unmuting
// plays the HUD click as confirmation (muting stays silent, obviously).
function SoundToggle() {
  const [muted, setMutedState] = useState(isMuted);
  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) uiClick();
  };
  return (
    <HudPlate caption="Sound">
      <Box
        component="button"
        type="button"
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        aria-pressed={muted}
        onClick={toggle}
        sx={{
          ...hudHitSx,
          px: "0.75rem",
          color: muted ? "rgba(250, 248, 242, 0.5)" : CREAM,
          "&:hover": {
            color: muted ? CREAM : ORANGE,
            background: "rgba(255, 122, 47, 0.12)",
          },
          "&:active": { filter: "brightness(0.92)" },
        }}
      >
        <SpeakerIcon muted={muted} />
      </Box>
    </HudPlate>
  );
}

function Telemetry() {
  const t = useGame((s) => s.telemetry);
  const odo = t.odo < 1000 ? `${t.odo.toFixed(1)}M` : `${(t.odo / 1000).toFixed(2)}KM`;
  const lines = [];
  if (t.peers) lines.push(`${t.peers + 1} ONLINE`);
  lines.push(`${t.speed.toFixed(2)}M/S \u00b7 ODO ${odo}`);
  lines.push(`FPS ${t.fps} \u00b7 CTRL ${t.ctrlHz}HZ`);
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.5rem",
        zIndex: 10,
        pointerEvents: "none",
        fontFamily: MONO,
        fontSize: "0.62rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(255, 255, 255, 0.35)",
        fontVariantNumeric: "tabular-nums",
        textShadow: "0 0 6px rgba(255, 255, 255, 0.15)",
        whiteSpace: "pre-line",
        textAlign: "right",
        lineHeight: 1.8,
      }}
    >
      {lines.join("\n")}
    </Box>
  );
}

function OsdLoad() {
  const rollersLoading = useGame((s) => s.rollersLoading);
  const policyLoading = useGame((s) => s.customPolicy?.status === "loading");
  const lines = [];
  if (rollersLoading) lines.push("LOADING ROLLERS");
  if (policyLoading) lines.push("LOADING MOVE");
  if (!lines.length) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        top: "5.2rem",
        right: "1.5rem",
        zIndex: 10,
        fontFamily: MONO,
        fontSize: "0.68rem",
        letterSpacing: "0.14em",
        color: ORANGE,
        textShadow: "0 0 8px rgba(255, 122, 47, 0.4)",
        textAlign: "right",
        lineHeight: 1.9,
      }}
    >
      {lines.map((l) => (
        <Box key={l}>
          {l}
          <Box
            component="span"
            sx={{ display: "inline-block", ml: "0.15em", animation: `${recBlink} 0.8s steps(1) infinite` }}
          >
            {"\u2588"}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// Toast-style OSD line for policy failures: a load error or a watchdog
// revert paints below the loading line for a few seconds, then clears the
// store slot (the official walker is already back by then).
function PolicyToast() {
  const cp = useGame((s) => s.customPolicy);
  const isError = cp?.status === "error";
  useEffect(() => {
    if (!isError) return;
    const t = setTimeout(() => {
      if (useGame.getState().customPolicy === cp) {
        useGame.setState({ customPolicy: null });
      }
    }, 9000);
    return () => clearTimeout(t);
  }, [cp, isError]);
  if (!isError) return null;
  const msg = cp.revertReason
    ? `MOVE REVERTED \u00b7 ${cp.revertReason}`
    : `MOVE LOAD FAILED \u00b7 ${cp.error ?? "unknown error"}`;
  return (
    <Box
      role="alert"
      sx={{
        position: "fixed",
        top: "7.4rem",
        right: "1.5rem",
        zIndex: 10,
        maxWidth: "24rem",
        fontFamily: MONO,
        fontSize: "0.66rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textAlign: "right",
        lineHeight: 1.7,
        color: "#ff4b3a",
        textShadow: "0 0 8px rgba(255, 75, 58, 0.45)",
      }}
    >
      {msg}
    </Box>
  );
}

export default function Hud() {
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const touchMode = useGame((s) => s.touchMode);
  if (!entered || menuOpen) return null;
  return (
    <>
      <BackButton />
      <SensorsButton />
      <SpeakButton />
      <PoliciesButton />
      <EnvironmentButton />
      <PoliciesPanel />
      {!touchMode && (
        <>
          <Quickbar />
          <Telemetry />
          <OsdLoad />
          <PolicyToast />
        </>
      )}
    </>
  );
}
