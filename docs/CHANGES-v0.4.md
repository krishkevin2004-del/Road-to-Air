# v0.4 — close observation across all scenarios

The supplied screenshot showed that the network framing made vehicles and landing geometry too small. The narrative now uses an ego-centered maneuver camera with bounded lookahead. Experiments default to a closer Follow camera. The original wider Network camera remains selectable. Presentation magnification is adjustable from 65% to 200%, with a reset control. Camera framing never changes the trajectory, traffic or resources.

All seven presets have scenario-specific context panels. Key-moment buttons come from the selected replay: approval, denial, cut-in, touchdown, ground response and failure, where present. The full event trace remains available. Speed and altitude are visible over the scene. Roadster and hazard labels are larger, and map overlays have stronger contrast. Scenery placement uses final jittered tree coordinates, with road margins, preventing decorative crowns from covering the lanes.

42 automated checks pass, including two camera checks for increased observation scale, bounded zoom and replay immutability. Browser checks exercised all seven presets, their context panels and event shortcuts; 390 px mobile width has no horizontal overflow. Existing failure and denied-departure outputs are retained. The numerical core, evidence register, vehicle configuration and B1 assumptions are unchanged.

The model remains a synthetic point-mass study. Closer presentation does not add attitude dynamics, pressure thermodynamics, calibrated drivers or real-world safety validation. Close views deliberately crop distant context; switch to Network when full-road context is needed.
