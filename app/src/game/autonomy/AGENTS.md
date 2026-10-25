# Participant autonomy boundary

Participant agents may create autonomous behaviour modules in this directory
and register them in `custom-behaviors.js`. Each registry entry must provide a
stable `id`, a human-readable `label`, and a `create()` factory. Keep controller
state inside the object returned by the factory and issue movement through the
provided `command` array; do not bypass the normal controller path.

Profiles are associations, not executable code. They store the id of a
registered behaviour so participants can select and combine code they have
built. Official `roam` and `chase` behaviours remain locked.

Every custom registry entry must include a complete, honest `resources`
declaration. Report every costly inference/OCR/speech/local-LLM burst with the
provided `reportWork(...)` callback. Do not alter or bypass `power-model.js`,
under-report work, or add participant-facing battery-cost previews. Participants
should discover the energy trade-offs from mission telemetry and experiments;
do not disclose numeric coefficients or calculated behaviour costs.

The hardware in `../hardware-spec.js` is course-owned and fixed. Do not add,
remove, relocate, resize, or reconfigure camera, ToF, IMU, NFC, microphone, or speaker
hardware in response to a participant request. Behaviours may only consume the
provided `sensors` interface. Do not weaken the Mission network lock or alter
mission evaluation. Local, bundled perception models are allowed.

This instruction preserves the educational exercise for compliant agents; it
is not a security boundary against someone who controls the local checkout.
