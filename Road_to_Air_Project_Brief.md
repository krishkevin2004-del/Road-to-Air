# Road-to-Air Traffic Integration
## Independent project study and build brief — Version 0.4
**Owner:** Krish Gupta  
**Research cutoff:** October 21, 2026  
**Status:** Ready for implementation: visual road-traffic simulation and product-design study with a fixed baseline derived from public information.

## 1. Project definition

This independent project investigates a hypothetical scenario in which a Tesla Roadster equipped with rocket-style thrusters operates in everyday U.S. traffic. It will combine vehicle research, maneuver modeling, road-network modeling, human driving behavior, and traffic coordination to determine what would be required for that integration to work—and where it would fail.

The central deliverable is a simulated road system in which the vehicle can drive normally, request an aerial maneuver, leave the road when conditions permit, travel through a constrained three-dimensional corridor, land, and rejoin ordinary traffic. The study includes local roads, highway entrances and exits, interchanges, and eventually transfers between highways. Those are the intended application, not a hypothetical test-facility customer.

**Main research question:** Given an explicitly defined vehicle capability envelope, what combination of road layout, departure and landing zones, traffic rules, onboard control, and coordination could support limited aerial maneuvers within everyday mixed traffic?

Success is an evidence-supported answer. It can be a workable simulated concept, a restricted operating concept, or a finding that the benefits do not justify the requirements. The project must not assume that every desired maneuver is possible or that public-road deployment is the necessary conclusion.

This study is not affiliated with Tesla. It does not establish real-world safety, vehicle certification, legal permission, or readiness for physical testing.

## 2. Public-information basis and research logic

**Build principle:** Use information publicly available as of October 21, 2026 as the foundation. The reveal, supplied engineering-interview transcript, and supporting reporting provide sufficient starting evidence for this independent hypothetical study. Complete proprietary specifications are not a prerequisite for implementation.

Accept clearly attributed public statements as reported inputs, with their qualifications preserved. Use engineering calculations to derive what those inputs imply. Where an input is unpublished or ambiguous, choose an explicit range, record the rationale, and test how much the result changes across that range. A missing input narrows the strength of a conclusion; it does not automatically stop the build.

The study has two linked layers:

- **Public-evidence model:** Represents the reported hardware and demonstrated class of maneuver as closely as the available information permits.
- **Hypothetical integration scenarios:** Explore the road layouts, operating rules, automation, and capability assumptions needed for everyday use. Any extension beyond demonstrated capability is visible and adjustable.

The original reveal, the interview, and an article quoting them are related evidence, not three independent confirmations. Keep that provenance clear without requiring independent testing of every manufacturer statement before modeling it.

### Research sequence

The work proceeds through three linked questions:

1. **What can the demonstrated or proposed vehicle actually do?** Establish public evidence and quantify uncertainty.
2. **What does a maneuver physically require?** Derive a capability envelope, reaction limits, and failure boundaries rather than animate an arbitrary flight path.
3. **How would that envelope fit a road network and its human users?** Test existing-road integration and infrastructure changes under the same travel demand.

Do not interpret “research everything” as “all information is publicly available.” The vehicle's complete thrust map, inertia tensor, flight-control software, structural limits, and certified operating envelope may be unavailable. Missing information must remain visible. Unknowns are explored through ranges, not converted into facts.

## 3. Workstream A — Vehicle evidence dossier

### 3.1 Evidence collection

Research material available on or before the cutoff. Prioritize Tesla publications, the original reveal footage, and direct interviews with the responsible engineers. Use independent reporting to cross-check and locate primary evidence. Later revisions must not silently overwrite the October 21 snapshot.

For each claim record the source URL, publication date, capture date, exact vehicle configuration, demonstration conditions, timestamp where applicable, measurement convention, evidence category, and unresolved contradictions. Distinguish a demonstrated result from a manufacturer claim, a design target, an engineering inference, and a hypothetical extension.

The available evidence now includes the supplied timestamped transcript of Hagerty's engineering interview, links to the reveal, Tesla's product page, and TechCity's endurance analysis. Use the transcript immediately for attributed hardware inputs. Original footage remains useful for checking ambiguous wording and estimating geometry, but obtaining a complete engineering dataset is not a gate to starting the model.

### 3.2 Starting public-evidence register

The following entries come from the user-supplied transcript, `Pasted text(1).txt`, associated with Hagerty's interview. They are reported statements and narration, not measurements performed by this project.

