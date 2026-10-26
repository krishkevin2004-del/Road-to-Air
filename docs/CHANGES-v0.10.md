# v0.10 · External audit fixes

An external review (independent re-derivation plus re-running the 60 mph scenario at several timesteps) confirmed the braking arithmetic and found four problems. All are fixed.

1. **Departure one step behind (real bias toward the flight).** The loop decided before the tick's motion, so the flight was screened and flown from the car's t−dt position while the lead's pose was exact at t: v·dt of free room (0.44 m at 49 mph, 0.54 m at 60 mph). The decision now happens at the exact observation instant (onset + 0.35 s = 5.35 s) from the car's exact position, and the flight is integrated in exact time with partial first/last steps.
2. **Timestep sensitivity.** Because the decision snapped to the next tick (5.36 s at 20 ms, 5.35 s at 10 ms), the 8 m case chose 3.0 s at 20 ms and 3.2 s at 10 ms. With exact decision time, durations, clearances, outcomes and impulse are identical at 20, 10 and 5 ms (regression test).
3. **Clearance and peaks under-sampled.** The roof clearance was sampled every 20 ms (0.900 m reported against 0.865 m continuous). The corridor and clearance check now runs at 2.5 ms (0.867 m, within 2 mm of a 0.1 ms independent check). Force/load peaks now include the profile endpoints: 1.956 g and 36.45 kN rather than 1.95 g and 36.3 kN.
4. **Jerk excluded transitions.** z = 16h·u²(1−u)² starts and ends with z'' = 32h/T² (9.375 m/s² for h = 3 m, T = 3.2 s) while ground travel has zero vertical acceleration, so the join is an acceleration step. The 17.58 m/s³ figure is now labelled within-flight jerk, and the step is reported.

## Corrected results
- 8 m gap (49, 60 and 70 mph give the same flight because the relative motion is identical until the lead stops): 3.2 s, 3 m hop; 1.956 g; 17.58 m/s³ within-flight; 36.45 kN; 59.64 kN·s + 12 kN·s reserve (≈119 kg of gas at 500 m/s, constant mass assumed); 0.867 m minimum roof clearance; liftoff 5.35 s, touchdown 8.55 s. Braking margins: −1.72 m (49 mph), −4.39 m (60 mph), −7.03 m (70 mph).
- Rescue windows: 6.5–9.5 m at 49 mph, 6.5–12 m at 60 mph, 6.5–15 m at 70 mph. The 6 m case now fails; it previously passed only because of the one-step bias.
- 32 m gap: 4.4 s hop, 0.908 m clearance, touchdown 9.75 s.

## Still not modeled
Exact forecast of the lead's braking, attitude dynamics, plume, drag, thrust onset and tank/nozzle behaviour (mass held constant). Passing the translational gates does not establish a deployable or safe maneuver.
