# RoboMasters MicroDuck Simulator

## The year is 2050

Autonomous robots keep cities running, repair critical infrastructure and enter
places that are too dangerous for people.

At the centre of this new world is **The Vault**, a secret research facility
built around an experimental source of energy. Seventy-two hours ago, the
facility went dark. Communications stopped. Security systems sealed every
entrance. A.R.I.A., the intelligence responsible for protecting the facility,
fell silent.

No human can safely enter.

Seven unfinished MicroDuck robots have been recovered from emergency storage.
Their hardware works, but they are not ready for the mission. Their perception,
autonomous behaviour and decision-making systems must be designed by a new team
of robotics engineers.

That team is you.

Your task is to prepare MicroDuck in the Testing Bay, decide which capabilities
it needs, and send it into The Vault. Every choice has consequences. More
capabilities can improve what the robot understands, but they also consume
energy. A fast route may save power while accepting more risk. A cautious route
may protect the facility while leaving less battery for what comes next.

Completing the objective is not the only question. The condition in which you
leave the robot, the facility and the people depending on them matters too.

## What students learn

This project introduces robotics through experimentation rather than a single
prescribed solution. Students can use a coding agent to help build systems, but
they remain responsible for deciding what should be built, which trade-offs are
acceptable and when the design should change.

Students practise:

- turning a mission objective into robot behaviours;
- comparing manual control, autonomy and learned movement policies;
- reading camera, distance, motion, NFC and battery data;
- connecting perception, planning and action through a control loop;
- designing state machines that recover from failure;
- using local computer vision, OCR, QR decoding, speech and language models;
- testing assumptions in simulation before deployment;
- reasoning about energy, risk, reliability and limited attempts;
- delegating implementation to an AI agent without surrendering human judgement.

There is no required combination of modules. Students may build a small focused
system or a more capable system with a larger power cost. The mission evaluates
what the robot actually does.

## Meet MicroDuck

