let currentFile;
let projectFiles;
let editingNode;
document.addEventListener('DOMContentLoaded', () => {
    // SETUP
    dragContainer(document.getElementById('container'), document.getElementById('move-container'));

    document.getElementById('add-node').addEventListener('click', () => {
        new Node();
    })
    document.getElementById('mode-line').addEventListener('change', (e) => {
    })

    let detailsPage = document.getElementById('details-page');
    let detailsPageTitle = detailsPage.getElementsByClassName('title')[0];
    let detailsPageDetails = detailsPage.getElementsByClassName('details')[0];
    detailsPageTitle.onchange = () => {
        editingNode.title = detailsPageTitle.value;
    }
    detailsPageDetails.onchange = () => {
        editingNode.details = detailsPageDetails.value;
    }
    document.getElementById('mode-edit').addEventListener('change', () => {
        detailsPageTitle.value = editingNode.title;
        detailsPageDetails.innerHTML = editingNode.details;
        detailsPageDetails.value = editingNode.details;
    })
    
    document.getElementById('mode-move').addEventListener('change', e => {
        Array.from(document.querySelectorAll('.node')).forEach(node => {
            node.classList.remove('selected');
            node.classList.remove('new-select-text');
        })
    })

    if(retrieveObjectFromLocalStorage('autosave')) {
        document.getElementById('auto-save').click();
    }
    document.getElementById('mode-auto-save').addEventListener('change', e => {
        storeObjectInLocalStorage('autosave', e.target.checked);
    })

    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
            event.preventDefault(); // Prevent the default browser save action
            save();
        }
        if (event.ctrlKey && event.key === 'z') {
            console.log('Ctrl + Z was pressed!');
            // Your undo functionality or custom action goes here
        }
    });

    setInterval(autosave, 5000); // Eventually would prefer to do interaction-based autosave but this works for now

    document.getElementById('add-project').addEventListener('click', createNewProject)

    // INITIALIZATION
    if(retrieveObjectFromLocalStorage('projects') !== null) {
        filesObject = retrieveObjectFromLocalStorage('projects');
        projectFiles = filesObject.map(obj => new ProjectFile(obj));
        filesObject.forEach(fileObj => {
            projectFiles.forEach(project => {
                if(project.id === fileObj.project) {
                    project.attachNodes(fileObj);
                }
            })
        })
        currentFile = projectFiles[0];
        currentFile.populate();
        updateProjects();
    } else {
        projectFiles = [];
        createNewProject();
    }
})

// Function to store an object in local storage
function storeObjectInLocalStorage(key, object) {
    try {
        const serializedObject = JSON.stringify(object);
        localStorage.setItem(key, serializedObject);
        console.log('Object stored in local storage successfully.');
    } catch (error) {
        console.error('Error storing object in local storage:', error);
    }
}
function save() {
    storeObjectInLocalStorage('projects', projectFiles.map(file => file.toCompactObj()));
}
function autosave() {
    if(document.getElementById('mode-auto-save').checked) {
        save();
    }
}
// Function to retrieve an object from local storage
function retrieveObjectFromLocalStorage(key) {
    try {
        const serializedObject = localStorage.getItem(key);
        if (serializedObject === null) {
            console.log('No object found in local storage with the provided key.');
            return null;
        }
        const object = JSON.parse(serializedObject);
        console.log('Object retrieved from local storage successfully.');
        return object;
    } catch (error) {
        console.error('Error retrieving object from local storage:', error);
        return null;
    }
}

