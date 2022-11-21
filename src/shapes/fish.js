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

export function createGLTFFish(
    mass = 1,
    position = { x: -50, y: 25, z: -10 },
    scale = {
        x: 0.015, y: 0.015, z: 0.015
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI, z: 0 }
) {
    window.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(
        '../../../../assets/models/red_betta_fish/scene.gltf',
        (gltf) => {
            const fish = gltf.scene;
            fish.name = 'fish';
            fish.scale.set(scale.x, scale.y, scale.z);
            fish.position.set(position.x, position.y, position.z);
            fish.rotation.set(rotation.x, rotation.y, rotation.z);
            fish.collisionResponseSplash = (mesh) => {
                if (window.splashCount < 1) {
                    const audio = new Audio('../../../../assets/sounds/splash.mp3');
                    audio.play().then();
                    window.splashCount++;
                }
                // applyImpulse(fish, 100, { x: 0, y: 1, z: 0 });
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

            const shape = new Ammo.btBoxShape(new Ammo.btVector3(23, 23, 23));
            //const shape = new Ammo.btSphereShape(25);
            //shape.getMargin(0.05);

            let rigidBody = createAmmoRigidBody(
                shape,
                fish,
                0.1,
                0.1,
                position,
                mass
            );

            fish.userData.physicsBody = rigidBody;

            g_ammoPhysicsWorld.addRigidBody(
                rigidBody,
                COLLISION_GROUP_BOX,
                COLLISION_GROUP_SPHERE |
                COLLISION_GROUP_BOX |
                COLLISION_GROUP_MOVABLE |
                COLLISION_GROUP_PLANE
            );

            addMeshToScene(fish);
            g_rigidBodies.push(fish);
            rigidBody.threeMesh = fish;
        }
    );
}
