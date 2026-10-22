# v0.9 update: what changed in the conclusions

Two statements below were true of v0.6 and are superseded. (1) The nominal aerial climb no longer fails the 32 m case: the bounded search finds a 4.4 s hop that clears the lead (v0.8). (2) The critical 8 m gap no longer ends in an unavoidable contact: a faster 3.2 s hop avoids the contact braking cannot (v0.9, `docs/CHANGES-v0.9.md`). The conclusion becomes a bounded one: the flight helps in a window of roughly 6 to 9.5 m following gap at default assumptions, does nothing below that, and is unnecessary above it. Ground-first remains the default because the window is narrow and the model is point-mass: attitude, plume and sensing are unresolved. The recreation-versus-emergency comparison still shows the opportunity cost as a denied request, not as a worse physical outcome, because braking suffices at its 20 m gap; no honest variant was found where the recreation flight is allowed and the later emergency is also unwinnable by braking.

---

# v0.6 update: decisions and limits

The product now uses one scenario workspace and a visible numerical audit below it. Emergency assistance is an intent distinct from a comparison response. Missed-exit convenience is one selectable route scenario, not the purpose of the whole study. Ordinary lane changes are not positioned as flight use cases; retained cut-in fixtures are labeled recovery stress tests.

The wider-gap sudden-braking case supports a ground-first interpretation: ground braking avoids ego contact without spending flight resources, while the nominal aerial climb fails the buffered corridor gate. The critical gap also produces a ground failure; this does not authorize an obstructed flight. Earlier optional use demonstrates both physical consumption and the inability to stack a second departure while already airborne.

The north-to-east elevated transfer is useful as a negative feasibility result. The chosen boundary-value profile uses about 110.594 kN·s but violates directional allocation and deck clearance, and no validated yaw controller exists. It remains a rejected proposal with an honest ground continuation, not a completed flying turn. A future implementation needs an attitude/nozzle/controller model, swept oriented-body occupancy, uncertainty and a complete landing/route model before considering admission. Increasing the baseline or clearing traffic is not a remedy.

The 250-run batch retains all 62 ego failures. These outcomes support model diagnosis, not a safety rate. The original memo follows for historical context; the v0.6 README and change notes describe the current UI and scope.

---

# Initial product and engineering decision memo

Historical v0.1 memo retained. See [CHANGES-v0.2.md](CHANGES-v0.2.md) for the current visual redesign, missed-exit case and model extensions.

**Version:** v0.1 / B1 · **Date:** October 21, 2026 · **Status:** first integrated prototype, further study required.

The product to investigate is a scarce maneuver capability within an ordinary trip. Its primary interaction is selecting an intention, inspecting the physical and traffic consequences, and deciding whether to preserve a future allocation. Flight is not treated as a default safety improvement.

## Users, affected people and priorities

The equipped driver wants predictable travel and understandable availability. Other drivers, passengers, people outside vehicles, road operators and emergency responders bear effects they did not choose. This version makes those independent drivers visible and refuses to clear them by fiat. Actual nonowner preferences, trust, adoption, interview findings, willingness to pay and regulatory consent have not been researched or invented.

Prioritize explaining availability and refusal before expanding impressive maneuvers. Emergency assistance remains a hypothesis to compare with ground braking and steering. Convenience and recreation are optional intentions; this version gives them identical maneuver physics rather than inventing a measured utility difference. A convenience time benefit must emerge from an actual route comparison. Recreational value is subjective and unmeasured.

## Annotated prototype flow

1. **Inspect the baseline.** The left panel exposes the ten-second cumulative ceiling, six-hour refill and nitrogen basis. The evidence dialog separates reported claims from engineering interpretations.
2. **Choose an intent and traffic event.** The scenario form chooses a fixed synthetic event sequence and seed. The replay policy is distinct from the camera. Engineering fields are secondary and do not modify B1.
3. **Understand the opportunity cost.** Before running, a concrete message gives the estimated seconds and impulse cost, remaining impulse and whether the reference later request still fits. This is capability for one stated maneuver, not a percentage of safety.
4. **Choose future-allocation consent.** The optional-use checkbox prototypes the driver's choice. Reserve-first automatically declines optional use when its policy allocation would be spent. Neither choice overrides completion reserve, force or traffic gates. The emergency response uses a preconfigured automated execution assumption, not a last-millisecond consent dialog.
5. **Observe the decision.** The scene shows the candidate corridor and landing window. Timeline events explain approval, denial, disturbance, correction, touchdown or failure. Observing a cut-in can invalidate the predicted landing. Seek and alternate cameras preserve the same replay.
6. **Compare the consequence.** Matched summaries retain denied requests, incomplete trips and failures. Exported replay states allow inspection beyond the animation. No score, race, mission or player steering is included.

