MRI Defender: Zone IV Safety Simulator
​MRI Defender is a high-stakes clinical safety training module designed to simulate the dangers of ferromagnetic projectiles in a 3.0 Tesla MRI environment. Users must identify and neutralize non-MR-safe objects before they reach the scanner's isocenter.
​🏥 Clinical Context
​This simulator is based on the American College of Radiology (ACR) safety guidelines:
​Zone IV Monitoring: The game takes place entirely within Zone IV, the room containing the MRI scanner where the static magnetic field is always active.
​The Missile Effect: Ferromagnetic objects like oxygen tanks and steel wheelchairs become high-velocity projectiles when brought near the bore.
​Magnetic Quench: If an object impacts the gantry, the system simulates a "Quench"—the rapid venting of liquid helium to shut down the magnetic field.
​🚀 Features
​Procedural Fracture Engine: Objects do not just disappear; they fracture and shake upon impact, requiring multiple "pulses" to neutralize.
​Tesla-Scaled Difficulty: As the score increases, the "Tesla" field strength rises, increasing the gravitational pull on hazards.
​Incident Logging: Every neutralized hazard is logged in a post-scan debrief, providing clinical "lore" and safety facts.
​CRT Aesthetics: Designed with a scanline overlay and motion ghosting to mimic medical monitoring hardware.
​🛠️ Technical Stack
​Language: Vanilla JavaScript (ES6+)
​Rendering: HTML5 Canvas API
​Mobile Support: TouchEvent API with Haptic Feedback (Vibration API)
​Architecture: State-based game loop with object-oriented projectile management.
​🕹️ How to Play
​Initialize: Tap the screen to energize the magnetic field.
​Neutralize: Tap falling objects to hit them with a magnetic pulse.
​Small items (Scissors) take 1 hit.
​Large items (Wheelchairs) take 5-6 hits.
​Monitor: Do not let any item touch the green gantry at the bottom.
​Debrief: If a Quench occurs, read the Incident Summary to learn about the hazards you encountered.
​📜 Disclaimer
​This is an educational simulation. It is intended to raise awareness about MRI safety and should not replace formal ACR safety training or hospital-mandated protocols.