class Node {
    constructor(obj) {
        this.before = [];
        this.after = [];
        this.elem = this.createElement();
        this.addFunctionalities();
        this.adjustInitialPosition();
        if(obj) {
            this.setId(obj.id);
            this.title = obj.title;
            this.left = obj.left;
            this.top = obj.top;
            this.details = obj.details;
        } else {
            currentFile.nodes[this.id] = this;
            this.details = '';
        }
    }
    get title() {
        return this.elem.children[0].innerHTML;
    }
    set title(string) {
        this.elem.children[0].innerHTML = string;
    }
    get details() {
        return this.elem.dataset.details !== undefined ? this.elem.dataset.details : '';
    }
    set details(string) {
        this.elem.dataset.details = string;
    }
    get id() {
        return this.elem.id;
    }
    set id(string) {
        if(this.elem.id) delete currentFile.nodes[this.elem.id]
        this.elem.id = string;
        currentFile.nodes[string] = this;
    }
    setId(string) {
        this.elem.id = string;
    }
    get left() {
        return this.elem.style.left;
    }
    set left(string) {
        this.elem.style.left = string;
    }
    get top() {
        return this.elem.style.top;
    }
    set top(string) {
        this.elem.style.top = string;
    }
    get completed() {
        return this.elem.classList.contains('complete');
    }
    toCompactObj() {
        return {
            title: this.title,
            id: this.id,
            left: this.left,
            top: this.top,
            details: this.details,
            completed: this.completed,
            before: this.before.map(x => x.id),
            after: this.after.map(x => x.id),
        }
    }
    attachFromObj(obj) {
        if(obj.completed) {
            this.before = obj.before.map(id => currentFile.nodes[id])
            this.after = obj.after.map(id => currentFile.nodes[id])
            this.elem.classList.add('complete');
        } else {
            obj.before.forEach(node => {
                this.addBefore(currentFile.nodes[node]);
            })
        }
    }
    addFunctionalities() {
        dragElement(this.elem, this);
        editTitle(this.elem, this);
        makeModeFunctions(this.elem, this);
    }
    adjustInitialPosition() {
        this.left = parseFloat(this.left) + (Math.sin(document.getElementsByClassName('node').length) * 220) + 'px';
        this.top = parseFloat(this.top) + (Math.cos(document.getElementsByClassName('node').length) * 220) + 'px';
    }
    addBefore(node) {
        this.before.push(node);
        node.addAfter(this);
        noLoops([], this);
    }
    addAfter(node) {
        this.after.push(node);
    }
    removeBefore(node) {
        if(this.before.indexOf(node) !== -1) {
            this.before.splice(this.before.indexOf(node), 1);
            node.after.splice(node.after.indexOf(this), 1);
        } else {
            console.log('Before node to be removed not found');
        }
    }
    removeAfter(node) {
        if(this.after.indexOf(node) !== -1) {
            this.after.splice(this.after.indexOf(node), 1);
            node.before.splice(node.before.indexOf(this), 1);
        } else {
            console.log('After node to be removed not found');
        }
    }
    createElement() {
        let elem = document.createElement('div');
        elem.classList.add('node')
        elem.style.left = window.innerWidth / 2 + 'px';
        elem.style.top = window.innerHeight / 2 + 'px';
        elem.id = randomId('node');
        elem.innerHTML = `<div class="title">${'Task ' + document.getElementsByClassName('node').length}</div>`;
        document.getElementById('container').appendChild(elem);

        return elem;
    }
    appendElement() {
        document.getElementById('container').appendChild(this.elem);
    }
    removeElement() {
        this.elem.remove();
    }
    remove() {
        this.patchDelete();
        this.elem.remove();
        delete currentFile.nodes[this.id];
    }
    complete() {
        if(this.elem.classList.contains('complete')) {
            this.elem.classList.remove('complete');
            this.unpatchComplete();
        } else {
            this.elem.classList.add('complete');
            this.patchComplete();
        }
    }
    patchDelete() {
        let b = this.before.map(x => x);
        let a = this.after.map(x => x);

        b.forEach(node => {this.removeBefore(node)});
        a.forEach(node => {this.removeAfter(node)});

        this.updateLines();
        b.forEach(node1 => {
            a.forEach(node2 => {
                node2.addBefore(node1);
                node2.updateLines();
            })
        })
    }
    patchComplete() {
        let b = this.before.map(x => x);
        let a = this.after.map(x => x);
        this.patchDelete();
        this.before = b;
        this.after = a;
    }
    unpatchComplete() {
        let b = this.before.map(x => x);
        let a = this.after.map(x => x);
        this.before = [];
        this.after = [];
        b.forEach(node => {
            if(currentFile.nodes[node.id] && !node.completed) {
                this.addBefore(node);
            }
        })
        a.forEach(node => {
            if(currentFile.nodes[node.id] && !node.completed) {
                node.addBefore(this);
            }
        })
        this.updateLines();
    }
    updateLines() {
        Array.from(document.getElementsByClassName('line')).forEach(line => {
            if(line.dataset.node1 === this.id || line.dataset.node2 === this.id) {
                line.remove();
            }
        })
        if(!this.completed) {
            this.before.forEach(n => {
                let line = createLineElement(parseFloat(this.left), parseFloat(this.top), parseFloat(n.left), parseFloat(n.top));
                line.dataset.node1 = this.id;
                line.dataset.node2 = n.id;
                makeLineDelete(line);
                document.getElementById('container').appendChild(line);
            })
            this.after.forEach(n => {
                let line = createLineElement(parseFloat(n.left), parseFloat(n.top), parseFloat(this.left), parseFloat(this.top));
                line.dataset.node2 = this.id;
                line.dataset.node1 = n.id;
                makeLineDelete(line);
                document.getElementById('container').appendChild(line);
            })
        }
    }
}
class Project extends Node {
    constructor(obj) {
        super(obj)
        this.elem.classList.add('project-node');
        if(obj) {
            // this is likely unnecessary as it is already done in the super function but im keeping it anyways
            this.title = obj.title;
            this.setId(obj.id);
        } else {
            this.title = 'Project ' + document.getElementsByClassName('project-node').length;
            this.id = randomId('project');
        }
        
    }
    addFunctionalities() {
        editTitle(this.elem, this);
        makeModeFunctions(this.elem, this);
    }
    adjustInitialPosition() {
        // just don't
    }
    remove() {
        if(window.confirm('Are you sure you wish to delete this project? This cannot be undone.')) {
            currentFile.remove();
            currentFile = projectFiles[0];
            currentFile.populate();
            document.getElementById('move-node').click();
            updateProjects();
        }
    }
    complete() {
        if(this.elem.classList.contains('complete')) this.elem.classList.remove('complete');
        else this.elem.classList.add('complete');
        updateProjects();
        document.getElementById('move-node').click();
    }
}
class ProjectFile {
    constructor(obj) {
        this.nodes = {};
        this.project;
        if(obj) {
            obj.nodes.forEach(obj2 => {
                if(obj2.id === obj.project) {
                    let node = new Project(obj2)
                    this.nodes[node.id] = node;
                    this.project = node;
                } else {
                    let node = new Node(obj2);
                    this.nodes[node.id] = node;
                }
            })
            this.clear();
        }
    }
    attachNodes(obj) {
        currentFile = this;
        obj.nodes.forEach(obj2 => {
            this.nodes[obj2.id].attachFromObj(obj2);
        })
    }
    get title() {
        return this.project.title;
    }
    set title(string) {
        this.project.title = string;
    }
    get completed() {
        return this.project.completed;
    }
    get id() {
        return this.project.id; // inherently bugged as you could get duplicate ids. FIX!!!
    }
    genProject() { 
        // This is here because the project file needs to be generated so that the project can
        // be added to the file's nodes object.
        this.project = new Project();
    }
    toCompactObj() {
        let compactNodes = Object.values(this.nodes).map(node => node.toCompactObj());
        return {
            project: this.project.id,
            nodes: compactNodes
        }
    }
    populate() {
        for(let id in this.nodes) {
            let node = this.nodes[id]
            node.appendElement();
        }
        for(let id in this.nodes) {
            let node = this.nodes[id]
            node.updateLines();
        }
    }
    clear() {
        Array.from(document.getElementsByClassName('line')).forEach(line => {
            line.remove();
        })
        Array.from(document.getElementsByClassName('node')).forEach(node => {
            node.remove();
        })
    }
    remove() {
        this.clear();
        projectFiles.splice(projectFiles.indexOf(this), 1);
    }
}

