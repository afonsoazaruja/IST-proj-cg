import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var podium, innerRing, middleRing, outerRing;
var scene, renderer, geometry, mesh;

// materials
var material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D}); // gold
var material2 = new THREE.MeshBasicMaterial({ color: 0x404040}); // grey
var material3 = new THREE.MeshBasicMaterial({ color: 0xFF9933}); // orange
var material4 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF}); // white
var material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4}); // grey steel
var material6 = new THREE.MeshBasicMaterial({ color: 0x00007E}); // dark blue
var material7 = new THREE.MeshBasicMaterial({ color: 0x008000}); // dark green
var material8 = new THREE.MeshBasicMaterial({ color: 0xBC0000}); // red
var material9 = new THREE.MeshBasicMaterial({ color: 0x6D3600}); // brown

var c=1, s=0.1;

var cam;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';
    
    const color = new THREE.Color( 'skyblue' );
    scene = new THREE.Scene();
    scene.background = color;
    scene.add(new THREE.AxesHelper(50));
    createPodium();
    createInnerRing();
    createMiddleRing();
    createOuterRing();
    createSkydome();
}


//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera(x, y, z) {
    cam = new THREE.PerspectiveCamera(70,
            window.innerWidth / window.innerHeight, 0.4, 1000);
    
    cam.position.x = x;
    cam.position.y = y;
    cam.position.z = z;

    cam.lookAt(scene.position);

    // Initialize OrbitControls
    const controls = new OrbitControls(cam, renderer.domElement);

    // Optional: Set some properties for better control
    controls.enableDamping = true; // Enable damping (inertia)
    controls.dampingFactor = 0.25; // Damping factor
    controls.screenSpacePanning = false; // Disable screen space panning
    controls.minDistance = 5; // Minimum distance for zoom
    controls.maxDistance = 50; // Maximum distance for zoom
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical angle
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////



////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addCylinder(obj, rt, rb, h, material) {
    'use strict';

    geometry = new THREE.CylinderGeometry(rt, rb, h);
    mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
}

function addRing(obj, ir, or, pos_x, pos_y, pos_z, material) {
    'use strict';

    var ringShape = new THREE.Shape();
    // Define the outer ring shape
    ringShape.absarc(0, 0, or, 0, Math.PI * 2, false);
    
    var holePath = new THREE.Path();
    // Define the inner ring (hole)
    holePath.absarc(0, 0, ir, 0, Math.PI * 2, true);
    ringShape.holes.push(holePath);

    // Define extrude settings
    var extrudeSettings = {
        steps: 1,
        depth: 1
    };

    // Extrude the shape to create geometry
    var geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);

    var mesh = new THREE.Mesh(geometry, material);

    mesh.rotateX(Math.PI / 2);

    obj.add(mesh);
    obj.position.set(pos_x, pos_y, pos_z);
    obj.movement = { moving: false, up: true, down: false };
}

function createSkydome() {
    const radius = 10;
    const widthSegments = 32;
    const heightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI / 2);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textures/skydome.png');

    const sphereMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide
    });

    const skydome = new THREE.Mesh(sphereGeometry, sphereMaterial);

    skydome.position.set(0, 0, 0);

    scene.add(skydome);
}

function createPodium() {
    'use strict';

    podium = new THREE.Object3D();
    
    addCylinder(podium, c, c, c, material1); // add podium

    podium.position.x = 0;
    podium.position.y = 0;
    podium.position.z = 0;

    scene.add(podium);
}

function createInnerRing() {
    'use strict';

    innerRing = new THREE.Object3D();
    innerRing.movement = { moving: false, up: false, down: false }; 

    addRing(innerRing, c, 5*c/2, 0, c, 0, material2); // add innerRing

    scene.add(innerRing);
} 

function createMiddleRing() {
    'use strict';

    middleRing = new THREE.Object3D();
    
    addRing(middleRing, 5*c/2, 4*c, 0, 2*c, 0, material3); // add middleRing

    scene.add(middleRing);
}

function createOuterRing() {
    'use strict';

    outerRing = new THREE.Object3D();
    
    addRing(outerRing, 4*c, 11*c/2, 0, 3*c, 0, material4); // add outerRing

    scene.add(outerRing);
}

