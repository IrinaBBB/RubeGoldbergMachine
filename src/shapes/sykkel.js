import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addMeshToScene } from '../helpers/myThreeHelper';
import * as THREE from 'three';
import {
    createAmmoRigidBody,
    g_ammoPhysicsWorld,
    g_rigidBodies,
} from '../helpers/myAmmoHelper';
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE,
    g_animationMixers,
} from '../helpers/threeAmmoShapes';

window.splashCount = 0;

export function createGLTFSykkel(
    mass = 1,
    position = { x: 1, y: 1, z: 1.1 },
    scale = {
        x: 15,
        y: 15,
        z: 15,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI, z: 0 }
) {
    window.loader = new GLTFLoader();
   // const dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('/draco/');
    //loader.setDRACOLoader(dracoLoader);
    loader.load(
        '../../../../assets/models/Old_Bicycle.glb',
        (glb) => {
            const sykkel = glb.scene;
            sykkel.name = 'sykkel';
            sykkel.scale.set(scale.x, scale.y, scale.z);
            sykkel.position.set(position.x, position.y, position.z);
            sykkel.rotation.set(rotation.x, rotation.y, rotation.z);
            sykkel.collisionResponse = (mesh) => {
                const audio = new Audio('../../../../assets/sounds/honk.mp3');
                audio.play().then();
                window.splashCount++;
            };
            let transform1 = new Ammo.btTransform();
            transform1.setIdentity();
            transform1.setOrigin(
                new Ammo.btVector3(position.x, position.y, position.z)
            );
            transform1.setRotation(
                new Ammo.btQuaternion(
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                )
            );

            const shape1 = new Ammo.btBoxShape(new Ammo.btVector3(10, 10, 10));
            //const shape = new Ammo.btSphereShape(25);
            //shape.getMargin(0.05);

            let rigidBody = createAmmoRigidBody(
                shape1,
                sykkel,
                0.5,
                50,
                position,
                mass
            );

            sykkel.userData.physicsBody = rigidBody;

            g_ammoPhysicsWorld.addRigidBody(
                rigidBody,
                COLLISION_GROUP_BOX,
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_BOX |
                COLLISION_GROUP_MOVABLE |
                COLLISION_GROUP_PLANE
            );

            addMeshToScene(sykkel);
            g_rigidBodies.push(sykkel);
            rigidBody.threeMesh = sykkel;
        }
    );
}
