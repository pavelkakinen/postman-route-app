# Implementation Plan — Postman Route App

## Architecture

```
src/
  components/
    CsvUpload.jsx        # File input + papaparse → array of {address, newspaper}
    Map.jsx              # Leaflet map, markers, route polyline
    StepNavigator.jsx    # Current stop card: address + newspaper + "Delivered" button
    AddressList.jsx      # Ordered list of all stops (sidebar or below map)
  services/
    geocoder.js          # Nominatim: address string → {lat, lng}  (rate-limited 1/sec)
    router.js            # OSRM: ordered coords → route geometry (GeoJSON polyline)
    optimizer.js         # Nearest-neighbor TSP on geocoded coords
  App.jsx                # State machine: IDLE → LOADING → READY → NAVIGATING
  main.jsx
```

### Data flow
```
CSV file
  → papaparse → [{address, newspaper}]
  → geocoder  → [{address, newspaper, lat, lng}]
  → optimizer → ordered [{…}]   (nearest-neighbor from first point)
  → router    → polyline geometry
  → Map + StepNavigator render
```

### State machine (App-level)
| State     | What's shown |
|-----------|--------------|
| `IDLE`    | CSV upload area |
| `LOADING` | Progress bar (geocoding N addresses) |
| `READY`   | Map with all markers + route line + full stop list |
| `NAVIGATING` | Map zoomed to current stop + StepNavigator card |

---

## Phases

### Phase 1 — CSV upload + display on map
**Goal:** Upload CSV, see address markers on map, nothing optimized yet.

Tasks:
- [ ] Replace default Vite template in `App.jsx` with minimal shell
- [ ] `CsvUpload` component: drag-and-drop or `<input type="file">`, parse with papaparse
- [ ] `Map` component: Leaflet map centered on Estonia/Pärnu, render a marker per stop
- [ ] Basic layout: upload area + map side by side

**Checkpoint:** Upload the sample CSV from PROJECT.md → 3 markers appear on the map.

---

### Phase 2 — Geocoding
**Goal:** Convert raw address strings to lat/lng via Nominatim.

Tasks:
- [ ] `geocoder.js`: fetch `https://nominatim.openstreetmap.org/search?q=…&format=json`
- [ ] Rate-limit to 1 request/second (sequential with delay)
- [ ] Show progress in UI: "Geocoding 4 / 12 addresses…"
- [ ] Handle failures: mark unresolved addresses as errors, skip them

**Checkpoint:** Upload CSV → progress indicator runs → markers appear at correct coordinates on the map. Verify with browser DevTools that Nominatim calls are sequential, not parallel.

---

### Phase 3 — Route optimization
**Goal:** Reorder stops with nearest-neighbor algorithm.

Tasks:
- [ ] `optimizer.js`: given `[{lat, lng, …}]`, return reordered array starting from index 0
- [ ] Apply optimizer after geocoding is complete
- [ ] Number each marker on the map (1, 2, 3…)
- [ ] Render ordered list of stops below the map

**Checkpoint:** Compare unoptimized vs optimized order visually on the map — stops should form a logical path, not jump around randomly.

---

### Phase 4 — Route line (OSRM)
**Goal:** Draw the actual road path between stops, not straight lines.

Tasks:
- [ ] `router.js`: send ordered coords to `https://router.project-osrm.org/route/v1/driving/…`
- [ ] Parse GeoJSON geometry from response
- [ ] Draw `<Polyline>` on the Leaflet map

**Checkpoint:** Route line follows actual roads between the stops. Test with Pärnu addresses to confirm the geometry looks correct.

---

### Phase 5 — Step-by-step navigation
**Goal:** Walk through stops one at a time.

Tasks:
- [ ] `StepNavigator` component: shows stop number, address, newspaper name
- [ ] "Delivered" button → advance to next stop, map pans + zooms to it
- [ ] Completed stops get a different marker color (grey)
- [ ] "Done" screen when all stops are delivered

**Checkpoint:** Go through all stops with the "Delivered" button — map follows correctly, last stop shows "Done", no crashes.

---

### Phase 6 — Polish & edge cases
**Goal:** Make it usable in the field.

Tasks:
- [ ] Mobile-friendly layout (single column, large tap targets)
- [ ] Error state UI for unresolvable addresses
- [ ] "Reset / upload new CSV" button
- [ ] Nominatim attribution footer (required by usage policy)
- [ ] Basic loading skeleton so map doesn't flash empty

**Checkpoint:** Test on a real phone browser. Upload a real-world CSV with 20+ addresses and complete a full delivery run without errors.

---

## Definition of Done (v0.1 MVP)

- [ ] All Phase 1–5 checkpoints pass
- [ ] Works on desktop Chrome and mobile Safari
- [ ] No API keys required — 100% free services (Nominatim + OSRM + OSM tiles)
- [ ] Deployable to Vercel/Netlify with `vite build`
