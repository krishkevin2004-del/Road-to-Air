# v0.2 — design refresh and the missed exit

October 21, 2026. The supplied black-and-white interchange and aerial street images inform the road presentation. The supplied website references inform the black background, oversized typography, restrained gold accents, automotive illustration and editorial spacing. No reference site copy, brand, commercial claims or photo-based dimensions are adopted. The silver car is an original code-native SVG concept illustration, not a Tesla rendering or measured vehicle geometry.

## User-facing changes

- New automotive hero, navigation and fixed-baseline specification strip.
- Larger scene with a terrain palette, asphalt, lane boundaries, directional arrows, median rails, elevated crossing, vegetation, detailed vehicle bodies, shadows and route overlays.
- Network, Follow and Side observation cameras; all preserve replay time and physical state.
- Wide resource ledger and inspectable event strip rather than a compressed three-column dashboard.
- New default **Missed exit / airport connector** and adverse **Missed exit / blocked connector** presets. Existing straight-road, cut-in, optional-use and emergency comparisons remain selectable.
- Route labels distinguish reaching the connector destination from merely driving past its x coordinate on the mainline.

## The scenario

An airport connection makes Exit 17 important to the driver. The ego passes the split at x=80 m and requests a convenience transfer at t=5 s. Its source lane center is y=7.4 m; the parallel connector is y=19 m. The proposed 11.6 m lateral transfer lasts 4.6 s with a 3 m apex. It is not a reconstruction of the reference interchange. The photograph's geometry and scale were not measured.

The candidate rises while lateral motion is held for 0.5 s, moves laterally over 3.6 s, then finishes lateral motion 0.5 s before touchdown. The unstaged simultaneous lift/lateral profile clips a modeled median rail and is rejected. The staged profile is accepted only after recalculating forces, impulse, jerk and swept geometry. This changes the requested trajectory, not B1 or the traffic. Rotation remains outside the model; both roads are parallel at touchdown.

Median rails are 1 m high, have physical occupied volumes, and remain in all gate checks. The overhead crossing has a deck at z=5.4–6 m and explicit piers. Its independent constant-speed traffic is represented in snapshots and ego collision checks. Surrounding ground drivers retain delayed car-following behavior; no one is moved to create a landing gap. Ground and bridge traffic draws are separate deterministic streams.

For seed 42 and the unchanged default vehicle interpretation, the admitted transfer uses approximately **90.741 kN·s** and **4.6 cumulative airborne seconds**, leaving roughly **34.259 kN·s** and **5.4 seconds**. It lands at t=9.6 s, around x=191.2 m, maintaining approximately 20.0 m/s longitudinal speed. The connector's x=500 m destination is reached at approximately 24.26 s. These are synthetic translational results, not vehicle performance claims.

Ground-only and denied-transfer cases continue on the mainline. A **1.8 km additional route** via the next exit is explicitly assumed. That detour is outside the local geometry and is not assigned a fabricated travel time. Passing x=500 m on the mainline cannot count as reaching the connector destination. The blocked variant adds a stationary vehicle on the connector; the independent traffic response can itself occupy the landing corridor and cause denial.

Reserve-first declines the optional transfer to preserve its future allocation. Physical or completion-reserve denial applies to every policy. The straight-road scenario family retains the optional-use-then-emergency experiment. The missed-exit family does not introduce a later hazard; its emergency checkbox is visibly disabled. Current onboard and forecast-assisted policies share a predictor, so no causal coordination advantage is claimed.

## Model scope and known limits

B1 remains compressed nitrogen, a ten-second cumulative airborne ceiling and a six-hour full refill turnaround. The 600 L reported flight configuration and attributed hardware register are retained. The same bounded force allocation, impulse ledger and completion reserve apply.

This is a synthetic local connector with limited vertical geometry. It does not implement a complete interchange road graph, heading-changing transfer, validated attitude/nozzle control, jet footprint, real sensor uncertainty, weather, road law or a calibrated traffic model. Vegetation and scenery outside the modeled road corridor are visual context. The elevated road flow is a deterministic constant-speed treatment, not calibrated bridge traffic. No runtime camera behavior changes any physical outcome.

The new cases add twelve checks covering a completed transfer, the rejected unstaged path, staging endpoints, landing velocity continuity, blocked occupancy, consent/reserve denial, immutable physical limits, correct destination classification, matched bridge demand, deck clearance, resource conservation and 20/10 ms convergence. Combined with the original nineteen, there are **31 automated checks**. The expanded batch has **175 runs**: seven presets, five seeds and five policies. Failure runs remain in the output.
