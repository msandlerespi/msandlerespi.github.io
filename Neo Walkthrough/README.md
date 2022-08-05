TODO:
1. Overlay:
   1. Options cannot be reused. Currently your workaround is to add a clone function, but I think it would be preferable to make options truly reusable so that any adjustments would be applied to all selectors using said Option.
   2. Implement a texture changing Option. (seems simple but I believe it requires a uv mapped model? Still need to learn more)
   3. Come up with and implement some natural way to add custom styling to the overlay.
   4. Hotspots probably need something in the 3D world to be connected to.
2. The entire project needs to be contained within a position: relative div. This way we won't get random floating elements from the overlay if this is a nested project.
3. Pointer Lock Controls sometimes doesn't stay where it is moved to (seems correlated to lag).
4. Now the current position detector doesn't work on the office model :(
5. Get rid of add functions for each object on the overlay, just make it one function that figures out the class type

LONGTERM:
1. Better styling
2. Rethink constructors: Object based? A mix?
3. Documentation, comments, etc...

Currently reworking the entire overlay module to make it work more logically and prevent potential future bugs