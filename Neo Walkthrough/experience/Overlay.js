import * as THREE from './three.js/three.module.js'

export class Overlay {
    /**
     * @param { THREE.Camera } camera - The camera
     * @param { THREE.WebGLRenderer } renderer - The renderer
     */
    constructor(camera, renderer) {
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
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: default;
                padding: 20px;
                border-radius: 5px;
                transition: opacity .5s;
            }
        `;  
        document.head.appendChild(style);

        this.camera = camera;

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
        view.camera = this.camera;
        view.addEventListener('enabled', () => {
            for(let i = 0; i < this.views.length; i++) {
                if(this.views[i] !== view) {
                    console.log(this.views[i]);
                    this.views[i].control.enabled = false;
                }
            }
        })
    }
    add(obj) {
        if(obj instanceof Selector) this.addSelector(obj);
        if(obj instanceof Hotspot) this.addHotspot(obj);
        if(obj instanceof View) this.addView(obj);
    }
}

export class Option {
    /**
     * @param { string } name - The name of the option
     * @param { string } image - A string specifying the CSS background of the option (ie. "#ff0000", "url(myurl.jpg)"", etc…)
     * @param { Object } [options] - Optional parameters
     * @param { Function } [options.onSelected] - The function to run when the option is selected. Function should accept the object being edited as input. Defaults to a function that applies the specified image to the model
     * @param { Function } [options.onDeselected] - The function to run when the option is deselected. Function should accept the object being edited as input
     */
    constructor(name, image, options) { // i think we may need an onDeselected
        this.name = name; // name of the option
        this.image = image;
        options = options || {}
        this.onSelected = options.onSelected || this.getDefaultFunction(image); // the function to be run when selected, accepting a mesh as input (this allows for options to be reused by different meshes)
        this.onDeselected = options.onDeselected;
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
        // The default function takes an object as an input and adjusts either the color or texture of that object depending on what was input in the image parameter
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
        } else {
            // Throw error, invalid image for default function
        }
    }
}
export class Selector {
    /**
     * @param { THREE.Object3D } object - The object to which the options apply
     * @param { Number } distance - The maximum distance the user can be from the target object at which the selector will display
     * @param { Option[] } [options] - The array of options this selector provides
     */
    constructor(object, distance, options) {
        this.object = object; 
        this.distance = distance; 

        this.elem = document.createElement('div');
        this.elem.className = 'tab';
        this.optionElem = document.createElement('div');
        this.optionElem.className = 'options';
        this.elem.append(this.optionElem);
        
        this.options = []; // an array of option objects
        if(options) {
            this.addOptions(options);
        }
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
            Array.from(this.optionElem.children).forEach(child => {
                if(child !== option) { 
                    Option.makeInactive(child);
                    if(child.onDeselected) child.onDeselected(this.object);
                }
            });
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
    /**
     * @param { THREE.Vector3 } position - The position of the hotspot
     * @param { boolean } content - The content of the hotspot
     * @param { Object } [options] - Optional parameters
     * @param { Number } [options.distance] - The maximum distance the user can be from the hotspot at which it will render
     * @param { Function } [options.onClick] - The function that will be triggered when the hotspot is clicked
     */
    constructor(position, content, options ) {
        this.position = position;
        this.content = content;
        this.distance = options.distance;

        this.elem = document.createElement('div');
        this.elem.className = 'hotspot';
        this.elem.innerHTML = content;
        if(options.onClick) this.elem.onclick = options.onClick;
    }
    update(camera, renderer) {
        if(!this.distance || camera.position.distanceTo(this.position) < this.distance) {
            this.elem.style.opacity = '1';
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
        } else {
            this.elem.style.opacity = '0';
        }
    }
}

export class View extends THREE.EventDispatcher { 
    /**
     * @param { string } name - The name of the view
     * @param { THREE.Vector3 } position - The position of the view
     * @param { Object } [options] - Optional parameters
     * @param { THREE.Vector3 } [options.target] - The target of the camera at that view (good for orbit controls, setting the target to the orbit controls target for a natural transition)
     * @param { Object } [options.control] - The active control at this view (ie. User, Orbit Controls, etc...). Note, whatever control is used must have a boolean parameter "enabled" in order for this to work. If your control has something different, consider adding such a parameter. If your control becomes enabled and disabled via a function, adding an "enable" setter to your control that calls said function based on the input boolean can be an effective strategy for making your control work.
     */
    constructor(name, position, options) {
        super();
        this.name = name;
        this.position = position;
        this.target = options.target;
        this.control = options.control;
        this.camera = null;

        this.elem = document.createElement('div');
        this.elem.innerHTML = name;
        this.elem.addEventListener('click', () => {
            this.onClick();
        })
    }
    onClick() {
        this.camera.teleport(this.position, this.target);
        if(this.control) {
            this.control.enabled = true;
            this.dispatchEvent({type: 'enabled'});
        }
    }
}