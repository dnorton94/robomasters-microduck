import { relativeTarget, wrapAngle } from "./perception.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class AutonomousSource {
  id = "autonomous";
  connected = true;
  command = new Float32Array(3);
  axes = { jaw: 0, orbitX: 0, orbitY: 0, ride: 0 };
  pressed = {};
  onAction = () => {};

  #perception;
  #getVelocityLimits;
  #manualActive;
  #enabled = false;
  #mode = "roam";
  #status = "Manual control";
  #onStatus;
  #goal = null;
  #lastPos = null;
  #stillFor = 0;
  #recoverFor = 0;
  #recoverSign = 1;
  #kickCooldown = 0;
  #wasTrying = false;

  constructor({ perception, getVelocityLimits, manualActive, onStatus = () => {} }) {
    this.#perception = perception;
    this.#getVelocityLimits = getVelocityLimits;
    this.#manualActive = manualActive;
    this.#onStatus = onStatus;
  }

  init() {}
  dispose() {}
  isActive() { return this.#enabled && !this.#manualActive(); }
  get enabled() { return this.#enabled; }
  get mode() { return this.#mode; }

  configure({ enabled = this.#enabled, mode = this.#mode } = {}) {
    this.#enabled = !!enabled;
    this.#mode = mode === "chase" ? "chase" : "roam";
    this.#goal = null;
    this.#stillFor = 0;
    this.#recoverFor = 0;
    this.command.fill(0);
    this.#setStatus(this.#enabled ? (this.#mode === "chase" ? "Searching for ball" : "Choosing route") : "Manual control");
  }

  stop() { this.configure({ enabled: false }); }

  poll(dt) {
    this.command.fill(0);
    if (!this.#enabled) { this.#wasTrying = false; return; }
    if (this.#manualActive()) {
      this.#setStatus("Manual override");
      this.#wasTrying = false;
      return;
    }
    const world = this.#perception.sample();
    if (!world?.robot) { this.#setStatus("Waiting for pose"); return; }
    this.#kickCooldown = Math.max(0, this.#kickCooldown - dt);
    this.#updateStuck(world.robot, dt);
    if (this.#recoverFor > 0) this.#recover(world, dt);
    else if (this.#avoidObstacle(world)) {}
    else if (this.#mode === "chase") this.#chase(world);
    else this.#roam(world);
    this.#wasTrying = Math.abs(this.command[0]) > 0.04 || Math.abs(this.command[2]) > 0.15;
  }

  #setStatus(value) {
    if (value === this.#status) return;
    this.#status = value;
    this.#onStatus(value);
  }

  #updateStuck(robot, dt) {
    if (this.#lastPos) {
      const moved = Math.hypot(robot.x - this.#lastPos.x, robot.y - this.#lastPos.y);
      this.#stillFor = this.#wasTrying && moved < 0.002 ? this.#stillFor + dt : Math.max(0, this.#stillFor - dt * 2);
      if (this.#stillFor > 1.25) {
        this.#stillFor = 0;
        this.#recoverFor = 1.4;
        this.#recoverSign *= -1;
      }
    }
    this.#lastPos = { x: robot.x, y: robot.y };
  }

  #recover(world, dt) {
    const [, back, ang] = this.#getVelocityLimits();
    this.command[0] = Math.max(back, -0.12);
    this.command[2] = ang * 0.8 * this.#recoverSign;
    this.#recoverFor -= dt;
    this.#goal = null;
    this.#setStatus("Recovering from obstacle");
  }

  #avoidObstacle({ robot, arena }) {
    const candidates = arena?.obstacles ?? [];
    let nearest = null;
    for (const obstacle of candidates) {
      const rel = relativeTarget(robot, obstacle);
      if (rel.distance < 0.42 && Math.abs(rel.bearing) < 1.05 &&
          (!nearest || rel.distance < nearest.distance)) nearest = rel;
    }
    if (!nearest) return false;
    const [fwd, , ang] = this.#getVelocityLimits();
    this.command[0] = fwd * 0.18;
    this.command[2] = (nearest.bearing >= 0 ? -1 : 1) * ang;
    this.#setStatus("Avoiding cube");
    return true;
  }

  #steer(robot, target, label, speedScale = 1) {
    const [fwd, , ang] = this.#getVelocityLimits();
    const { distance, bearing } = relativeTarget(robot, target);
    // The walking policy turns more reliably with a small forward arc than
    // with a pure yaw command, so retain a cautious crawl while misaligned.
    const alignment = clamp(1 - Math.abs(bearing) / 1.1, 0.22, 1);
    this.command[0] = fwd * speedScale * alignment;
    this.command[2] = clamp(bearing * 1.8, -ang, ang);
    this.#setStatus(label);
    return { distance, bearing };
  }

  #roam({ robot, arena }) {
    const margin = 0.32;
    const nearWall = Math.max(Math.abs(robot.x), Math.abs(robot.y)) > arena.half - margin;
    if (nearWall) {
      const inward = Math.atan2(-robot.y, -robot.x);
      const turn = wrapAngle(inward - robot.yaw);
      const [fwd, , ang] = this.#getVelocityLimits();
      this.command[0] = fwd * 0.3;
      this.command[2] = clamp(turn * 1.8, -ang, ang);
      this.#goal = null;
      this.#setStatus("Avoiding arena wall");
      return;
    }
    if (!this.#goal || Math.hypot(this.#goal.x - robot.x, this.#goal.y - robot.y) < 0.18) {
      const span = arena.half - margin;
      this.#goal = { x: (Math.random() * 2 - 1) * span, y: (Math.random() * 2 - 1) * span };
    }
    this.#steer(robot, this.#goal, "Roaming", 0.72);
  }

  #chase({ robot, ball }) {
    if (!ball?.active) { this.#setStatus("Searching for ball"); return; }
    const rel = relativeTarget(robot, ball);
    if (rel.distance < 0.23 && Math.abs(rel.bearing) < 0.28 && this.#kickCooldown === 0) {
      this.command.fill(0);
      this.#kickCooldown = 1.4;
      this.onAction(rel.bearing >= 0 ? "kickL" : "kickR", { autonomous: true });
      this.#setStatus("Kicking ball");
      return;
    }
    const speed = rel.distance < 0.42 ? 0.38 : 0.82;
    this.#steer(robot, ball, Math.abs(rel.bearing) > 0.35 ? "Aligning with ball" : "Approaching ball", speed);
  }
}

