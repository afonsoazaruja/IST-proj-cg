import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var podium, innerRing, middleRing, outerRing, mobiusStrip;
var scene, renderer, geometry, mesh;
//var trefoilKnot, conicSpiral, sphere, torus, helix, ellipticParaboloid, hyperbolicParaboloid;
var objects = new Array();
var spotlights = new Array();
var pointLights = new Array();

// materials
var material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D}); // gold
var material2 = new THREE.MeshBasicMaterial({ color: 0x404040}); // grey
var material3 = new THREE.MeshBasicMaterial({ color: 0xFF9933}); // orange
var material4 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF}); // white
var material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4}); // grey steel
var material6 = new THREE.MeshBasicMaterial({ color: 0x00007E}); // dark blue
var material7 = new THREE.MeshToonMaterial({ color: 0x008000,side:THREE.DoubleSide}); // dark green
var material8 = new THREE.MeshNormalMaterial({side:THREE.DoubleSide}); // red
var material9 = new THREE.MeshLambertMaterial({ color: 0x6D3600, side:THREE.DoubleSide}); // brown
var material10 = new THREE.MeshPhongMaterial({color:0xff0000, side:THREE.DoubleSide});

const c=1, s=2, h=7, r=1.5;

var cam, clock, delta;

var x, y, z;

var ambientLight, directionalLight;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';
    
    const color = new THREE.Color( 'skyblue' );
    scene = new THREE.Scene();
    scene.background = color;
    scene.add(new THREE.AxesHelper(8));
    createPodium();
    createInnerRing();
    createMiddleRing();
    createOuterRing();
    createMobiusStrip();
    createObjects();
    createSkydome();
    createLights();
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

    cam.lookAt(0, 10, 0);

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
function createLights() {
    'use strict';
    
    // ambient light
    ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);
    
    // directional light
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 0);
    directionalLight.lookAt(scene.position);
    scene.add(directionalLight);

    // point lights for mobius strip
    for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var x = 0.9 * Math.cos(angle);
        var z = 0.9 * Math.sin(angle);
        pointLights[i] = new THREE.PointLight(0xffffff, 1, 1);
        pointLights[i].visible = false; // Initially off
        pointLights[i].position.set(x, 5, z);
        scene.add(pointLights[i]);
    }

    // spolights for each object
    for (var i = 0; i < 24; i++) {
        spotlights[i] = new THREE.SpotLight(0xffffff, 5);
        spotlights[i].visible = false; // Initially off
        spotlights[i].position.set(objects[i].position.x, objects[i].position.y - 2, objects[i].position.z);
        spotlights[i].lookAt(objects[i].position);
        scene.add(spotlights[i]);   
    }
    
}
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
        steps: 100,
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

// Parametric Functions Constructors
function kleinFunction(u, v, target) {
    u *= Math.PI;
    v *= 2 * Math.PI;
    u = u * 2;
    if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + 2 * (1 - Math.cos(u / 2)) * Math.cos(u) * Math.cos(v);
        z = -8 * Math.sin(u / 2) - 2 * (1 - Math.cos(u / 2)) * Math.sin(u) * Math.sin(v);
    } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + 2 * (1 - Math.cos(u / 2)) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u / 2);
    }
    y = -2 * (1 - Math.cos(u / 2)) * Math.sin(v);
    target.set(x, y, z);
}

function torus(u, v, target) {
    const r = 1;
    const R = 2;
    const theta = 2 * Math.PI * u;
    const phi = 2 * Math.PI * v;
    x = (R + r * Math.cos(phi)) * Math.cos(theta);
    y = (R + r * Math.cos(phi)) * Math.sin(theta);
    z = r * Math.sin(phi);
    target.set(x, y, z);
}

function hyperbolicParaboloid(u, v, target) {
    x = u * 2 - 1;
    y = v * 2 - 1;
    z = x * x - y * y;
    target.set(x, y, z);
}

