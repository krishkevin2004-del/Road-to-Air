# v0.6 — situations, visible calculations and decisions

## Product changes and five annotations

The hero lead reads “A car made to fly. Meet the world it has to share.” The brand identifies a hypothetical Roadster. The missed-exit-specific introductory story and duplicate canvas are removed; a single workspace is headed “Real situations. Measured responses.” Emergency copy uses a sudden brake check and a shrinking gap, while preserving the comparison with braking and steering. The main study is generalized rather than framed around an airport exit.

Controls separate the road situation, reason for the request and response being compared. Emergency is included as a first-class intent. Intent selection moves to a related scenario family, and route situations identify convenience. The prior-use/emergency response is omitted for route-only scenarios. Advanced duplicate forecast labels are kept in exported/headless comparisons but do not crowd the primary control. The capability section now reflects the selected replay's actual final ledger rather than an independent canonical example.

A report immediately beneath each scenario exposes event timing, response latency, actual versus proposed departure/landing, candidate duration, ground stopping distance and margin, screened steering, the governing equations, current mass/force/load/jerk assumptions, peak forces, impulse integral and reserve inequality, landing coordinates, uncertainty, gate reasons and a conditional decision. Candidate profiles and request times are presets, not optimal solutions. Ground-only reports distinguish comparator calculations from the selected car's actual motion.

## Sudden braking

At t=5 s a moving leader begins finite 8 m/s² braking from 22 m/s. Initial bumper gaps are 32 m and 8 m. Ego starts at 22 m/s and applies its configured ground braking only after the response latency; observation/departure decisions align to the next physics tick. Lead motion remains continuous and identical across response policies. Fourteen seeded adjacent vehicles keep independent constant-speed motion. They are never removed for a candidate. These are synthetic inputs, not reconstructed incidents.

The four-second / 3 m apex aerial request uses the existing support-force and resource model. The flight gate sweeps the analytically moving leader throughout climb, flight and a 0.6 s recovery window, then checks braking space after touchdown. Steering screens two three-second 3.7 m lateral profiles with swept occupancy and acceleration limits; steering is not executed as a full counterfactual branch.

With baseline seed 42, the wider-gap ground case avoids ego contact; the tighter-gap ground case records contact. The nominal aerial climb is denied in both because the leader occupies the buffered corridor. A ground failure does not waive that gate. Prior optional use at t=1 s is separately compared; an ongoing flight cannot stack another departure. All physical consumption remains in the exported ledger.

## North → east elevated highway

The road graph sketch has a northbound ground carriageway and an eastbound deck at 6 m, with independent moving traffic. At t=5 s, a request targets 60 m north and 60 m east over 4.6 s. Each axis uses a quintic Hermite boundary-value curve with endpoint positions and velocities specified and endpoint acceleration zero. North velocity is 22→0 m/s, east velocity 0→22 m/s; vertical position is a smooth 0→6 m displacement plus a 2 m bump. Forces are integrated from m(aN,aE,g+az).

The existing 18 kN lateral ceiling is conservatively applied to total horizontal force; this is a screening assumption, not a new longitudinal nozzle map. The request uses approximately 110.594 kN·s nominal impulse. It violates the conservative directional allocation and intersects the deck/clearance buffer. Independently, the model has no validated controller for a 90° yaw maneuver. Every non-ground response therefore denies departure. Increasing the impulse sensitivity setting cannot bypass the yaw or geometry gates.

The dashed path and moving marker represent the rejected proposal only. Solid vehicles represent actual traffic and the northbound Roadster. The actual ego remains at z=0, consumes no aerial resources and never reaches the eastbound destination. A conventional interchange remains the route alternative; its detour time and distance are not invented.

## Evidence and limits

All new numerical inputs are registered as synthetic assumptions in `data/parameters.json` and `data/evidence.json`. B1, vehicle interpretation and original force/resource limits are unchanged. The original scenarios remain for continuity and adversarial checks, explicitly labeled where they are legacy recovery tests.

55 checks pass. The expanded ten-scenario, five-seed, five-response batch contains 250 runs and retains 62 ego failures. No field calibration or safety probability is inferred. Attitude, jets, pressure thermodynamics, weather, real sensing, background contact dynamics and a complete interchange network remain unresolved. The heading-changing proposal is not a completed flight capability.
