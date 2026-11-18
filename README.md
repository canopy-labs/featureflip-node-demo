# Featureflip Node.js Demo

A tiny, self-contained Node.js + Express app for the YouTube video
**"Add a Feature Flag to a Node.js App in 5 Minutes."**

It renders a realistic SaaS landing page ("Lumen"). A feature-flagged
announcement bar is hidden by default and slides in the moment you flip the
`new-banner` flag on in the Featureflip dashboard — no restart, no redeploy.
A small flag-state chip (bottom-right) mirrors the flag live so it reads
clearly on camera.

## What's on screen

- **Off:** clean landing page, no announcement bar. Chip reads `new-banner = OFF`.
- **On:** a gradient announcement bar slides down from the top. Chip reads `new-banner = ON`.

The page polls `GET /api/banner` once a second, and that endpoint is the only
place the SDK is touched — one `boolVariation` call.

## Prerequisites

- Node.js **20.19.0+** (22+ recommended)
- A Featureflip account
- A boolean flag named **`new-banner`** created in one environment
- That environment's **SERVER SDK key** (Dashboard → Environments → SDK keys)

## Setup

```bash
npm install

# Point the app at your flag:
cp .env.example .env
#   then edit .env and paste your SERVER SDK key into FF_SDK_KEY
```

`.env`:

```
FF_SDK_KEY=your-server-sdk-key
```

## Run

```bash
npm start
# ▶ Demo running at http://localhost:4000
```

Open <http://localhost:4000>. With `new-banner` **off** you'll see the plain
page. Flip it **on** in the dashboard and the banner appears within ~1 second.

> **No key yet?** `npm start` still works — the SDK falls back to serving the
> flag's default (OFF), so you can preview the page before wiring up a key.

## How it works

The whole integration is ~10 lines in [`server.js`](./server.js):

```js
const client = await FeatureflipClient.create({ sdkKey: process.env.FF_SDK_KEY });

app.get("/api/banner", (req, res) => {
  if (client.boolVariation("new-banner", { user_id: "user-123" }, false)) {
    res.json({ showBanner: true, announcement: "Lumen AI Insights is here — …" });
  } else {
    res.json({ showBanner: false });
  }
});
```

`create()` fetches your flag config once at boot, then holds a live stream so
changes arrive in near-real-time. `boolVariation()` is a synchronous in-memory
read — no network call on the request path. The third argument (`false`) is the
default served if the flag can't be reached, so the app fails safe.

The SDK talks to the production evaluation API (`eval.featureflip.io`) by
default. Override with `baseUrl` in the `create()` config if you need to.

## Recording checklist (maps to the video script)

| Scene | In the app / dashboard |
|-------|------------------------|
| 2 — Install | Show `npm install @featureflip/node`; show the `new-banner` flag + copy the SDK key |
| 3 — Code | Show `server.js` (auto-zoom the `boolVariation` line) |
| 4 — Run, flag OFF | `npm start`, open localhost:4000 → plain page, chip `OFF` |
| 5 — **Live flip** | Split screen: toggle `new-banner` ON in the dashboard → banner slides in, chip flips to `ON` (no restart) |
| 6 — Targeting | In the dashboard, switch `new-banner` to a 20% rollout / targeting rule |
| 7 — Recap/CTA | Recap card + `app.featureflip.io/sign-up` |

**Recording tips**

- Record at 1920×1080 (or 2560×1440 and downscale) for crisp text.
- Bump your editor + terminal font size to ~18–20px so code is legible at 1080p.
- For Scene 5, keep both the dashboard toggle and the browser visible in one
  frame so the cause-and-effect is obvious.
- The 1s poll means the banner appears almost instantly — pause ~2s on the
  toggle so the change lands on camera before you move the cursor.
