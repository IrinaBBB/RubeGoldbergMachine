import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { addMeshToScene } from '../helpers/myThreeHelper';
import {
    applyImpulse,
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

export function createGLTFSportsbil(
    mass = 1,
    position = {x: 8, y: 23, z: -35},
    scale = {
        x: 0.015, y: 0.015, z: 0.015
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI*4, z: 0 }
) {
    window.loader = new GLTFLoader();
    //const dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('/draco/');
    //loader.setDRACOLoader(dracoLoader);
    loader.load(
        '../../../../assets/models/sportsbil/sportcar_017.glb',
        (glb) => {
            const sportsbil = glb.scene;
            sportsbil.name = 'sportsbil';
            sportsbil.scale.set(scale.x, scale.y, scale.z);
            sportsbil.position.set(position.x, position.y, position.z);
            sportsbil.rotation.set(rotation.x, rotation.y, rotation.z);
            sportsbil.collisionResponseSplash = (mesh) => {
                if (window.splashCount < 1) {
                    const audio = new Audio('../../../../assets/sounds/engine.mp3');
                    audio.play().then();
                    window.splashCount++;
                }
            };

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

            const shape = new Ammo.btBoxShape(new Ammo.btVector3(70, 70, 70));
            //const shape = new Ammo.btSphereShape(25);
            //shape.getMargin(0.05);

            let rigidBody = createAmmoRigidBody(
                shape,
                sportsbil,
                0.8,
                100,
                position,
                mass
            );

            sportsbil.userData.physicsBody = rigidBody;

            g_ammoPhysicsWorld.addRigidBody(
                rigidBody,
                COLLISION_GROUP_BOX,
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_BOX |
                COLLISION_GROUP_MOVABLE |
                COLLISION_GROUP_PLANE
            );

            addMeshToScene(sportsbil);
            g_rigidBodies.push(sportsbil);
            rigidBody.threeMesh = sportsbil;
        }
    );
}