// HELPER FUNCTIONS

function resetContainerPosition() {
    let container = document.getElementById('container');
    container.style.top = '0px';
    container.style.left = '0px';
}

function noLoops(seen, current) {
    let s = seen.map(x => x);
    if(s.indexOf(current) !== -1) {
        current.removeAfter(seen.pop());
        return;
    }
    s.push(current);
    current.before.forEach(next => {
        noLoops(s, next);
    })
}


function createLineElement(x1, y1, x2, y2) {
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
  
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;

    return line;
}

function dragElement(elmnt, node) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        if(document.getElementById('mode-move').checked) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        node.updateLines();
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function dragContainer(elmnt, mover) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    mover.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if(document.getElementById('mode-move').checked) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function editTitle(elmnt, node) {
    elmnt.addEventListener('dblclick', e => {
        // elmnt.children[0].focus();
        // elmnt.children[0].select();
        editingNode = node;
        document.getElementById('mode-edit').click();
    })
}

function makeModeFunctions(elmnt, node) {
    elmnt.onclick = e => {
        if(document.getElementById('mode-line').checked) {
            let selected = document.querySelectorAll('.node.selected');
            elmnt.classList.add('selected');
            if(selected.length === 1) {
                node.addBefore(currentFile.nodes[selected[0].id]);
                node.updateLines();
                document.getElementById('line-cover').click();
                document.getElementById('add-line').click(); // this is so stupid but whatever
            } else if(!elmnt.classList.contains('project-node')) {
                Array.from(document.querySelectorAll('.node:not(.selected)')).forEach(node => {
                    node.classList.add('new-select-text');
                })
            } else {
                elmnt.classList.remove('selected');
            }
        } else if(document.getElementById('mode-complete').checked) {
            node.complete();
        } else if(document.getElementById('mode-delete').checked) {
            node.remove();
        }
    }
}

