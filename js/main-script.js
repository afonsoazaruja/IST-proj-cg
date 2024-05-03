import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras=new Array(), camera, scene, renderer;

var geometry, material1, material2, material3, material4, material5, mesh;

var base, crane, car, claw;

var c=1, h=10;

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
    createCrane();
    createCar();
    createClaw();
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
    var cam;
    cam = new THREE.OrthographicCamera(window.innerWidth / - 100, window.innerWidth / 100, window.innerHeight / 100, window.innerHeight / - 100, 1, 100);
    cam.position.x = x;
    cam.position.y = y;
    cam.position.z = z;
    cam.lookAt(0, c+h/2, 0);

    cameras[id] = cam;
}

function createCameras(){
    createOrthographicCamera(0,0,5,100); //mudar 4º argumento para dar para ver a lança
    createOrthographicCamera(1,10,6,0);
    createOrthographicCamera(2,0,20,0);
    createOrthographicCamera(3,10,6,10);
    createPersepectiveCamera(4,15,15,15);
    camera = cameras[0];

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
function addCylinder(obj, rt, rb, h, rs, ref_x, ref_y, ref_z, material) {
    'use strict';
    
    geometry = new THREE.CylinderGeometry(rt, rb, h, rs);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

/* Function that creates a Tetrahedron and positions it in the referencial */
function addTetrahedron(obj, r, d, ref_x, ref_y, ref_z, material, reversed) {
    'use strict';
    
    geometry = new THREE.TetrahedronGeometry(r, d);
    mesh = new THREE.Mesh(geometry, material);
    if(reversed) {
        mesh.rotation.x = Math.PI;
    }
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

function createBase() {
    'use strict';

    base = new THREE.Object3D();

    material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D});
    material2 = new THREE.MeshBasicMaterial({ color: 0x404040});
    
    addCube(base, 2*c, c, 2*c, 0, 0, 0, material2); // add base
    addCube(base, 1, h, 1, 0, h/2+c/2, 0, material1); // add tower

    scene.add(base);

    base.position.x = 0;
    base.position.y = 0;
    base.position.z = 0;
}

function createCrane() {
    'use strict';

    crane = new THREE.Object3D();

    material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D});
    material2 = new THREE.MeshBasicMaterial({ color: 0x404040});
    material3 = new THREE.MeshBasicMaterial({ color: 0xFF9933});
    material4 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF});
    
    addCylinder(crane, c, c, c, 50, 0, 0, 0, material2); // axis of rotation
    addCube(crane, c, c, 15*c, 0, c, 3*c, material1); // jib and counterjib
    addCube(crane, c, c, c, c, c, 0, material4); // cabine
    addTetrahedron(crane, c, 0, 0, 2*c, 0, material3, false); // apex
    addCube(crane, c/2, 2*c, c, 0, 0, -3*c, material2); // counterweight
    
    scene.add(crane);

    crane.position.x = 0;
    crane.position.y = c+h;
    crane.position.z = 0;
}

function createCar() {
    'use strict';

    car = new THREE.Object3D();

    material2 = new THREE.MeshBasicMaterial({ color: 0x404040});
    material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4});

    addCube(car, c/2, c/2, c, 0, 0, 0, material2); // car
    addCylinder(car, c/4, c/4, h/2, 50, 0, -((h+c)/4), 0, material5); // steel cable

    scene.add(car);

    car.position.x = 0;
    car.position.y = (5*c)/4 + h;
    car.position.z = 10*c;
}

function createClaw() {
    'use strict';

    claw = new THREE.Object3D();

    material2 = new THREE.MeshBasicMaterial({ color: 0x404040});
    material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4});

    addCylinder(claw, c, c, c, 50, 0, 0, 0, material5); // claw block
    addTetrahedron(claw, c/2, 0, c/2, -3*c/4, 0, material2, true); // claw
    addTetrahedron(claw, c/2, 0, -c/2, -3*c/4, 0, material2, true); // claw
    addTetrahedron(claw, c/2, 0, 0, -3*c/4, c/2, material2, true); // claw
    addTetrahedron(claw, c/2, 0, 0, -3*c/4, -c/2, material2, true); // claw

    scene.add(claw);

    claw.position.x = 0;
    claw.position.y = h/2 + c/2;
    claw.position.z = 10*c;
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
    renderer.render(scene, camera);
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

    window.addEventListener("keydown", onKeyDown);
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

    switch (e.keyCode) {
    case 49: //'1'
        camera = cameras[0];
        break;

    case 50: //'2'
        camera = cameras[1];
        break;

    case 51: //'3'
        camera = cameras[2];
        break;

    case 52: //'4'
        camera = cameras[3];
        break;

    case 53: //'5'
        camera = cameras[4];
        break;
    case 54: //'6'
        //camera = cameras[5];
        break;
    case 55:
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = !node.material.wireframe;
            }
        });
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();