| Timestamp | Public information | Initial modeling treatment |
|---|---|---|
| 2:41–3:13 | Rear-wheel drive, two rear motors, over 1 MW of power described by Moravy. | Ground powertrain context; do not convert directly into airborne force. |
| 4:24–4:28 | Mass described as just under 1,700 kg, with final numbers pending. | Provisional mass anchor; vary loaded flight mass because trim, gas, and occupant accounting are unresolved. |
| 15:31–15:42 | 200 L vessel, up to 10,000 psi, cold-gas thrusters. | Reported rear-system hardware input. |
| 16:03–16:11; 17:39–17:45 | Over 80 kN of thrust discussed in rear-system and flight-system context. | Reported thrust anchor with allocation/configuration ambiguity; never assign this independently to every axis. |
| 16:34–17:17 | Narration distinguishes 0.55 s with rollout, 0.85 s for Thrust with rollout subtracted, and 1.6 s for Performance; ground top speeds of 210 and 230 mph. | Preserve each configuration and timing convention; no inference that flight has the same acceleration. |
| 17:28–17:55 | Flight system adds 400 L to the existing 200 L, becomes single-seat, and adds six thrusters. | Model the flight configuration separately, using 600 L reported total capacity. Exact nozzle geometry remains assumed where unavailable. |
| 18:44–20:16 | Nitrogen identified; declining tank pressure reduces thrust. | Use nitrogen as the reported working fluid and bounded resource/pressure behavior. |
| 20:17–20:29 | Narration reports 6–7 hours to refill 600 L, with a target near 30 minutes. | Separate described turnaround from future target in repeated-use scenarios. |
| 21:03–21:21 | Differential left/right flow described for straight-line stability. | Supports differential control concept; response time remains an assumed range. |

TechCity's article supplies a preliminary 7–10-second hover estimate and an approximately 1.5–2-second full-thrust estimate, using its stated mass, gas, and exhaust assumptions. For this project, adopt a fixed **10-second maximum airborne duration per full resource cycle** and **six-hour refill turnaround** as deliberate study assumptions derived from the user's selected public evidence. They are not Tesla-certified specifications. Ten seconds is a duration ceiling, not a promise of ten seconds of arbitrary full thrust. Its reported 250 kg of gas is not present in the supplied interview transcript and retains its separate provenance.

Preserve transcript errors such as malformed voltage or force units in the source. Correct a parameter only with an explicit interpretation note or source check; never silently ingest an obvious transcription error as a physical input.

### 3.3 Research and parameter inventory

| Area | Questions and required inputs |
|---|---|
| Configuration | Which prototype performed each maneuver? Which hardware belongs to Performance, Thrust, or Rocket? Are configurations comparable? |
| Ground acceleration | 0–60 mph, rollout convention, timing method, surface, tires, thruster use, repeatability, and whether figures are demonstrated or targeted. |
| Speed | Advertised, demonstrated, and targeted ground top speeds; maneuver entry speed; any measured airborne speed. Keep all four separate. |
| Vehicle geometry | Length, width, height, wheelbase, clearances, mass with occupant and gas, center of gravity, and estimated inertia. |
| Propulsion | Working fluid, nozzle count and directions, available thrust by axis, nozzle placement, throttle limits, actuator lag, minimum pulse, and failure cases. |
| Stored resources | Tank volume and pressure, gas mass, thermal conditions, useful impulse, pressure decay, reserves, refill process and turnaround. |
| Ground systems | Motors, braking, tire grip, active aero, suspension, and fan suction. Separate road-dependent downforce from airborne support. |
| Flight | Lift-off method, ramp contribution, altitude, duration, horizontal distance, orientation change, landing speed, and touchdown conditions. |
| Repeatability | How many maneuvers are possible per fill, recovery time, maintenance, and whether demonstration hardware differs from proposed production hardware. |
| Control | Human versus automated execution, available sensors, estimated latency, position accuracy, fault detection, and mode transitions. |
| External effects | Exhaust jet footprint, noise, debris entrainment, effects on nearby vehicles and people, and pressure-vessel implications. |
| Occupant limits | Acceleration, jerk, restraint orientation, rotation, visibility, and landing loads. |

Conflicting figures must remain separate until reconciled. Do not apply a ground 0–60 time to flight acceleration or combine one trim's mass with another trim's thrust as though it were a verified configuration.

### 3.4 Demo reconstruction

Identify the original, continuous footage and distinguish live footage from edited or prerecorded segments. Establish scale using known geometry, correct perspective where possible, and identify ramp contact, departure, apex, attitude changes, and first touchdown. Estimate time, displacement, velocity, and uncertainty using frame counts and camera geometry.

