# WonderLab — motion badminton

A browser-only 3D badminton prototype built with Three.js, the uploaded GLB court/player/racket models, a simulated AI opponent, local MediaPipe pose tracking and keyboard/mouse fallback. No account or backend required. WebGL2 and browser hardware acceleration are recommended.

## 3D assets and animations

- `Models/player_Blue.glb`: rigged Mixamo character, cloned with independent skeletons for both players.
- `Models/texture_player_Blue_512.png`: explicitly applied to the player. Blue regions are recolored at runtime for the red AI without recoloring skin/hair.
- `Models/badminton_bat.glb`: normalized racket follows each character's right-hand position.
- `Models/batminton_court.glb`: normalized floor/net geometry; legacy specular/glossiness diffuse textures are mapped for modern Three.js. The floor uses a blue arena material with regulation-layout service lines.
- Runtime procedural bone animation adds breathing/ready stance, side-step legs, a raised-arm swing and finger grip. These are **code-driven animations, not baked clips written into the original GLB**. Original uploaded files are unchanged.
- `UI/WonderLab Motion Badminton Stadium.png` is now the actual stadium backdrop. The original image is copied unchanged to `public/ui/stadium.png` and displayed with aspect-preserving cover cropping. The previous procedural hall is removed; the court, characters, net, racket, shuttle, trail and shadows remain live 3D in front of the image.
- `UI/09_game_logo.png` is the header logo. Boards `01`–`08` and `10` are visual references: CSS/HTML recreates their neon blue panels, blue/red scoreboard, yellow Start Game button, tips and Settings/Help/Home controls. Their example scores, online statuses and text are **not** pasted over the live game.
- The Mission board tracks a match win, seven player points and a five-shot rally; it resets with the match and does not change scoring.
- Default camera: eye-level at 2.15 world units behind the blue player, with a slight shoulder offset and smoothed lateral follow so the head is not directly in the shuttle sightline. Portrait uses more distance but retains eye height. **Settings → Camera view → Court overview** restores the wider, higher camera. The stadium is a 2D backdrop, not a 360-degree environment.

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

- Select **Start Game**. A/D or arrow keys move; Space swings. Alternatively move the mouse over the court and click to swing.
- Wait until the shuttle is near the racket: a swing is active for 0.5 seconds, but the return happens only at the shared racket-contact plane (with limited lateral reach), not halfway down the court. A miss continues past the player and falls before the point is awarded.
- **Aim:** hold Q/E (or a left/right movement key) when pressing Space for a left/right angled return; no direction gives a straight shot. With the mouse, move left/right just before clicking. In webcam mode, the horizontal direction of the swinging wrist controls the angle; an upward swing with little sideways motion goes straight.
- Incoming AI shots mix overhead clears (2.75-unit contact height, higher arc and extra flight time), low drives (1.85-unit contact height) and standard shots. A bounded four-shot mix prevents repeated low-only rallies; it resets with a new match. Watch the live shot hint in the tips bar. Raise a visible wrist above your shoulder and swing for overheads; raised strokes have a slightly more forgiving motion-speed threshold. Keyboard/mouse still use the same swing control. Height matching is assisted, not a strict real-world wrist-height collision gate.
- Incoming and outgoing flight endpoints, arm/racket targeting and hit flash use each shot's actual height, so changing shot types does not teleport the shuttle vertically.
- Red AI movement is about 16–18% faster across difficulties. AI still has difficulty-specific reaction delay, movement speed and targeting error. It returns reachable shots, but a wide shot or a change of direction can beat it. Your shots never auto-target the AI's position.
- The lowered camera gives a more court-level view. Flight endpoints, racket string-bed placement, contact sound, brief flash, and outgoing trail use the same contact point. This is an assisted arcade contact/arm-IK system, not arbitrary mesh-to-mesh collision physics.
- Enable the camera, grant permission and stand back with your shoulders and hands visible. Body position controls lateral movement; a quick movement of either hand triggers a swing. No physical racket is necessary. Ensure you have a safe, clear space.
- Settings provide three bot speeds and 11-point quick or 21-point standard matches. Rally scoring, win by two, caps of 15/30 respectively.
- Pause, restart, optional synthesized hit sounds and court fullscreen are available.
- **Crowd reactions:** click the speaker button to enable sound (muted by default). Blue wins a point → `Sound/crowd-cheering.mp3`; blue loses a point → `Sound/crowd-disappointment.mp3`. Each reaction plays for at most 1.8 seconds (cheer starts at 8 seconds to skip its quiet intro; disappointment starts at the beginning), with a quick fade-in and fade-out before the next serve. This replaces the synthetic crowd effect; hit beeps remain. Both recordings preload/decode once when sound is enabled and use the app's Pages base path. Mute, pause, restart and hiding the tab stop either recording, and newer points replace old reactions. Failed downloads do not stop gameplay; toggling sound retries them. A reaction is skipped if loading would delay it by more than 300 ms, preventing out-of-time cheers.

## Privacy and limitations

Camera frames and pose inference remain in the browser. Switching back to keyboard mode stops the camera. The pose model/runtime is served by this app. Google Fonts is used for typography with local system fallbacks.

This is an arcade prototype, not a full badminton simulation: shuttle trajectories, strokes, serving and player movement are simplified. The 11-point mode is a house-rule quick match; 21-point scoring follows the standard target/deuce/cap. Motion thresholds need testing/tuning on real webcams, lighting and body positions. Camera access may need the preview opened in a separate tab if an embedded preview blocks permissions. Keyboard play works without a webcam.

Scoring, GLB integrity, expected rig bones and texture format have automated Node tests. The build verifier also checks the deployed 3D assets and their subpath URLs.

For browser smoke tests, start the dev server, then run:

```sh
npx playwright install chromium
node scripts/browser-smoke.mjs
node scripts/rally-smoke.mjs
```

The rally smoke test drives the real game with keyboard events, captures a contact-frame screenshot, and checks that a right-angle return can beat Casual AI for a 1–0 score. Unit tests additionally cover early/distant-hit rejection, direction selection, reachable vs. unreachable AI shots, reaction delay and contact positions at 30/60/120 FPS.

`TEST_URL` can target a deployed subpath or local Vite preview. `CHROMIUM_EXECUTABLE_PATH` optionally selects an existing Chromium executable. Screenshots go to ignored `.artifacts/`. The smoke test covers model loading, start, keyboard movement/swing input, pause/resume, settings, restart, camera-denial fallback, and mobile overflow. It does not validate the physical accuracy of motion tracking or stroke mechanics. Live webcam recognition still requires manual testing on a camera-equipped device.

## Loading screen

The supplied `UI/WonderLab Motion Badminton Loading Screen.png` is copied unchanged to `public/ui/loading.png`, preloaded and shown in the initial HTML (before the game JavaScript). Live overlays replace the artwork's printed percent/network/ready labels. Progress reflects completion of five top-level assets (court, player, racket, player texture, stadium), reaching 90% when loaded and 100% only after scene assembly. It is an asset-count indicator, not byte-transfer progress; MediaPipe still loads on demand when the camera is enabled.

The game remains inert behind the screen until ready. It dismisses after the prepared scene has a chance to paint, without an artificial wait. Asset/WebGL errors show a Retry button that reloads the page; slow loading offers Retry after 20 seconds without falsely declaring failure. The artwork uses contain framing on mobile so neither player is cropped. JavaScript-disabled browsers receive a text explanation.

`node scripts/loading-smoke.mjs` (same `TEST_URL` / Chromium environment options as other browser tests) checks delayed assets, progress, desktop/mobile artwork, failure, retry and starting the game.
