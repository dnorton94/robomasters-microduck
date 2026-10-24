// Short, UI-triggered velocity command used to visibly demonstrate the
// continuous walk/drive policy. Physical inputs remain higher priority.
export class PolicyPreviewSource {
  id = "policy-preview";
  connected = true;
  command = new Float32Array(3);
  axes = { jaw: 0, orbitX: 0, orbitY: 0, ride: 0 };
  pressed = {};
  onAction = () => {};
  #remaining = 0;
  #getVelocityLimits;
  #manualActive;

  constructor({ getVelocityLimits, manualActive }) {
    this.#getVelocityLimits = getVelocityLimits;
    this.#manualActive = manualActive;
  }
  init() {}
  dispose() {}
  isActive() { return this.#remaining > 0; }
  start(seconds = 5) { this.#remaining = seconds; }
  stop() { this.#remaining = 0; this.command.fill(0); }
  poll(dt) {
    if (this.#manualActive()) this.stop();
    if (this.#remaining <= 0) { this.command.fill(0); return; }
    const [forward] = this.#getVelocityLimits();
    this.command[0] = forward;
    this.command[1] = 0;
    this.command[2] = 0;
    this.#remaining = Math.max(0, this.#remaining - dt);
  }
}
