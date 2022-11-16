import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper.js';
import {
    createAmmoRigidBody,
    g_ammoPhysicsWorld,
    g_rigidBodies,
} from './myAmmoHelper.js';
import { cloneUniformsGroups } from 'three/src/renderers/shaders/UniformsUtils';

let g_xzPlaneSideLength = 100;

const COLLISION_GROUP_PLANE = 1;
const COLLISION_GROUP_SPHERE = 2;
const COLLISION_GROUP_MOVABLE = 4;
const COLLISION_GROUP_BOX = 8; //..osv. legg til etter behov.

export function createAmmoXZPlane(xzPlaneSideLength) {
    const mass = 0;
    const position = { x: 0, y: 7.5, z: 0 };
    g_xzPlaneSideLength = xzPlaneSideLength;
    /**
     * Three.js
     */
    let geometry = new THREE.PlaneGeometry(
        g_xzPlaneSideLength,
        g_xzPlaneSideLength,
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
        new Ammo.btVector3(g_xzPlaneSideLength / 2, 0, g_xzPlaneSideLength / 2)
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
    mass = 1,
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

export function createAmmoCubeOfMesh(mesh, mass = 1) {
    let width =
        (mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x) *
        mesh.customScale.x;
    let height =
        (mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y) *
        mesh.customScale.y;
    let depth =
        (mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z) *
        mesh.customScale.z;

    // mesh.castShadow = true;
    // mesh.receiveShadow = true;

    // mesh.position.x *= mesh.customScale.x;
    // mesh.position.y *= mesh.customScale.y;
    // mesh.position.z *= mesh.customScale.z;

    // mesh.rotation.y = -Math.PI / 2;

    console.log(width);
    console.log(height);
    console.log(depth);

    let shape = new Ammo.btBoxShape(
        new Ammo.btVector3(width / 2, height / 2, depth / 2)
    );
    let rigidBody = createAmmoRigidBody(
        shape,
        mesh,
        0.7,
        0.8,
        mesh.position,
        mass
    );
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

    //addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;
}

export function createAmmoCube(
    mass = 17,
    color = 0xf00fe0,
    position = { x: 20, y: 50, z: 30 }
) {
    const sideLength = 0.2 * mass;

    /**
     * Three.js
     */
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, sideLength, sideLength, 1, 1),
        new THREE.MeshStandardMaterial({ color: color })
    );
    mesh.name = 'cube';
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    console.log(mesh);

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

export function createMovable(
    color = 0x00a6e5,
    position = { x: -10, y: 20, z: -30 }
) {
    const sideLength = 5;
    const mass = 0; //Merk!

    //THREE
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, sideLength, sideLength, 1, 1),
        new THREE.MeshStandardMaterial({ color: color })
    );
    mesh.name = 'movable';
    position.y = position.y + (mesh.scale.y * sideLength) / 2;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    //AMMO
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;

    let shape = new Ammo.btBoxShape(
        new Ammo.btVector3(width / 2, height / 2, depth / 2)
    );
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);
    // Følgende er avgjørende for å kunne flytte på objektet:
    // 2 = BODYFLAG_KINEMATIC_OBJECT: Betyr kinematic object, masse=0 men kan flyttes!
    rigidBody.setCollisionFlags(rigidBody.getCollisionFlags() | 2);
    // 4 = BODYSTATE_DISABLE_DEACTIVATION, dvs. "Never sleep".
    rigidBody.setActivationState(4);
    mesh.userData.physicsBody = rigidBody;

    // Legger til physics world:
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_MOVABLE,
        COLLISION_GROUP_SPHERE | COLLISION_GROUP_PLANE | COLLISION_GROUP_BOX
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
    const pos = { x: xPos, y: height, z: zPos };
    const mass = 5 + Math.random() * 20;

    createAmmoSphere(mass, 0x00ff00, { x: xPos, y: 50, z: zPos });
}