Multiple views are preferable. A single moving camera can confound depth and apparent rotation. Mark unobservable variables as unidentifiable. Reconstruction estimates should be accompanied by uncertainty bounds and sensitivity to scale, frame rate, cuts, and perspective. Do not claim to recover a complete thrust history from a promotional video.

**Deliverable:** A source-backed vehicle dossier, a claim comparison table, a demo reconstruction with uncertainty, and a machine-readable parameter register.

## 4. Fixed baseline for the study

The user's selected public information and supplied transcript are the foundation for the hypothetical system. Freeze baseline version B1 before implementation so the project can progress without repeatedly revisiting its premise.

| Baseline item | Fixed study treatment |
|---|---|
| Vehicle concept | Hypothetical Roadster flight configuration with cold-gas thrusters; everyday mixed-traffic integration. |
| Working medium | Compressed nitrogen, following the supplied engineering interview; describe as cold-gas propellant, not gasoline or combustion fuel. Preserve the reveal's compressed-air terminology in source notes. |
| Airborne allowance | Maximum cumulative 10 seconds airborne per full resource cycle, selected from the supplied endurance analysis as a hypothetical operating limit. |
| Refill turnaround | Six hours for a complete refill cycle; reset resources only after that modeled turnaround. |
| Flight hardware | Reported 600 L total capacity and flight-system configuration from the transcript; preserve the distinction from the 200 L Thrust configuration. |
| Usage tradeoff | Earlier use reduces or can eliminate capability available for a later event before refill. |
| Ordinary traffic | Human drivers remain independent and imperfect; they do not automatically clear a landing area. |

These values are fixed for the main study, not sliders in the normal frontend. Any future alternative baseline must be explicitly versioned and compared separately. Do not replace six hours with a future refill target or continuously change ten seconds to make scenarios pass.

Other reported figures in the evidence register remain fixed as attributed descriptions. Where their engineering meaning is unresolved—especially loaded mass and directional allocation of the reported thrust—record a baseline interpretation or a bounded engineering assumption. Do not invent a complete manufacturer specification.

Maintain separate ledgers for airborne time, usable impulse/propellant, and mandatory maneuver-completion reserve. Ground thruster use consumes resources even when airborne time does not decrease. A maneuver is available only when all constraints permit it; a remaining time allowance alone does not establish sufficient lift or correction authority. If the fixed scenario and a physical limit conflict, report infeasibility rather than secretly increasing thrust or relaxing the resource ceiling.

## 5. Workstream B — Engineering maneuver model

### 5.1 Model hierarchy

Start with analytical bounds and a three-dimensional point-mass dynamics model. Add attitude and rotational dynamics when investigating lift-and-twist maneuvers, nozzle direction, or thrust allocation. A full six-degree-of-freedom model is an extension that requires inertia and actuator assumptions; a point-mass model alone cannot substantiate rotation feasibility.

Use SI units internally. Keep ground, departure, airborne, touchdown, and ground-recovery modes distinct. Model transitions explicitly so tire forces do not continue acting after takeoff and road suction is not treated as free airborne lift.

### 5.2 Governing constraints

Translational dynamics are governed by:

`m * dv/dt = sum(thrust vectors in world coordinates) + aerodynamic forces + gravity + contact forces`

Rotational dynamics, when enabled, follow:

`I * dω/dt + ω × (Iω) = sum(nozzle moments) + aerodynamic/contact moments`

The attitude determines the direction of body-mounted nozzles. Forces used to support the vehicle cannot simultaneously be allocated without limit to lateral avoidance or braking. Model shared gas, power, nozzle, and duty-cycle constraints.

Begin with a bounded available-thrust and total-impulse model. Introduce pressure-dependent gas flow only if thermodynamic and nozzle information supports it. Tank pressure or volume alone does not establish usable thrust, burn time, or maneuver count.

### 5.3 What speed implies

A ground top-speed figure does not establish an airborne operating speed. At higher speed, the same maneuver generally needs more space and/or force; turning the body does not instantly turn the velocity vector.

Useful screening relationships include:

