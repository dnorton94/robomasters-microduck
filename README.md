# RoboMasters MicroDuck Simulator

An educational, browser-based MicroDuck simulator with manual control,
autonomous behaviours and interactive sensors. MuJoCo compiled to WebAssembly
steps the physics while ONNX Runtime Web runs the robot's real trained movement
policies at 50 Hz. Everything runs locally in the browser—no simulation backend
is required.

This project extends the original
[Pollen Robotics MicroDuck Space](https://huggingface.co/spaces/pollen-robotics/microduck-simulator)
while preserving its appearance, controls, walking policies and balancing
behaviour.

## Highlights

- Manual driving with keyboard, touch and gamepad support
- Autonomous **Roam** and **Chase Ball** modes
- Immediate manual override and a dedicated **Stop** control
- Placeable, collidable cube obstacles
- Robot-eye POV camera
- Simulated 8×8 Time-of-Flight depth sensor
- Simulated head and beak NFC readers with placeable tags
- Opt-in browser microphone input
- One **Sensors** button that hides or restores every sensor display
- An **Available Policies** panel for inspecting and triggering ONNX moves
- Feet and roller locomotion using the existing ONNX policies

Two locomotion variants of the same robot are included: **legs** (walking,
the default) and **rollers** (the wheeled skating variant). Press `M` (or
hold D-pad up ~1 s on a gamepad) to switch; the roller model, meshes and
policies are lazy-loaded on the first switch.

## Policies

| Mode | Checkpoint | What it does |
|--------|-----------|--------------|
| Run (legs) | `BEST_alpha_walking.onnx` | Velocity-tracking locomotion (arrows / WASD to steer) |
| Sit | `BEST_alpha_sitstand.onnx` | Sits down on its hull, stands back up |
| Roll | `roulade.onnx` | Rolls over and recovers |
| Kick | `ball_kick_left.onnx` / `ball_kick_right.onnx` | Blind one-shot kick (0.5 s window, zeroed commands), left or right leg |
| Drive (rollers) | `BEST_roller.onnx` | Velocity-tracking skating on 4 passive wheels (higher top speed: 0.6 m/s) |
| Crouch (rollers) | `BEST_roller_crouch.onnx` | One-shot crouch-glide: sinks low over ~3.5 s and stands back up (phase-encoded command) |

Policies and MJCF model from
[pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
and [pollen-robotics/microduck_rl](https://github.com/pollen-robotics/microduck_rl).

Select **Policies** in the top-right corner to open the live policy browser.
It shows each policy's friendly name and checkpoint, the active movement mode,
and a **Trigger** button. Moves that do not apply to the current feet/rollers
configuration are disabled. Triggering a policy is treated as an explicit
manual command, so it safely stops autonomous steering first. Active community
policies also appear in this list.

## Controls

- Arrows or WASD / ZQSD: forward / back + turn
- M: switch legs <-> rollers
- Q / E (A / E on AZERTY): kick left / right (legs only)
- F: alternate left / right kicks (legs only)
- R: sit / stand (legs) / crouch-glide (rollers)
- G: ground pick (legs only)
- C: toggle the chase camera (on by default; dragging detaches it)
- Space: reset
- Drag to orbit, scroll to zoom
- Colour dots: repaint the duck (it quacks)

### Autonomous pilot

The in-game **Pilot** panel switches between the original manual controls
and autonomous driving. **Roam** chooses safe targets around the arena,
turns away from walls and reverses/turns when progress stalls. **Chase ball**
uses the simulated robot and ball poses to align, approach and launch the
existing left/right kick policy. **Stop** returns to manual control at once;
holding any movement key, stick or touch control temporarily overrides the
autonomous command without changing the trained locomotion policy.

Simulator perception is isolated in `app/src/game/autonomy/perception.js` so
pose/range estimates from real sensors can replace it without changing the
behaviour controller.

The **Cubes** panel enables arena placement mode. Click **Place cube**, then
click the arena floor to add up to eight solid obstacles; **Clear** removes
them. Autonomous driving treats placed cubes as sensed obstacles in addition
to their MuJoCo collision geometry.

### Sensors

The top-right **Sensors** button toggles the complete sensor dashboard. Hiding
the dashboard does not reset sensor readings, microphone permission or the
individual visibility choices; showing it restores the previous state.
Every sensor card can also be hidden and restored independently.

The **First person / Third person** control switches the whole arena view to
the existing MicroDuck head camera and back. It remains available in both the
Testing Bay and Mission, even when the sensor dashboard is hidden.

A live **Robot POV** inset renders from MicroDuck's head so learners can
compare its egocentric view with the normal third-person camera. The inset
can be hidden and restored without changing robot control. Its renderer is
recreated when the sensor dashboard returns, so repeated hide/show cycles are
safe.

The opt-in **Microphone Sensor** exposes live input level, time-domain data,
frequency data, the Web Audio analyser and the underlying `MediaStream` via
`microphoneApi` (also `window.__microduckMicrophone`). Audio stays local and
is neither recorded nor transmitted by the simulator. This is an extension
point for later speech commands, wake words and sound-reactive behaviours.

The simulated head also publishes a real-time **8×8 ToF depth frame** at
10 Hz. Sixty-four rays originate at the MJCF's physical ToF site and measure
walls, props, the ball and placed cubes up to 2 m away. The HUD shows the
numbers as a near-orange/far-blue grid, while extensions can consume the same
data through `tofApi` or `window.__microduckTof`.

The **NFC** panel models the two antennas found on the real robot: one in the
head and one in the beak. Select **Place tag**, click a cube surface to add a tag,
and move the duck very close to it. The panel reports the tag ID independently
for each antenna and highlights a tag when read. Up to six tags can be placed;
**Clear** removes them. Extensions can subscribe through `nfcApi` or
`window.__microduckNfc`.

The **Body IMU** and **Head IMU** cards expose each unit's three-axis
accelerometer, three-axis gyroscope and roll/pitch/yaw orientation at 10 Hz.
The body values come directly from MuJoCo's IMU sensors; the articulated head
values are derived from its simulated pose. Extensions can subscribe through
`imuApi` or `window.__microduckImu`.

The sensor adapters intentionally sit behind small publish/subscribe APIs so
real camera, ToF, NFC, IMU or microphone sources can replace the simulation
inputs without rewriting the displays or autonomous controller.

### Mission mode

Use the **Testing Bay / Mission** control to enter Stage One: **The Red Plate**.
The duck must solve the plate's hidden timing protocol using autonomous control;
the mission panel and plate lighting provide experimental feedback without
publishing the thresholds in the interface. Manual entry is rejected, leaving
too early resets the attempt, and a containment failure or completion offers a
stage retry. The target is a flush 6-by-6 patch of floor cells that disappears
and relocates after five unattended seconds or between attempts. Mission mode
locks control to autonomy and disables policy triggering, cube placement and
tag placement. The ball and the Testing Bay's Roam/Chase selector are removed
for the mission. Mission entry also closes live browser connections and blocks
new HTTP, XHR, WebSocket, EventSource, beacon and WebRTC traffic until the user
returns to the Testing Bay. The mission evaluator is isolated from the HUD and
covered by boundary tests.

Floor clicks and double-click waypoint navigation are ignored in Mission. An
early plate exit removes the target, starts a fresh attempt and relocates it.
The plate is also excluded from simulated ToF returns because it is flush with
the floor rather than an obstacle.

Completing Stage One reveals the Stage Two access code
`ACTIVATEDUCKMASTER`. Entering that earned code in the completion panel opens
Stage Two and replaces the plate with three physical core cubes: red, blue and
orange. Cube positions and QR-facing directions change each attempt, and the
safe core is randomized. Each cube carries a locally generated diagnostic QR
payload that can be observed through the fixed head camera and processed by a
participant's bundled vision behaviour without internet access.

Mission mode also shows a compact stage-code input immediately to the left of
the **Mission** control. A previously earned code can be entered there to jump
directly to its stage; entering `ACTIVATEDUCKMASTER` starts a fresh randomized
Stage Two attempt.

The autonomous behaviour reports a decoded observation with
`emitAction("reportQr", { color, payload })`. The evaluator silently checks the
exact payload, camera alignment and scan distance. All three cores must be
scanned, the duck must withdraw to a clear decision position, and then remain
beside its chosen core to submit. Colliding with a cube or selecting an unsafe
core fails the attempt. The HUD deliberately provides no scan, range, decoded
message or correct-core feedback.

Mission locks autonomous control on but does not replace its configuration. It
runs the registered code-backed behaviour selected in the Testing Bay. An agent
can add a local controller (for example camera object detection) in
`app/src/game/autonomy/custom-behaviors.js`; after registration it appears in
the profile editor and receives world state, fixed sensor interfaces and the
same command path as manual input. Mission networking remains unavailable, so
vision or speech models must be bundled and run locally.

Roam and Chase Ball are locked official controller templates. The **+** control
first creates an empty named profile. Its settings button then opens the in-app
editor where participants can add, rename, associate or remove registered
behaviours and delete the profile itself. Profiles persist only these
associations in browser storage; executable behaviour remains in source code.
The selected behaviour is carried into Mission.

`app/src/game/hardware-spec.js` defines the fixed course hardware: one head
camera, one 8×8 head ToF sensor, body/head IMUs, head/beak NFC antennas and one
local microphone input. Participant behaviours may consume those devices but
must not add or reconfigure hardware. Repository agent instructions document
this educational boundary; as with mission rules, a locally controlled browser
checkout cannot provide cryptographic enforcement.

This browser build is an educational practice environment, not a secure exam
client. A participant who controls a local source checkout can inspect or alter
any client-side rule. Official results should therefore be validated by a
server-authoritative mission service rather than trusting the local bundle.

In roller mode the legs-only actions (kicks, sit) are disabled and their
hints fade out; play the ball by driving into it.

### URL parameters

- `?boot=1`: skip the welcome screen and enter the simulator directly. This is
  useful for local development and automated UI checks.

The ball's physics are local to your tab, but its pose is broadcast with
your duck's, so other visitors see a translucent copy of your ball next
to your ghost (and you see theirs). A square arena (3 x 3 m) fences the
play area so neither the ball nor the duck can wander off.

### Gamepad

Plug in a controller and the same mapping as the real robot runtime applies:

- Left stick: forward / back + turn
- Right stick: orbit the camera (detaches the chase cam)
- R3 (right stick click): toggle the chase cam back on
- X or D-pad down: sit / stand (legs) / crouch-glide (rollers)
- A: ground pick (legs only)
- Y: toggle head control
- RB / LB: right / left kick (legs only)
- D-pad up: hold ~1 s to switch legs <-> rollers (the real robot uses a 3 s hold)
- Right trigger: mouth (analog) + quack
- Left trigger: hold for wheee
- A: enter / resume the game while the title or pause overlay is up
- Menu/Start (or Select): exit back to the title overlay while in-game

## How it works

The app is a Vite + React + MUI shell around an imperative game core:
React/MUI renders the UI chrome (title menu, BIOS console, HUD, touch
overlay), react-three-fiber owns the canvas/lights/environment, and the
physics/policy/rig loop lives in framework-agnostic modules under
`app/src/game/`. A zustand store bridges the two (game state out,
UI intents in).

- `app/src/game/game.js` fetches the MJCF (`robot_allcollisions.xml`, or
  `robot_allcollisions_rollers.xml` for the roller variant), strips the
  visual geoms, injects a floor, arena walls, a ball, a collision box for
  the arcade cabinet row and a STAND keyframe, and compiles it with the
  official `@mujoco/mujoco` WASM bindings.
- Both variants share the exact same policy interface: 61D observation
  (gyro, projected gravity, 14 joint pos/vel, last action, 13D command)
  and 14 position-targets, matching [`microduck_rl/scripts/infer_policy.py`](https://github.com/pollen-robotics/microduck_rl/blob/main/scripts/infer_policy.py).
  The roller variant adds 4 passive wheel hinges that appear in `qpos`
  (zeroed in the keyframe) but not in the observation.
- Rendering is a three.js rig built from `kinematics.json` /
  `kinematics_rollers.json` + decimated STL meshes, driven directly from
  MuJoCo `qpos` (including the passive wheel spin).
- Switching variants swaps the compiled model + data + rig + ONNX sessions
  wholesale; both stay resident after the first load so toggling back and
  forth is instant.

## Development

Large binary assets (robot meshes, GLB models, ONNX policies) are stored
with [Git LFS](https://git-lfs.com/). Clone with LFS installed, or pull
the real files after a plain clone - otherwise the app boots against
text pointer files and fails with errors like
`SyntaxError: Unexpected token 'v', "version ht"... is not valid JSON`
(that string is the start of an LFS pointer, not your model):

```bash
git lfs install   # once per machine
git lfs pull      # fetch the actual binaries in an existing clone
```

```bash
cd app
npm install
npm run dev     # dev server on http://localhost:5173
npm test        # autonomous controller and keyboard-layout tests
npm run build   # production bundle in app/dist/
```

Open `http://localhost:5173/?boot=1` to jump directly into the simulator.

The Space builds with the included `Dockerfile` (Vite build, served by
nginx-unprivileged on port 8080). Static assets (meshes, policies, audio,
images) live in `app/public/` and keep their historical URLs.

## License

The app code is released under the [Apache License 2.0](LICENSE).
