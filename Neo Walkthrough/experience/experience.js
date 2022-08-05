import * as THREE from './three.js/three.module.js'
import Model from './Model.js'
import User from './User.js'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'https://cdn.skypack.dev/three-mesh-bvh';
import { Overlay, Option, Selector, Hotspot, View } from './Overlay.js'
import { GUI } from './three.js/libs/lil-gui.module.min.js';

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

    model = new Model(scene, './experience/assets/models/furnished_suburban_house/scene.glb', 'GLTF', { shadows: true });
    // model = new Model(scene, './experience/assets/models/furnished_suburban_house/scene.gltf', 'GLTF', { shadows: true });
    // model = new Model(scene, './experience/assets/models/modern_office_interior/scene.gltf', 'GLTF', { shadows: true });
    // camera.alt = true; 

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    let d = new THREE.DirectionalLight(0xffffff, .5);
    d.position.set(1, 1, -1);
    scene.add(d);

    user = new User(camera, renderer, scene.children);
    user.height = 1.5;
    user.speed = 10;
    user.radius = .1;

    overlay = new Overlay(renderer, user);

    model.addEventListener('loaded', () => {

        let option1 = new Option(
            'red', 
            '#ff0000'
        );
        let option2 = new Option(
            'green', 
            '#00ff00'
        );
        let option3 = new Option(
            'blue', 
            '#0000ff',
        );

        // let bin = model.model.getObjectByName("Material2_186", true);
        // bin.material = new THREE.MeshStandardMaterial({color: 0xff0000});
        // let bs = new Selector(bin, 2);
        // bs.addOptions([option1, option2, option3]);
        // overlay.addSelector(bs);
        // let bin2 = model.model.getObjectByName("Material2_132", true);
        // bin2.material = new THREE.MeshStandardMaterial({color: 0xff0000});
        // let bs2 = new Selector(bin2, 2);
        // bs2.addOptions([option1, option2, option3]);
        // overlay.addSelector(bs2);

        let grill = model.model.getObjectByName("Object_98", true);
        grill.material = new THREE.MeshStandardMaterial({color: 0xff0000});
        let selector = new Selector(grill, 2);
        selector.addOptions([option1, option2, option3]);
        overlay.addSelector(selector);

        let hotspot = new Hotspot(new THREE.Vector3(0, 1.5, 0), 0, "this is the starting position");
        overlay.addHotspot(hotspot);
    })

    let view = new View('start', new THREE.Vector3(0, 1.5, 0));
    overlay.addView(view);
    
    let gui = new GUI();
    gui.add(user, 'rayCollisionCount', 4, 128, 2);

}

function animate() {
    requestAnimationFrame( animate );

    overlay.update(camera, renderer);
    user.update();

    renderer.render( scene, camera );
    // console.log( renderer.info.render.triangles );
}