import * as THREE from './three.js/three.module.js'

export class Option {
    constructor(name, image, onSelected, active) {
        this.name = name; // name of the option
        this.onSelected = onSelected; // the function to be run when selected, accepting a mesh as input (this allows for options to be reused by different meshes)

        this.elem = document.createElement('div');
        this.elem.className = 'option';
        if(active) {
            this.elem.className = 'option active';
        }
        this.elem.style.background = image;
    }
}
export class Selector {
    constructor(options, object, distance, overlay) {
        this.options = options; // an array of option objects
        this.object = object; // the object to which the options apply
        this.distance = distance; // the radius from the object within which this selector tab should be usable

        this.elem = document.createElement('div');
        this.elem.className = 'tab';
        this.overlay = overlay;
        this.overlay.selectors.push(this);
        this.elem.addEventListener('click', e => {
            this.overlay.tabs.forEach(tab => {
                if(tab.elem === this.elem) {
                    tab.elem.className = 'tab active';
                } else {
                    tab.elem.className = 'tab';
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
                        option.elem.classList = 'option active';
                        option.onSelected(object);
                    } else {
                        option.elem.classList = 'option';
                    }
                }
            });
        }


    }
    add() {
        if(this.overlay.tabs.indexOf(this) === -1) {
            if(this.overlay.tabs.length === 0) {
                this.elem.className = 'tab active';
            } else {
                this.elem.className = 'tab';
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
}

export class Overlay {
    constructor() {
        let style = document.createElement('style');
        style.textContent = `
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
        `;
        document.head.appendChild(style);

        this.overlay = document.createElement('div');
        this.overlay.id = 'overlay';
        document.body.appendChild(this.overlay);

        this.selectors = [];
        this.tabs = [];
    }
    update(position) {
        this.selectors.forEach(selector => {
            selector.object.parent.updateWorldMatrix();
            let v = new THREE.Vector3();
            selector.object.getWorldPosition(v)
            
            if(v.distanceTo(position) < selector.distance) {
                selector.add();
            } else {
                selector.remove();
            }
        });
        if(this.overlay.children.length > 0) this.overlay.style.display = '';
        else this.overlay.style.display = 'none';
    }
}