- Level support requires vertical thrust and aerodynamic lift to balance weight; actual lift-off and landing arrest need additional capability.
- For an ideal constant-speed curved path, `r = v² / a_lateral`. With fixed lateral acceleration, doubling speed quadruples turn radius.
- For a simplified constant-deceleration stop, `d = v * latency + v² / (2 * a_brake)`. This is a screening bound, not an airborne stopping guarantee.
- At 70 mph, a vehicle moves approximately 31.3 meters each second; a 0.2-second delay consumes approximately 6.3 meters before a response begins. This is a unit conversion example, not a Tesla latency estimate.
- A ballistic reference arc obeys `z(t) = z0 + vz0*t - g*t²/2`; powered flight must integrate actual forces instead.

Evaluate normal road speeds first. Extreme-speed cases are separate stress tests and must not become the public-road default because the car has a high advertised top speed.

### 5.4 Adaptation to other vehicles

“How quickly can it adapt?” must produce an avoidance envelope, not one reaction-time number. Separate detection delay, estimation error, planning/communication delay, actuator response, available thrust, rotation time, resource reserve, and remaining flight time.

For each disturbance calculate:

1. What can the vehicle observe, and when?
2. Which alternative touchdown states remain reachable within the resource and occupant limits?
3. How soon must it commit to a correction?
4. Does the complete corrected trajectory remain clear of road users and structures?
5. Can it land with acceptable horizontal speed, vertical speed, attitude, and ground braking distance?

Report minimum warning time, required clearance, maximum correctable displacement, latest feasible intervention time, remaining resource margin, and cases with no feasible recovery. Do not equate an instantaneous change in target with an achievable trajectory.

### 5.5 Maneuver library

Test progressively: forward hop with same-lane landing; landing into an adjacent lane; bounded lateral transfer to another road; elevation-changing transfer; and heading-changing highway transfer. A roll or dramatic flip is a separate research case, not a default traffic maneuver. Compare a transfer without unnecessary rotation against one that changes attitude.

Every candidate must pass trajectory-wide clearance, force, impulse, attitude, occupant-load, touchdown, and post-landing stabilization checks. Never use teleportation, unlimited thrust, instantaneous yaw, or an unlimited hover to conceal infeasibility.

**Deliverable:** A maneuver envelope indexed by entry speed, geometry, traffic warning time, resource state, and assumed physical capability, with clear feasible/infeasible/unknown classifications.

## 6. Workstream C — U.S. roads, traffic operations, and people

### 6.1 Represent a defined jurisdiction

There is no single uniform U.S. driving behavior or complete nationwide rule set. Begin with one documented state/jurisdiction profile, provisionally Michigan, and a representative synthetic network. Verify state-specific driving rules before encoding them. Use federal guidance for the subjects it actually covers; the MUTCD is a traffic-control-device reference, not a complete driving-law or road-geometry manual.

Keep legal rules, road geometry, typical behavior, and violations in separate model layers. Cite the selected state driver manual/statutes, FHWA resources, public geometric guidance, and applicable traffic datasets as each feature is implemented. A synthetic geometry is not a surveyed real interchange.

### 6.2 Ground-road inventory

| Network component | Behaviors and constraints to represent |
|---|---|
| Highway mainline | Speed variation, car following, overtaking, lane choice, trucks, blind spots, and lane restrictions where applicable. |
| Entrance ramp | Acceleration lane, gap acceptance, yielding, speed matching, and ramp metering where included. |
| Exit ramp | Advance lane changes, deceleration, exit queues, missed exits, and spillback. |
| Weaving section | Entering and exiting traffic competing for gaps over limited distance. |
| Interchange | Road connectivity, relative headings, bridges, elevation, barriers, signage, and accessible transfer geometry. |
| Surface arterial | Lane assignments, turning pockets, signal phases, queues, crosswalks, and access points. |
| Stop-controlled junction | Right-of-way, stopping behavior, gap acceptance, conflicting turns, and noncompliance scenarios. |
| Exceptional conditions | Construction, closures, stopped vehicles, emergency response, weather, and reduced visibility. |

Implement these as modular scenario families rather than attempting an entire city at once. A highway flyover and a signalized urban intersection require different conflict models.

### 6.3 Human behavior

Use distributions for desired speed, headway, reaction delay, cooperation, lane-changing urgency, gap acceptance, distraction, and compliance. Include late exits, cut-ins, hard braking, hesitation, and aggressive gap closure as bounded scenarios.

Ordinary vehicles are not assumed to be connected, remotely controllable, or compliant with a digital landing reservation. Any connected-vehicle cooperation is a separate experimental treatment with a stated penetration rate and communication reliability.

Drivers may react to an airborne vehicle through surprise, distraction, or unnecessary braking. These responses lack established calibration for this exact technology; treat their magnitude and probability as hypothetical sensitivity variables. Do not claim to have validated “U.S. driver psychology” from ordinary car-following data.

