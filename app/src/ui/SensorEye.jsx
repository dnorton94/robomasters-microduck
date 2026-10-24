import Box from "@mui/material/Box";

export default function SensorEye({ visible }) {
  return (
    <Box component="svg" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      sx={{ display: "block", width: 17, height: 17 }}>
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.7" />
      {!visible && <path d="M4 4l16 16" />}
    </Box>
  );
}
