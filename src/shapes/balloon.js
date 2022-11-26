import { addMeshToScene } from '../helpers/myThreeHelper.js';
import * as THREE from 'three';
import {
    applyImpulse,
    createAmmoRigidBody,
    g_ammoPhysicsWorld,
    g_rigidBodies,
} from '../helpers/myAmmoHelper.js';
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE, COLLISION_GROUP_PENDULUM_SPHERE_BALL,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE,
    g_animationMixers,
} from '../helpers/threeAmmoShapes.js';

export function createBalloon(
    radius = 5
    ,
    position= {x:0, y: 0, z: 0},
    mass = 1000,
    rotation = { x: 0, y: 0, z: 0 },
    quaternion =  {x: 0, y: 0, z: 0, w: 1}
) {

    //THREE
    let geometry = new THREE.SphereGeometry(radius,20,20);
    let material = new THREE.MeshPhongMaterial({
        color: Math.random() *  0xffffff, shininess: 10,
        side: THREE.DoubleSide
    });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'balloon';
    mesh.position.set(position.x, position.y, position.z);


    //AMMO
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;

    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));


    let localInertia = new Ammo.btVector3(0, 0, 0);


    //gemoetrisk struktur

    let shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
    shape.setMargin(0.05);
    shape.calculateLocalInertia(mass, localInertia);


    let rigidBody = createAmmoRigidBody(
        shape,
        mesh,
        0,
        0,
        position,
        mass
    );
    mesh.userData.physicsBody = rigidBody;
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SPHERE,
        COLLISION_GROUP_SPHERE |
        COLLISION_GROUP_BOX |
        COLLISION_GROUP_MOVABLE |
        COLLISION_GROUP_PENDULUM_SPHERE_BALL |
        COLLISION_GROUP_PLANE
    );

    mesh.collisionResponse = (mesh) => {
       // mesh.forEach(balloon => {
            mesh.position.y -= 1;
            //if (balloon.position.y > 50)
              //      scene.remove(balloon);

        }

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;




}