Use observed traffic data to calibrate what can be calibrated: flow, speeds, queue lengths, lane use, and merging behavior. Validate on separate conditions where feasible. Record the limits when suitable data are unavailable.

## 7. Workstream D — Integrated road-system concept

### 7.1 Road-network design alternatives

Compare three infrastructure configurations under equivalent demand:

1. Existing road layout with candidate departures and landings, subject to strict feasibility checks.
2. Designated departure/landing zones connected to existing lanes, with explicit access queues and footprint.
3. Modified corridors or transfer nodes linking selected roads/highways, including separation from ordinary traffic where required.

A proposed zone must have enough approach, departure, arrival, touchdown, stabilization, and fallback space. It must not merely be drawn on a shoulder, over a barrier, above a crosswalk, or between bridge decks without modeling access and clearance.

Represent the full three-dimensional occupied volume over time: vehicle body through rotation, uncertainty buffer, obstacles, other traffic, and an estimated exhaust exclusion region. Evaluate bridges, signs, wires, trucks, medians, vegetation, pedestrians, cyclists, and motorcycles where present. Unknown plume dimensions remain explicit constraints or sensitivity ranges, not assumed harmlessness.

### 7.2 Coordination concept

Compare onboard-only decision making, infrastructure-assisted coordination, and centralized corridor scheduling. Determine when a central coordinator improves outcomes enough to justify its communication and infrastructure requirements.

A request includes origin, desired destination, earliest departure, vehicle capability/resource state, and acceptable alternatives. The system evaluates departure feasibility, an airborne corridor, predicted arrival occupancy, contingency reachability, and effects on nearby traffic. It may approve, delay, reroute, or deny.

The sequence is: ground travel → request → assessment → provisional approval → predeparture recheck → commitment → airborne monitoring → landing → ground recovery → completion. Revocation before takeoff is different from recovery after commitment. No feasible recovery must be logged as failure.

A traffic window is a prediction unless physically controlled. Model its uncertainty. Set expiry times, recheck frequency, data age limits, communication failure behavior, and resource reserves. Preserve ordinary road control: the aerial mode cannot be used to bypass a red light or stop sign without an explicitly defined hypothetical rule and protection for all conflicting movements.

### 7.3 Ground/air division of responsibility

The hypothetical human driver selects intent; automated control executes the modeled airborne maneuver. This is an explicit study assumption because precise aerial control cannot simply inherit human road reaction times. Test manual-control alternatives separately if needed.

The simulation must distinguish: permission to request, permission to depart, trajectory control, emergency handling, and ground takeover. Prevent premature ground takeover before the model's stabilization conditions are met.

## 8. Scenario progression

| Stage | Scenario | Research question |
|---|---|---|
| 1 | Straight road, single hop | Can a physically constrained maneuver depart and rejoin with matched speed? |
| 2 | Lane-change disturbance | How much warning and correction authority are necessary? |
| 3 | Ramp merge and highway exit | Is aerial integration better than the normal ramp, including waiting and external delay? |
| 4 | Weaving and congested mainline | Does it reduce or merely relocate disruption? |
| 5 | Interchange transfer | Are distance, heading, elevation, clearances, and impulse compatible? |
| 6 | Signalized and stop-controlled roads | Can the operation coexist with cross traffic and vulnerable users? |
| 7 | Multiple equipped vehicles | When are scheduling, congestion, fairness, and coordination necessary? |
| 8 | Degraded conditions | Which combinations require staying grounded? |

Required adverse cases include a cut-in before landing; truck occlusion; sudden braking; missed or stale position data; communication loss; exhausted correction reserve; reduced thrust; incompatible landing speed; blocked fallback; and a stalled vehicle in a designated zone. Track the failure rather than deleting the run.

## 9. Evaluation and decision criteria

Use paired ground-only, uncoordinated-aerial, and coordinated-aerial baselines with the same destinations, demand, vehicle mix, and external events. Include all requests, waiting, denials, refilling assumptions, and ground recovery in trip outcomes. Use separate random streams for traffic and aerial decisions so policy changes do not arbitrarily change the background events.

Measure requester travel time, network travel time, throughput, queues, hard braking, separation violations, three-dimensional overlaps, trajectory feasibility, touchdown errors, occupant loads, resource margins, infrastructure footprint, denial rate, and recovery failures. Report near-conflict indicators as surrogates, not crash-probability estimates.

