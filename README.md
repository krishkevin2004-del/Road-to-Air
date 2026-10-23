# Road to Air · v0.9

A local engineering and product-design study of a hypothetical thruster-equipped Roadster sharing synthetic roads with independent traffic. The supplied brief and public-evidence register remain attached. Modeled results do not establish public-road safety or certified Tesla performance.

## Run locally

Python 3 serves the frontend. Node.js 20+ runs checks and batches. No dependency installation, API key, CDN or account is required.

```sh
cd Road-to-Air
python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173. Keep the server running; stop with Ctrl-C. Use a different port if needed. Serve over HTTP rather than opening index.html directly because the app loads configuration and a module worker.

```sh
npm test
npm run experiment
```

`npm start` runs the same local Python server. Six hours is simulated service time, not a wall-clock wait.

## Four purposeful situations

The menu is curated rather than a free combination of traffic events, intents and algorithm labels. Each situation displays its question and fixed purpose. Only meaningful responses are offered:

| Situation | Variants | Responses | Why keep it? |
| --- | --- | --- | --- |
| Sudden braking ahead | 32 m / critical 8 m following gap, plus a sweep of every gap from 4 m up | Ground braking / assess aerial assistance | Tests whether flight helps. At 32 m braking suffices; at 8 m braking records contact and a faster hop avoids it; below about 6 m nothing inside the limits clears the lead. |
| Recreation now, emergency later | Optional flight at 1 s, completed at 5.6 s; braking hazard at 14 s | No flight / save flight for emergency / recreation first | Isolates completed optional consumption from capability available when a later event occurs. |
| Missed highway exit | Clear / occupied connector | Next exit / assess connector transfer | Compares an optional route benefit against resource cost and actual landing occupancy. |
| Intersecting highways | North → east, +6 m deck | One feasibility assessment | Shows why the requested heading-changing concept is rejected; duplicate ground/forecast choices add no information. |

There are **12 public combinations**, each run across five seeds in `results/curated-combinations.json` and `.csv`. Early/late cut-in tests, reduced-thrust stress presets, arbitrary intent combinations and duplicate forecast/reserve choices are removed from the public menu. The adversarial engine fixtures remain available to automated tests. See `docs/SCENARIO-AUDIT.md` for the rationale and actual findings.

The sudden-braking and recreation situations have a **travel speed** control: 49 mph (22 m/s, default) or 70 mph (31.3 m/s). Replays show only about 3.5 s before the (planned) liftoff to 3.5 s after touchdown rather than all 28 simulated seconds; the simulation still runs to 28 s so arrival times and route comparisons are unchanged.

Result cards match the question: contact outcome for braking, impulse available at the emergency decision for recreation, and connector arrival for route transfer. Reasons for use are shown rather than freely mixed with unrelated situations. The intention tabs take you to the corresponding curated situation.

Play, seek, step, change speed, switch camera or zoom. Event buttons inspect actual timestamps. Cameras never change physics. Mobile settings collapse initially, and the page supports reduced motion.

## Read the math beneath the selected scenario

The report shows event onset and observation, configured latency, stopping distances and margin, screened ground steering, requested versus actual liftoff and touchdown, candidate duration and displacement, force peaks, impulse integral, completion reserve, available resources, landing coordinates and uncertainty, gate reasons, and a decision with tradeoffs. Ground-only reports clearly identify calculations borrowed from their matched aerial comparator.

Candidate times and profiles are presets, not an optimizer's earliest safe departure or minimum flight time. A departure can be admitted by a translational screen and still fail later. “No contact” is a simulated occupied-volume result, not a crash probability. JSON export includes the selected replay and its numerical analysis; CSV contains only the relevant responses offered for the selected situation.

## New physical situations

**Sudden lead braking:** both cars start at 22 m/s. The leader begins finite 8 m/s² braking at 5 s; ego responds after the configured latency, quantized to the physics step. The 32 m and 8 m initial bumper gaps provide distinct ground outcomes. The flight request is a bounded search at a fixed 3 m apex: gentle 4.0–5.0 s hops first, then faster 2.4–3.8 s climbs only if none passes. It must clear the leader during climb, flight and landing recovery. Braking begins exactly one configured latency after onset. No car is teleported to a stop or moved aside. Adjacent vehicles are seeded independent constant-speed demand. Steering is screened over two three-second lateral corridors, not executed as a full comparison branch.

**Northbound → elevated eastbound highway:** the request changes heading 90°, moves 60 m north and 60 m east, and targets a deck 6 m above the ground. A quintic boundary-value profile matches road-aligned endpoint velocities and zero endpoint accelerations. The report integrates total support and horizontal force. The dashed curve is a rejected proposal. The actual car continues north. This candidate violates the conservative directional bound, intersects the deck clearance buffer and lacks validated yaw/nozzle control; it is never granted success by raising B1 or clearing traffic.

**Recreation sequence:** the optional flight completes at 5.6 s before the leader brakes at 14 s, with a synthetic 20 m initial bumper gap. The full-resource aerial candidate passes the nominal corridor screen, whereas prior recreation leaves insufficient impulse for it. Ground braking still avoids ego contact: retained flight capability is not presented as necessary for survival.

**Technical fixtures:** clear corridor, reduced thrust, occupied landing and early/late cut-ins remain in headless tests. They are not public situation choices. Original failures are retained for regression diagnosis.

## Fixed assumptions and implementation

B1 is compressed nitrogen, at most ten cumulative airborne seconds per full resource cycle, and a six-hour complete refill turnaround. These are study assumptions. Usable impulse, gas equivalent and mandatory completion reserve are separate physical ledgers; ten seconds never supplies unlimited thrust. In practice impulse binds first: holding 1,900 kg off the ground costs about 18.6 kN·s per second, so at 125 kN·s a single flight tops out near 6 s (the 12 kN·s completion reserve included). The ten-second figure is the top of a third-party best-case estimate (250 kg of gas, 650 m/s exhaust, 1,700 kg), not a Tesla number.

- `data/evidence.json`: public statements, interpretation limits and synthetic-scenario provenance.
- `data/vehicle.json`: configurable unresolved vehicle interpretation; B1 stays frozen in `src/model.js`.
- `data/parameters.json`: numerical values, units and explicit synthetic behavior/geometry assumptions.
- `src/physics.js`, `src/model.js`: numerical screening and resource accounting.
- `src/simulation.js`, `src/interchange.js`: original coupled traffic/flight and parallel-connector cases.
- `src/situations.js`: finite lead braking, steering screens, boundary-value highway request and denial gates.
- `src/analysis.js`: reproducible report values and conditional decision reasoning.
- `src/experiment.js`, `src/simulation-worker.js`: shared headless computation and browser worker.
- `src/render.js`, `src/highway-render.js`, `src/camera.js`: observation only; actual motion and rejected proposals remain distinct.
- `src/app.js`, `src/narrative.js`, `src/replay.js`: controls, page interactions, replay interpolation and export.

## Verification and limits

73 automated checks pass. They cover analytical motion, force allocation, resource conservation, refill, collisions, successful and failed recovery, seeded reproduction, timestep convergence, replay, cameras, new brake-onset continuity and latency, matched lead demand, highway endpoint velocities, force integration, immutable denial and report distinctions. The current audit runs all 12 offered combinations across five seeds (60 runs), plus 36 envelope points. `results/paired-runs.*` are the retained historical v0.6 technical batch and are not the current public catalog. Seeds are synthetic variation, not a statistical safety dataset.

The original car artwork now has a lower canopy, sculpted body surfaces, slim lights, a splitter, turbine wheels and detailed brakes. The simulation Roadster uses a shared tapered sports-car mesh in both road renderers. These are display changes inside the unchanged physical dimensions, not new vehicle specifications.

This is a translational model. Attitude, nozzle torque/control, plume footprint, pressure thermodynamics, real sensors, weather and road law remain unresolved. The new adjacent/bridge flows use constant-speed demand, not calibrated driver reactions. No complete highway route graph or conventional-interchange detour time is implemented. Steering remains a screen. A successful heading-changing flight is not implemented: the elevated-highway request is explicitly denied. See `docs/MODEL.md`, `docs/CHANGES-v0.6.md` and `docs/VERIFICATION.md` for details.

### v0.9: where the flight helps
**Read this first:** wherever the flight beats braking, the following gap is a tailgating distance. At 49 mph the window is 6 to 9.5 m, which is 0.27 to 0.43 s behind the lead car (the common two-second rule is 44 m). At 70 mph the window is 6 to 15 m, 0.19 to 0.48 s (two seconds would be 62.6 m). The study shows what the hardware could do in that situation, not that following that closely is sensible.

The sudden-braking search now escalates to faster climbs when gentle hops cannot clear a close lead vehicle. At the 8 m gap braking has a −1.72 m stopping margin and records contact, while a 3.2 s, 3 m hop (1.95 g, 17.5 m/s³, 59.6 kN·s plus the 12 kN·s reserve) clears the lead roof by 0.94 m with no modeled contact. Section 06 of the page sweeps every gap from 4 m (up to 10 m beyond the braking boundary, which follows the engineering assumptions): contact in both responses at 4–5.5 m, a flight rescue at 6–9.5 m, braking sufficient from 10 m. Each cell is a full engine replay (`lean` mode, verified identical to the full replay), not a formula. The replay's braking onset was made exact so contact agrees with the analytical margin at every gap. Point-mass result: attitude, jet plume on the vehicle below and sensing uncertainty are not modeled. See `docs/CHANGES-v0.9.md`.

### v0.8: search before denial
The 32 m sudden-braking case finds and executes a 4.4 s, 3 m apex jump. Liftoff is 5.36 s; touchdown is 9.76 s. Minimum sampled roof clearance during longitudinal body overlap is about 0.89 m. The swept 0.70 m buffered corridor check also passes. Actual consumption is about 82.01 kN·s and 4.4 airborne seconds. This demonstrates a feasible translational overflight without reducing the clearance buffer or changing the lead trajectory. Ground braking also succeeds, so physical feasibility is separate from necessity or a real safety verdict. (v0.8 left the 8 m case rejected; v0.9 supersedes that.)

## Deploy on Vercel

Import `krishkevin2004-del/Road-to-Air` in Vercel. Use the repository root, Framework Preset **Other**, Build Command `npm run build`, and Output Directory `dist`. The checked-in `vercel.json` supplies these settings. No environment variables or backend service are required. Simulation runs in a browser module worker.

To preview the production files locally:

```sh
npm run build
python3 -m http.server 4175 --bind 127.0.0.1 --directory dist
```

Historical large batch JSON and preview screenshots remain in the local study folder; the repository includes current reproducible results and the code to regenerate batches.
