import * as THREE from 'three';
import GUI from 'lil-gui';
import { applyImpulse, moveRigidBody } from './myAmmoHelper';
import { createRandomSpheres } from './threeAmmoShapes';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

let g_scene, g_renderer, g_camera, g_controls, g_lilGui;

export function createThreeScene() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    /**
     * Renderer
     */
    g_renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    g_renderer.setSize(window.innerWidth, window.innerHeight);
    g_renderer.setClearColor(0xbfd104, 0xff); //farge, alphaverdi.
    g_renderer.shadowMap.enabled = true; //NB!
    g_renderer.shadowMapSoft = true;
    g_renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    /**
     * Scene
     */
    g_scene = new THREE.Scene();
    g_scene.background = new THREE.Color(0xdddddd);

    // lil-gui kontroller:
    g_lilGui = new GUI();

    // Sceneobjekter
    //await addSceneObjects();
    addLights();

    /**
     * Camera
     */
    g_camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    g_camera.position.x = 40;
    g_camera.position.y = 70;
    g_camera.position.z = 50;

    // TrackballControls:
    g_controls = new TrackballControls(g_camera, g_renderer.domElement);
    g_controls.addEventListener('change', renderScene);

    return g_scene;
}

export function addLights() {
    // Ambient:
    let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight1.visible = true;
    g_scene.add(ambientLight1);
    const ambientFolder = g_lilGui.addFolder('Ambient Light');
    ambientFolder.add(ambientLight1, 'visible').name('On/Off');
    ambientFolder
        .add(ambientLight1, 'intensity')
        .min(0)
        .max(1)
        .step(0.01)
        .name('Intensity');
    ambientFolder.addColor(ambientLight1, 'color').name('Color');
    ambientFolder.close();

    /**
     * Directional light (creates shadow)
     */
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.visible = true;
    directionalLight.position.set(0, 105, 0);

    /**
     * Shows light source
     */
    const directionalLightHelper = new THREE.DirectionalLightHelper(
        directionalLight,
        10,
        0xff0000
    );
    directionalLightHelper.visible = true;
    //g_scene.add(directionalLightHelper);
    directionalLight.castShadow = true; //Merk!
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 5;
    directionalLight.shadow.camera.far = 110;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    g_scene.add(directionalLight);
    // Viser lyskildekamera (hva lyskilden "ser")
    // const directionalLightCameraHelper = new THREE.CameraHelper(
    //     directionalLight.shadow.camera
    // );
    // directionalLightCameraHelper.visible = true;
    //
    // g_scene.add(directionalLightCameraHelper);

    //lil-gui:
    const directionalFolder = g_lilGui.addFolder('Directional Light');
    directionalFolder.add(directionalLight, 'visible').name('On/Off');
    directionalFolder
        .add(directionalLight, 'intensity')
        .min(0)
        .max(1)
        .step(0.01)
        .name('Intensity');
    directionalFolder.addColor(directionalLight, 'color').name('Color');
    directionalFolder.close();
}

/**
 * Checks keys
 */
export function handleKeys(delta, g_currentlyPressedKeys) {
    if (g_currentlyPressedKeys['KeyH']) {
        //H
        createRandomSpheres(200);
    }
    if (g_currentlyPressedKeys['KeyU']) {
        //H
        const cube = g_scene.getObjectByName('cube');
        applyImpulse(cube.userData.physicsBody, 50, { x: 0, y: 1, z: 0 });
    }

    const movable = g_scene.getObjectByName('movable');
    if (g_currentlyPressedKeys['KeyA']) {
        //A
        moveRigidBody(movable, { x: -0.2, y: 0, z: 0 });
    }
    if (g_currentlyPressedKeys['KeyD']) {
        //D
        moveRigidBody(movable, { x: 0.2, y: 0, z: 0 });
    }
    if (g_currentlyPressedKeys['KeyW']) {
        //W
        moveRigidBody(movable, { x: 0, y: 0, z: -0.2 });
    }
    if (g_currentlyPressedKeys['KeyS']) {
        //S
        moveRigidBody(movable, { x: 0, y: 0, z: 0.2 });
    }
}

export function onWindowResize() {
    g_camera.aspect = window.innerWidth / window.innerHeight;
    g_camera.updateProjectionMatrix();
    g_renderer.setSize(window.innerWidth, window.innerHeight);
    g_controls.handleResize();
    renderScene();
}

/**
 * Update Trackball controls
 */
export function updateThree(deltaTime) {
    g_controls.update();
}

export function addMeshToScene(mesh) {
    g_scene.add(mesh);
}

export function renderScene() {
    g_renderer.render(g_scene, g_camera);
}

export function getRigidBodyFromMesh(meshName) {
    const mesh = g_scene.getObjectByName(meshName);
    if (mesh) return mesh.userData.physicsBody;
    else return null;
}
