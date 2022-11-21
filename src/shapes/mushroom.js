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
    window.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(
        '../../../../assets/models/pc_nightmare_mushroom/scene.gltf',
        (gltf) => {
            const mushroom = gltf.scene;
            mushroom.name = 'mushroom';
            mushroom.scale.set(scale.x, scale.y, scale.z);
            mushroom.position.set(position.x, position.y, position.z);
            mushroom.rotation.set(rotation.x, rotation.y, rotation.z);
            mushroom.collisionResponse = (mesh) => {
                const audio = new Audio('../../../../assets/sounds/chips.mp3');
                audio.play().then();
            };
            addMeshToScene(mushroom);
            console.log(gltf.scene.animations);

            const mixer = new THREE.AnimationMixer(gltf.scene);
            g_animationMixers.push(mixer);

            let clips = gltf.animations;
            for (let i = 0; i < clips.length; i++) {
                console.log(clips[i].name);
            }

            const animation0 = gltf.animations[0];
            const action0 = mixer.clipAction(animation0);
            action0.setLoop(THREE.LoopRepeat);
            //action0.setDuration(10);
            action0.play();
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
                0,
                position,
                mass
            );

            g_ammoPhysicsWorld.addRigidBody(
                rigidBody,
                COLLISION_GROUP_BOX,
                COLLISION_GROUP_SPHERE |
                    COLLISION_GROUP_BOX |
                    COLLISION_GROUP_MOVABLE |
                    COLLISION_GROUP_PLANE
            );

            mushroom.userData.physicsBody = rigidBody;
            g_rigidBodies.push(mushroom);
            rigidBody.threeMesh = mushroom;
        }
    );
}
