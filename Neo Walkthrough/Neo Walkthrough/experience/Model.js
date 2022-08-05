import { FBXLoader } from './three.js/loaders/FBXLoader.js'
import { GLTFLoader } from './three.js/loaders/GLTFLoader.js'
import { OBJLoader } from './three.js/loaders/OBJLoader.js'
import { DRACOLoader } from './three.js/loaders/DRACOLoader.js'
import { ColladaLoader } from './three.js/loaders/ColladaLoader.js'
import * as THREE from './three.js/three.module.js'

export default class Model extends THREE.EventDispatcher {
    /**
     * @param { Object } scene - The ThreeJS scene
     * @param { string } path - The file path of the model
     * @param { string } type - The file type of the model
     * @param { Object } [options] - optional parameters
     * @param { boolean } [options.shadows=false] - Whether or not to make the model cast and recieve shadows; defaults to false
     */
    constructor(scene, path, type, options) {
        super();
        let loader;
        switch(type) {
            case 'fbx':
            case 'FBX':
                loader = new FBXLoader();
                break
            case 'gltf':
            case 'glb':
            case 'GLTF':
            case 'GLB':
                loader = new GLTFLoader()
                break
            case 'obj':
            case 'OBJ':
                loader = new OBJLoader()
                break
            case 'draco':
            case 'DRACO':
                loader = new DRACOLoader()
                break
            case 'collada':
            case 'COLLADA':
                loader = new ColladaLoader()
                break
            default:
                return "Invalid file type. Please input one of the following file types: FBX, GLTF, OBJ, DRACO, COLLADA"
        }

        loader.load(path, model => {
            if(model.scene) model = model.scene
            
            model.name = 'model';
            scene.add(model)

            if(!options.shadows) options.shadows = false
            model.traverse(mesh => {
                if(mesh.isMesh) {
                    mesh.castShadows = options.shadows
                    mesh.receiveShadows = options.shadows
                    mesh.geometry.computeBoundsTree();
                }
            })

            this.model = model

            this.dispatchEvent({type: 'loaded'})
        })
        
        return this;
    }
}