import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras=new Array(), camera, scene, renderer;

var geometry, mesh;
var material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D}); // gold
var material2 = new THREE.MeshBasicMaterial({ color: 0x404040}); // grey
var material3 = new THREE.MeshBasicMaterial({ color: 0xFF9933}); // orange
var material4 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF}); // white
var material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4}); // grey steel

var base, crane, car, claw, container;

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
    scene.add(base);
    createContainer();
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
    cam = new THREE.OrthographicCamera(window.innerWidth / - 75, window.innerWidth / 75, window.innerHeight / 75, window.innerHeight / - 75, 1);
    cam.position.x = x;
    cam.position.y = y;
    cam.position.z = z;
    cam.lookAt(0, c+h/2, 0);

    cameras[id] = cam;
}

function createCameras(){
    createOrthographicCamera(0,0,6,100); //mudar 4º argumento para dar para ver a lança
    createOrthographicCamera(1,100,6,0);
    createOrthographicCamera(2,0,100,0);
    createOrthographicCamera(3,10,6,10);
    createPersepectiveCamera(4,15,15,15);
    camera = cameras[0];

}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

// No lights in this project

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
function addCylinder(obj, rt, rb, h, rs, ref_x, ref_y, ref_z, material, name) {
    'use strict';
    
    geometry = new THREE.CylinderGeometry(rt, rb, h, rs);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ref_x, ref_y, ref_z);
    if (name != null) mesh.name = name;
    obj.add(mesh);
}

