import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var podium, innerRing, middleRing, outerRing;
var scene, renderer, geometry, geo, mesh;

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

var c=1;

var cam;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';
    
    const color = new THREE.Color( 'skyblue' );
    scene = new THREE.Scene();
    scene.background = color;
    scene.add(new THREE.AxesHelper(10));
    createPodium();
    scene.add(podium);

    createInnerRing();
    createMiddleRing();
    createOuterRing();
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
    ringShape.absarc(0, 0, or, 0, ir, false);
    var holePath = new THREE.Path();
    holePath.absarc(0, 0, or, 0, ir, true);
    ringShape.holes.push(holePath);

    // Define extrude settings
    var extrudeSettings = {
        steps: 2,
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2
    };

    // Extrude the shape to create geometry
    var geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);

    mesh.rotateX(Math.PI/2);    

    mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    
    podium.add(obj);
    
    obj.position.x = pos_x;
    obj.position.y = pos_y;
    obj.position.z = pos_z;
    obj.movement = { moving:false, up: true, down: false };
}

function createPodium() {
    'use strict';

    podium = new THREE.Object3D();
    
    addCylinder(podium, c, c, c, material1); // add podium

    podium.position.x = 0;
    podium.position.y = 0;
    podium.position.z = 0;
}

function createInnerRing() {
    'use strict';

    innerRing = new THREE.Object3D();
    
    addRing(innerRing, c, 2*c, 0, 0, 0, material2); // add innerRing
} 

function createMiddleRing() {
    'use strict';

    middleRing = new THREE.Object3D();
    
    addRing(middleRing, 2*c, 3*c, 0, 0, 0, material3); // add middleRing
}

function createOuterRing() {
    'use strict';

    outerRing = new THREE.Object3D();
    
    addRing(outerRing, 3*c, 4*c, 0, 0, 0, material4); // add outerRing
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
    if(innerRing.movement.moving){
        if (innerRing.movement.up){
            innerRing.position += 0.01;
            if(innerRing.position >= 10){
                innerRing.movement.up = false;
                innerRing.movement.down = true;
            }
        }
        if(innerRing.movement.down){
            innerRing.position -= 0.01;
            if(innerRing.position <= 0){
                innerRing.movement.down = false;
                innerRing.movement.up = true;
            }
        }
    }
    if(middleRing.movement.moving){
        if (middleRing.movement.up){
            middleRing.position += 0.01;
            if(middleRing.position >= 10){
                middleRing.movement.up = false;
                middleRing.movement.down = true;
            }
        }
        if(middleRing.movement.down){
            middleRing.position -= 0.01;
            if(middleRing.position <= 0){
                middleRing.movement.down = false;
                middleRing.movement.up = true;
            }
        }
    }
    
    if(outerRing.movement.moving){
        if (outerRing.movement.up){
            outerRing.position += 0.01;
            if(outerRing.position >= 10){
                outerRing.movement.up = false;
                outerRing.movement.down = true;
            }
        }
        if(outerRing.movement.down){
            outerRing.position -= 0.01;
            if(outerRing.position <= 0){
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
    createCamera(10, 10, 10);
    
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
        innerRing.moving = true;
        break;
    case 50: //'2'
        middleRing.moving = true;
        break;
    case 51: //'3'
        outerRing.moving = true;
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
        innerRing.moving = false;
        break;

    case 50: //'2'
        middleRing.moving = false;
        break;

    case 51: //'3'
        outerRing.moving = false;
        break;
    }
}

init();
animate();