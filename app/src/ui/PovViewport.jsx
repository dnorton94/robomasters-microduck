import { useEffect, useRef } from "react";
import * as THREE from "three";
import Box from "@mui/material/Box";
import { gameApi, useGame } from "../store.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import SensorEye from "./SensorEye.jsx";

export default function PovViewport() {
  const canvasRef = useRef(null);
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const enabled = useGame((s) => s.povEnabled);
  const firstPerson = useGame((s) => s.povFirstPerson);
  const sensorsVisible = useGame((s) => s.sensorsVisible);
  const shouldRender = firstPerson || (enabled && sensorsVisible);

  useEffect(() => {
    if (!shouldRender || !entered || menuOpen || !canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x08080c, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const camera = new THREE.PerspectiveCamera(72, 280 / 168, 0.015, 20);
    const resize = () => {
      const width = firstPerson ? window.innerWidth : 280;
      const height = firstPerson ? window.innerHeight : 168;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const draw = () => {
      gameApi.renderPov?.(renderer, camera);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, [entered, firstPerson, menuOpen, shouldRender]);

  if (!entered || menuOpen) return null;
  const viewToggle = (
    <Box component="button" type="button"
      aria-label={firstPerson ? "Switch to third-person view" : "Switch to first-person view"}
      onClick={() => useGame.setState({ povFirstPerson: !firstPerson, povEnabled: true })}
      sx={{ position: "fixed", top: "1.25rem", left: "8.5rem", zIndex: 13, height: 48,
        border: `2px solid ${CREAM}`, background: firstPerson ? ORANGE : "rgba(8,8,12,.72)",
        color: firstPerson ? COMIC_INK : CREAM, fontFamily: ANTON, letterSpacing: ".08em",
        px: 1.5, cursor: "pointer", boxShadow: `2px 2px 0 ${COMIC_INK}` }}>
      {firstPerson ? "Third person" : "First person"}
    </Box>
  );

  if (!shouldRender) return <>{viewToggle}{sensorsVisible && !enabled &&
    <Box component="button" type="button" aria-label="Show robot POV"
      onClick={() => useGame.setState({ povEnabled: true })}
      sx={{ position: "fixed", top: "5.2rem", right: "1.5rem", zIndex: 11,
        border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.8)", color: CREAM,
        fontFamily: ANTON, letterSpacing: ".1em", px: 1.2, py: 0.7, cursor: "pointer" }}>
      <SensorEye visible={false} />
    </Box>}</>;

  return <>{viewToggle}
    <Box sx={{ position: "fixed", ...(firstPerson ? { inset: 0 } : { top: "5.2rem", right: "1.5rem" }),
      zIndex: firstPerson ? 6 : 11, width: firstPerson ? "100vw" : 280,
      height: firstPerson ? "100vh" : 168, border: firstPerson ? 0 : `3px solid ${CREAM}`,
      background: "#08080c", boxShadow: firstPerson ? "none" : `4px 4px 0 ${COMIC_INK}`,
      overflow: "hidden" }}>
      <Box component="canvas" ref={canvasRef} aria-label="MicroDuck point-of-view camera"
        sx={{ display: "block", width: "100%", height: "100%" }} />
      <Box sx={{ position: "absolute", top: 6, left: 8, pointerEvents: "none",
        fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".13em", color: ORANGE,
        textShadow: "0 0 5px #000" }}>ROBOT POV · LIVE</Box>
      <Box aria-hidden sx={{ position: "absolute", left: "50%", top: "50%", width: 14, height: 14,
        transform: "translate(-50%,-50%)", border: "1px solid rgba(255,122,47,.75)", borderRadius: "50%",
        "&::before": { content: '\"\"', position: "absolute", left: -5, right: -5, top: 6, borderTop: "1px solid rgba(255,122,47,.75)" },
        "&::after": { content: '\"\"', position: "absolute", top: -5, bottom: -5, left: 6, borderLeft: "1px solid rgba(255,122,47,.75)" } }} />
      {!firstPerson && <Box component="button" type="button" aria-label="Hide robot POV"
        onClick={() => useGame.setState({ povEnabled: false })}
        sx={{ position: "absolute", top: 4, right: 4, border: 0, background: "rgba(8,8,12,.75)",
          color: CREAM, fontFamily: ANTON, cursor: "pointer", width: 28, height: 28,
          display: "grid", placeItems: "center" }}><SensorEye visible /></Box>}
    </Box>
  </>;
}
