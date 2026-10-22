# Model contract · B1 interpretation 1

The original straight-road model below is retained. Version 0.2 adds the synthetic parallel connector, barrier/deck checks and staged lateral profile described in [CHANGES-v0.2.md](CHANGES-v0.2.md). Its parameters are registered in `data/parameters.json` under `interchangeScenario`.

## Baseline and evidence

B1 fixes compressed nitrogen, reported 600 L flight configuration, maximum **cumulative** ten seconds airborne per full resource cycle and six hours of complete refill service. These are study rules. They are never changed to achieve a successful run. Ground thruster use can consume impulse without reducing airborne time. Reset requires an explicit refill start followed by 21,600 simulated seconds; driving alone never refills anything. Refill lifecycle is covered by headless checks, not a six-hour frontend replay.

Only the written brief was available, not the original transcript or source footage. The register preserves the brief's interview extraction as attributed claims; original wording and demo reconstruction are not independently verified. October 21, 2026 is the evidence cutoff and capture date. Unknown publication dates remain null. TechCity's gas estimate has separate provenance from the interview. The reveal's air terminology and the interview's nitrogen terminology remain distinct. Ground acceleration timing conventions never become flight acceleration inputs. The fetched Tesla page supplies no complete flight map.

## Vehicle and trajectory

Coordinates: x forward along road, y lateral (lane centers 0, 3.7, 7.4 m), z vehicle bottom above road. SI units. Ego body 4.8 × 2 × 1.25 m, assumed. Constant conservative loaded mass 1,900 kg avoids increasing capability as estimated gas leaves; it is not a reconstructed flight trim mass.

For phase u=t/T, a nominal candidate has:

- x = x₀ + v₀t; no horizontal thrust or tire propulsion while airborne.
- z = 16 h u²(1−u)², with zero departure/touchdown vertical velocity, apex h.
- y = y₀ + d(10u³−15u⁴+6u⁵), with zero endpoint lateral velocity and acceleration.
- Required force F = (0, m ÿ, m(z̈+g)). Total force is the vector magnitude, not an independent per-axis allowance.
- Midpoint force quadrature computes impulse ∫|F|dt, not mgT for every maneuver. Gas equivalent is impulse / assumed effective exhaust velocity 500 m/s. This is a bounded resource model, not a tank blowdown model. No gas mass is inferred from volume alone.

The vehicle starts at rest vertically on the road, then uses positive force to accelerate upward. It does not inherit a free ballistic launch velocity or a ramp. Simulation advances positions and velocities using midpoint acceleration and a second-order position update. It does not set positions to the plotted curve each frame. Nominal touchdown checks require |z| ≤ 0.04 m, |vz| ≤ 0.08 m/s and |vy| ≤ 0.08 m/s. Small contact residuals are settled to the road only within these limits; longitudinal speed is preserved. Ground forces resume after touchdown, with 0.6 s recovery mode before ordinary takeover.

A 1,900 kg vehicle supporting itself for four seconds requires approximately 74.556 kN·s before corrections; a 4.6 s same-lane hop requires 85.739 kN·s. The latter leaves only 39.261 kN·s from the assumed 125 kN·s full ledger. Another four-second hop plus 12 kN·s mandatory margin cannot fit, even though 5.4 seconds of airborne allowance remain.

## Gates and uncertainty

Nominal bounds: shared 80 kN ceiling, 55 kN vertical and 18 kN lateral, 3 g specific force, 35 m/s³ within-flight jerk, and 12 kN·s completion reserve. Force direction cannot provide negative vertical thrust. The assumed total-force bound declines linearly with the fraction of impulse remaining, from 100% to 60% of the maximum. The planner uses the anticipated ledger after consumption and reserve; this is a bounded engineering sensitivity law, not a measured relation between pressure and thrust.

Admission evaluates an entire candidate at 10 ms samples, instantaneous force sharing, impulse, remaining cumulative time, nominal touchdown, predicted occupied volumes, a 0.6 s recovery corridor and forward post-landing braking clearance. Braking clearance includes a 2 m gap, latency distance and relative stopping-distance allowance. No predicted window commands another driver to yield. Forecast uncertainty is displayed as ±v·latency, a heuristic interval, not a calibrated probability or guaranteed containment. It is not a robust uncertainty-tube proof.

A single correction candidate moves into lane center 0 using the remaining flight time. It starts from the existing position and lateral velocity (nominally zero at first correction), integrates the new force, and keeps the original vertical profile and touchdown deadline. It must retain the completion margin. The current implementation tests one alternative; “unrecoverable” means **no feasible tested recovery**, not proof that every conceivable controller fails. A rejected correction does not teleport the target: the original trajectory continues and any contact is logged. No emergency hovering or completion-reserve override exists.

Plume size, nozzle pointing, attitude, contact-transition jerk and load transfer are unresolved. Instantaneous changes between ground contact and the selected vertical force profile are simplified; within-flight jerk gates do not establish actuator or occupant feasibility at those boundaries. Therefore even passing runs remain **unresolved for a complete vehicle or real-road operating concept**. No rotation maneuver is represented or claimed feasible. Aerodynamic lift, drag, road suction and wind are zero in this first envelope, not unreported sources of assistance.

## Ground traffic and coupling

SUMO was evaluated using its car-following documentation, including action-step versus headway behavior. No SUMO binary is installed. For a single bounded segment, an inspectable custom IDM-style model keeps the first version locally runnable and exposes all force/occupancy transitions without introducing a TraCI dependency. It is not equivalent to validated SUMO operation. No SUMO version or extension interface has been selected for production integration. SUMO migration is required before complex networks; verify the installed version and TraCI interface then.

