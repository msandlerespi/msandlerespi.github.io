import * as THREE from './three.js/three.module.js'
import { PointerLockControls } from './three.js/controls/PointerLockControls.js'
import { TWEEN } from './three.js/libs/tween.module.min.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'https://cdn.skypack.dev/three-mesh-bvh';

// THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
// THREE.Mesh.prototype.raycast = acceleratedRaycast;

export default class User extends PointerLockControls {
    constructor(camera, renderer, colliders) {
        super( camera, document.body );

        this.colliders = colliders;
        this.raycaster = new THREE.Raycaster();
        this.collisionRay = new THREE.Raycaster();
        this.collisionRay.firstHitOnly = true;
        this.pointer = new THREE.Vector2();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.movingForward = false;
        this.movingBackward = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.prevTime = 0;
        this.radius = .2;
        this.speed = 10;

        let looked = false;
        let bufferStart = 3;
        let buffer = bufferStart;
        
        renderer.domElement.addEventListener( 'mousedown', () => {
            looked = false;
            buffer = bufferStart;
            this.lock();
        } );
        document.addEventListener('mousemove', () => {
            if(buffer) buffer--;
            else looked = true;
        });
        document.addEventListener( 'mouseup', event => {
            if(!looked) {
                // teleport functionality
                let x = ( event.clientX / window.innerWidth ) * 2 - 1;
                let y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                this.pointer.set(x, y);
                this.raycaster.setFromCamera( this.pointer, this.getObject() );
                const intersects = this.raycaster.intersectObjects( this.colliders ); // this should be intersecting only the floor objects
                if(intersects.length > 0) {
                    let newPos = intersects[0].point.clone();
                    console.log(intersects[0]);
                    newPos.y = this.getObject().position.y;
                    newPos.lerp(this.getObject().position, (1 / newPos.distanceTo(this.getObject().position)) * this.radius);
                    this.teleport(newPos);
                }
            }
            looked = false;
            this.unlock();
        } );

        window.addEventListener('keydown', event => {

            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    this.movingForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.movingLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.movingBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.movingRight = true;
                    break;
            }

        });
        window.addEventListener('keyup', event => {
            switch ( event.code ) {

                case 'ArrowUp':
                case 'KeyW':
                    this.movingForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    this.movingLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    this.movingBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    this.movingRight = false;
                    break;

            }

        });
        document.addEventListener('visibilitychange', () => {
            if(document.visibilityState === 'hidden') {
                this.velocity.x = 0;
                this.velocity.z = 0;
                this.movingForward = false;
                this.movingBackward = false;
                this.movingLeft = false;
                this.movingRight = false;
            }
        });

        return this;
    }

    initBVH() {

        let int = setInterval(() => {
            for(let i = 0; i < this.colliders.length; i++) {
                if(this.colliders[i].name === 'model') {
                    this.colliders[i].traverse(c => {
                        c.geometry.computeBoundsTree();
                    });
                    clearInterval(int);
                }
            }
        }, 50)
    }

    set height(h) {
        this.getObject().position.y = h;
    }

    teleport(newPos) {
        let tpTime = 2000;
        new TWEEN.Tween(this.getObject().position)
            .to(newPos, tpTime)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
    }
    collide() {
        if(TWEEN.getAll().length === 0) {
            let position = this.getObject().position;
            let maxShift = [0, new THREE.Vector3(0, 0, 0)];
            for(let i = -Math.PI; i < Math.PI; i += Math.PI/8) {
                let end = new THREE.Vector3(Math.sin(i), 0, Math.cos(i));
                this.collisionRay.set(position, end);
                let collisions = this.collisionRay.intersectObjects(this.colliders); 
                if(collisions.length > 0 && collisions[0].distance < this.radius) {
                    let shift = this.radius - collisions[0].distance
                    if(shift > maxShift[0]) {
                        maxShift[0] = shift;
                        maxShift[1] = end;
                    }
                }
            }
            this.getObject().position.x -= maxShift[0] * maxShift[1].x;
            this.getObject().position.z -= maxShift[0] * maxShift[1].z;
        }
    }
    move(delta) {
        delta = delta < this.radius / (2 * this.speed) ? delta : this.radius / 2;

        this.velocity.x -= this.velocity.x * 5.0 * delta;
        this.velocity.z -= this.velocity.z * 5.0 * delta;

        this.direction.z = Number( this.movingForward ) - Number( this.movingBackward );
        this.direction.x = Number( this.movingRight ) - Number( this.movingLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.movingForward || this.movingBackward ) this.velocity.z -= this.direction.z * this.speed * delta;
        if ( this.movingLeft || this.movingRight ) this.velocity.x -= this.direction.x * this.speed * delta;

        this.moveRight( - this.velocity.x * delta );
        this.moveForward( - this.velocity.z * delta );
    }
    update(time) {
        time = time || performance.now();
        TWEEN.update(time); // unusual if tween is used elsewhere, but this is unexpected

        let delta = ( time - this.prevTime ) / 1000;
        this.move(delta);
        this.collide();
        this.prevTime = time;
    }
}


// TODO: Make it so that the user object has a position that is intrinsically linked to the position of the camera. Then use that for position adjustments