import { useEffect } from "react";
import Box from "@mui/material/Box";
import { gameApi, useGame } from "../store.js";
import { nfcApi } from "../game/nfc-sensor.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";

const Reader = ({ label, tag }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: .35,
    borderBottom: "1px solid rgba(250,248,242,.12)", fontFamily: MONO, fontSize: ".58rem" }}>
    <span style={{ color: "rgba(250,248,242,.58)" }}>{label}</span>
    <span style={{ color: tag ? ORANGE : CREAM }}>{tag?.id ?? "NO TAG"}</span>
  </Box>
);

export default function NfcPanel() {
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const nfc = useGame((s) => s.nfc);
  const sensorsVisible = useGame((s) => s.sensorsVisible);
  useEffect(() => nfcApi.subscribe((next) => useGame.setState({ nfc: next })), []);
  if (!entered || menuOpen || !sensorsVisible) return null;
  if (!nfc.enabled) return (
    <Box component="button" type="button" onClick={() => nfcApi.setEnabled(true)}
      sx={{ position: "fixed", top: "41rem", right: "1.5rem", zIndex: 11,
        border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.82)", color: CREAM,
        fontFamily: ANTON, letterSpacing: ".08em", px: 1, py: .6, cursor: "pointer" }}>Show NFC</Box>
  );
  return (
    <Box sx={{ position: "fixed", top: "41rem", right: "1.5rem", zIndex: 11,
      width: 280, border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.88)",
      boxShadow: `3px 3px 0 ${COMIC_INK}`, boxSizing: "border-box", p: "7px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".11em", color: ORANGE }}>NFC · NEAR-FIELD READERS</Box>
        <Box component="button" type="button" aria-label="Hide NFC sensors" onClick={() => nfcApi.setEnabled(false)}
          sx={{ border: 0, background: "transparent", color: CREAM, fontFamily: ANTON, cursor: "pointer" }}>×</Box>
      </Box>
      <Reader label="HEAD ANTENNA" tag={nfc.head} />
      <Reader label="BEAK ANTENNA" tag={nfc.beak} />
      <Box sx={{ display: "flex", mt: .7, gap: .5 }}>
        <Box component="button" type="button" onClick={() => gameApi.setNfcPlacement?.(!nfc.placing)}
          sx={{ flex: 1, border: `1px solid ${ORANGE}`, background: nfc.placing ? ORANGE : "transparent",
            color: nfc.placing ? COMIC_INK : CREAM, fontFamily: ANTON, cursor: "pointer", py: .4 }}>
          {nfc.placing ? "CLICK ARENA" : "PLACE TAG"}
        </Box>
        <Box component="button" type="button" disabled={!nfc.tagCount} onClick={() => gameApi.clearNfcTags?.()}
          sx={{ border: `1px solid ${CREAM}`, background: "transparent", color: CREAM,
            fontFamily: ANTON, cursor: "pointer", opacity: nfc.tagCount ? 1 : .35 }}>CLEAR</Box>
      </Box>
      <Box sx={{ mt: .5, fontFamily: MONO, fontSize: ".48rem", color: "rgba(250,248,242,.48)" }}>
        {nfc.tagCount}/6 TAGS · MOVE VERY CLOSE TO READ
      </Box>
    </Box>
  );
}
