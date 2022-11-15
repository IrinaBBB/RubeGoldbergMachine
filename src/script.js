import './style.css';
import * as THREE from 'three';
import Stats from 'stats.js';

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

    //Input - standard Javascript / WebGL:
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    /**
     *  Create Three Scene
     */
    createThreeScene();

    /**
     * Create Ammo World
     */
    createAmmoWorld(true);

    /**
     *  Add three/ammo-objects
     */
    addAmmoSceneObjects();

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

function addAmmoSceneObjects() {
    createAmmoXZPlane(XZ_PLANE_SIDE_LENGTH);
    createAmmoSpheres(20);
    createAmmoCube();
    createMovable();
}

function handleKeyUp(event) {
    g_currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
    g_currentlyPressedKeys[event.code] = true;
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
