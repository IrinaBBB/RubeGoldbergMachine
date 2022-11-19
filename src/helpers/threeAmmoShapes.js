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

let g_xzPlaneSideLength = 200;

const COLLISION_GROUP_PLANE = 1;
const COLLISION_GROUP_SPHERE = 2;
const COLLISION_GROUP_MOVABLE = 4;
const COLLISION_GROUP_BOX = 8; //..osv. legg til etter behov.
let loader;

export function createGLTFDomino(
    mass = 100,
    position = { x: -55, y: 50, z: 40 },
    scale = {
        x: 0.01,
        y: 0.01,
        z: 0.01,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI / 2, z: 0 }
) {
    loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load('../../../../assets/models/domino/scene.gltf', (gltf) => {
        const domino = gltf.scene;
        domino.scale.set(scale.x, scale.y, scale.z);
        domino.position.set(position.x, position.y, position.z);
        domino.rotation.set(rotation.x, rotation.y, rotation.z);
        addMeshToScene(domino);

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(
            new Ammo.btVector3(position.x, position.y, position.z)
        );
        transform.setRotation(
            new Ammo.btQuaternion(
                quaternion.x,
                quaternion.y,
                quaternion.z,
                quaternion.w
            )
        );

        let verticesPosition = [];
        const cube = domino.getObjectByName('Cube');
        cube.children.forEach((child) => {
            const array = Array.from(
                child.geometry.getAttribute('position').array
            );
            verticesPosition.push(...array);
        });

        const triangles = [];
        for (let i = 0; i < verticesPosition.length; i += 3) {
            triangles.push({
                x: verticesPosition[i],
                y: verticesPosition[i + 2],
                z: verticesPosition[i + 3],
            });
        }

        let triangle_mesh = new Ammo.btTriangleMesh();
        let vecA = new Ammo.btVector3(0, 0, 0);
        let vecB = new Ammo.btVector3(0, 0, 0);
        let vecC = new Ammo.btVector3(0, 0, 0);

        for (let i = 0; i < triangles.length - 3; i++) {
            vecA.setX(triangles[i].x);
            vecA.setY(triangles[i].y);
            vecA.setZ(triangles[i].z);

            vecB.setX(triangles[i + 1].x);
            vecB.setY(triangles[i + 1].y);
            vecB.setZ(triangles[i + 1].z);

            vecC.setX(triangles[i + 2].x);
            vecC.setY(triangles[i + 2].y);
            vecC.setZ(triangles[i + 2].z);

            triangle_mesh.addTriangle(vecA, vecB, vecC, true);
        }

        Ammo.destroy(vecA);
        Ammo.destroy(vecB);
        Ammo.destroy(vecC);

        /**
         * Shape created from vertices (is not used for now)
         */
        // const shape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true);
        // cube.children.forEach((child) => {
        //     child.geometry.verticesNeedUpdate = true;
        // });

        const shape = new Ammo.btBoxShape(new Ammo.btVector3(30, 40, 30));
        //shape.getMargin(0.05);

        let rigidBody = createAmmoRigidBody(
            shape,
            domino,
            0.1,
            1,
            position,
            mass
        );

        g_ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_SPHERE,
            COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_BOX |
                COLLISION_GROUP_MOVABLE |
                COLLISION_GROUP_PLANE
        );

        domino.userData.physicsBody = rigidBody;
        g_rigidBodies.push(domino);
    });
}

export function createGLTFMushroom(
    mass = 1,
    position = { x: -55, y: 62, z: 30 },
    scale = {
        x: 0.5,
        y: 0.5,
        z: 0.5,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI / 2, z: 0 }
) {
    loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load('../../../../assets/models/pc_nightmare_mushroom/scene.gltf', (gltf) => {
        const mushroom = gltf.scene;
        mushroom.scale.set(scale.x, scale.y, scale.z);
        mushroom.position.set(position.x, position.y, position.z);
        mushroom.rotation.set(rotation.x, rotation.y, rotation.z);
        addMeshToScene(mushroom);

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(
            new Ammo.btVector3(position.x, position.y, position.z)
        );
        transform.setRotation(
            new Ammo.btQuaternion(
                quaternion.x,
                quaternion.y,
                quaternion.z,
                quaternion.w
            )
        );


        const shape = new Ammo.btBoxShape(new Ammo.btVector3(10, 23, 10));
        //const shape = new Ammo.btSphereShape(25);
        //shape.getMargin(0.05);

        let rigidBody = createAmmoRigidBody(
            shape,
            mushroom,
            0.1,
            0.1,
            position,
            mass
        );

        g_ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_SPHERE,
            COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_BOX |
            COLLISION_GROUP_MOVABLE |
            COLLISION_GROUP_PLANE
        );

        mushroom.userData.physicsBody = rigidBody;
        g_rigidBodies.push(mushroom);
    });
}


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

export function createMovable(
    mass = 0,
    color = 0x00a6e5,
    position = { x: -10, y: 20, z: -30 },
    dimensions = { x: 5, y: 5, z: 5 }
) {
    const sideLength = dimensions.y;


    //THREE
    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z, 1, 1),
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
