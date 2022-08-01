import * as THREE from './three.js/three.module.js'
import Model from './Model.js'
import User from './User.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'https://cdn.skypack.dev/three-mesh-bvh';
import { Option, Selector, Overlay } from './Overlay.js'

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

let scene, camera, renderer;
let model, user, overlay;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // model = new Model(scene, './experience/assets/models/furnished_suburban_house/scene.gltf', 'GLTF', { shadows: true });
    model = new Model(scene, './experience/assets/models/modern_office_interior/scene.gltf', 'GLTF', { shadows: true });
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    let d = new THREE.DirectionalLight(0xffffff, .5);
    d.position.set(1, 1, -1);
    scene.add(d);

    overlay = new Overlay();

    setTimeout(() => {
        let option1 = new Option(
            'red', 
            '#ff0000', 
            (obj) => {
                obj.material.color.set(0xff0000)
            }, 
            true
        );
        let option2 = new Option(
            'green', 
            '#00ff00', 
            (obj) => {
                obj.material.color.set(0x00ff00)
            }
        );
        let option3 = new Option(
            'blue', 
            '#0000ff', 
            (obj) => {
                obj.material.color.set(0x0000ff)
            }
        );
        let bin = model.model.getObjectByName("Material2_186", true);
        bin.material = new THREE.MeshStandardMaterial({color: 0xff0000});
        let selector = new Selector([option1, option2, option3], bin, 2, overlay);
        // let bin2 = model.model.getObjectByName("Material2_132", true);
        // bin2.material = new THREE.MeshStandardMaterial({color: 0xff0000});
        // let selector2 = new Selector([option1, option2, option3], bin2, 2, overlay);
        
    }, 10000);

    user = new User(camera, renderer, scene.children);
    user.height = 1.5;
    user.speed = 4;
    user.radius = .1;

}

function animate() {
    requestAnimationFrame( animate );

    overlay.update(camera.position);
    user.update();

    renderer.render( scene, camera );
}