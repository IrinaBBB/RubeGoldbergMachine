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

import { createAmmoWorld, updatePhysics } from './helpers/myAmmoHelper.js';

import {
    createAmmoCube,
    createAmmoSpheres,
    createAmmoXZPlane,
    createMovable,
} from './helpers/threeAmmoShapes.js';

/**
 * Global variables
 */
let g_clock;
let g_models;
let g_scene;
const g_currentlyPressedKeys = [];
const XZ_PLANE_SIDE_LENGTH = 100;
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
    addSceneObjects();

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
    createAmmoXZPlane(XZ_PLANE_SIDE_LENGTH);
    // createAmmoSpheres(20);
    // createAmmoCube();
    // createMovable();
    loadModels();
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
function loadModels() {
    const progressBarElement = document.querySelector('#progressbar');
    const manager = new THREE.LoadingManager();
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressBarElement.style.width = `${
            ((itemsLoaded / itemsTotal) * 100) | 0
        }%`;
    };
    manager.onLoad = () => {
        initModels();
    };
    g_models = {
        mantis: {
            url: '../../../assets/models/mantis/scene.gltf',
            scale: { x: 0.3, y: 0.3, z: 0.3 },
            position: { x: 0, y: 0, z: 0 },
        },
        pc_nightmare_mushroom: {
            url: '../../../assets/models/pc_nightmare_mushroom/scene.gltf',
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 40, y: 20, z: 0 },
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

    Object.values(g_models).forEach((model, ndx) => {
        model.gltf.scene.traverse(function (child) {
            if (child.type === 'SkinnedMesh') {
                console.log(child);
            }
        });

        const clonedScene = SkeletonUtils.clone(model.gltf.scene);
        const root = new THREE.Object3D();
        /**
         * Scale and position
         */
        root.scale.set(model.scale.x, model.scale.y, model.scale.z);
        root.position.set(model.position.x, model.position.y, model.position.z);
        root.add(clonedScene);
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
