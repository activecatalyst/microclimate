# Microclimate

A personal weather station for one street. Not a weather app — a cockpit readout: a huge current temperature, a row of **verdict chips** driven by your own rules ("hoodie weather", "walk window 4–5 PM", "perfect Criterion night"), a 24-hour temperature horizon, a 7-day strip, and a live sunrise/sunset arc. One dark, glanceable page. No accounts, no keys, no tracking.

Built as a mobile-first PWA in plain HTML/CSS/JS. No build step, no dependencies, no framework. Deploy by copying two files.

---

## The point of it: a personal rules engine

Most weather apps show you numbers and make you do the interpreting. Microclimate does the interpreting. You define rules; the forecast is evaluated against them; each rule produces a chip on the main screen and a fragment in the morning **briefing** sentence.

Six rules ship by default, all editable:

| Chip | What it decides |
|------|-----------------|
| Hoodie Index | Temp below your threshold → "hoodie weather" |
| Walk Window | Finds today's best 1-hour outdoor window (temp band, no rain, low wind) and names the time |
| Golden Hour | Today's golden-hour window + a quality guess from cloud cover |
| Gym Run | Checks the drive windows you set (e.g. 6–8 AM, 4–6 PM) for wet roads |
| Movie Night | Cloudy or rainy evening → "perfect Criterion night" |
| Hydration Flag | High temp above your threshold → carry water |
| Outdoor Training | Air quality (US AQI) below your ceiling → clear to train outside |

Each rule is data, not code:

```json
{
  "id": "hoodie",
  "name": "Hoodie Index",
  "icon": "🧥",
  "type": "temp_below",
  "enabled": true,
  "params": { "source": "current", "threshold": 62 },
  "verdicts": { "go": "hoodie weather", "off": "skin's fine" }
}
```

Add your own by dropping a new object into the JSON editor in settings — no logic to touch. Available rule `type`s:

- `temp_below` / `temp_above` — compare `current`, `today_max`, or `today_min` against a `threshold`
- `walk_window` — best comfortable hour (`tempMin`, `tempMax`, `maxWind`, `allowRain`)
- `golden_hour` — golden-hour times + cloud-based quality (`which`: `evening` or `morning`)
- `drive_windows` — verdict on named time `windows` for wet/gusty conditions
- `evening_clouds` — evening cloud cover / rain over a window (`eveningStart`, `eveningEnd`, `cloudMin`)
- `air_quality` — US AQI against `maxAqi`

---

## Features

- **Current conditions** — big temperature with feels-like, humidity, wind, cloud, and US AQI
- **Yesterday delta** — "about 4° warmer than this time yesterday"
- **Morning briefing** — one sentence stitched from your active rules
- **24-hour horizon** — SVG temperature curve with precipitation bars
- **7-day forecast** — compact lo–hi rows with rain probability
- **Sun arc** — sunrise/sunset with the sun at its current position
- **Two saved locations** — one-tap toggle in the header (San Diego / Los Angeles by default)
- **Use my location** — fills coordinates from your device and names the city
- **Offline** — the last successful fetch is cached; the page still renders with a "stale" timestamp when you have no signal
- **Installable** — add to home screen on iOS/Android or install on desktop Chrome/Edge

---

## Quick start

### Run locally

Because it uses a service worker, open it through a local server rather than `file://`:

```bash
# from the folder containing index.html
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works. Opening `index.html` directly still shows the app, but the offline service worker won't register over `file://`.

### Deploy to GitHub Pages

1. Put `index.html` and `sw.js` in a repository (same directory — the paths are relative).
2. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**, pick your branch and root.
3. Open the published URL. GitHub Pages serves over HTTPS, so the service worker, offline cache, and geolocation all work.

That's it — no build, no CI, no bundler.

---

## Settings

Open with the ⚙ button. Two ways to edit, kept in sync:

- **Form** — friendly fields for locations (with a radio for the active one, plus "use my location") and every rule's parameters, icons, and verdict strings.
- **JSON** — the raw settings object, for power edits, adding rules, or copy/paste backup.

Everything is stored in your browser's `localStorage`. Nothing leaves the device except the forecast/air-quality/geocoding requests.

### Changing location

Set coordinates once in settings, or tap **use my location**. Coordinates default to San Diego. The header pill swaps between your saved locations with one tap; each location caches its data separately.

---

## Customization

- **Add a rule** — copy an existing object in the JSON editor, change its `type`, `params`, and `verdicts`. It appears as a new chip immediately.
- **Reorder / disable** — set `"enabled": false` to hide a chip without deleting it. Chip order follows array order.
- **Recolor** — the palette lives in CSS variables at the top of `index.html` (`--bg`, `--go`, `--curve`, `--precip`, `--sun`, etc.). The shipped theme is "Sonar" (deep-sea teal on navy).

---

## How it works

- **Data**: [Open-Meteo](https://open-meteo.com) forecast and air-quality APIs — free, no key required. Reverse geocoding (for "use my location") uses BigDataCloud's free client endpoint.
- **Offline data**: every successful fetch is written to `localStorage`; on failure the app repaints from that cache and flips the status mark and timestamp to a stale state.
- **Offline shell**: `sw.js` caches `index.html` network-first, so edits land on next load but the page still boots with no connection.
- **Icons**: the app icon (favicon, Apple touch icon, and manifest PNGs) is drawn on a `<canvas>` at load, so the whole thing stays essentially self-contained.

### Files

```
index.html   the entire app — markup, styles, logic, manifest, icons
sw.js         optional service worker for offline launch
```

---

## Browser support

Works in any modern browser. Install-as-app is supported on iOS/Android and on desktop Chrome and Edge; Firefox and Safari on desktop run it as a regular tab. Geolocation and the service worker require HTTPS (or `localhost`).

---

## Updating a deployed copy

Bump the cache name in `sw.js` so old caches clear:

```js
const CACHE = "microclimate-v2";  // was v1
```

Visitors get the new version on their next load.

---

## License

Do whatever you like with it.