Each driver holds acceleration between seeded 0.4–0.9 s decision intervals. Desired headways and speeds vary by seed, separately from the 20 ms physics clock. IDM-style acceleration uses free-speed exponent 4, desired gap 2 + max(0, vH + vΔv/(2√ab)), acceleration 1.5 m/s², comfortable braking 2.5 m/s² and maximum braking 7 m/s² (ego cap 7.5). These are synthetic behavior assumptions. No Michigan statute, speed-limit rule or validated driver psychology has been encoded.

A cut-in independently follows a 0.9 s smooth lane transition, whether or not it creates a conflict. Cars react through their own ground model; they do not obey aerial reservations. Early / late cut-in onset is 3.2 / 6.5 s; the event becomes available to the aerial correction after the configured 0.35 s detection/decision delay. That delay lumps several processes and is quantized to physics steps. Reactions to the novel airborne vehicle, distracted driving and calibrated sensor uncertainty are not modeled.

Airborne ego is excluded from the ground leader list, but stays in all 3D overlap checks. Touchdown reinserts the same body and speed. Synchronous acceleration decisions avoid iteration-order effects. Neighbors are never moved, deleted, or stopped by a landing reservation. Swept axis-aligned occupied boxes test relative movement through each dynamics interval; a zero-buffer overlap is counted once per background pair. Buffered trajectory checks use 0.7 m. Curvature within a 20 ms step is approximated linearly; timestep convergence tests bound the observed numerical effect, not every possible high-speed case. Ego contact terminates its physical run and freezes its body for replay. Background overlaps are logged without a multibody crash response; network metrics after any overlap are not reliable crash outcomes.

The stopped-car reveal is a scripted occupancy disturbance at x=335 m and t=14 s. It has no modeled occlusion geometry. It does not claim a car physically materializes; it represents a previously unmodeled / unobserved obstruction. Ground braking runs against the same reveal. Ground steering is a three-second, one-lane quintic screening path checked against projected traffic and an assumed lateral acceleration bound. It is **not** an executed tire/friction/control simulation and cannot establish superiority over flight.

## Policies, events and evaluation

All policies receive identical initial traffic, destination x=500 m, and external event times/positions for a given seed. A dedicated seeded traffic RNG builds the population once per run; aerial decisions consume no random draws. Actual background trajectories may differ through interaction with the ground ego. Horizon is 28 s. Unreached destinations remain null, never converted to a 28 s travel-time claim. Background distance is the sum of traveled distances, not network travel time or throughput.

- Ground only: ordinary driving and braking, no aerial requests.
- Coordinated aerial: forecast-assisted request following the later hazard, no earlier optional request. This is a minimal centralized predictor, not V2X infrastructure control.
- Optional → emergency: optional request at 3 s with future-allocation consent, followed by the same hazard and physical gates.
- Reserve first: deny optional use if the remaining impulse after the maneuver and completion margin falls below a 72 kN·s product reserve; later request remains gated.
- Onboard only: optional request without a protected future allocation; same predictor and traffic gates in v0.1. This label records a policy scaffold. A causal coordinated-versus-onboard advantage is not implemented or inferred.

The reserve comparisons deliberately change requested use timing; they are a resource-use product study, not an isolated communication experiment. Convenience and recreation differ only in user intent and interface framing. No recreation utility or convenience time saving is invented. No emergency prevalence or utility weights are assumed.

Thresholds and five scenario presets are versioned here and in `data/parameters.json`. The batch holds five declared seeds across all five policy labels and scenario presets, records failures and denials, and produces 36 mass/speed/duration points. Seeds explore synthetic driver variation, not statistical population confidence. Full emergency frequency, queues, fairness, network delay, noise, infrastructure footprint and real-road safety remain unmeasured.

## Version 0.6 additional situations

The sudden-braking lead position after onset t0=5 is x=x0+v0 min(t,t0)+v0 s−a s²/2, with s=clamp(t−t0,0,v0/a). Both cars begin at 22 m/s; lead deceleration is 8 m/s², and ego uses configured braking after configured latency, beginning exactly one latency after onset (v0.9). Initial bumper gaps 32 m and 8 m are synthetic. Analytical final stopping margin = gap + vLead²/(2 bLead) − [vEgo latency + vEgo²/(2 bEgo)]. Swept occupied volumes remain the runtime outcome test. Adjacent cars use independent seeded constant-speed demand. The aerial traffic gate conditions its prediction on the scripted lead braking trajectory; this is not real sensor uncertainty.

For the north→east request, set u=t/T and p=a1 u+a3 u³+a4 u⁴+a5 u⁵, with a1=v0 T, A=d−a1, B=v1 T−a1, a3=10A−4B, a4=−15A+7B, a5=6A−3B. These constraints match displacement d, initial/final velocity v0/v1 and zero endpoint acceleration. Use separate north, east and vertical axes; vertical includes the existing quartic bump. Total force = m sqrt(aNorth²+aEast²+(g+aZ)²). Integrate at 0.01 s for the 4.6 s preset. Total horizontal force is conservatively screened against the existing lateral ceiling. This cannot validate a longitudinal nozzle allocation or yaw controller. Physical deck occupancy and independent elevated traffic are swept separately. The missing validated 90° heading controller is an unconditional admission barrier. The candidate is visualized only as a rejected proposal; actual ego stays northbound on the ground.

Reports expose presets and gate results, not an optimizer's minimum required airborne time. Departure times are scheduled requests or quantized first-response ticks. Planned touchdown and actual completed touchdown are distinct. The report's conditional decision is a product/engineering interpretation of modeled constraints, never a public-road safety clearance.
