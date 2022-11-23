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
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE,
    g_animationMixers,
} from '../helpers/threeAmmoShapes.js';

export function createPlank(
    dimensions ={
    x: 1,
    y: 1,
    z: 1,
},
    position= {x:20, y: 50, z:30},
    mass = 17,
    rotation = { x: 0, y: 0, z: 0 }
)
{

 //THREE
    let geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
    let material = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'plank';
    mesh.position.set(position.x, position.y, position.z);
    //mesh.rotation.set(rotation.x, scale.y, scale.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);


     //AMMO
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;

    //gemoetrisk struktur

    let shape= new Ammo.btBoxShape( new Ammo.btVector3( width*0.5, height*0.5, depth*0.5 ) );
    //shape.setMargin( 0.05 );


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
        COLLISION_GROUP_BOX,
        COLLISION_GROUP_SPHERE |
        COLLISION_GROUP_BOX |
        COLLISION_GROUP_MOVABLE |
        COLLISION_GROUP_PLANE
    );

    addMeshToScene(mesh);
    g_rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;




}