import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { useGame } from "../store.js";

const plateFlash = keyframes`
  0%, 100% { opacity: .08; }
  50% { opacity: .3; }
`;

export default function MissionPanel() {
  const entered = useGame((state) => state.entered);
  const menuOpen = useGame((state) => state.menuOpen);
  const mode = useGame((state) => state.environmentMode);
  const mission = useGame((state) => state.mission);
  if (!entered || menuOpen || mode !== "mission") return null;
  const standing = mission.status === "timing" || mission.status === "armed";
  return <>
    {standing && <Box aria-hidden sx={{ position: "fixed", inset: 0, zIndex: 8,
      pointerEvents: "none", background: "#20ff87", mixBlendMode: "screen",
      animation: `${plateFlash} .55s ease-in-out infinite` }} />}
    {mission.status === "failed" && <Box aria-hidden sx={{ position: "fixed", inset: 8,
      zIndex: 8, pointerEvents: "none", border: "5px solid rgba(255,32,32,.72)",
      boxShadow: "inset 0 0 60px rgba(255,0,0,.32)" }} />}
  </>;
}