function sphere(u, v, target) {
    var u = (u * 2 * Math.PI) - Math.PI;
    var v = (v * 2 * Math.PI) - Math.PI;

    var x = Math.sin(u) * Math.sin(v) + 0.05 * Math.cos(20 * v);
    var y = Math.cos(u) * Math.sin(v) + 0.05 * Math.cos(20 * u);
    var z = Math.cos(v);


    target.set(x, y, z);
}

function egg(u, v, target) {
    var u = u * 2 * Math.PI;
    var v = (v * 2 * Math.PI) - Math.PI;

    var x = Math.cos(u);
    var y = Math.sin(u) + Math.cos(v);
    var z = Math.sin(v);


    target.set(x, y, z);
}

function curvedring(u, v, target) {
    var a = 3;
    var n = 3;
    var m = 1;

    var u = u * 4 * Math.PI;
    var v = v * 2 * Math.PI;

    var x = (a + Math.cos(n * u / 2.0) * Math.sin(v) - Math.sin(n * u / 2.0) * Math.sin(2 * v)) * Math.cos(m * u / 2.0);
    var y = (a + Math.cos(n * u / 2.0) * Math.sin(v) - Math.sin(n * u / 2.0) * Math.sin(2 * v)) * Math.sin(m * u / 2.0);
    var z = Math.sin(n * u / 2.0) * Math.sin(v) + Math.cos(n * u / 2.0) * Math.sin(2 * v);

    target.set(x, y, z);
}

function catenoid(u, v, target) {
    const a = 1;
    const x = a * Math.cosh(v * 2 - 1) * Math.cos(u * 2 * Math.PI);
    const y = a * Math.cosh(v * 2 - 1) * Math.sin(u * 2 * Math.PI);
    const z = v * 4 - 2;
    target.set(x, y, z);
}

function enneperSurface(u, v, target) {
    u = (u - 0.5) * 2;
    v = (v - 0.5) * 2;
    const x = u - (u ** 3) / 3 + u * v ** 2;
    const y = v - (v ** 3) / 3 + v * u ** 2;
    const z = u ** 2 - v ** 2;
    target.set(x, y, z);
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

 // Function to create a Möbius strip
function createMobiusStrip() {
    'use strict';
    mobiusStrip = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        -0.75, c/2, 0,            // v0
        
        -0.75, 0, 0.15,           // v1
        -0.60, c/2, 0.3,          // v2
        -0.60, 0, 0.45,           // v3
        -0.3, c/2, 0.6,           // v4
        -0.15, 0, 0.75,           // v5
        
        0, c/2-0.1, 0.75,         // v6

        0.15, 0.1, 0.60,          // v7
        0.3, c/2-0.15, 0.75,      // v8
        0.50, 0.2, 0.45,          // v9
        0.6, c/2-0.20, 0.5,       // v10
        0.5, 0.2, 0.15,           // v11
        
        0.8, c/2-0.25, 0,         // v12
        
        0.55, 0.3, -0.15,         // v13
        0.75, c/2-0.3, -0.3,      // v14
        0.5, 0.40, -0.40,         // v15
        0.5, c/2-0.4, -0.6,       // v16
        0.2, 0.45, -0.70,         // v17
        
        0, c/2, -0.75,            // v18
        
        -0.15, 0, -0.75,          // v19
        -0.3, c/2, -0.6,          // v20
        -0.45, 0, -0.60,          // v21
        -0.6, c/2, -0.3,          // v22
        -0.75, 0, -0.15,          // v23
    ]);

    const indices = new Uint32Array([
        1, 2, 0,        // f1
        3, 2, 1,        // f2
        3, 4, 2,        // f3
        5, 4, 3,        // f4
        5, 6, 4,        // f5
        7, 6, 5,        // f6
        7, 8, 6,        // f7
        9, 8, 7,        // f8
        9, 10, 8,       // f9
        11, 10, 9,      // f10
        11, 12, 10,     // f11
        13, 12, 11,     // f12
        13, 14, 12,     // f13
        15, 14, 13,     // f14
        15, 16, 14,     // f15
        17, 16, 15,     // f16
        19, 17, 16,     // f17
        19, 18, 17,     // f18
        19, 20, 18,     // f19
        21, 20, 19,     // f20
        21, 22, 20,     // f21
        23, 22, 21,     // f22
        23, 0, 22,      // f23
        1, 0, 23        // f24
    ]);

    mobiusStrip.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    mobiusStrip.setIndex(new THREE.BufferAttribute(indices, 1));
    mobiusStrip.computeVertexNormals();

    mesh = new THREE.Mesh( mobiusStrip, material10 );
    mesh.position.set(0,5,0);
    scene.add(mesh);
}

