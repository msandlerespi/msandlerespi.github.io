import * as THREE from './three.js/three.module.js'


export class Overlay {
    constructor(renderer) {
        let style = document.createElement('style');
        style.textContent = `
            body {
                overflow: hidden;
            }
            #overlay {
                background: #999;
                position: absolute;
                bottom: 50px;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                max-width: 1500px;
                height: 150px;
                border-radius: 0 20px 20px 20px;
                font-size: 0px;
                z-index: 50;
            }
            
            .tab {
                width: 12.5%;
                height: 150px;
                display: inline-block;
                margin: 0;
                font-size: 20px;
            }
            .tab.active > * {
                z-index: 100000;
            }
            .tab::after {
                content: '';
                width: 12.5%;
                height: 30px;
                background: #777;
                position: absolute;
                transform: translateY(-100%);
                border-radius: 20px 20px 0 0;
            }
            .tab.active::after {
                background: #999;
            }
            .tab:not(.active):hover::after {
                background: #888;
            }

            .options {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                height: 100%;
                background: #999;
                border-radius: 20px 20px 20px 20px;
            }
            .option {
                width: 100px;
                height: 100px;
                border-radius: 20px;
                background: white;
                display: inline-block;
                border: 3px solid white;
                margin: 25px 0px 25px 10px;
            }
            .option.active {
                border: 3px solid yellow;
            }

            .hotspot {
                background: lightgray;
                opacity: 50%;
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: default;
                padding: 20px;
                border-radius: 5px;
            }
            .hotspot:hover {
                opacity: 100%;
            }
        `;  
        document.head.appendChild(style);

        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay';
        document.body.appendChild(this.overlay);

        this.selectors = [];
        this.tabs = [];
    }
    update(camera) {
        this.selectors.forEach(selector => {
            if(!selector.object.geometry.boundingSphere) selector.object.geometry.computeBoundingSphere();
            let v = selector.object.geometry.boundingSphere.center.clone();
            
            if(v.distanceTo(camera.position) < selector.distance) {
                v.project(camera);
                if(v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1 && v.z > 0 && v.z < 1) {
                    selector.add();
                } else selector.remove();
            } else selector.remove();
        });
        if(this.overlay.children.length > 0) this.overlay.style.display = '';
        else this.overlay.style.display = 'none';
    }
}

export class Option {
    constructor(name, image, onSelected) {
        this.name = name; // name of the option
        this.image = image;
        this.onSelected = onSelected || this.getDefaultFunction(image); // the function to be run when selected, accepting a mesh as input (this allows for options to be reused by different meshes)

        this.elem = document.createElement('div');
        this.elem.className = 'option';
        this.elem.style.background = image;
    }
    clone() {
        return new Option(this.name, this.image, this.onSelected, this.active);
    }
    makeActive() {
        this.elem.className = 'option active';
    }
    makeInactive() {
        this.elem.className = 'option';
    }
    getDefaultFunction(image) {
        // The default function takes an object as an input, and adjusts either the color or texture of that object depending on what was input in the image category
        if(image.substring(0, 4) === 'url(') {
            let url = image.substring(4, image.length - 1);
            let loader = new THREE.TextureLoader();
            let texture = loader.load(url);
            return (obj) => {
                obj.material.map = texture;
            }
        } else if(image[0] === '#' || image.substring(0, 3) === 'rgb' || image.substring(0, 3) === 'hsl') {
            let color = new THREE.Color(image);
            return (obj) => {
                obj.material.color = color;
            }
        }
    }
}
export class Selector {
    constructor(options, object, distance, overlay) {
        this.options = options; // an array of option objects
        this.options[0].makeActive();
        this.object = object; // the object to which the options apply
        this.distance = distance; // the radius from the object within which this selector tab should be usable

        this.elem = document.createElement('div');
        this.elem.className = 'tab';
        this.overlay = overlay;
        this.overlay.selectors.push(this);
        this.elem.addEventListener('click', e => {
            this.overlay.tabs.forEach(tab => {
                if(tab.elem === this.elem) {
                    tab.makeActive();
                } else {
                    tab.makeInactive();
                }
            })
        });
        let o = document.createElement('div');
        o.className = 'options';
        this.elem.append(o)
        for(let i = 0; i < options.length; i++) {
            let clickedOption = options[i];
            o.append(clickedOption.elem);
            clickedOption.elem.addEventListener('click', e => {
                for(let j = 0; j < options.length; j++) {
                    let option = options[j];
                    if(option.elem === clickedOption.elem) {
                        option.makeActive();
                        option.onSelected(object);
                    } else {
                        option.makeInactive();
                    }
                }
            });
        }


    }
    add() {
        if(this.overlay.tabs.indexOf(this) === -1) {
            if(this.overlay.tabs.length === 0) {
                this.makeActive();
            } else {
                this.makeInactive();
            }
            this.overlay.tabs.push(this);
            overlay.append(this.elem);
        }
    }
    remove() {
        let index = this.overlay.tabs.indexOf(this);
        if(index !== -1) {
            this.overlay.tabs.splice(index, 1);
            this.elem.remove();
            if(this.overlay.tabs.length > 0 && this.elem.className.includes('active')) {
                this.overlay.tabs[this.overlay.tabs.length - 1].elem.className = 'tab active';
            }
        }
    }
    makeActive() {
        this.elem.className = 'tab active';
    }
    makeInactive() {
        this.elem.className = 'tab';
    }
}

export class Hotspot {
    constructor(position, radius, content) {
        this.position = position;
        this.radius = radius;
        this.content = content;

        this.elem = document.createElement('div');
        this.elem.className = 'hotspot';
        this.elem.innerHTML = content;
        document.body.append(this.elem);
    }
    update(renderer, camera) {
        let canvas = renderer.domElement;
        let screenPosition = this.position.clone().project(camera);
        screenPosition.x = Math.round((0.5 + screenPosition.x / 2) * (canvas.width / window.devicePixelRatio));
        screenPosition.y = Math.round((0.5 - screenPosition.y / 2) * (canvas.height / window.devicePixelRatio));

        if(screenPosition.z < 1 && screenPosition.z > 0) {
            this.elem.style.left = screenPosition.x + 'px';
            this.elem.style.top = screenPosition.y + 'px';
        } else {
            this.elem.style.left = '100000px';
        }
    }
}