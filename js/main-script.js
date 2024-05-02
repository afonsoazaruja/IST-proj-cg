import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras=new Array(), scene, renderer;

var geometry, material1, material2, mesh;

var base, crane;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    const color = new THREE.Color( 'skyblue' );
    scene = new THREE.Scene();
    scene.background = color;
    scene.add(new THREE.AxesHelper(10));
    createBase();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createPersepectiveCamera(id,x,y,z) {
    'use strict';
    var cam;
    cam = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cam.position.x = x;
    cam.position.y = y;
    cam.position.z = z;
    cam.lookAt(scene.position);

    cameras[id] = cam;
    cam.lookAt(scene.position);
}

function createOrthographicCamera(id,x,y,z) {
    'use strict';
    cameras[id] = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, 1, 1000);
    cameras[id].position.x = x;
    cameras[id].position.y = y;
    cameras[id].position.z = z;
    cameras[id].lookAt(scene.position);

    new THREE.cameras[id]
}

function createCameras(){
    for(var i=0;i<6;i++){
        createPersepectiveCamera(i,17,17,17);
    }
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

/* Function that creates a cube and positions it in the referencial */
function addCube(obj, x, y, z, ref_x, ref_y, ref_z, material) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(x, y, z);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

/* Function that creates a cilinder and positions it in the referencial */
function addCylinder(obj, rt, rb, h, ref_x, ref_y, ref_z) {
    'use strict';
    
    geometry = new THREE.CylinderGeometry(rt, rb, h, rs);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

/* Function that creates a Tetrahedron and positions it in the referencial */
function addTetrahedron(obj, r, d, ref_x, ref_y, ref_z, material) {
    'use strict';
    
    geometry = new THREE.TetrahedronGeometry(r, d);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

function createBase() {
    'use strict';

    var base = new THREE.Object3D();

    material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D, wireframe: false });
    material2 = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false });
    
    addCube(base, 2, 1, 2, 0, 0, 0, material2); // add base
    addCube(base, 1, 10, 1, 0, 5, 0, material1); // add tower

    scene.add(base);

    base.position.x = 0;
    base.position.y = 0;
    base.position.z = 0;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, cameras[0]);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    /*switch (e.keyCode) {
    case 49: //'1'
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = !node.material.wireframe;
            }
        });
        break;

    case 50: //'2'
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = !node.material.wireframe;
            }
        });
        break;

    case 51: //'3'
        scene.traverse(function (node) {
            if (node instanceof THREE.AxesHelper) {
                node.visible = !node.visible;
            }
        });
        break;

    case 52: //'4'
        scene.traverse(function (node) {
            if (node instanceof THREE.AxesHelper) {
                node.visible = !node.visible;
            }
        });
        break;

    case 53: //'5'
        scene.traverse(function (node) {
            if (node instanceof THREE.AxesHelper) {
                node.visible = !node.visible;
            }
        });
        break;
    case 53: //'6'
        scene.traverse(function (node) {
            if (node instanceof THREE.AxesHelper) {
                node.visible = !node.visible;
            }
        });
        break;

    }*/
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();