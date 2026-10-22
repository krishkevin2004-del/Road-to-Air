# v0.3 — a continuous road-to-air story

October 21, 2026. Local source delivery; no remote hosting or third-party runtime dependencies.

## Experience

A spacious automotive hero leads into an editorial introduction, a pinned missed-exit replay, a light resource section, use-intention tabs, the experiment, matched comparisons, the calculator and the evidence register. Four scroll chapters follow the canonical seed-42 transfer from 4.0 to 10.2 simulated seconds. Scrolling backward reverses the recorded replay; it never steers or recalculates the vehicle. The canonical narrative remains independent of experimental settings below.

Native scrolling is retained. Motion uses scheduled animation frames and passive scroll listeners. Intersection observers reveal content once. Short screens and reduced-motion settings switch the pinned sequence to chapter selection. The footer provides a per-page motion toggle. Keyboard users can navigate the intention tabs with arrows, Home and End. Scenario settings collapse on initial mobile load. Loading, pending settings, errors and disabled exports make the applied experiment explicit.

## Rendering and calculation

Matched runs are computed in a module Web Worker using the same simulation core as Node. A newly requested experiment cancels the old worker; generation IDs reject stale results. The compatibility path computes on the main thread only if Worker construction is unavailable. HTTP serving remains required.

Static terrain, roads, markings and bridge layers are cached per canvas. Follow-camera caches use padded, quantized centers; replaced buffers are released. Device pixel ratio is bounded. The altitude trace is cached separately. A binary search locates irregularly spaced snapshots, and only display poses interpolate. Discrete modes, events, resource ledgers and failed ego state remain authoritative. The render loop schedules only when needed, suspends with a hidden page, and pauses playback outside the experiment. HUD updates are throttled while vehicle poses remain smooth.

The hidden `performance-check` DOM output reports the calculation engine, worker duration and cached scene draw timing for local verification. This is a diagnostic, not a frame-rate or safety guarantee.

## Correctness fixes

- Completed touchdown, proposed windows, denials and failed runs have distinct landing labels, including lane zero.
- Event seeking uses actual timestamps; 0.1-second stepping avoids floating-point drift.
- Camera changes preserve time and ledgers. Smooth display sampling never edits exported snapshots.
- The calculator can load the actual candidate, including lateral staging, instead of silently screening a different unstaged profile.
- CSV headers include fields present in any matched summary and escape values correctly.
- Emergency preference survives moving between exit and straight-road scenario families.
- Old experiment settings stay explicitly marked until recomputation completes.
- Hidden chapter copy no longer ghosts through the next chapter. The story track reserves its layout before the worker finishes, and warming a cache schedules the correct visible pose afterward.

## Scope

B1, physical limits, traffic reactions and all authoritative simulation equations remain unchanged from v0.2. The missed-exit profile still consumes about 90.741 kN·s and 4.6 seconds, leaving about 34.259 kN·s and 5.4 seconds. Blocked paths are denied and unrecoverable cut-ins retain their failure. No traffic is moved to guarantee success.

40 headless checks pass, including nine new replay/computation checks. The unchanged v0.2 batch retains 175 runs, including 37 failed ego runs. See the verification record for browser observations and remaining limits. UI performance is device/browser dependent; initial cache construction can still take longer than a cached frame. This remains a synthetic translational study without validated attitude, pressure thermodynamics, plume footprint, complete interchange graph or real-world safety validation.
