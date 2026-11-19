// server.js — Featureflip Node.js demo
// The entire feature-flag integration is the ~10 lines in the block below.

import path from "node:path";
import express from "express";
import { FeatureflipClient } from "@featureflip/node";

// Load FF_SDK_KEY from a local .env file if present (optional).
try {
  process.loadEnvFile();
} catch {
  /* no .env file — that's fine, we'll serve defaults */
}

// Default to 4000 — port 3000 is where the Featureflip web app runs, and a
// collision there is silent and confusing. Override with PORT=... if needed.
const PORT = Number(process.env.PORT) || 4000;

// ── Featureflip: initialize once, when the server boots ──────────────────
// create() fetches your flag configuration and resolves when the SDK is
// ready. After that it holds a live stream, so flag changes arrive in
// near-real-time with no redeploy.
//
// No SDK key yet? We fall back to a stub that always returns the default,
// so `npm start` renders the page before you've wired up a key.
let client;
if (process.env.FF_SDK_KEY) {
  try {
    client = await FeatureflipClient.create({ sdkKey: process.env.FF_SDK_KEY });
    console.log("✓ Connected to Featureflip");
  } catch (err) {
    console.warn(`⚠ Featureflip init failed (${err.message}) — serving defaults`);
  }
}
client ??= { boolVariation: (_key, _ctx, def) => def, close: async () => {} };
// ─────────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.static(path.join(import.meta.dirname, "public")));

// The page polls this endpoint. The server decides whether the announcement
// bar shows and what it says, so changing it never needs a page edit.
app.get("/api/banner", (req, res) => {
  if (client.boolVariation("announcement-bar", { user_id: "user-123" }, false)) {
    res.json({
      showBanner: true,
      announcement: "Lumen AI Insights is here — auto-summarize any dashboard in one click.",
    });
  } else {
    res.json({ showBanner: false });
  }
});

const server = app.listen(PORT, () => {
  console.log(`▶ Demo running at http://localhost:${PORT}`);
  if (!process.env.FF_SDK_KEY) {
    console.warn("⚠ No FF_SDK_KEY set — serving defaults. Add it to .env to go live.");
  }
});

// Fail loudly on a port clash instead of silently letting the browser hit
// whatever else is on that port (e.g. the Featureflip web app on :3000).
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`✗ Port ${PORT} is already in use. Start on another port:\n    PORT=4100 npm start`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

// Flush pending analytics events and close the stream on shutdown.
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