function createPodium() {
    'use strict';

    podium = new THREE.Object3D();
    
    addCylinder(podium, c, c, c, material1); // add podium

    podium.position.x = 0;
    podium.position.y = c/2;
    podium.position.z = 0;

    scene.add(podium);
}

function createInnerRing() {
    'use strict';

    innerRing = new THREE.Object3D();
    innerRing.movement = { moving: false, up: false, down: false }; 

    addRing(innerRing, 13*c/12, 5*c/2, 0, c, 0, material2); // add innerRing

    scene.add(innerRing);
}

function createMiddleRing() {
    'use strict';

    middleRing = new THREE.Object3D();
    
    addRing(middleRing, 37*c/14, 4*c, 0, 2*c, 0, material3); // add middleRing

    scene.add(middleRing);
}

function createOuterRing() {
    'use strict';

    outerRing = new THREE.Object3D();
    
    addRing(outerRing, 29*c/7, 11*c/2, 0, 3*c, 0, material4); // add outerRing

    scene.add(outerRing);
}

function createObjects() {
    'use strict';
    
    var j = 0; 
    while (j < 3) {
        for (let i = 0+8*j; i < 8+8*j; i++) {
            objects[i] = new THREE.Object3D();
            if (j == 0) {
                innerRing.add(objects[i]);
            }
            else if (j == 1) {
                middleRing.add(objects[i]);
            }
            else {
                outerRing.add(objects[i]);
            }
        }

        // egg
        geometry = new ParametricGeometry(egg,100,100);
        mesh = new THREE.Mesh(geometry, material10);
        mesh.scale.set(0.4, 0.6, 0.4);
        objects[0+8*j].add(mesh);

        // klein bottle
        geometry = new ParametricGeometry(kleinFunction, 100, 100);
        mesh = new THREE.Mesh( geometry, material10);
        mesh.scale.set(0.07, 0.07, 0.07);
        objects[1+8*j].add(mesh);
        
        // sphere
        geometry = new ParametricGeometry(sphere, 200, 10);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.4, 0.4, 0.4);
        objects[2+8*j].add(mesh);
        
       // catenoid
        geometry = new ParametricGeometry(catenoid, 100, 100);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.2, 0.2, 0.2); 
        objects[3+8*j].add(mesh);
        
        // torus
        geometry = new ParametricGeometry(torus, 100, 100);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.1, 0.1, 0.1); 
        objects[4+8*j].add(mesh);

        // ennerSurface
        geometry = new ParametricGeometry(enneperSurface, 100, 100);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.3, 0.6, 0.3); 
        objects[5+8*j].add(mesh);

        // hyperbolicParaboloid
        geometry = new ParametricGeometry(hyperbolicParaboloid, 100, 100);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.3, 0.3, 0.3);
        objects[6+8*j].add(mesh);

        // curvedring
        geometry = new ParametricGeometry(curvedring, 100, 100);
        mesh = new THREE.Mesh( geometry, material10 );
        mesh.scale.set(0.15, 0.15, 0.15);
        objects[7+8*j].add(mesh);
        
    
        // positioning each object
        objects[0+8*j].position.x = c+r/2+(j*r);
        objects[0+8*j].position.y = 4*c/3;
        objects[0+8*j].position.z = 0;
        
        objects[1+8*j].position.x = -(c+r/2+(j*r));
        objects[1+8*j].position.y = c/2;
        objects[1+8*j].position.z = 0;
        
        objects[2+8*j].position.x = 0;
        objects[2+8*j].position.y = c/2 + 0.1;
        objects[2+8*j].position.z = c+r/2+(j*r);
        
        objects[3+8*j].position.x = 0;
        objects[3+8*j].position.y = c/2;
        objects[3+8*j].position.z = -(c+r/2+(j*r));
        
        objects[4+8*j].position.x = (Math.sqrt(2)/2*(c+r/2+j*r));
        objects[4+8*j].position.y = c/2;
        objects[4+8*j].position.z = (Math.sqrt(2)/2*(c+r/2+j*r));
        
        objects[5+8*j].position.x = -(Math.sqrt(2)/2*(c+r/2+j*r));
        objects[5+8*j].position.y = 4.6*c/4;
        objects[5+8*j].position.z = (Math.sqrt(2)/2*(c+r/2+j*r));
        
        objects[6+8*j].position.x = (Math.sqrt(2)/2*(c+r/2+j*r));
        objects[6+8*j].position.y = c/2 + 0.1;
        objects[6+8*j].position.z = -(Math.sqrt(2)/2*(c+r/2+j*r));

        objects[7+8*j].position.x = -(Math.sqrt(2)/2*(c+r/2+j*r));
        objects[7+8*j].position.y = c/2 + 0.30;
        objects[7+8*j].position.z = -(Math.sqrt(2)/2*(c+r/2+j*r));
        
        j++;
    }
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

    // Ring rotation
    innerRing.rotation.y += s/10 * delta;
    middleRing.rotation.y += s/10 * delta;
    outerRing.rotation.y += s/10 * delta;

    // Ring movement
    if(innerRing.movement.moving){
        if (innerRing.movement.up){
            innerRing.position.y += s * delta;
            if(innerRing.position.y >= h){
                innerRing.movement.up = false;
                innerRing.movement.down = true;
            }
        }
        if(innerRing.movement.down){
            innerRing.position.y -= s * delta;
            if(innerRing.position.y <= c/2){
                innerRing.movement.down = false;
                innerRing.movement.up = true;
            }
        }
    }
    if(middleRing.movement.moving){
        if (middleRing.movement.up){
            middleRing.position.y += s * delta;
            if(middleRing.position.y >= h){
                middleRing.movement.up = false;
                middleRing.movement.down = true;
            }
        }
        if(middleRing.movement.down){
            middleRing.position.y -= s * delta;
            if(middleRing.position.y <= c/2){
                middleRing.movement.down = false;
                middleRing.movement.up = true;
            }
        }
    }
    
    if(outerRing.movement.moving){
        if (outerRing.movement.up){
            outerRing.position.y += s * delta;
            if(outerRing.position.y >= h){
                outerRing.movement.up = false;
                outerRing.movement.down = true;
            }
        }
        if(outerRing.movement.down){
            outerRing.position.y -= s * delta;
            if(outerRing.position.y <= c/2){
                outerRing.movement.down = false;
                outerRing.movement.up = true;
            }
        }
    }

    // Objects rotation
    objects.forEach(object => {
        object.rotateY(Math.random() * 3*s/2 * delta);
    })
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

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCamera(5, 5, 0);
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';

    delta = clock.getDelta();

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
        innerRing.movement.moving = !innerRing.movement.moving;
        break;
    case 50: //'2'
        middleRing.movement.moving = !middleRing.movement.moving;
        break;
    case 51: //'3'
        outerRing.movement.moving = !outerRing.movement.moving;
        break;
    case 68: //'D'
        directionalLight.visible = !directionalLight.visible;
        break;
    case 83: //'S'
        spotlights.forEach(spotlight => {
            spotlight.visible = !spotlight.visible;
        });
        break;
    case 80: //'P'
        pointLights.forEach(pointLight => {
            pointLight.visible = !pointLight.visible;
        });
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
        break;

    case 50: //'2'
        break;

    case 51: //'3'
        break;
    }
}

init();
animate();