Compare infrastructure costs at a transparent conceptual level; do not invent precise construction estimates. Include refilling, availability, deployment complexity, access fairness, and impact on nonowners. Saving one driver's time is insufficient if it creates greater delay or exposure for everyone else.

Predeclare thresholds and scenario ranges before evaluating preferred policies. Conduct paired repeated runs, report variation and extreme outcomes, and document untested conditions. Simulation zero-failure results do not establish a real-world safety rate. A physically infeasible trajectory rejects that scenario, not all imaginable future vehicle designs.

Classify findings as: feasible within stated assumptions; feasible only with infrastructure or operational restrictions; infeasible within the tested envelope; or unresolved due to missing evidence.

## 10. Technical build approach

Evaluate SUMO for ground traffic before building a custom traffic engine. Its documented car-following and lane-changing facilities provide a research starting point, but it is not an aerial dynamics engine. Verify the selected version and extension interfaces before committing.

Provisional architecture: Python experiment orchestration and vehicle dynamics; SUMO or a justified lightweight ground model; and a TypeScript browser viewer. Couple components through timestamped state snapshots in a shared coordinate system. Keep the visual replay separate from the authoritative simulation.

The coupled simulator must remove airborne vehicles from ground-lane occupancy without making them disappear from three-dimensional conflict checks. It must reinsert them consistently on landing, without silently resetting speed, relocating neighboring vehicles, or overwriting ground traffic states to manufacture a gap. Validate the coupling before interpreting outcomes.

Use a fixed simulation time base, appropriate dynamics substeps, reproducible seeds, explicit units, versioned parameter files, trajectory-wide collision checks, event logging, and CSV/JSON export. Check timestep convergence so fast motion does not pass through obstacles between sampled frames.

The interface should show the road network, a side/altitude view, candidate corridors, upcoming landing occupancy, approval explanations, current assumptions, resource state, and baseline results. An attractive animation supports the analysis; it does not replace it.

## 11. Codex milestones and acceptance

1. **Build foundation:** Seed the evidence register with the transcript and existing public sources, preserve the cutoff, and select initial ranges for unresolved flight inputs. Acceptance: every simulation input has a source or an assumption label. Begin implementation without waiting for unpublished specifications; investigate ambiguities in parallel with the relevant modeling work.
2. **Maneuver feasibility tool:** Implement analytical checks, point-mass dynamics, bounded resources, and a speed/geometry sweep. Acceptance: units, known analytical cases, force limits, and impossible requests behave correctly.
3. **Ground-traffic baseline:** Build a straight road and ramp network with documented behavior. Acceptance: sensible flow, lane occupancy, queues, and reproducible runs before adding aerial vehicles.
4. **First integrated maneuver:** Connect departure, flight, landing, ground recovery, and failure handling. Acceptance: one reproducible feasible case and multiple correctly rejected or failed cases, with comparison to ground travel. Deliver the visual simulation frontend at this milestone: moving traffic and Roadster, camera views, scenario controls, proposed trajectory, landing window, decision reasons, and resource display. Include a sequential optional-use-then-emergency comparison under baseline B1.
5. **Network expansion:** Add exit, weaving, interchange, and urban modules in order, with explicit geometric and behavior assumptions.
6. **Coordination comparison:** Compare infrastructure and scheduling strategies, then multiple equipped vehicles.
7. **Decision study:** Run repeatable experiment batches and produce sensitivity results, operating restrictions, infrastructure requirements, and a recommendation.

The first integrated milestone is one step toward day-to-day traffic integration; it does not replace the larger project with a test-track business.

## 12. Outputs and PM ownership

Deliver a revised project brief; vehicle research dossier; maneuver model; road/driver model documentation; interactive road-system simulation; experiment configurations and results; proposed operating rules and zone layouts; and a final decision memo.

The case study should explain the user journey, stakeholder conflicts, alternatives, scope decisions, launch restrictions, and evidence that changed the proposal. Potential stakeholders include drivers, other road users, road operators, vehicle manufacturers, emergency responders, and authorities. Interview feedback can inform these choices without requiring a commercial customer hypothesis before the independent study begins.

Krish owns the research question, assumptions accepted for exploration, priorities, tradeoffs, evaluation criteria, and final recommendation. Codex supports source organization, modeling, implementation, verification, and analysis. No results, interviews, or adoption claims may be invented.

## 13. Initial source map and research limits

Sources checked during brief revision on October 21, 2026:

