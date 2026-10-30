# Barangay Safety — portfolio demo builds

The "Try it yourself" section of `/projects/barangay-safety/` runs the **real Barangay Safety
Flutter app**, compiled for the web, on sample data:

| Published at | Built from | What it is |
|---|---|---|
| `public/demos/barangay/` | `hall_demo.dart` | The barangay-hall web dashboard (WebShell, the real routes and screens) signed in as a sample secretary |
| `public/demos/barangay-resident/` | `resident_demo.dart` | The resident app: home, report form, "how to report" tutorial and report detail, as a sample resident |

Both use a backend that lives in the page: Supabase is initialised with a fake address and an
`httpClient` that answers every call locally, so **nothing leaves the browser and no real
record can be reached**. The page around them (`src/components/demos/BarangayDemo.astro`) relays
messages: a report filed on the phone is posted to the dashboard, and status changes made on the
dashboard are posted back to the phone.

## Rebuilding

From a copy of the public repository (github.com/IanKarvey/barangay-safety):

1. Copy `hall_demo.dart` to `tool/portfolio_demo/main.dart` and `resident_demo.dart` to
   `tool/portfolio_demo/resident.dart`.
2. In that copy only, point the map at OpenStreetMap (the Stadia key is not used here):
   in `lib/config/app_config.dart` set `mapTileUrl` to `'https://tile.openstreetmap.org/{z}/{x}/{y}.png'`
   and `mapAttribution` to `'© OpenStreetMap contributors'`.
3. Build (in Git Bash, set `MSYS_NO_PATHCONV=1` first so `/demos/...` is not turned into a Windows path):

   ```bash
   flutter build web -t tool/portfolio_demo/main.dart -o build/portfolio_demo \
     --base-href /demos/barangay/ --release --no-wasm-dry-run --dart-define=BUILD_ID=portfolio-demo
   flutter build web -t tool/portfolio_demo/resident.dart -o build/portfolio_resident \
     --base-href /demos/barangay-resident/ --release --no-wasm-dry-run
   ```

4. Copy each build into its `public/demos/...` folder **except** `canvaskit/` (loaded from Google's
   CDN), `flutter_service_worker.js`, `flutter_bootstrap.js`, `index.html`, `manifest.json` and
   `version.json`. Keep the hand-written `index.html` in each folder: it starts Flutter without a
   service worker (the app's own page clears every cache on the domain, which must not happen inside
   the portfolio), answers the realtime WebSocket in the page, and — for the resident app — supplies
   a fixed GPS position in Barangay 3 so the visitor is never asked for their location.
   Update `_flutter.buildConfig` in those pages to the new build's `engineRevision` if Flutter changed.
