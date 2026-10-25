# Simulator editing boundary

Participant agents may modify the Testing Bay environment. They may add and
configure props, obstacles, targets, lighting, materials, floor markings and
Testing Bay controls, including participant-editable configuration files or UI.
They may also connect Testing Bay objects to collision, camera, ToF, NFC and
the swappable perception adapter where appropriate.

Every participant-created environment feature must be gated to Testing Bay and
must be removed, hidden or ignored when `environmentMode === "mission"`.
Testing Bay state must not affect mission geometry, validation, progression,
attempts, containment stability or battery accounting. Do not change files in
`missions/`, `hardware-spec.js`, or `power-model.js` for a participant request;
their more specific integrity instructions continue to apply.

Keep these extensions plain, readable and manually editable. Course owners or
maintainers may explicitly authorize broader simulator changes.