function createObjects() {
    'use strict';
    
    for (let i = 0; i < 8; i++) {
        objects[i] = new THREE.Object3D();
        innerMesh.add(objects[i]);
    }

    addCube(objects[0], 1, 1, 1, 0, 0, 0, material6);               // cube
    objects[0].radius = 0.4;                             // sphere around for collisions
    
    geometry = new THREE.DodecahedronGeometry(1);                   // dodecahedron
    mesh = new THREE.Mesh(geometry, material9);
    mesh.position.set(0, 0, 0);
    objects[1].add(mesh);
    objects[1].radius = 1;                                          // sphere around for collisions

    geometry = new THREE.IcosahedronGeometry(1);                    // icosahedron
    mesh = new THREE.Mesh(geometry, material3);
    mesh.position.set(0, 0, 0);
    objects[2].add(mesh);
    objects[2].radius = 1;                                          // sphere around for collisions

    geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);          // torus
    mesh = new THREE.Mesh(geometry, material8);
    mesh.position.set(0, 0, 0);
    objects[3].add(mesh);
    objects[3].radius = 0.7;                                          // sphere around for collisions

    geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);      // torus knot
    mesh = new THREE.Mesh(geometry, material7);
    mesh.position.set(0, 0, 0);
    objects[4].add(mesh);
    objects[4].radius = 1;                                          // sphere around for collisions

    // positioning each object
    objects[0].position.x = -5;
    objects[0].position.y = 0;
    objects[0].position.z = 4;

    objects[1].position.x = -3;
    objects[1].position.y = 0.5;
    objects[1].position.z = -4;

    objects[2].position.x = -7;
    objects[2].position.y = 0.3;
    objects[2].position.z = 7;

    objects[3].position.x = 1;
    objects[3].position.y = 0.2;
    objects[3].position.z = -7;

    objects[4].position.x = 5;
    objects[4].position.y = 0.5;
    objects[4].position.z = 2;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////

// no collisions in this project
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////

// no collisions in this project
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////

function update(){
    'use strict';

    innerRing.rotation.y += s/4;
    middleRing.rotation.y -= s/3;
    outerRing.rotation.y += s/2;

    if(innerRing.movement.moving){
        if (innerRing.movement.up){
            innerRing.position.y += s;
            if(innerRing.position.y >= 10){
                innerRing.movement.up = false;
                innerRing.movement.down = true;
            }
        }
        if(innerRing.movement.down){
            innerRing.position.y -= s;
            if(innerRing.position.y <= 0){
                innerRing.movement.down = false;
                innerRing.movement.up = true;
            }
        }
    }
    if(middleRing.movement.moving){
        if (middleRing.movement.up){
            middleRing.position.y += s;
            if(middleRing.position.y >= 10){
                middleRing.movement.up = false;
                middleRing.movement.down = true;
            }
        }
        if(middleRing.movement.down){
            middleRing.position.y -= s;
            if(middleRing.position.y <= 0){
                middleRing.movement.down = false;
                middleRing.movement.up = true;
            }
        }
    }
    
    if(outerRing.movement.moving){
        if (outerRing.movement.up){
            outerRing.position.y += s;
            if(outerRing.position.y >= 10){
                outerRing.movement.up = false;
                outerRing.movement.down = true;
            }
        }
        if(outerRing.movement.down){
            outerRing.position.y -= s;
            if(outerRing.position.y <= 0){
                outerRing.movement.down = false;
                outerRing.movement.up = true;
            }
        }
    }
}

/////////////
/* DISPLAY */
/////////////

function render() {
    'use strict';

    renderer.render(scene, cam);
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
    createCamera(0, 10, 0);
    
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
        innerRing.movement.moving = true;
        console.log('1');   
        break;
    case 50: //'2'
        middleRing.movement.moving = true;
        console.log('2');
        break;
    case 51: //'3'
        outerRing.movement.moving = true;
        console.log('3');
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////

function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
    case 49: //'1'
        innerRing.movement.moving = false;
        break;

    case 50: //'2'
        middleRing.movement.moving = false;
        break;

    case 51: //'3'
        outerRing.movement.moving = false;
        break;
    }
}

init();
animate();
