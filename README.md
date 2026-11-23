# Rally — motion badminton

A browser-only 3D badminton prototype built with Three.js, the uploaded GLB court/player/racket models, a simulated AI opponent, local MediaPipe pose tracking and keyboard/mouse fallback. No account or backend required. WebGL2 and browser hardware acceleration are recommended.

## 3D assets and animations

- `Models/player_Blue.glb`: rigged Mixamo character, cloned with independent skeletons for both players.
- `Models/texture_player_Blue_512.png`: explicitly applied to the player. Blue regions are recolored at runtime for the red AI without recoloring skin/hair.
- `Models/badminton_bat.glb`: normalized racket follows each character's right-hand position.
- `Models/batminton_court.glb`: normalized floor/net geometry; legacy specular/glossiness diffuse textures are mapped for modern Three.js. The floor uses a blue arena material with regulation-layout service lines.
- Runtime procedural bone animation adds breathing/ready stance, side-step legs, a raised-arm swing and finger grip. These are **code-driven animations, not baked clips written into the original GLB**. Original uploaded files are unchanged.
- The surrounding stadium (roof beams, seating, lighting, trees), shuttle, cyan trail, shadows and blue/red HUD are rendered locally. The reference image guides the design; it is not used as a fake playable background.

`npm run dev` / `npm run build` copy the four required assets into ignored `public/models/`. They are published under the Vite base path; screenshots and duplicate generated assets are not committed. If a required asset fails to load, the start button stays disabled and the HUD shows an error rather than starting an invisible match.

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

Scoring, GLB integrity, expected rig bones and texture format have automated Node tests. The build verifier also checks the deployed 3D assets and their subpath URLs.

For browser smoke tests, start the dev server, then run:

```sh
npx playwright install chromium
node scripts/browser-smoke.mjs
```

`TEST_URL` can target a deployed subpath or local Vite preview. `CHROMIUM_EXECUTABLE_PATH` optionally selects an existing Chromium executable. Screenshots go to ignored `.artifacts/`. The smoke test covers model loading, start, keyboard movement/swing input, pause/resume, settings, restart, camera-denial fallback, and mobile overflow. It does not validate the physical accuracy of motion tracking or stroke mechanics. Live webcam recognition still requires manual testing on a camera-equipped device.