## Initial observed results: seed 42

For the clear-corridor preset, the ground-only case remains short of the 500 m destination at the 28 s horizon, stopping upstream of the scripted obstruction without ego contact. Forecast-assisted aerial use completes its four-second maneuver and reaches 500 m at 24.36 s. It spends about 74.56 kN·s. This is a result of the defined obstacle geometry and bounded point-mass model, not evidence that flight is broadly safer.

The optional-use case spends about 85.74 kN·s in an earlier 4.6 s hop and lands successfully. A later aerial request is denied for insufficient impulse, despite 5.4 seconds of airborne allowance left. Ground driving/braking remains available. Reserve-first rejects the earlier optional request and retains the later modeled maneuver. This illustrates a consequence, not an optimal reserve policy or an emergency-frequency claim.

The early-cut-in optional case finds a bounded move into lane 1 and lands. This route change alters later exposure, so its travel-time outcome cannot be attributed to scarce-resource allocation alone. The emergency remains at the same absolute location and time across runs; it is not relocated to guarantee a conflict with each policy's ego state. The clear-corridor sequence is the cleaner resource-use comparison.

For the early-cut-in ground route, the later proposed landing has insufficient post-landing braking clearance, so aerial use is denied. A trajectory that reaches z=0 is not enough to approve integration. For the late-cut-in preset, the tested alternative violates the remaining envelope and contact occurs; the run terminates. Occupied landing and reduced thrust presets deny optional departure under the same baseline.

Five seeds across five presets and five policy labels produce 125 retained runs. Some seeds fail even in the nominal clear-corridor condition; the full results are in `results/paired-runs.json` and `.csv`. These synthetic outcomes show sensitivity to interaction timing and the need for a more credible traffic/coupling model. They do not establish a real-world safety rate. Do not select a favorable seed as proof of readiness.

## Policy recommendation for the next study

Keep mandatory maneuver-completion reserve separate from a future-event product allocation. Make refusal and estimated future unavailability visible before optional use. Retain ground-only behavior when an aerial request is unavailable. Do not market the remaining resource as protection or require a driver to approve a new airborne decision within an assumed subsecond window.

No public-road launch recommendation is supported. Within this prototype, reserve-first can preserve a later candidate but also restrict optional use whose benefit may be realized without any emergency. There is no defensible weighting of those outcomes yet. A scripted emergency cannot supply its prevalence, and optional consent cannot absolve effects on other road users.

## Remaining limits and next milestones

- Establish original transcript wording and continuous demo reconstruction; preserve timestamps and configuration ambiguity.
- Replace the single-vector translational assumption with nozzle allocation, actuator response and attitude dynamics. Validate lift-off/contact loads and transition jerk. Reject rotation claims until that exists.
- Bound jet footprint, noise, debris and pressure-vessel effects before treating a traffic-clear trajectory as an operating concept.
- Migrate / cross-check against a selected SUMO release and calibrate ground behavior. Verify Michigan rules before claiming a jurisdiction profile. Add explicit perception history and occlusion rather than relying on scripted revelation and decision intervals.
- Expand emergency comparison to fully executed tire-limited ground steering. Add latency splitting, braking/steering coupling, reachable landing sets and multiple fallback candidates.
- Implement infrastructure data age, communication failure and a separate coordination treatment. Current onboard and forecast-assisted labels share a predictor; their timing-policy comparison does not identify a communications benefit.
- Add ramps, exits, weaving, structures, vulnerable road users and multiple equipped vehicles in that order. Measure queues, network travel time, fairness and conceptual footprint. No construction prices are asserted.
- Add interaction for refilling / service queues, multiple cycles and partial depletion; headless ledger checks currently cover the six-hour reset.

Evidence that would change the recommendation includes a measured nozzle map and maneuver envelope, calibrated interaction behavior, verified feasible fallback sets, better outcomes than executed ground alternatives across matched adverse cases, and acceptable impact on nonowners. Until then the system is a transparent engineering/product study.
