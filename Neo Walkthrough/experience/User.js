import * as THREE from './three.js/three.module.js'
import { PointerLockControls } from './three.js/controls/PointerLockControls.js'

export default class User extends PointerLockControls {
    /**
     * @param { THREE.Camera } camera - The camera, now the user object
     * @param { THREE.WebGLRenderer } renderer - The renderer
     * @param { Object } [options] - Optional parameters
     * @param { boolean } [options.enableCollisions=false] - Whether or not to calculate collisions
     * @param { THREE.Object3D[] } [options.colliders] - Array of objects with which the player should collide
     * @param { Number } [options.collisionRayCount=4] - The number of rays with which to calculate collisions (more rays = more accurate collisions at the expense of intensive computation)
     * @param { Number } [options.radius=0.2] - The radius of the user, at what point they should collide with objects
     * @param { Number } [options.speed=10] - The speed at which the user moves
     * @param { Number } [options.height=1.5] - The height of the user
     * @param { boolean } [options.enabled=true] - Whether or not the controls are enabled
     */
    constructor(camera, renderer, options) {
        super( camera, renderer.domElement );

        this.enableCollisions = options.enableCollisions;
        this.colliders = options.colliders;
        this.radius = options.radius || 0.2;
        this.speed = options.speed || 10;
        this.collisionRayCount = options.collisionRayCount || 4;
        this.height = options.height || 1.5

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
        this.mouseDownElem = renderer.domElement;

        camera.near = this.radius;

        let looked = false;
        let bufferStart = 3;
        let buffer = bufferStart;
        
        this.onMouseDown = () => {
            console.log('clicked');
            looked = false;
            buffer = bufferStart;
            this.lock();
        };
        this.onMouseMove = () => {
            if(buffer) buffer--;
            else looked = true;
        };
        this.onMouseUp = (event) => {
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
                    this.getObject().teleport(newPos);
                }
            }
            looked = false;
            this.unlock();
        };

        this.onKeyDown = ( event ) => {
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
        }
        this.onKeyUp = (event) => {
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
        }
        this.onVisibilityChange = () => {
            if(document.visibilityState === 'hidden') {
                this.velocity.x = 0;
                this.velocity.z = 0;
                this.movingForward = false;
                this.movingBackward = false;
                this.movingLeft = false;
                this.movingRight = false;
            }
        }
        document.addEventListener('keydown', this.onKeyDown); // could need to be window.add...
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.mouseDownElem.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        
        if(options.enabled === false) this.enabled = false;

        return this;
    }

    set height(h) {
        this.getObject().position.y = h;
    }
    get height() {
        return this.getObject().position.y;
    }
    set enabled(bool) {
        if(bool) {
            this.userConnect();
        } else {
            this.userDisconnect();
        }
    }
    userConnect() {
        this.userDisconnect(); // maybe not necessary but nice regardless, prevents duplicates
        this.connect();
        document.addEventListener('keydown', this.onKeyDown); // could need to be window.add...
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('visibilitychange', this.onVisibilityChange);

        this.mouseDownElem.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }
    userDisconnect() {
        this.disconnect();
        document.removeEventListener('keydown', this.onKeyDown); 
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);

        this.mouseDownElem.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        
        console.log(document);
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.movingForward = false;
        this.movingBackward = false;
        this.movingLeft = false;
        this.movingRight = false;
    }
    collide() {
        if(this.enableCollisions && !this.getObject().teleporting) {
            let position = this.getObject().position;
            let maxShift = [0, new THREE.Vector3(0, 0, 0)];
            for(let i = -Math.PI; i < Math.PI; i += 2*Math.PI/this.collisionRayCount) {
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

        this.velocity.x -= this.velocity.x * 5.0 * delta;
        this.velocity.z -= this.velocity.z * 5.0 * delta;

        this.direction.z = Number( this.movingForward ) - Number( this.movingBackward );
        this.direction.x = Number( this.movingRight ) - Number( this.movingLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.movingForward || this.movingBackward ) this.velocity.z -= this.direction.z * this.speed * delta;
        if ( this.movingLeft || this.movingRight ) this.velocity.x -= this.direction.x * this.speed * delta;

        if(!this.getObject().teleporting) {
            this.moveRight( Math.min(Math.max(- this.velocity.x * delta, -this.radius), this.radius) );
            this.moveForward( Math.min(Math.max(- this.velocity.z * delta, -this.radius), this.radius) );
        }
    }
    update(time) {
        time = time || performance.now();

        let delta = ( time - this.prevTime ) / 1000;
        this.move(delta);
        this.collide();
        this.prevTime = time;
    }
}


// TODO: Make it so that the user object has a position that is intrinsically linked to the position of the camera. Then use that for position adjustments