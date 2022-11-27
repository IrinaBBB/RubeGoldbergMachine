import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import {createAmmoRigidBody, g_ammoPhysicsWorld, g_rigidBodies} from "../helpers/myAmmoHelper";
import {addMeshToScene} from "../helpers/myThreeHelper";
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE
} from "../helpers/threeAmmoShapes";
export let bell;

window.bellCount = 0;

export function createGLTFBell(
    mass = 1,
    position = {x: -15, y: 6, z: 40.5},
    scale = {x: 70, y: 70, z: 70},
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: 0, z: 0 }
) {
    window.loader = new GLTFLoader();
    loader.load(
        '../../../../assets/models/bell/bell.glb',
        (glb) => {
            bell = glb.scene;
            bell.scale.set(scale.x, scale.y, scale.z);
            bell.position.set(position.x, position.y, position.z);
            bell.rotation.set(rotation.x, rotation.y, rotation.z);
            bell.collisionResponse = (mesh) => {
                if (window.bellCount < 1) {
                    const audio = new Audio('../../../../assets/sounds/bell.mp3');
                    audio.play().then();
                    //audio.setVolume(8);
                    window.bellCount++;
                }
            };

            addMeshToScene(bell);
            console.log(glb.scene.animations)
            bell.name = 'bell';

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


            let shape = new Ammo.btBoxShape(new Ammo.btVector3(0.1, 0, 0.1 )); //70, 70, 70
            //shape.setMargin( 0.05 );
            //const shape = new Ammo.btSphereShape(2);
            //shape.getMargin(0.05);

            let rigidBody = createAmmoRigidBody(
                shape,
                bell,
                0.8,
                50,
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

            bell.userData.physicsBody = rigidBody;
            g_rigidBodies.push(bell);
            rigidBody.threeMesh = bell;
        }
    );
}
