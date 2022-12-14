import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper.js';
import {
    createAmmoRigidBody,
    g_ammoPhysicsWorld,
    g_rigidBodies,
} from './myAmmoHelper.js';
import { cloneUniformsGroups } from 'three/src/renderers/shaders/UniformsUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

window.loader = new GLTFLoader();

let g_xzPlaneSideLength = 200;
export const COLLISION_GROUP_PLANE = 1;
export const COLLISION_GROUP_SPHERE = 2;
export const COLLISION_GROUP_MOVABLE = 4;
export const COLLISION_GROUP_BOX = 8; //..osv. legg til etter behov.
export const COLLISION_GROUP_PENDULUM_SPHERE = 10;
export const COLLISION_GROUP_PENDULUM_SPHERE_BALL = 12;
export const g_animationMixers = [];


export function createAmmoXZPlane(xzPlaneSideLength, xzPlaneSideWidth) {
    const mass = 0;
    const position = { x: 41, y: 50, z: 55 };
    g_xzPlaneSideLength = xzPlaneSideLength;
    /**
     * Three.js
     */
    let geometry = new THREE.PlaneGeometry(
        xzPlaneSideLength,
        xzPlaneSideWidth,
        1,
        1
    );
    geometry.rotateX(-Math.PI / 2);
    let material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.name = 'xzplane';

    /**
     * Ammo.js
     */
    let shape = new Ammo.btBoxShape(
        new Ammo.btVector3(xzPlaneSideLength / 2, 0, xzPlaneSideWidth / 2)
    );
    //shape.setMargin( 0.05 );
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);

    mesh.userData.physicsBody = rigidBody;

    /**
     * Adds rigid body to the world
     */
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PLANE,
        COLLISION_GROUP_SPHERE | COLLISION_GROUP_BOX
    );

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh; //Brukes til collision events:
}

export function createAmmoSphere(
    mass = 100,
    color = 0x00ff00,
    position = { x: 0, y: 50, z: 0 }
) {
    const radius = 0.2 * mass;

    /**
     * Three.js
     */
    let mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({ color: color })
    );
    mesh.name = 'sphere';
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.collisionResponse = (mesh1) => {
        mesh1.material.color.setHex(Math.random() * 0xffffff);
    };

    /**
     * Ammo.js
     */
    let shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
    shape.setMargin(0.05);
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0, position, mass);

    mesh.userData.physicsBody = rigidBody;

    /**
     * Add to physics world
     */
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SPHERE,
        COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_BOX |
            COLLISION_GROUP_MOVABLE |
            COLLISION_GROUP_PLANE
    );

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;
}

export function createAmmoBox(
    mass = 17,
    color = 0xf00fe0,
    dimensions = { x: 1, y: 1, z: 1 },
    position = { x: 20, y: 50, z: 30 },
    rotation = { x: 0, y: 0, z: 0 },
    visible = true
) {
    /**
     * Three.js
     */
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z, 1, 1),
        new THREE.MeshStandardMaterial({ color: color })
    );
    mesh.name = 'cube';
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = visible;

    /**
     * Ammo.js
     */
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;

    let shape = new Ammo.btBoxShape(
        new Ammo.btVector3(width / 2, height / 2, depth / 2)
    );
    //shape.setMargin(0.05);
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);

    mesh.userData.physicsBody = rigidBody;

    /**
     * Add to physics world
     */
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_BOX,
        COLLISION_GROUP_BOX |
            COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_MOVABLE |
            COLLISION_GROUP_PLANE
    );

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;
}

/**
 * Creates kinematic rigid body
 * mass = 0
 * can be moved and animated
 * can move dynamic rigid bodies
 * cannot be moved by dynamic rigid bodies
 */
export function createMovable(
    color = 0x00a6e5,
    position = { x: -10, y: 20, z: -30 },
    dimensions = { x: 5, y: 5, z: 5 }
) {
    const mass = 0;
    const sideLength = dimensions.y;

    /**
     * Three.js
     */
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z, 1, 1),
        new THREE.MeshStandardMaterial({ color: color })
    );
    mesh.name = 'movable';
    position.y = position.y + (mesh.scale.y * sideLength) / 2;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    /**
     * Ammo.js
     */
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;

    let shape = new Ammo.btBoxShape(
        new Ammo.btVector3(width / 2, height / 2, depth / 2)
    );
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);
    // F??lgende er avgj??rende for ?? kunne flytte p?? objektet:
    // 2 = BODYFLAG_KINEMATIC_OBJECT: Betyr kinematic object, masse=0 men kan flyttes!
    rigidBody.setCollisionFlags(rigidBody.getCollisionFlags() | 2);
    // 4 = BODYSTATE_DISABLE_DEACTIVATION, dvs. "Never sleep".
    rigidBody.setActivationState(4);
    mesh.userData.physicsBody = rigidBody;

    /**
     * Adds movable to physical world
     * Adds it to Movable group
     * Sets a mask for those groups with which it can collide
     */
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_MOVABLE,
        COLLISION_GROUP_SPHERE | COLLISION_GROUP_PLANE | COLLISION_GROUP_BOX | COLLISION_GROUP_PENDULUM_SPHERE_BALL
    );

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;
}

export function createAmmoSpheres(noSpheres) {
    for (let i = 0; i < noSpheres; i++) {
        let height = 40 + Math.random() * 30;
        createRandomSpheres(height);
    }
}

export function createRandomSpheres(height = 50) {
    const xPos =
        -(g_xzPlaneSideLength / 2) + Math.random() * g_xzPlaneSideLength;
    const zPos =
        -(g_xzPlaneSideLength / 2) + Math.random() * g_xzPlaneSideLength;
    //const pos = {x: xPos, y: height, z: zPos};
    const mass = 5 + Math.random() * 20;

    createAmmoSphere(mass, 0x00ff00, { x: xPos, y: 50, z: zPos });
}
