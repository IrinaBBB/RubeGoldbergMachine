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
    createAmmoSpheres,
    createAmmoBox,
    createGLTFDomino,
    createAmmoXZPlane,
    createMovable, createGLTFMushroom,
} from './helpers/threeAmmoShapes.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader';

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

function handleKeyUp(event) {
    g_currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
    g_currentlyPressedKeys[event.code] = true;
}

/**
 * Add Scene objects function
 */
function addSceneObjects() {
    //createAmmoXZPlane(XZ_PLANE_SIDE_LENGTH);
   // createAmmoSpheres(20);
    /**
     * Floor and Walls
     */
    createAmmoBox(
        0,
        0x0044ff,
        { x: 120, y: 6, z: 120 },
        { x: 0, y: 0, z: 0 },
        false
    );

    /**
     * Bookshelf physics
     */
    createAmmoBox(
        0,
        0x00ffff,
        { x: 10, y: 54, z: 39 },
        { x: -55, y: 23, z: 39.5 },
        false
    );
    createMovable(0, 0x550099, { x: -55, y: 50, z: 55 });

    /** Small Bed */
    createAmmoBox(
        0,
        0x00ffff,
        { x: 20, y: 10, z: 40 },
        { x: -55, y: 11, z: 0 },
        false
    );

    /** Big Bed */
    createAmmoBox(
        0,
        0xffff00,
        { x: 100, y: 10, z: 35 },
        { x: -55, y: 11, z: -40 },
        false
    );

    /** Dominoes **/
    createGLTFDomino(
        100,
        { x: -55, y: 60, z: 40 },
        { x: 0.02, y: 0.02, z: 0.02 },
        { x: 0, y: 0, z: 0, w: 1 },
        { x: 0, y: Math.PI / 2, z: 0 }
    );

    createGLTFDomino(
        100,
        { x: -55, y: 60, z: 43 },
        { x: 0.02, y: 0.02, z: 0.02 },
        { x: 0, y: 0, z: 0, w: 1 },
        { x: 0, y: Math.PI / 2, z: 0 }
    );

    createGLTFDomino(
        100,
        { x: -55, y: 60, z: 46 },
        { x: 0.02, y: 0.02, z: 0.02 },
        { x: 0, y: 0, z: 0, w: 1 },
        { x: 0, y: Math.PI / 2, z: 0 }
    );

    /** Nightmare Mushroom */
    createGLTFMushroom();
    // createGLTFDomino(
    //     100,
    //     { x: -55, y: 60, z: 48 },
    //     { x: 0.02, y: 0.02, z: 0.02 },
    //     { x: 0, y: 0, z: 0, w: 1 },
    //     { x: 0, y: Math.PI / 2, z: 0 }
    // );
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
        ball: {
            url: '../../../assets/models/pokeball/model.gltf',
            scale: { x: 0.1, y: 0.1, z: 0.1 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
        },
        wooden_wheel: {
            url: '../../../assets/models/wooden_wheel/scene.gltf',
            scale: { x: 0.3, y: 0.3, z: 0.3 },
            position: { x: 5, y: 20, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
        },
        golf_ball: {
            url: '../../../assets/models/golf_ball/scene.gltf',
            scale: { x: 0.05, y: 0.05, z: 0.05 },
            position: { x: 30, y: 20, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
        },
        domino: {
            url: '../../../assets/models/domino/scene.gltf',
            scale: { x: 0.01, y: 0.01, z: 0.01 },
            position: { x: 0, y: 30, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
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

    Object.values(g_models).forEach((model, ndx) => {
        model.gltf.scene.traverse(function (child) {
            if (child.name === 'Floor') {
                meshes.push(child);
            }
        });

        const clonedScene = SkeletonUtils.clone(model.gltf.scene);
        const root = new THREE.Object3D();

        /**
         * Scale and position
         */
        meshes.forEach((mesh) => {
            if (mesh.name === 'Floor') {
                console.log(mesh);
                mesh.customScale = model.scale;
            }
        });

        root.scale.set(model.scale.x, model.scale.y, model.scale.z);
        root.position.set(model.position.x, model.position.y, model.position.z);
        root.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
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
