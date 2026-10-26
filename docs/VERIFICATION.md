# Verification record · October 26, 2026

## Version 0.10 update (external audit)

77 automated checks pass, including four regression tests for the audit: the flight is screened from the car's exact position at the 5.35 s decision instant; selected duration, clearance, outcome and impulse are identical at 20, 10 and 5 ms; the reported roof clearance agrees with an independent 0.1 ms continuous-geometry check within 5 mm (0.867 m); and screened peaks equal the analytic endpoint values (1.956 g, 36.45 kN, 17.58 m/s³ within-flight jerk, 9.375 m/s² transition step). Gap sweeps at 49 and 60 mph give identical bands at 20 and 10 ms with no flight-causes-contact anomaly and no replay/formula disagreement. The braking arithmetic was independently confirmed by the audit.

# Verification record · October 22, 2026

## Version 0.9 update

73 automated checks pass (11 in `tests/gapsweep.test.js` covering the sweep, 70 mph math, speed validation and the replay window; 2 rewritten in `tests/situations.test.js` for the 8 m rescue). The 70 mph sweep (45 gaps) shows replay contact agreeing with the analytical margin at every gap and no flight-causes-contact anomalies. Checked beyond the suite: a headless sweep of 1,782 rows over 81 mass/thrust/impulse/latency combinations found no case where a flight causes contact that braking avoids, no case where replay contact disagrees with the analytical stopping margin, and no rescue violating the 3 g, 35 m/s³, impulse-plus-reserve or 0.70 m clearance limits. `lean` replays were compared with full replays for 176 runs with identical outcomes. Exits were swept over 400 seeds and 800 runs with zero background-vehicle overlaps (a mainline-lane ramp spawn that caused 6 to 8 percent of seeds to overlap was removed). The live site was exercised in a browser at desktop and 375 px widths, including assumption changes, invalid input and the slider; the console was empty. Evidence-register claims were cross-checked on 22 Oct 2026 against secondary coverage (Tesla North, AutoGuide, TechCity); video timestamps and one claim (differential flow) remain unverified and are marked so in the register. Not verified: attitude, plume, real sensing, or any real-world safety outcome.

## Version 0.7 update

58 automated checks pass. The public catalog has four situations and twelve allowed situation/variant/response combinations. Each is executed across five seeds by `npm run experiment`, producing 60 current audit records. The three additional tests check the curated catalog, deterministic execution/reporting of every offered combination, and a recreation flight completed before the later hazard with distinct retained-versus-depleted resource outcomes. Earlier physics and adversarial-fixture tests remain intact.

Browser verification steps through every one of the twelve public combinations. The controls expose 2, 3, 2 and 1 responses for braking, recreation, connector and highway respectively. Every report is populated and contains no invalid numerical text. The car SVG parses as XML; both renderer modules pass syntax checks. The new hero and sport-car mesh are visually inspected. Styling does not change model dimensions, mass, forces, resource limits or collision accounting.

The resource comparison now observes an optional touchdown at 5.6 s before lead braking at 14 s, rather than overlapping the two events. Full resources admit the nominal aerial candidate; prior recreation leaves insufficient impulse. Ground braking remains viable. Results therefore demonstrate availability and opportunity cost, not that flight is necessary for survival.

## Version 0.6 update

All 55 automated checks pass. Thirteen new checks cover finite braking motion and stop distance, observation latency and timestep quantization, distinct adequate/critical ground gaps, refusal to force a critical aerial corridor to pass, prior optional use/consent/future reserve, matched lead/adjacent demand, quintic north/east/height endpoints and velocities, integrated highway force, unconditional yaw denial with actual motion staying northbound, resource conservation and deterministic reproduction in the new cases, 20/10 ms braking convergence, report distinctions between rejected plan and actual flight, and the highway Follow camera keeping the actual car in view throughout playback.

The expanded batch has 250 runs: ten situations × five seeds × five internal response labels, plus 36 envelope points. It retains 62 failed ego runs; these are synthetic failure indicators, not crash rates. Original adverse cases remain.

Desktop browser checks exercised all ten situations. Each produces a populated calculation report and a conditional decision; report text contains no NaN, Infinity or undefined values. Emergency, convenience and recreation selection are connected to situation/response controls. Ground-only reports identify their aerial comparator rather than claiming an actual flight. Recreation with the braking sequence exposes the earlier-use/later-request tradeoff. Mobile 390×844 reports document width 390 px, and the old separate story canvas is absent. A direct math shortcut is available next to the event buttons. Browser warning/error logs were empty in the checked flows. Installed-version checks confirm the new hero/brand text, generalized heading, one simulation canvas, and the visible 7.70 m response + 32.27 m braking = 39.97 m total ego stopping calculation for the 32 m gap case.

The highway scene distinguishes solid actual vehicles and the dashed rejected request. Its visual layout includes a northbound road, elevated eastbound deck and independent traffic. The actual car remains northbound; a successful 90° flight is not implemented. The math reports approximately 110.594 kN·s required, a directional force failure, deck/clearance failure and missing yaw-controller validation. No denial consumes flight resources.

## Version 0.5 readability update

Browser verification confirms 14 px computed scenario subheadings and 15 px supporting copy on desktop and mobile. At 390×844 and 375×667, document width equals viewport width. The enlarged assessment chapter does not overlap its readouts at 390×844; shorter mobile screens switch to compact chapters. Event shortcuts and stepping advance to 5.10 s normally. Browser error/warning logs are empty after the final check. This presentation-only change does not alter the numerical core; the existing 42-check numerical/camera result is retained.

## Version 0.4 update