/* IMPLEMENTAR ESTA FUNCAO NO ADDCYLINDER */
function addCylinderRotation(obj, rt, rb, h, rs, ref_x, ref_y, ref_z, rot_x, rot_y, rot_z, material) {
    'use strict';
    
    geometry = new THREE.CylinderGeometry(rt, rb, h, rs);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(rot_x); mesh.rotateY(rot_y); mesh.rotateZ(rot_z);
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

function addPyramid(obj, ref_x, ref_y, ref_z, material) {
    'use strict';
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array( [
        -c/2, 0,  c/2,    // v0
        c/2,0,  c/2,  // v1       v0, v1, v2 - tetrahedron base
        c/2, 0,  -c/2,   // v2
        -c/2,  0,  -c/2,      // v3       v3 - tetrahedron top vertice
        0,  2*c,  0,      // v4
    ] );

    const indices = [
        0, 1, 4,
        1, 2, 4,
        2, 3, 4,
        0, 3, 4
    ];    

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}
    

/* Function that creates a Tetrahedron and positions it in the referencial */
function addTetrahedron(obj, ref_x, ref_y, ref_z, material, reversed) {
    'use strict';
    
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array( [
        -c/4, 0,  -c/4,    // v0
        c/4, 0,  -c/4,      // v1       v0, v1, v2 - tetrahedron base
        c/4, 0,  c/4,       // v2
        0,  c,  0,          // v3       v3 - tetrahedron top vertice
    ] );

    const indices = [
        2, 1, 0,
        0, 3, 2,
        1, 3, 0,
        2, 3, 1
    ];    

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    const mesh = new THREE.Mesh( geometry, material );
    if(reversed) {
        mesh.rotation.x = Math.PI;
    }
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}

function createBase() {
    'use strict';

    base = new THREE.Object3D();
    
    addCube(base, 2*c, c, 2*c, 0, 0, 0, material2); // add base
    addCube(base, 1, h, 1, 0, h/2+c/2, 0, material1); // add tower

    createCrane(base);

    base.position.x = 0;
    base.position.y = 0;
    base.position.z = 0;
}

function createCrane() {
    'use strict';

    crane = new THREE.Object3D();
    crane.add(new THREE.AxesHelper(2));
    crane.userData = { rot_pos: false, rot_neg: false, step: 0 };
    
    addCylinder(crane, c, c, c, 50, 0, 0, 0, material2, null); // axis of rotation
    addCube(crane, c, c, 15*c, 0, c, 3*c, material1); // jib and counterjib
    addCube(crane, c, c, c, c, c, 0, material4); // cabine
    addPyramid(crane, 0, c, 0, material3); // apex
    addCube(crane, c/2, 2*c, c, 0, 0, -3*c, material2); // counterweight
    addCylinderRotation(crane, c/20, c/20, c*10, 50, 0, 4*c/2, 5*c, -1.4, 0, 0, material5) // fore pendant
    addCylinderRotation(crane, c/20, c/20, c*5-c/2, 50, 0, 4*c/2, -2*c, 1.2, 0, 0, material5) // rear pendant
    
    createCar();
    base.add(crane);

    crane.position.x = 0;
    crane.position.y = c+h;
    crane.position.z = 0;

}

function createCar() {
    'use strict';

    car = new THREE.Object3D();
    car.add(new THREE.AxesHelper(2));
    car.userData = { forwards: false, backwards: false, step: 0 };
    
    addCube(car, c/2, c/2, c, 0, 0, 0, material5); // car
    addCylinder(car, c/8, c/8, 5*c, 50, 0, -((h+c)/4), 0, material5, "cable"); // steel cable
    
    createClaw(car);
    crane.add(car);
    
    car.position.x = 0;
    car.position.y = c/4;
    car.position.z = 10*c;
}

function createClaw() {
    'use strict';

    claw = new THREE.Object3D();
    claw.add(new THREE.AxesHelper(2));
    car.userData = { up: false, down: false, step: 0 };

    addCylinder(claw, c, c, c, 50, 0, 0, 0, material5, null); // claw block
    addTetrahedron(claw, c/2, -c/3, 0, material2, true); // claw
    addTetrahedron(claw, -c/2, -c/3, 0, material2, true); // claw
    addTetrahedron(claw, 0, -c/3, c/2, material2, true); // claw          // mudar y
    addTetrahedron(claw, 0, -c/3, -c/2, material2, true); // claw
    
    claw.position.x = 0;
    claw.position.y = -h/2;
    claw.position.z = 0;

    car.add(claw);
}

function createContainer(){
    'use strict';

    container = new THREE.Object3D();
    
    addCube(container, 5.5,0,7 , 0,-1,0, material2)
    addCube(container, 5.5,3,0.2 , 0,0,3.5, material5)
    addCube(container, 5.5,3,0.2 , 0,0,-3.5, material5)
    addCube(container, 0.2,3,7 , 2.5,0,0, material5)
    addCube(container, 0.2,3,7 , -2.5,0,0, material5)
    scene.add(container);
    container.position.x = 7;
    container.position.y = 1;
    container.position.z = 7;
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
    
    if (crane.userData.rot_pos) {
        crane.rotateY(0.01);
    }
    if (crane.userData.rot_neg) {
        crane.rotateY(-0.01);
    }
    if (car.userData.forwards && car.position.z < 10) {
        car.position.z += 0.1;
    }
    if (car.userData.backwards && car.position.z > 2) {
        car.position.z -= 0.1;
    }
    if (claw.userData.up && claw.position.y < -1) {
        claw.position.y += 0.05;
        car.children.forEach(element => {
            if (element.name == "cable") {
                element.scale.y -= 0.01;
                element.position.y += 0.025
            }
        });
    }
    if (claw.userData.down && claw.position.y > -10) {
        claw.position.y -= 0.05;
        car.children.forEach(element => {
            if (element.name == "cable") {
                element.scale.y += 0.01;
                element.position.y -= 0.025
            }
        });
    }

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
    window.addEventListener("keyup", onKeyUp);

}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    update();
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
    case 55: //'7'
        material1.wireframe = !material1.wireframe;
        material2.wireframe = !material2.wireframe;        
        material3.wireframe = !material3.wireframe;        
        material4.wireframe = !material4.wireframe;        
        material5.wireframe = !material5.wireframe;        
        break;
    case 65: //'q'
        crane.userData.rot_neg = true;
        break;
    case 81: //'a'
        crane.userData.rot_pos = true;
        break;
    case 87: //'w'
        car.userData.forwards = true;
        break;
    case 83: //'s'
        car.userData.backwards = true;
        break;
    case 69: //'e'
        claw.userData.up = true;
        break;
    case 68: //'d'
        claw.userData.down = true;
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
    case 65: //'q'
        crane.userData.rot_neg = false;        
        break;
    case 81: //'a'
        crane.userData.rot_pos = false;        
        break;
    case 87: //'w'
        car.userData.forwards = false;
        break;
    case 83: //'s'
        car.userData.backwards = false;
        break;
    case 69: //'e'
        claw.userData.up = false;
        break;
    case 68: //'d'
        claw.userData.down = false;
        break;
    }
}

init();
animate();