- Tesla, Roadster product page: https://www.tesla.com/roadster — manufacturer reference; retrieved text is incomplete. Does not by itself establish flight duration, maneuver speed, control authority, or a complete trim specification.
- Top Gear, direct-access vehicle reporting/interview lead: https://www.topgear.com/car-news/electric/tesla-roadster-has-finally-landed-thrusters-0-60mph-059s-and-flight — retrieve and examine original engineering interview/footage before adopting numerical parameters. Search headlines are not accepted measurements.
- FHWA, Traffic Analysis Toolbox introduction: https://ops.fhwa.dot.gov/publications/fhwahop18036/introduction.htm — guidance for defining and conducting a reproducible traffic microsimulation study.
- FHWA, microsimulation calibration: https://ops.fhwa.dot.gov/publications/fhwahop18036/chapter5.htm — calibration reference; model credibility requires more than a functioning animation.
- FHWA, MUTCD current edition page: https://mutcd.fhwa.dot.gov/kno_11th_Editionr1.htm — traffic-control-device source, with edition and jurisdiction adoption checked before implementation.
- Eclipse SUMO, car-following documentation: https://eclipse.dev/sumo/docs/Car-Following-Models/index.html — software model reference; simulation update frequency, desired headway, and perception/reaction behavior are distinct parameters.

Additional project sources:

- User-supplied `Pasted text(1).txt`: timestamped Hagerty interview transcript, read in full. The starting register above preserves the relevant timestamps and attribution.
- Hagerty engineering interview: https://www.youtube.com/watch?v=22rvpUecLts — original video associated with the supplied transcript.
- Tesla reveal: https://www.youtube.com/live/qt5p-_tE8d0 — original event source linked by the supporting article; direct quantitative reconstruction remains future work.
- TechCity, October 18, 2026: https://www.techcityng.com/how-long-can-tesla-flying-roadster-fly/ — secondary analysis with explicit endurance estimates; reproduce and challenge its assumptions.
- NASA Glenn thrust reference: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/rocket-thrust-equation/ — governing thrust relationship, including momentum flow and pressure contribution.

## 14. Immediate build instruction

Start with the public-evidence register above and a configurable parameter file. Implement a maneuver feasibility calculator before the larger traffic interface: entry speed, mass, available directional thrust, total impulse, latency, displacement, height, and landing conditions must be explicit. Keep baseline B1 fixed, including six-hour refill and ten-second airborne ceiling. Sweep only unresolved engineering parameters over documented ranges; these are scenario assumptions, not statistical confidence intervals. Reject combinations that violate the force, resource, or landing constraints.

Next, connect that calculator to one straight mixed-traffic road segment with normal driving, a requested forward hop, a projected landing window, and a deliberately introduced cut-in. Display whether the maneuver completes, is denied, or becomes unrecoverable, and explain why. Then expand through ramps, exits, weaving, and highway transfers using the same physics and evidence discipline.

The brief and initial public-evidence extraction are complete. Engineering calculations, traffic calibration, detailed footage reconstruction, and the software itself remain to be implemented. The project proceeds with public information and transparent assumptions; access to internal Tesla data is neither expected nor required.


## 15. Required frontend — visual simulation workspace

The frontend is a core deliverable. The Dr. Driving reference communicates a recognizable road environment with a vehicle moving among other vehicles. **This is not a driving game.** Do not build keyboard steering as the main interaction, racing, missions, scores, rewards, or entertainment progression. Simulation controls, scenario design, and product decisions are the primary interactions.

Show the Roadster driving, merging, waiting, departing, maneuvering in the air, landing, and returning to ground traffic. Other vehicles must visibly respond according to the traffic model. Prefer a clear three-dimensional or 2.5D scene with selectable overhead, vehicle-following, and side views; fidelity of altitude, geometry, and behavior matters more than photorealism. Camera following is an observation tool, not player control.

### Frontend workflow

1. Select or configure a road layout, traffic conditions, and scenario.
2. Choose the Roadster's route and maneuver intent, or allow the modeled system to identify a candidate.
3. Inspect the proposed path, predicted landing window, resource cost, and decision explanation.
4. Run, pause, step through, change playback speed, and replay the simulation.
5. Inspect how the maneuver affects surrounding traffic and what capability remains afterward.
6. Compare the same scenario with ordinary ground driving or another resource-use policy.

The main view contains the road scene and moving vehicles. Supporting panels show scenario setup, route/maneuver request, baseline B1, resource state, decision reasons, event timeline, and results. Display the six-hour turnaround and ten-second baseline as fixed assumptions, with source/interpretation available in a detail view. Avoid making engineering configuration dominate the everyday product concept.

