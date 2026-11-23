# Rally — motion badminton

A browser-only badminton prototype with a perspective Canvas court, a simulated AI opponent, local MediaPipe pose tracking and keyboard/mouse fallback. No account or backend required.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

Vite listens on `0.0.0.0:5173`. Build output is in `dist/`. MediaPipe's runtime and models are copied from the npm package before dev/build; generated copies are ignored by Git. Deploy the entire dist directory over HTTPS for camera access.

## GitHub Pages

In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source. After this change is merged into `main`, the Pages workflow installs dependencies, tests scoring, builds with `/<repository-name>/` as the base URL, verifies the built assets, and deploys **only `dist/`**. Pull requests run the build checks without deploying.

Do not publish the repository root with “Deploy from a branch”: the source HTML requires Vite compilation. JavaScript, CSS, the home link, and local MediaPipe assets all need the repository subpath.

To reproduce the Pages build locally (POSIX shell):

```sh
VITE_BASE_PATH=/WebCameGames-Batminton/ npm run build
node scripts/check-pages-build.js
```

For a custom domain served at the root, use `VITE_BASE_PATH=/` for both the build and verification steps instead. After a successful deployment, hard-refresh the site (Ctrl+Shift+R) before testing camera permissions.

## Play

- Select **Let's play**. A/D or arrow keys move; Space swings. Alternatively move the mouse over the court and click to swing.
- Hit when the shuttle approaches your player. The bot automatically returns reachable shots.
- Enable the camera, grant permission and stand back with your shoulders and hands visible. Body position controls lateral movement; a quick movement of either hand triggers a swing. No physical racket is necessary. Ensure you have a safe, clear space.
- Settings provide three bot speeds and 11-point quick or 21-point standard matches. Rally scoring, win by two, caps of 15/30 respectively.
- Pause, restart, optional synthesized hit sounds and court fullscreen are available.

## Privacy and limitations

Camera frames and pose inference remain in the browser. Switching back to keyboard mode stops the camera. The pose model/runtime is served by this app. Google Fonts is used for typography with local system fallbacks.

This is an arcade prototype, not a full badminton simulation: shuttle trajectories, strokes, serving and player movement are simplified. The 11-point mode is a house-rule quick match; 21-point scoring follows the standard target/deuce/cap. Motion thresholds need testing/tuning on real webcams, lighting and body positions. Camera access may need the preview opened in a separate tab if an embedded preview blocks permissions. Keyboard play works without a webcam.

Scoring has automated Node tests. Live webcam recognition requires manual testing on a camera-equipped device; it cannot be validated in this headless workspace.
