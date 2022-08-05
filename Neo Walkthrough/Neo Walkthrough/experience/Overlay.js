import * as THREE from './three.js/three.module.js'

// so we need a div called overlay. in it should be a div called selectors, a div called hotspots, and a div called views.
// we should add selectors to the overlay and options to the selectors. Options should not be a part of the selector constructor tbh
// we should add hotspots to the overlay
// we should add views to the overlay
// the overlay should take care of getting elements where they belong. Perhaps the overlay could be responsible for generating all html (which could help with the issue of wanting reusable options, since each option would not store an html element)
// i think selectors should have an update function that checks distance that can be called by the overlay update function
export class Overlay {
    constructor(renderer, user) {
        let style = document.createElement('style');
        style.textContent = `
            #overlay {
                width: ${renderer.domElement.width}px;
                height: ${renderer.domElement.height}px;
                position: absolute;
                top: ${renderer.domElement.getBoundingClientRect().top}px;
                left: ${renderer.domElement.getBoundingClientRect().left}px;
                pointer-events: none;
            }
            #overlay > * {
                pointer-events: auto;
            }
            #hotspots {
                width: 100%;
                height: 100%;
                position: absolute;
                overflow: hidden;
                pointer-events: none;
            }
            #hotspots > * {
                pointer-events: auto;
            }
            #views {
                position: absolute;
                top: 100px;
                right: 100px;
                background: #999;
                width: 100px;
                min-height: 100px;
            }
            #views > div {
                cursor: pointer;
                width: 100%;
                text-align: center;
                background: #999;
            }
            #views > div:hover {
                background: #ccc;
            }
            #selectors {
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

        this.user = user;

        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay';
        document.body.appendChild(this.overlay);

        this.selectorElem = document.createElement('div');
        this.selectorElem.id = 'selectors';
        overlay.appendChild(this.selectorElem);

        this.hotspotElem = document.createElement('div');
        this.hotspotElem.id = 'hotspots';
        overlay.appendChild(this.hotspotElem);

        this.viewElem = document.createElement('div');
        this.viewElem.id = 'views';
        overlay.appendChild(this.viewElem);

        this.selectors = [];
        this.tabs = []; // active selectors
        
        this.hotspots = [];
        
        this.views = [];
    }
    update(camera, renderer) {
        this.selectors.forEach(selector => {
            if(!selector.object.geometry.boundingSphere) selector.object.geometry.computeBoundingSphere();
            let v = selector.object.geometry.boundingSphere.center.clone();
            
            if(camera.alt) {
                v = new THREE.Vector3();
                selector.object.getWorldPosition(v);
            }
            console.log(v.distanceTo(camera.position));
            
            if(v.distanceTo(camera.position) < selector.distance) {
                v.project(camera);
                if(v.x > -1 && v.x < 1 && v.y > -1 && v.y < 1 && v.z > 0 && v.z < 1) {
                    this.showSelector(selector);
                } else this.hideSelector(selector);
            } else this.hideSelector(selector);
        });
        if(this.tabs.length > 0) this.selectorElem.style.display = '';
        else this.selectorElem.style.display = 'none';
        this.hotspots.forEach(hotspot => {
            hotspot.update(camera, renderer);
        })
    }
    addSelector(selector) {
        this.selectors.push(selector);
        this.selectorElem.append(selector.elem);
    }
    showSelector(selector) {
        if(!this.selectors.includes(selector)) return "invalid selector";
        if(this.tabs.indexOf(selector) === -1) {
            console.log(this.tabs);
            if(this.tabs.length === 0) selector.makeActive();
            else selector.makeInactive();
            this.tabs.push(selector);
            this.selectorElem.append(selector.elem);
        }
    }
    hideSelector(selector) {
        if(!this.selectors.includes(selector)) return "invalid selector";
        let index = this.tabs.indexOf(selector);
        if(index !== -1) {
            this.tabs.splice(index, 1);
            selector.elem.remove();
            if(this.tabs.length > 0 && selector.elem.className.includes('active')) {
                this.tabs[this.tabs.length - 1].makeActive();
            }
        }
    }
    addHotspot(hotspot) {
        this.hotspots.push(hotspot);
        this.hotspotElem.append(hotspot.elem);
    }
    addView(view) {
        this.views.push(view);
        this.viewElem.append(view.elem);
        view.user = this.user;
    }
}

export class Option {
    constructor(name, image, onSelected) { // i think we may need an onDeselected
        this.name = name; // name of the option
        this.image = image;
        this.onSelected = onSelected || this.getDefaultFunction(image); // the function to be run when selected, accepting a mesh as input (this allows for options to be reused by different meshes)
    }
    clone() {
        return new Option(this.name, this.image, this.onSelected, this.active);
    }
    static makeActive(elem) {
        elem.className = 'option active';
    }
    static makeInactive(elem) {
        elem.className = 'option';
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
    constructor(object, distance) {
        this.options = []; // an array of option objects
        this.object = object; // the object to which the options apply
        this.distance = distance; // the radius from the object within which this selector tab should be usable

        this.elem = document.createElement('div');
        this.elem.className = 'tab';
        this.optionElem = document.createElement('div');
        this.optionElem.className = 'options';
        this.elem.append(this.optionElem);
    }
    addOption(option) {
        this.options.push(option);

        let elem = document.createElement('div');
        elem.className = 'option';
        elem.name = option.name;
        elem.style.background = option.image;
        this.optionElem.append(elem);
        if(this.options.length === 1) {
            Option.makeActive(elem);
        }

        elem.addEventListener('click', () => {
            Array.from(this.optionElem.children).forEach(child => { Option.makeInactive(child) });
            Option.makeActive(elem);
            option.onSelected(this.object);
        })
    }
    addOptions(options) {
        options.forEach(o => {
            this.addOption(o);
        })
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
    }
    update(camera, renderer) {
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

export class View { // in the future we may want this to have more options like control type (if you want an outside view of the building with orbit controls or something).
    constructor(name, position) {
        this.name = name;
        this.position = position;
        this.user = null;

        this.elem = document.createElement('div');
        this.elem.innerHTML = name;
        this.elem.addEventListener('click', () => {
            this.onClick(this.user);
        })
    }
    onClick(user) {
        user.teleport(this.position);
    }
}