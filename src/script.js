import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
    createThreeScene,
    handleKeys,
    onWindowResize,
    renderScene,
    updateThree,
} from './helpers/myThreeHelper.js';

import {
    createAmmoRigidBody,
    createAmmoWorld,
    updatePhysics,
} from './helpers/myAmmoHelper.js';

import {
    createAmmoCube,
    createAmmoCubeOfMesh,
    createAmmoSpheres,
    createAmmoBox,
    createAmmoXZPlane,
    createMovable,
} from './helpers/threeAmmoShapes.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * Global variables
 */
let g_clock;
let g_models;
let g_scene;
const g_currentlyPressedKeys = [];
const XZ_PLANE_SIDE_LENGTH = 300;
const stats = Stats();

/**
 * Ammo.js Initialization
 */
Ammo().then(async function (AmmoLib) {
    Ammo = AmmoLib;
    await main();
});

/**
 * Main function
 */
export async function main() {
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    /**
     * Call handleKeyUp and handleKeyDown on keyUp/keyDown
     */
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    /**
     *  Create Three Scene
     */
    g_scene = createThreeScene();

    /**
     * Create Ammo World
     */
    createAmmoWorld(true);

    /**
     *  Add three/ammo-objects
     */
    loadModelsAndSceneObjects();

    /**
     * Clock for animation
     */
    g_clock = new THREE.Clock();

    /**
     * Handle windows resize
     */
    window.addEventListener('resize', onWindowResize, false);

    /**
     * Handle keystrokes
     */
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    /**
     * Start animation loop
     */
    animate(0);
}

function addSceneObjects() {
    //createAmmoXZPlane(XZ_PLANE_SIDE_LENGTH);
    createAmmoSpheres(20);
    createAmmoBox(
        0,
        0x00ffff,
        { x: 10, y: 54, z: 39 },
        { x: -55, y: 23, z: 39.5 },
        false
    );
    // createMovable();
}

function handleKeyUp(event) {
    g_currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
    g_currentlyPressedKeys[event.code] = true;
}

/**
 * Load models function
 */
function loadModelsAndSceneObjects() {
    const progressBarElement = document.querySelector('#progress-bar');
    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressBarElement.style.width = `${
            ((itemsLoaded / itemsTotal) * 100) | 0
        }%`;
    };
    manager.onLoad = () => {
        initModels();
        addSceneObjects();
    };
    g_models = {
        bedroom: {
            url: '../../../assets/models/bedroom/bedroom.glb',
            scale: { x: 15, y: 15, z: 15 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        },
    };
    /**
     * Use GLTFLoader to load each .gltf / .glb file
     */
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(g_models)) {
        gltfLoader.load(model.url, (gltf) => {
            model.gltf = gltf;
        });
    }
}

/**
 * Initialize models function
 */
function initModels() {
    const loadingElement = document.querySelector('#loading');
    loadingElement.style.display = 'none';
    const meshes = [];

    const root = new THREE.Object3D();
    Object.values(g_models).forEach((model, ndx) => {
        model.gltf.scene.traverse(function (child) {
            if (child.name === 'Scene') {
                console.log(child);
                meshes.push(child);
            }
        });

        /**
         * Scale and position
         */
        meshes.forEach((mesh) => {
            const floor = mesh.getObjectByName('Floor');
            floor.customScale = model.scale;
            createAmmoCubeOfMesh(floor, 0);
            root.add(mesh);
        });
        root.scale.set(model.scale.x, model.scale.y, model.scale.z);
        root.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
        g_scene.add(root);
    });
}

function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
    });
    let deltaTime = g_clock.getDelta();

    stats.begin();

    /**
     * Update graphics
     */
    updateThree(deltaTime);

    /**
     * Update physics
     */
    updatePhysics(deltaTime);

    /**
     * Check input
     */
    handleKeys(deltaTime, g_currentlyPressedKeys);

    /**
     * Draw scene with a given camera
     */
    renderScene();

    stats.end();
}