42 checks pass, including two camera checks for closer framing across viewport sizes, bounded zoom and replay immutability. All seven scenario presets were exercised in the browser: each loaded its matching context panel and event shortcuts. Zooming to 120% and switching to Side preserved 5.00 simulated seconds and the 10.00-second resource ledger. The 390×844 viewport reported document width 390 px, with no horizontal overflow. Browser error/warning logs were empty during the scenario checks. Decorative tree placement now excludes roads based on final jittered positions. Numerical model files and register data are unchanged.

## Version 0.3 update

All 40 headless checks pass. Nine new checks cover irregular snapshot lookup, interpolated poses without mutated ledgers, failed-state freeze, replay boundaries, lane-zero touchdown descriptions, request status descriptions, bounded/reversible scroll mapping, heterogeneous CSV fields/escaping, and isolation of the selected experiment from the canonical story. The physical simulation and retained 175-run batch are unchanged.

Browser checks exercise desktop 1280×720 and mobile 390×844 / 375×667. Mobile document width equals viewport width, settings start collapsed, and the pinned chapter fits the tested heights. Scrolling advances and reverses actual replay poses. Chapter copy is exclusively visible during transitions. Camera changes at 9.60 s preserve 5.40 airborne seconds remaining. Loading the maneuver into the calculator produces the staged 11.6 m / 0.5 s inset screen at 90.7 kN·s. Rapid scenario changes retain the final selection; the blocked connector remains denied with 125 kN·s untouched. Switching back to a straight-road preset restores the later-emergency preference.

Keyboard arrow navigation selects the convenience intention, the per-page reduced-motion toggle enables compact chapter selection, and Escape closes the evidence dialog. Downloaded late-cut-in JSON parses with its failure event and 283 snapshots; downloaded CSV parses as five policies with 14 columns. No warning or error logs were observed in the tested page.

In the local browser, one mobile worker calculation took about 386 ms off the main thread; the sampled cached scene draw p95 was 0.80 ms over 180 draws (Network camera). This measures drawing work only, not full frame pacing or universal performance. Initial scenery creation remains more expensive, and compatibility mode can block if Worker is unavailable. No 60-fps guarantee is claimed.

## Version 0.2 update

All 31 automated checks pass: the original 19 plus 12 missed-exit/geometry/coupling checks in `tests/interchange.test.js`. The expanded batch contains 175 runs across seven presets. It retains 37 failed ego runs from the original adverse scenarios. The new accepted connector cases and blocked-connector denials are included, rather than replacing older failures.

Browser checks verify the revised hero, navigation, detailed map, modeled connector transfer, occupied-connector refusal, camera state preservation, resource ledgers and legacy emergency controls. The original verification record follows for context.


## Automated checks

Run `npm test` from the project root. The first version has 19 checks:

1. Immutable B1 values.
2. Known analytical profile endpoints, apex and stopping distance.
3. Integrated positive support-force impulse against m g T.
4. Force / direction / load / duration / reserve / refill denials and invalid input.
5. Ground-thruster impulse accounting without airborne debit; overspend rejection.
6. Explicit service start and six-hour refill boundary.
7. Partial depletion permits shorter requests while rejecting longer ones.
8. Swept collisions catch fast crossings and respect 3D clearance.
9. Exact seeded reproduction and matched initial / external events.
10. Clear full-resource flight, touchdown and ground reinsertion.
11. Early reachable and late unrecoverable cut-ins.
12. Prior optional use removes later physical capability despite time remaining.
13. Reserve-first preservation and later request.
14. Consent cannot waive physical / traffic gates.
15. Post-landing braking-space denial.
16. Optional use without an emergency.
17. Per-frame resource conservation and retained traffic across all presets.
18. 20 / 10 ms convergence of decisions, contact verdicts, progress (<2 m difference) and impulse (<900 N s difference) in the selected clear/early/late sequences.
19. Numerical parameter provenance and 36-point envelope sweep with passes and denials.

Numerical bounds are study tolerances, not physical measurement uncertainty. At 20 ms, the four-second reference support impulse differs from m g T by 0.57 N s due to midpoint quadrature; 10 ms reduces the integration error. No finite timestep study proves universal collision accuracy.

`npm run experiment` writes 125 paired policy runs (five seeds × five presets × five policies), preserving all requests, denials, events, metrics and failures, plus the 36-point envelope sweep. This is synthetic variation, not a statistical safety validation.

## Browser checks

The app was served locally and tested in the Codex in-app browser. The rendered road scene and altitude graph loaded, fixed B1 and resource ledgers displayed, and the step button advanced visible state. Timeline seeking exposed the early correction and its resource state. The evidence dialog loaded the source register with configuration, timestamps and provenance. Follow, Overhead and Side cameras preserved simulation time and airborne allowance. The late-cut-in replay displayed contact failure. CSV download contained five matched policies, and downloaded replay JSON retained failure events and the terminated ego state. Source JSON and CSV were parsed after browser download. The calculator, event seeking and fixed baseline were also inspected. No responsive viewport override was used; the default browser exercised the two-column breakpoint.

No automated UI test framework or external dependency was installed. Browser checks complement the headless numerical checks; appearance does not validate the vehicle model.

## Batch outcome retained in delivery

Of the 125 synthetic policy runs, 37 terminate the ego trajectory and 62 record at least one background/ego overlap. These are retained failures of the modeled interactions, not crash-rate estimates. Background contact response is not implemented. Numerical success on the acceptance cases does not erase these limits.

## v0.8 verification (historical)
60 tests passed. Re-ran 12 curated combinations across five seeds. The 32 m braking overflight executed; the 8 m variant was still denied at that version (superseded in v0.9). UI report verified to show all attempted durations, selected trajectory, actual landing, clearance and resources.