MicroDuck is a small biped robot created by
[Pollen Robotics](https://pollen-robotics.com/microduck/). This simulator builds
on the original
[MicroDuck simulator](https://huggingface.co/spaces/pollen-robotics/microduck-simulator)
and preserves its appearance, balancing behaviour and trained movement policies.

The course robot has a fixed hardware configuration:

- one head-mounted camera;
- one head-mounted 8 by 8 Time-of-Flight distance sensor;
- body and head IMUs with accelerometer and gyroscope data;
- NFC readers in the head and beak;
- one microphone input;
- one head speaker;
- battery, voltage and estimated runtime telemetry;
- feet and roller locomotion configurations.

The hardware is intentionally fixed. Robotics engineers rarely get unlimited
equipment, so students must decide how to use the available sensors well.

MicroDuck moves using trained ONNX policies. A policy converts the robot's
current state and a movement command into joint targets many times per second.
The autonomous controller does not replace these policies. It supplies movement
commands through the same path as a person using the keyboard or gamepad, while
the existing policies continue to walk, balance, turn, kick or roll.

Policy and robot sources:

- [pollen-robotics/microduck](https://github.com/pollen-robotics/microduck)
- [pollen-robotics/microduck_rl](https://github.com/pollen-robotics/microduck_rl)

## Why use a robot simulator?

A simulator lets students make mistakes quickly and safely. The browser runs a
MuJoCo physics model, renders the arena with three.js and executes ONNX movement
policies locally. Sensor adapters turn simulated geometry and motion into the
same kinds of readings that robot software expects.

Simulation is useful for:

- testing navigation logic without damaging hardware;
- repeating the same experiment under controlled conditions;
- observing information that is difficult to inspect on a physical robot;
- developing software before a real robot is available;
- separating perception and control code from a particular sensor source.

A simulation is still a model, not reality. Real cameras have noise, floors
have different friction, batteries age and motors behave differently. The
project keeps perception behind replaceable adapters so simulated inputs can
later be exchanged for real sensor data.

## Testing Bay and Mission

The **Testing Bay** is an open workshop. Students can drive MicroDuck manually,
inspect sensors, trigger movement policies, place and move cubes, attach NFC
tags, change the environment and test autonomous profiles. Coding agents may
add custom Testing Bay objects and autonomous behaviours.

The official **Roam** and **Chase Ball** behaviours provide examples. Students
create a profile, add their own registered behaviours, and decide which profile
will control the mission.

**Mission** sends the selected autonomous system into The Vault. Each stage
begins with a short story briefing and starts only when **Enter Stage** is
selected. Mission activity consumes battery, failures affect containment and
consequences carry between stages. The simulator does not reveal its internal
scoring calculations in the interface. Students must observe, test and revise.

Mission networking is disabled. Models required by a behaviour must be bundled
and run locally. Stage Three also uses a bundled Transformers.js Whisper model
to evaluate the exact audio emitted by MicroDuck's speaker. It does not listen
through the computer microphone or send audio to an online service.

Different combinations of battery and containment state produce different
endings. Passing every stage therefore does not guarantee the same outcome.

## Install and run locally

### Requirements

- Git
- [Git LFS](https://git-lfs.com/)
- Node.js `20.19+` or `22.12+`
- A current desktop browser with WebAssembly support

The first clone requires an internet connection because the robot models, ONNX
policies and local speech-recognition assets are large. Mission execution itself
does not require internet access.

### 1. Clone the project

```bash
git clone https://github.com/dnorton94/robomasters-microduck.git
cd robomasters-microduck
```

### 2. Download the large assets

```bash
git lfs install
git lfs pull
```

Do not skip this step. Without Git LFS, some model files will contain pointer
text instead of the actual binary data and the simulator will not boot.

### 3. Install the application

```bash
cd app
npm install
```

### 4. Start the simulator

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). To skip the welcome screen
during development, open
[http://localhost:5173/?boot=1](http://localhost:5173/?boot=1).

### 5. Verify the installation

```bash
npm test
npm run build
```

The production build is written to `app/dist/`.

## First session

1. Enter the simulator and remain in **Testing Bay**.
2. Practise manual movement and switching between feet and rollers.
3. Open **Policies** and observe how trained policies perform individual moves.
4. Open **Sensors** and compare the third-person view with MicroDuck's POV.
5. Place cubes and inspect how camera and distance readings change.
6. Create an autonomous profile and test its behaviour.
7. Enter **Mission** when the team is ready to accept the consequences of its design.

## Basic controls

| Input | Action |
| --- | --- |
| Arrow keys or WASD | Move and turn |
| M | Switch feet and rollers |
| Q and E | Kick left and right |
| F | Alternate kicks |
| R | Sit or stand; crouch glide on rollers |
| G | Ground pick |
| C | Toggle the chase camera |
| Space | Reset the robot |
| Mouse drag | Orbit the camera |
| Mouse wheel | Zoom |

Keyboard input immediately overrides autonomous control in the Testing Bay.
The visible **Stop** button returns the robot to manual control.

## Building autonomous behaviours

Participant behaviours are registered in:

`app/src/game/autonomy/custom-behaviors.js`

A behaviour receives simulated world observations, fixed sensor interfaces and
the same movement command array used by manual input. Camera and navigation code
are kept separate, which makes it possible to replace simulator geometry with a
real perception system later.

Every custom behaviour declares the sensors and compute resources it uses.
Costly work such as detection, OCR, local language inference or speech
processing is reported when it occurs. These declarations become part of the
mission battery model. Testing Bay development does not consume mission battery.

Repository `AGENTS.md` files explain the educational boundary to coding agents.
Agents may help implement student behaviours and Testing Bay environments, but
must preserve the fixed hardware and course-owned mission evaluation. All source
remains readable and manually editable by students.

## Project structure

```text
app/src/game/              Physics, sensors, policies and simulation loop
app/src/game/autonomy/     Autonomous controllers and participant extension point
app/src/game/missions/     Course-owned mission evaluation
app/src/ui/                React interface and mission presentation
app/public/                Robot assets, policies and local AI models
app/test/                  Automated behaviour and mission tests
```

The application uses React, Vite, MUI, zustand, three.js, MuJoCo WebAssembly,
ONNX Runtime Web and Transformers.js. Everything needed by the mission is served
from the local project.

## Useful commands

Run these commands from `app/`:

```bash
npm run dev       # local development server
npm test          # automated tests
npm run build     # production build
npm run preview   # preview the production build
```

## Educational integrity

This is a learning environment, not a secure examination client. Mission rules
remain readable because understanding and manually changing source code can
also be educational. Coding agents are instructed not to reveal or modify
protected lesson mechanics on a learner's behalf. A person who controls a local
checkout can still change any client-side code.

## License

Application code is released under the [Apache License 2.0](LICENSE). Bundled
third-party models and assets retain their original licences and provenance.
