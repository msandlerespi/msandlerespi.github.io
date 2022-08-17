import { TWEEN } from './three.js/libs/tween.module.min.js'
import { Vector3 } from './three.js/three.module.js';

export function teleport(position, target, time) {
    time = time || 2000;
    new TWEEN.Tween(this.position)
        .to(position, time)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
    if(target) {
        this.target = (new Vector3( 0, 0, -1 )).applyQuaternion( this.quaternion ).add( this.position );
        new TWEEN.Tween(this.target)
        .to(target, time)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => { this.target = false; })
        .start()
    }
}
export function teleportUpdate(time) {
    time = time || performance.now();
    TWEEN.update(time);
    if(TWEEN.getAll().length === 0) {
        this.teleporting = false;
    } else {
        this.teleporting = true;
    }
    if(this.target) {
        this.lookAt(this.target);
    }
}