function makeLineDelete(line) {
    line.onclick = () => {
        if(document.getElementById('mode-delete').checked) {
            let n1 = currentFile.nodes[line.dataset.node1];
            let n2 = currentFile.nodes[line.dataset.node2];
            n1.removeBefore(n2);
            n1.updateLines();
        }
    }
}

function randomId(string) {
    let id = string + "-" + Math.floor(Math.random() * 10000);
    if(document.getElementById(id) !== null) return randomId();
    return id;
}

function updateProjects() {
    setDocumentTitle();
    let menu = document.getElementById('project-menu');
    for(let i = menu.children.length - 1; i >= 0 ; i--) {
        let child = menu.children[i];
        if(child.classList.contains('project')) child.remove();
    }
    projectFiles.forEach(file => {
        let projectSelect = document.createElement('div');
        projectSelect.innerHTML = file.title;
        projectSelect.classList.add('project');
        if(file.completed) projectSelect.classList.add('complete');
        if(file === currentFile) projectSelect.classList.add('current');
        else {
            projectSelect.onclick = () => {
                resetContainerPosition();
                currentFile.clear();
                currentFile = file;
                currentFile.populate();
                updateProjects();
            }
        }
        menu.appendChild(projectSelect);
    })
}
function createNewProject() {
    if(currentFile) currentFile.clear();
    currentFile = new ProjectFile();
    currentFile.genProject();
    projectFiles.push(currentFile);
    updateProjects();
}
function setDocumentTitle() {
    document.getElementsByTagName('title')[0].innerHTML = currentFile.title + ' - Task Web';
}