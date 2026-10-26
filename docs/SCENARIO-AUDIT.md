# Scenario-purpose audit · v0.8

The audit asks two questions before exposing a combination: what product or engineering decision does it answer, and does the response add information rather than relabel the same behavior? Every remaining public combination is executed for seeds 7, 19, 42, 101 and 2026. The reproducible records are in `results/curated-combinations.json` and `.csv`; `npm run experiment` regenerates them.

## Kept questions and baseline seed-42 findings

| Situation | Meaningful comparison | Result and reason to keep |
| --- | --- | --- |
| Sudden braking, 32 m gap | Ground braking vs aerial request | Ground avoids ego contact. The initial 4 s jump fails clearance, but the bounded search finds a 4.4 s jump that passes the unchanged buffer and executes without modeled contact. Feasibility is demonstrated; braking still avoids spending resources. |
| Sudden braking, critical 8 m gap | Ground braking vs aerial request | Ground records contact (stopping margin -1.7 m). The gentle 4.0-5.0 s hops are denied because they climb too slowly, so the search escalates to faster climbs: a 3.2 s, 3 m hop (1.956 g, 17.58 m/s³ within-flight jerk, 59.64 kN·s plus the 12 kN·s reserve) clears the lead roof by 0.867 m and completes with no modeled contact. At default assumptions this rescue window is 6.5 to 9.5 m (v0.10); below 6.5 m no profile inside the force, load and jerk limits clears the lead. Point-mass result: attitude and jet plume are not modeled. |
| Recreation before a later emergency | No flight vs preserve for emergency vs recreation first | Optional flight finishes at 5.6 s; lead braking begins at 14 s. Full resources permit the nominal emergency candidate; recreation leaves about 39.3 kN·s and that later request is denied for resource shortage. Ground braking remains viable. This isolates opportunity cost without claiming flight is necessary for survival. |
| Missed exit, clear connector | Next conventional exit vs aerial connector request | Transfer passes the nominal screen and uses about 90.7 kN·s. Ground continues toward the next exit; the extra 1.8 km is assumed and its time is not invented. The question is convenience versus lost future capability. |
| Missed exit, occupied connector | Next exit vs transfer request | Flight is denied by occupancy. Kept as a landing-corridor variant because it checks that an apparent shortcut is not automatically admissible. |
| Intersecting highway | One proposed north-to-east transfer assessment | Denied for directional allocation, deck clearance and absent validated yaw control. Ground and duplicate forecast choices produce no distinct flight; removed those choices. The explicitly requested concept remains as a feasibility study, not a successful route. |

This produces 4 situation entries, 6 situation/variant states and 12 offered response combinations. Each has a visible purpose. Intended use is fixed by the question rather than arbitrarily combined with it. The intention tabs navigate between the corresponding situations.

## Removed from the public UI

- **Early / late cut-in:** these test a recovery controller after an already requested flight. They do not provide a clear reason for an ordinary driver to fly. Retained only as adversarial regression fixtures.
- **Reduced shared thrust / generic occupied landing:** technical sensitivities and fixtures rather than everyday user situations. The engineering configuration and tests retain them; connector occupancy is the comprehensible public variant.
- **Clear corridor with a scripted stopped-car insertion:** replaced publicly by a continuously moving lead vehicle that brakes only after the optional flight has completed.
- **Onboard versus coordinated forecast labels:** the implementations share a predictor, so a coordination advantage cannot be isolated. Removed the interchangeable public choices.
- **Separate reserve-first policy:** in the curated questions it duplicates the meaningful “save flight for emergency” comparison. No extra selector is needed.
- **Free emergency / convenience / recreation cross-product:** an emergency label on a missed-exit convenience request changes no physical event, and an optional flight without a route or recreation purpose explains nothing. Purpose is now specific to the selected case.
- **Spending-consent checkbox:** duplicated selecting the recreation response. Permission to execute the hypothetical optional use is part of that selected response; physical and completion-reserve gates still cannot be waived.

## Presentation corrected with the audit

Emergency braking cards show contact outcome rather than leading with “destination not reached,” since stopping can be the intended result. Recreation cards show impulse available at the emergency decision, not just the ledger after every maneuver. Route cards show connector arrival or the need for a conventional exit. The highway card reports a rejected transfer rather than a destination race.

The original late-hazard sequence could overlap the recreation flight. It is replaced by a 1 s recreation request, 5.6 s touchdown and 14 s hazard. This separates already completed consumption from a second departure while still airborne. The 20 m gap is a registered synthetic input; it allows testing resource availability while keeping ground braking as a viable comparison. No traffic is cleared and B1 is unchanged.

58 automated checks pass. Browser verification exercises all twelve public combinations and confirms the relevant response counts (2 / 3 / 2 / 1 by situation), populated decision reports and no invalid numerical text. These are diagnostic checks, not safety validation.

## Gap sweep (v0.9)

Section 06 of the page replays the sudden-braking event (22 m/s, lead braking at 8 m/s²) for every initial gap from 4 m up to 10 m beyond the braking boundary, once with ground braking and once with an aerial request. Each cell is a full engine replay (`lean` mode: no replay frames, 14 s horizon, verified identical to the full run), not a formula. The replay now starts braking exactly one configured latency after onset, so contact in the replay agrees with the analytical stopping margin at every gap. At default assumptions: contact in both responses at 4-6 m, a flight avoids the contact braking cannot at 6.5-9.5 m (v0.10 corrected timing), and braking suffices from 10 m. Tests: `tests/gapsweep.test.js`.
