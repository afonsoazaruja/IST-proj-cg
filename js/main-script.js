import * as THREE from 'three';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var clock;

var cameras=new Array(), camera, scene, renderer;

var geometry, mesh;
var material1 = new THREE.MeshBasicMaterial({ color: 0xEEAD2D}); // gold
var material2 = new THREE.MeshBasicMaterial({ color: 0x404040}); // grey
var material3 = new THREE.MeshBasicMaterial({ color: 0xFF9933}); // orange
var material4 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF}); // white
var material5 = new THREE.MeshBasicMaterial({ color: 0xB4B4B4}); // grey steel

var base, crane, car, claw, container, objects= new Array();

var c=1, h=10;

var claw_rotation = 0;

var collision = new Array();
collision.action= false;
collision.number = -1;
collision.phase1 = false;
collision.phase2 = false;
collision.phase3 = false;
collision.phase4 = false;
collision.phase5 = false;
collision.rotation;

// Get reference to HUD element
var camHUD = [
    document.getElementById('cam1'),
    document.getElementById('cam2'),
    document.getElementById('cam3'),
    document.getElementById('cam4'),
    document.getElementById('cam5'),
    document.getElementById('cam6')
];

var toggleWireframe = false;

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
    createObjects();
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
    createOrthographicCamera(0,0,6,100);
    createOrthographicCamera(1,100,6,0);
    createOrthographicCamera(2,0,50,0);
    createOrthographicCamera(3,10,6,10);
    createPersepectiveCamera(4,15,15,15);
    createPersepectiveCamera(5,0,0,0);
    cameras[5].lookAt(0,10,0);
    cameras[5].rotation.x = -Math.PI/2;
    claw.add(cameras[5]); // para movimentacao da camara em relacao a grua
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
function addCylinder(obj, rt, rb, h, rs, ref_x, ref_y, ref_z, rot_x, rot_y, rot_z, material, name) {
    'use strict';
    
    geometry = new THREE.CylinderGeometry(rt, rb, h, rs);
    mesh = new THREE.Mesh(geometry, material);
    mesh.rotateX(rot_x); mesh.rotateY(rot_y); mesh.rotateZ(rot_z);
    mesh.position.set(ref_x, ref_y, ref_z);
    if (name != null) mesh.name = name;
    obj.add(mesh);
}

