# v0.8 · Feasible overflight search

Braking requests now test durations 4.0 to 5.0 seconds at 0.2 second intervals and a fixed 3 m apex. The first candidate passing all existing physics, resources, 0.70 m swept occupancy buffer and recovery gates is selected. Requests retain every attempted profile and rejection reason; reports show the search and sampled minimum roof clearance. No changes to B1, vehicle bounds, impulse budget, response latency or external traffic.

At seed 42, 32 m gap: 4.0 and 4.2 s fail; 4.4 s passes. Actual liftoff 5.36 s, touchdown 9.76 s; sampled overflight roof clearance 0.892 m; actual impulse 82.011 kN·s; 5.6 s and 42.989 kN·s remain. Ground braking also works. The 8 m variant remained rejected and recorded ground contact (superseded in v0.9: a faster climb now clears it). Low-resource cases remain denied. The recreation sequence retains its previous outcome.

Verification: 60 automated tests, all 12 public combinations across five seeds, timestep convergence and unchanged matched external traffic. Clearance is a synthetic buffer, not a validated safety standard. Search is bounded and script-conditioned; attitude and plume physics remain unresolved.
