import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { gameApi, useGame } from "../store.js";
import { nfcApi } from "../game/nfc-sensor.js";
import { ORANGE, MONO } from "../theme.js";
import { ANTON, COMIC_INK, CREAM } from "./comic.jsx";
import SensorEye from "./SensorEye.jsx";

const Reader = ({ label, tag }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: .35,
    borderBottom: "1px solid rgba(250,248,242,.12)", fontFamily: MONO, fontSize: ".58rem" }}>
    <span style={{ color: "rgba(250,248,242,.58)" }}>{label}</span>
    <span style={{ color: tag ? ORANGE : CREAM }}>{tag ? `${tag.id} · ${tag.type.toUpperCase()}` : "NO TAG"}</span>
  </Box>
);

const fieldSx = { width: "100%", boxSizing: "border-box", border: "1px solid rgba(250,248,242,.35)",
  background: "rgba(0,0,0,.34)", color: CREAM, fontFamily: MONO, fontSize: ".58rem", p: .6 };

export default function NfcPanel() {
  const entered = useGame((s) => s.entered);
  const menuOpen = useGame((s) => s.menuOpen);
  const nfc = useGame((s) => s.nfc);
  const mission = useGame((s) => s.environmentMode === "mission");
  const sensorsVisible = useGame((s) => s.sensorsVisible);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState({ type: "text", content: "" });
  const tagIds = nfc.tags.map((tag) => tag.id).join("|");
  useEffect(() => nfcApi.subscribe((next) => useGame.setState({ nfc: next })), []);
  useEffect(() => {
    const selected = nfc.tags.find((tag) => tag.id === selectedId) ?? nfc.tags.at(-1);
    if (!selected) { setSelectedId(""); setDraft({ type: "text", content: "" }); return; }
    if (selected.id !== selectedId) setSelectedId(selected.id);
    setDraft({ type: selected.type, content: selected.content });
    // Sensor readings publish at 10 Hz. Only reset the editor when tags are
    // added/removed; otherwise those readings would erase in-progress typing.
  }, [tagIds]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectTag = (id) => {
    const tag = nfc.tags.find((candidate) => candidate.id === id);
    setSelectedId(id);
    if (tag) setDraft({ type: tag.type, content: tag.content });
  };
  const save = (next = draft) => gameApi.updateNfcTag?.(selectedId, next);
  const loadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = { type: "image", content: String(reader.result) };
      setDraft(next); save(next);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  if (!entered || menuOpen || !sensorsVisible) return null;
  if (!nfc.enabled) return (
    <Box component="button" type="button" aria-label="Show NFC sensors" onClick={() => nfcApi.setEnabled(true)}
      sx={{ position: "fixed", top: "41rem", right: "1.5rem", zIndex: 11,
        border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.82)", color: CREAM,
        fontFamily: ANTON, px: 1, py: .6, cursor: "pointer" }}><SensorEye visible={false} /></Box>
  );
  return (
    <Box sx={{ position: "fixed", top: "41rem", right: "1.5rem", zIndex: 11,
      width: 280, border: `2px solid ${CREAM}`, background: "rgba(8,8,12,.88)",
      boxShadow: `3px 3px 0 ${COMIC_INK}`, boxSizing: "border-box", p: "7px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".11em", color: ORANGE }}>NFC · NEAR-FIELD READERS</Box>
        <Box component="button" type="button" aria-label="Hide NFC sensors" onClick={() => nfcApi.setEnabled(false)}
          sx={{ border: 0, background: "transparent", color: CREAM, fontFamily: ANTON,
            cursor: "pointer", display: "grid", placeItems: "center", width: 24, height: 24 }}>
          <SensorEye visible />
        </Box>
      </Box>
      <Reader label="HEAD ANTENNA" tag={nfc.head} />
      <Reader label="BEAK ANTENNA" tag={nfc.beak} />
      {!mission && <Box sx={{ display: "flex", mt: .7, gap: .5 }}>
        <Box component="button" type="button" onClick={() => gameApi.setNfcPlacement?.(!nfc.placing)}
          sx={{ flex: 1, border: `1px solid ${ORANGE}`, background: nfc.placing ? ORANGE : "transparent",
            color: nfc.placing ? COMIC_INK : CREAM, fontFamily: ANTON, cursor: "pointer", py: .4 }}>
          {nfc.placing ? "CLICK CUBE" : "PLACE TAG"}
        </Box>
        <Box component="button" type="button" disabled={!nfc.tagCount} onClick={() => gameApi.clearNfcTags?.()}
          sx={{ border: `1px solid ${CREAM}`, background: "transparent", color: CREAM,
            fontFamily: ANTON, cursor: "pointer", opacity: nfc.tagCount ? 1 : .35 }}>CLEAR</Box>
      </Box>}
      {!mission && <Box sx={{ mt: .5, fontFamily: MONO, fontSize: ".48rem", color: "rgba(250,248,242,.48)" }}>
        {nfc.tagCount}/6 TAGS · ATTACH TO A CUBE SURFACE
      </Box>}
      {!mission && !!nfc.tags.length && <Box sx={{ mt: .8, pt: .7, borderTop: "1px solid rgba(250,248,242,.18)" }}>
        <Box sx={{ display: "flex", gap: .5 }}>
          <Box component="select" aria-label="NFC tag to edit" value={selectedId}
            onChange={(event) => selectTag(event.target.value)} sx={{ ...fieldSx, flex: 1 }}>
            {nfc.tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.id}</option>)}
          </Box>
          <Box component="select" aria-label="NFC payload type" value={draft.type}
            onChange={(event) => setDraft((old) => ({ ...old, type: event.target.value }))}
            sx={{ ...fieldSx, width: 82 }}>
            <option value="text">TEXT</option><option value="url">URL</option><option value="image">IMAGE</option>
          </Box>
        </Box>
        {draft.type === "image" ? <>
          <Box component="label" sx={{ ...fieldSx, display: "block", mt: .5, textAlign: "center", cursor: "pointer", color: ORANGE }}>
            CHOOSE IMAGE<input hidden type="file" accept="image/*" onChange={loadImage} />
          </Box>
          {draft.content && <Box component="img" src={draft.content} alt={`${selectedId} payload`}
            sx={{ display: "block", width: "100%", height: 64, mt: .5, objectFit: "contain", background: "#111" }} />}
        </> : <Box component={draft.type === "text" ? "textarea" : "input"}
          type={draft.type === "url" ? "url" : undefined} rows={draft.type === "text" ? 2 : undefined}
          aria-label={`${draft.type} payload`} placeholder={draft.type === "url" ? "https://example.com" : "Tag message"}
          value={draft.content} onChange={(event) => setDraft((old) => ({ ...old, content: event.target.value }))}
          sx={{ ...fieldSx, mt: .5, resize: "vertical" }} />}
        <Box component="button" type="button" onClick={() => save()} sx={{ width: "100%", mt: .5,
          border: `1px solid ${ORANGE}`, background: ORANGE, color: COMIC_INK, fontFamily: ANTON, cursor: "pointer", py: .35 }}>
          WRITE TO {selectedId}
        </Box>
      </Box>}
    </Box>
  );
}
