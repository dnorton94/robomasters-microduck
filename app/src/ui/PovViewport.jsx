import { useEffect, useRef } from "react";
import * as THREE from "three";
import Box from "@mui/material/Box";
import { gameApi, useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

export default function PovViewport() {
  const canvasRef = useRef(null);
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const enabled = useGame((s) => s.povEnabled);
  const sensorsVisible = useGame((s) => s.sensorsVisible);

  useEffect(() => {
    if (!enabled || !entered || menuOpen || !canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(280, 168, false);
    renderer.setClearColor(0x08080c, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const camera = new THREE.PerspectiveCamera(72, 280 / 168, 0.015, 20);
    let raf = 0;
    const draw = () => {
      gameApi.renderPov?.(renderer, camera);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); renderer.dispose(); };
  }, [enabled, entered, menuOpen]);

  if (!entered || menuOpen || !sensorsVisible) return null;
  if (!enabled) {
    return (
      <Box component="button" type="button" onClick={() => useGame.setState({ povEnabled: true })}
        sx={{ position: "fixed", top: "5.2rem", right: "1.5rem", zIndex: 11,
          border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.8)", color: CREAM,
          fontFamily: ANTON, letterSpacing: ".1em", px: 1.2, py: 0.7, cursor: "pointer" }}>
        Show POV
      </Box>
    );
  }
  return (
    <Box sx={{ position: "fixed", top: "5.2rem", right: "1.5rem", zIndex: 11,
      width: 280, height: 168, border: `3px solid ${CREAM}`, background: "#08080c",
      boxShadow: `4px 4px 0 ${COMIC_INK}`, overflow: "hidden" }}>
      <Box component="canvas" ref={canvasRef} width={280} height={168}
        aria-label="MicroDuck point-of-view camera" sx={{ display: "block", width: "100%", height: "100%" }} />
      <Box sx={{ position: "absolute", top: 6, left: 8, pointerEvents: "none",
        fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".13em", color: ORANGE,
        textShadow: "0 0 5px #000" }}>ROBOT POV · LIVE</Box>
      <Box aria-hidden sx={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14,
        transform: "translate(-50%,-50%)", border: "1px solid rgba(255,122,47,.75)", borderRadius: "50%",
        "&::before": { content: '\"\"', position: "absolute", left: -5, right: -5, top: 6, borderTop: "1px solid rgba(255,122,47,.75)" },
        "&::after": { content: '\"\"', position: "absolute", top: -5, bottom: -5, left: 6, borderLeft: "1px solid rgba(255,122,47,.75)" } }} />
      <Box component="button" type="button" aria-label="Hide robot POV"
        onClick={() => useGame.setState({ povEnabled: false })}
        sx={{ position: "absolute", top: 4, right: 4, border: 0, background: "rgba(8,8,12,.75)",
          color: CREAM, fontFamily: ANTON, cursor: "pointer", width: 24, height: 24 }}>×</Box>
    </Box>
  );
}

