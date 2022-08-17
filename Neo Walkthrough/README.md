TODO:
1. Overlay:
   1. Implement a texture changing Option. (seems simple but I believe it requires a uv mapped model? Still need to learn more)
   2. Come up with and implement some natural way to add custom styling to the overlay.
   3. Hotspots probably need something in the 3D world to be connected to.
2. Pointer Lock Controls sometimes doesn't stay where it is moved to (seems correlated to lag).
3. Now the current position detector doesn't work on the office model :(

LONGTERM:
1. Better styling
2. Rethink constructors: Object based? A mix?
3. Documentation, comments, etc...


I think it makes more sense to make it separate, user can extend pointer controls and the other option is just to use orbit controls. the enabled boolean can control user as well. We can make it easy to switch between controls in the view selector.
With this in mind, one adjustment is needed. Teleport will need to be a function of the camera, not the user. Triggering the camera's teleportation will occur in the user as well as the views panel.

PLayer Motion
Collisions
Model Loading
Teleporting
Overlay
- Views
- Clickable Hotspots
- Object Editor

I think the immediate projects should be the following:
1. Adjusting constructors to accept objects if they have any optional parameters or if they have 3 or more parameters
2. Adjust classes to use this. for methods and not for any variables except when needed
3. Documentation and comments

I think a good approach might be to start writing documentation so that as I go I'll see inconsistencies and know what to adjust to clean it up. I can add comments as I go as well to really help with that