function addPyramid(obj, ref_x, ref_y, ref_z, material) {
    'use strict';
    const geometry = new THREE.BufferGeometry();
    
    const vertices = new Float32Array([
        -c/2, 0, -c/2,   // Base vertices
        c/2, 0, -c/2,
        c/2, 0, c/2,    
        -c/2, 0, c/2,
        0, 2*c, 0        // Apex
    ]);

    const indices = new Uint32Array([
        3, 2, 1,  // Base triangle
        3, 1, 0,  // Base triangle
        4, 1, 0,  // Side triangles
        4, 2, 1,
        4, 3, 2,
        4, 0, 3
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(ref_x, ref_y, ref_z);
    obj.add(mesh);
}
    

/* Function that creates a Tetrahedron and positions it in the referencial */
function addTetrahedron(obj, ref_x, ref_y, ref_z, material, reversed, name) {
    'use strict';
    
    const geometry = new THREE.BufferGeometry();
    
    const vertices = [
        0, 0, -c/4,        // Vertex 0
        -c/4, 0, c/4,      // Vertex 1
        c/4, 0, c/4,       // Vertex 2
        0, c, 0            // Apex (3)
    ];

    const indices = [
        0, 1, 2,        // Base
        0, 2, 3,
        2, 1, 3,        // Side Triangles
        1, 0, 3
    ];

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    mesh = new THREE.Mesh( geometry, material );
    if(reversed) {
        mesh.rotation.x = Math.PI;
    }
    mesh.position.set(ref_x, ref_y, ref_z);
    if (name != null) mesh.name = name;
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
    
    addCylinder(crane, c, c, c, 50, 0, 0, 0, 0, 0, 0, material2, null); // axis of rotation
    addCube(crane, c, c, 15*c, 0, c, 3*c, material1); // jib and counterjib
    addCube(crane, c, c, c, c, c, 0, material4); // cabine
    addPyramid(crane, 0, c, 0, material3); // apex
    addCube(crane, c/2, 2*c, c, 0, 0, -3*c, material2); // counterweight
    addCylinder(crane, c/20, c/20, c*10.05, 50, 0, 4*c/2, 5*c, -1.39, 0, 0, material5) // fore pendant
    addCylinder(crane, c/20, c/20, c*5-c/2, 50, 0, 4*c/2, -2*c, 1.15, 0, 0,  material5) // rear pendant
    
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
    addCylinder(car, c/16, c/16, 5*c, 50, 0, -((h+c)/4), 0, 0, 0, 0, material5, "cable"); // steel cable
    
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
    claw.userData = { up: false, down: false, rotateIn: false, rotateOut: false, rotation: 0.0 };

    addCylinder(claw, c, c, c, 50, 0, 0, 0, 0, 0, 0, material5, null); // claw block
    addTetrahedron(claw, 2*c/3, -c/3, 0, material2, true, "claw1"); // claw
    addTetrahedron(claw, -2*c/3, -c/3, 0, material2, true, "claw2"); // claw
    addTetrahedron(claw, 0, -c/3, 2*c/3, material2, true, "claw3"); // claw
    addTetrahedron(claw, 0, -c/3, -2*c/3, material2, true, "claw4"); // claw
    
    claw.position.x = 0;
    claw.position.y = -h/2;
    claw.position.z = 0;
    claw.radius=1;

    car.add(claw);
}

function createContainer(){
    'use strict';

    container = new THREE.Object3D();
    
    addCube(container, 5.5,0,7 , 0,-1.5,0, material2)
    addCube(container, 5.5,2.5,0.2 , 0,-0.8,3.5, material5)
    addCube(container, 5.5,2.5,0.2 , 0,-0.8,-3.5, material5)
    addCube(container, 0.2,2.5,7 , 2.7,-0.8,0, material5)
    addCube(container, 0.2,2.5,7 , -2.7,-0.8,0, material5)

    scene.add(container);

    container.position.x = 7;
    container.position.y = 1.5;
    container.position.z = 7;
}

function createObjects(){
    'use strict';
    
    for (let i = 0; i < 5; i++) {
        objects[i] = new THREE.Object3D();
        scene.add(objects[i]);
    }
    addCube(objects[0], 1, 1, 1, 0, 0, 0, material1);
    objects[0].radius = Math.sqrt(3)/2;
    
    geometry = new THREE.DodecahedronGeometry(1);
    mesh = new THREE.Mesh(geometry, material2);
    mesh.position.set(0, 0, 0);
    objects[1].add(mesh);
    objects[1].radius = 1;

    geometry = new THREE.IcosahedronGeometry(1);
    mesh = new THREE.Mesh(geometry, material3);
    mesh.position.set(0, 0, 0);
    objects[2].add(mesh);
    objects[2].radius = 1;

    geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
    mesh = new THREE.Mesh(geometry, material4);
    mesh.position.set(0, 0, 0);
    objects[3].add(mesh);
    objects[3].radius = 1;

    geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
    mesh = new THREE.Mesh(geometry, material5);
    mesh.position.set(0, 0, 0);
    objects[4].add(mesh);
    objects[4].radius = 1;

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

function checkCollisions(){
    'use strict';

    if (collision.action)
        return;
    var vectorClaw= new THREE.Vector3();
    claw.getWorldPosition(vectorClaw)
    var vectorObject= new THREE.Vector3();
    for (let i = 0; i < 5; i++) {
        objects[i].getWorldPosition(vectorObject)

        // Calculate the distance between the centers of the spheres
        const dx = vectorClaw.x - vectorObject.x;
        const dy = vectorClaw.y - vectorObject.y;
        const dz = vectorClaw.z - vectorObject.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);


        // Check if the distance is less than the sum of the radius
        if (distance < claw.radius + objects[i].radius){
            console.log("Collision detected");
            collision.action = true;
            collision.number = i;
            collision.phase1 = true;
            if(vectorClaw.x < 0){
                collision.rotation = true;
            }else{
                collision.rotation = false;
            }
            cancelAnimation();
        }
        if (collision.action)
            break;
    }

}

function cancelAnimation(){
    'use strict';
    crane.userData.rot_pos = false;
    crane.userData.rot_neg = false;
    car.userData.forwards = false;
    car.userData.backwards = false;
    claw.userData.up = false;
    claw.userData.down = false;
    claw.userData.rotateIn = false;
    claw.userData.rotateOut = false;
}


///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

    // não permitir tocar nas teclas de movimento
    // agarrar no bloco
    // subir cabo
    // alinhar carrinho
    // rodar grua
    // descer cabo
    // soltar bloco
    // subir cabo (duvidoso)

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    
    var delta = clock.getDelta();
    // Crane Controls
    if (crane.userData.rot_pos) {
        pos_rotation.style.color = 'lightgreen';        
        crane.rotateY(0.3 * delta);
    } else {
        pos_rotation.style.color = 'tomato';
    }
    if (crane.userData.rot_neg) {
        neg_rotation.style.color = 'lightgreen';
        crane.rotateY(-0.3 * delta);
    } else {
        neg_rotation.style.color = 'tomato';
    }
    if (car.userData.forwards && car.position.z < 10) {
        forwards.style.color = 'lightgreen';
        car.position.z += 1.5 * delta;
    } else {
        forwards.style.color = 'tomato';
    }
    if (car.userData.backwards && car.position.z > 2) {
        backwards.style.color = 'lightgreen';
        car.position.z -= 1.5 * delta;
    } else {
        backwards.style.color = 'tomato';
    }
    if (claw.userData.up && claw.position.y < -1) {
        up.style.color = 'lightgreen';
        claw.position.y += 5 * delta;
        car.children.forEach(element => {
            if (element.name == "cable") {
                element.scale.y -= 1 * delta;
                element.position.y += 2.5 * delta;
            }
        });
    } else {
        up.style.color = 'tomato';
    }
    if (claw.userData.down && claw.position.y > -10) {
        down.style.color = 'lightgreen';
        claw.position.y -= 5 * delta;
        car.children.forEach(element => {
            if (element.name == "cable") {
                element.scale.y += 1 * delta;
                element.position.y -= 2.5 * delta;
            }
        });
    } else {
        down.style.color = 'tomato';
    }
    if (claw.userData.rotateIn && claw_rotation < 3*c) {
        close_claw.style.color = 'lightgreen';
        claw.children.forEach(element => {
            if (element.name == "claw1") {
                element.rotateZ(0.01);
            }
            if (element.name == "claw2") {
                element.rotateZ(-0.01);
            }
            if (element.name == "claw3") {
                element.rotateX(0.01);
            }
            if (element.name == "claw4") {
                element.rotateX(-0.01);
            }
            claw_rotation += 0.01;
        });
    } else {
        close_claw.style.color = 'tomato';
    }
    if (claw.userData.rotateOut && claw_rotation > -4*c) {
        open_claw.style.color = 'lightgreen';
        claw.children.forEach(element => {
            if (element.name == "claw1") {
                element.rotateZ(-0.01);
            }
            if (element.name == "claw2") {
                element.rotateZ(0.01);
            }
            if (element.name == "claw3") {
                element.rotateX(-0.01);
            }
            if (element.name == "claw4") {
                element.rotateX(0.01);
            }
            claw_rotation -= 0.01;
        });
    } else {
        open_claw.style.color = 'tomato';
    }

    // Cameras
    for (var i = 0; i < 6; i++) {
        camHUD[i].style.color = 'tomato';
    }    
    var currentCameraIndex = cameras.indexOf(camera);
    
    if (currentCameraIndex !== -1) {
        camHUD[currentCameraIndex].style.color = 'lightgreen';
    }

    // Wireframe
    if (toggleWireframe) {
        wireframe.style.color = 'lightgreen';
    } else {
        wireframe.style.color = 'tomato';
    }
    checkCollisions();
    //phase 1 (abrir), phase 2 (fechar), phase 3 (subir e colocar na posisao certa), phase 4 (descer), phase 5 (limpar o objeto)
    var vectorClaw= new THREE.Vector3();
    claw.getWorldPosition(vectorClaw)
    if(collision.phase1){
        if(claw_rotation > -4*c){
            claw.userData.rotateOut = true;
        } else {
            claw.userData.rotateOut = false;
            collision.phase1 = false;
            collision.phase2 = true;
        }
    }
    if(collision.phase2){
        if(claw_rotation < 3*c){
            claw.userData.rotateIn = true;
            if(vectorClaw.y > 4)
                claw.userData.down = true;
        } else {
            claw.userData.rotateIn = false;
            claw.userData.down = false;
            collision.phase2 = false;
            collision.phase3 = true;

        }
    }
    if(collision.phase3){
        if(vectorClaw.y < 7){
            claw.userData.up = true;
            objects[collision.number].position.y+=5 * delta;
        }else{
            claw.userData.up = false;
        }
        if(car.position.z < 10){
            car.userData.forwards = true;
        }else{
            car.userData.forwards = false;
        }
        if(collision.rotation && car.position.z > 10){
            crane.userData.rot_pos = true;
        }if(!collision.rotation && car.position.z > 10){
            crane.userData.rot_neg = true;
        }
        if(vectorClaw.z > 6.5 && vectorClaw.z < 7.5 && vectorClaw.x > 6.5 && vectorClaw.x < 7.5){
            crane.userData.rot_pos = false;
            crane.userData.rot_neg = false;
            car.userData.forwards = false;
            claw.userData.up = false;
            collision.phase3 = false;
            collision.phase4 = true;
        }
        objects[collision.number].position.z = vectorClaw.z;
        objects[collision.number].position.x = vectorClaw.x;
    }
    if(collision.phase4){
        if(vectorClaw.y > 4){
            claw.userData.down = true;
            objects[collision.number].position.y-=5 * delta;
        }else{
            claw.userData.down = false;
            collision.phase4 = false;
            collision.phase5 = true;
        } 
    }
    if(collision.phase5){
        if(objects[collision.number].position.y > 0)
            objects[collision.number].position.y -= 5 * delta;
        else{
            objects[collision.number].position.y = -20;
            scene.remove(objects[collision.number]);
            collision.action = false;
            collision.phase5 = false;
            collision.number = -1;
        }
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

    clock = new THREE.Clock();

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
        camera = cameras[5];
        break;
    case 55 : //'7'
        toggleWireframe = !toggleWireframe;
        material1.wireframe = !material1.wireframe;
        material2.wireframe = !material2.wireframe;        
        material3.wireframe = !material3.wireframe;        
        material4.wireframe = !material4.wireframe;        
        material5.wireframe = !material5.wireframe;        
        break;
    case 81: //'q'
        if(!collision.action)
            crane.userData.rot_pos = true;
        break;
        case 65: //'a'
        if(!collision.action)
            crane.userData.rot_neg = true;
        break;
    case 87: //'w'
        if(!collision.action)
            car.userData.forwards = true;
        break;
    case 83: //'s'
        if(!collision.action)
            car.userData.backwards = true;
        break;
    case 69: //'e'
        if(!collision.action)
            claw.userData.up = true;
        break;
    case 68: //'d'
        if(!collision.action)
            claw.userData.down = true;
        break;
    case 82: //'r'
        if(!collision.action)
            claw.userData.rotateIn = true;
        break;
    case 70: //'f'
        if(!collision.action)
            claw.userData.rotateOut = true;
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
    case 81: //'q'
        crane.userData.rot_pos = false;        
        break;
    case 65: //'a'
        crane.userData.rot_neg = false;        
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
    case 82: //'r'
        claw.userData.rotateIn = false;
        break;
    case 70: //'f'
        claw.userData.rotateOut = false;
        break;
    }

}

init();
animate();
