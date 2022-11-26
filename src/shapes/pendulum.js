import { addMeshToScene } from '../helpers/myThreeHelper';
import * as THREE from 'three';
import {
    createAmmoRigidBody,
    g_ammoPhysicsWorld,
    g_rigidBodies, IMPULSE_FORCE,
} from '../helpers/myAmmoHelper';
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE,
    COLLISION_GROUP_PENDULUM_SPHERE,
    COLLISION_GROUP_PENDULUM_SPHERE_BALL,
    g_animationMixers,
} from '../helpers/threeAmmoShapes';
import {domino} from "./domino";


export async function createPendulum(
    position = {x:0,y: 0,z: 0},
    lineLength = 50,
    ballRadius = 0.5

) {

    const rigidBodyAnchor = await createPendulumAnchor(position);
    const rigidBodyArm = await createPendulumArm(lineLength, ballRadius);
    const armLength = rigidBodyArm.threeMesh.geometry.parameters.height;
    addPendulumConstraint(rigidBodyAnchor, rigidBodyArm, armLength);

}

function addPendulumConstraint(rigidBody1, rigidBody2, armLength) {

    const anchorPivot = new Ammo.btVector3(0.5, 0,0 );
    const anchorAxis = new Ammo.btVector3(1, 0, 0);
    const armPivot = new Ammo.btVector3(0,armLength/2, 0 );
    const armAxis = new Ammo.btVector3(0, 0,0 );
    let hingeConstraint = new Ammo.btHingeConstraint(
        rigidBody1,
        rigidBody2,
        anchorPivot,
        armPivot,
        anchorAxis,
        armAxis,
        false
    );
    const lowerLimit = -Math.PI ;
    const upperLimit = Math.PI;
    const softness = 0.9;
    const biasFactor = 1;
    const relaxationFactor = 1.0;
    if (hingeConstraint !== undefined) {
        hingeConstraint.setLimit(lowerLimit, upperLimit, softness, biasFactor, relaxationFactor);
        hingeConstraint.enableAngularMotor(0, false, 0);

        g_ammoPhysicsWorld.addConstraint(hingeConstraint, false);
    }
}



async function createPendulumAnchor(
    position ={x:0, y:0, z:0}) {
    const mass = 0
    const radius = 1;

    //THREE
    const material = await getPendulumMaterial();
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'pendulumAnchor';
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    //AMMO
    const shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
    shape.setMargin( 0.05 );
    const rigidBody = createAmmoRigidBody(shape, mesh, 0.4, 0, position, mass);
    mesh.userData.physicsBody = rigidBody;
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PENDULUM_SPHERE,
        COLLISION_GROUP_SPHERE);

    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;
    return rigidBody;
}

async function createPendulumArm(height = 50, radius = 0.5) {
    const mass=20;
    const color=0x00ff00;
    const width=0.010, depth=0.1;
    const position={x:0, y:0, z:0};
    const quaternion = {x:0, y:0, z:0, w:1};
    //THREE
    const geometry = new THREE.BoxGeometry(width,height,depth, 1, 1);
    const material = await getPendulumMaterial();

    const armMesh = new THREE.Mesh(geometry, material);
    armMesh.name = 'pendulumArm';
    armMesh.position.set(position.x, position.y, position.z);
    armMesh.castShadow = true;
    armMesh.receiveShadow = true;
    window.PendulumSoundCount = 0;

    armMesh.collisionResponse = (arMesh) => {
        pushPendulumArm(arMesh, {x:15, y:0, z:0})
        //if (window.PendulumSoundCount< 1) {
        //const audio = new Audio('../../../../assets/sounds/bonk.mp3');
        //audio.play().then();
          //  window.dominoSoundCount++;
        }
    //};

    //Ballen
    const cubeTextureLoader = new THREE.TextureLoader();
    const texture = cubeTextureLoader.load([
        '../../../assets/textures/mars.jpg']);
    const weightMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshBasicMaterial(
            { map: texture
            }));

    weightMesh.name = 'pendulumWeight';
    weightMesh.position.set(0, -height/2, 0);
    weightMesh.castShadow = true;
    weightMesh.receiveShadow = true;
    armMesh.add(weightMesh);

    //AMMO
    const mesh_width = armMesh.geometry.parameters.width;    //(er her overflødig)
    const mesh_height = armMesh.geometry.parameters.height;  //(er her overflødig)
    const mesh_depth = armMesh.geometry.parameters.depth;    //(er her overflødig)

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
    transform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) );


    let localInertia = new Ammo.btVector3( 0, 0, 0 );


    const shape = new Ammo.btBoxShape( new Ammo.btVector3( mesh_width/2, mesh_height/2, mesh_depth/2) );
    shape.setMargin( 0.05 );
    shape.calculateLocalInertia( mass, localInertia );
    const rigidBody = createAmmoRigidBody(shape, armMesh, 0.3, 5, position, mass);
    rigidBody.setDamping(0, 0);
    //rigidBody.setActivationState(4);
    armMesh.userData.physicsBody = rigidBody;

    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PENDULUM_SPHERE_BALL,
        COLLISION_GROUP_PENDULUM_SPHERE_BALL
         |
        COLLISION_GROUP_SPHERE |
        COLLISION_GROUP_PLANE |
        COLLISION_GROUP_MOVABLE |
        COLLISION_GROUP_BOX



    );
    addMeshToScene(armMesh);
    g_rigidBodies.push(armMesh);
    rigidBody.threeMesh = armMesh;
    return rigidBody;
}

async function getPendulumMaterial() {

    const color=0x0000ff;
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const texture = await cubeTextureLoader.load([
        '../../../assets/textures/mars.jpg']);


    let material = new THREE.MeshBasicMaterial({map: texture});
    material.metalness =0.7;
    material.roughness=0.2;
    //material.envMap = map;

    if (material === undefined)
        material = new THREE.MeshBasicMaterial({color: color})
    return material;
}

export function pushPendulumArm(mesh, direction) {
    if (!mesh.userData.physicsBody)
        return;
    const rigidBody = mesh.userData.physicsBody;
    rigidBody.activate(true);
    // Gir impuls ytterst på armen:
    const armWidth = mesh.geometry.parameters.width;
    const relativeVector = new Ammo.btVector3(armWidth/2, 0, 0);
    const impulseVector = new Ammo.btVector3(50*direction.x, 0, 100*direction.z);
    rigidBody.applyImpulse(impulseVector, relativeVector);
}