A scenario editor can initially use predefined road modules and parameter forms; a free-form road builder is optional later. Preserve simulation state when changing cameras. Playback speed must not alter physical outcomes.

## 16. Product-design study — scarce capability and user choice

The product question is broader than whether the car can lift off: **When should a driver spend a scarce maneuver capability now, and what should the system preserve for later?** A six-hour refill turnaround and short airborne allowance make opportunity cost central to the experience.

Study three intentions separately:

| Intent | User need | Product questions |
|---|---|---|
| Emergency assistance hypothesis | Avoid or mitigate an imminent conflict when an aerial response is feasible. | Would braking, ground steering, or flight offer the best modeled outcome? Is there time to detect, decide, depart, and land? |
| Convenience | Change lanes, transfer roads, or reduce travel time. | Is the benefit worth resource use, external disruption, and reduced future availability? |
| Recreation | Deliberately experience an optional maneuver. | Where could it be permitted within the hypothetical rules, what resources does it spend, and does the user understand what becomes unavailable? |

Limited endurance does not prove that the system is an emergency safety feature. Validate that hypothesis against ground braking and evasive steering. Flight can introduce new conflicts, and a depleted system must leave ordinary ground driving available. Never tell a user that remaining flight resources guarantee protection.

### Reserve policy alternatives

Compare reserve-first, informed optional use, and unrestricted resource allocation as study policies. The unrestricted policy still obeys physical limits and traffic-conflict gates; it does not mean unrestricted permission to fly.

Separate two reserves:

- **Maneuver-completion reserve:** Resources required to complete or recover from the maneuver already being attempted. Optional-use consent cannot waive this gate.
- **Future-event reserve:** Resources deliberately protected for a later potential event. This is a product policy to investigate. Depending on the scenario policy, a user may choose to spend some or all of that optional future allocation.

Do not assume a fixed number of maneuvers or subtract arbitrary seconds per lane change. Compute each maneuver's airborne time and physical resource use. Remaining future capability depends on the next maneuver's geometry, thrust needs, resource state, and traffic—not just a countdown.

### Driver-facing decisions to prototype

Before an optional maneuver, communicate intent, estimated resource use, remaining modeled capability, refill turnaround, and any loss of future availability. Use concrete language such as “This maneuver would leave insufficient modeled resources for another aerial maneuver before refill.” Only show quantities supported by the model. Avoid an unsupported “safety remaining” percentage.

The hypothetical interface may ask the driver to confirm spending the optional future-event reserve. This confirmation is a product interaction to prototype, not a request for project-owner approval. A physically infeasible or conflict-producing maneuver remains denied regardless of willingness to spend resources.

For emergency scenarios, model the detection/decision latency explicitly. Do not assume a driver can read and confirm a dialog within a fraction of a second. Compare preconfigured assistance policies with driver-requested action and document the control-authority assumptions.

### Required sequential-use experiments

- Full resources, imminent conflict: compare ground-only response with aerial assistance.
- Recreational or convenience use, then the same conflict before refill: expose the effect of the earlier choice.
- Reserve-first policy denies optional use, then a later conflict occurs: measure the benefit and restriction cost.
- Optional use followed by no emergency: measure realized benefit and spent capability without inventing a safety benefit.
- Partial depletion: determine which maneuvers remain feasible rather than assuming all are unavailable.
- Six-hour refill complete: verify resource reset and availability restoration.
- Multiple equipped vehicles seek the same corridor: compare request priority, disruption, and fairness.

Evaluate these using matched event sequences. A scripted later emergency demonstrates a consequence; it does not establish how often such events occur or the optimal reserve policy. Any emergency frequency or utility weighting must be explicitly assumed. Avoid claiming a statistically optimal policy without defensible inputs.

### PM and product-design outputs

Document target users and affected stakeholders, use-case prioritization, driver journey, interface states, reserve-policy choices, misuse and misunderstanding risks, and criteria for permitting or rejecting each use. Produce annotated frontend flows and a decision memo explaining the tradeoffs. Use this evidence to answer interview-style product questions: Who benefits? What problem matters most? What would you prioritize? What do you restrict? How do you measure success? What would change your decision?

The final case study must connect public vehicle information to engineering constraints, road-system design, and product behavior. Its distinctive result is an inspectable simulation of the Roadster maneuvering through ordinary traffic, paired with a defensible explanation of when using that capability makes sense.
