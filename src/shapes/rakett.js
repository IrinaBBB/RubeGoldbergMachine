import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import {DRACOLoader} from "three/addons/loaders/DRACOLoader";
import {createAmmoRigidBody, g_ammoPhysicsWorld, g_rigidBodies} from "../helpers/myAmmoHelper";
import {addMeshToScene} from "../helpers/myThreeHelper";
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE
} from "../helpers/threeAmmoShapes";

export function createGLTFRakett(
    mass = 50,
    position = { x: -1, y: 5, z: 5 },
    scale = {
        x: 0.03,
        y: 0.03,
        z: 0.03,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI / 2, z: 0 }
) {
    window.dominoSoundCount = 0;
    window.loader = new GLTFLoader();
    let rocket;
    //const dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('/draco/');
    //loader.setDRACOLoader(dracoLoader);
    loader.load( "https://www.stivaliserna.com/assets/rocket/rocket.gltf",
        (gltf) => {
            rocket = gltf.scene;
            rocket.position.y = 50;
        rocket.scale.set(scale.x, scale.y, scale.z);
        rocket.position.set(position.x, position.y, position.z);
        rocket.rotation.set(rotation.x, rotation.y, rotation.z);
        rocket.collisionResponse = (mesh) => {
            if (window.dominoSoundCount < 1) {
                const audio = new Audio('../../../../assets/sounds/chips.mp3');
                audio.play().then();
                window.dominoSoundCount++;
            }
        };
        addMeshToScene(rocket);
        console.log(gltf.scene.animations);
        rocket.name = 'domino';



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

        const shape = new Ammo.btBoxShape(new Ammo.btVector3(70, 130, 50));
        //shape.getMargin(0.05);

        let rigidBody = createAmmoRigidBody(
            shape,
            rocket,
            0.5,
            50,
            position,
            mass
        );
        //domino.userData.physicsBody = rigidBody;
        g_ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_BOX |
            COLLISION_GROUP_MOVABLE |
            COLLISION_GROUP_PLANE
        );

        rocket.userData.physicsBody = rigidBody;
        //addMeshToScene(domino);
        g_rigidBodies.push(rocket);
        rigidBody.threeMesh = rocket;
    });
}