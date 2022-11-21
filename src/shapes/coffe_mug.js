import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {DRACOLoader} from "three/addons/loaders/DRACOLoader";
import {createAmmoRigidBody, g_ammoPhysicsWorld, g_rigidBodies} from "../helpers/myAmmoHelper";
import {addMeshToScene} from "../helpers/myThreeHelper";
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE
} from "../helpers/threeAmmoShapes";

export function createOBJCoffeMug(
    mass = 100,
    position = { x: -20, y: 50, z: 40 },
    scale = {
        x: 0.01,
        y: 0.01,
        z: 0.01,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI / 2, z: 0 }
) {
    window.coffeSoundCount = 0;
    window.loader = new OBJLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    const manager = new THREE.LoadingManager( loadModel );

    // texture

    const textureLoader = new THREE.TextureLoader( manager );
    const texture = textureLoader.load( 'textures/uv_grid_opengl.jpg' );

    // model

    function onProgress( xhr ) {

        if ( xhr.lengthComputable ) {

            const percentComplete = xhr.loaded / xhr.total * 100;
            console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );

        }

    }

    function onError() {}

    const loader = new OBJLoader( manager );
    loader.load( '\'../../../../assets/models/', function ( obj ) {

        let object = obj;

    }, onProgress, onError );


    const coffeMug = gltf.scene;
        domino.scale.set(scale.x, scale.y, scale.z);
        domino.position.set(position.x, position.y, position.z);
        domino.rotation.set(rotation.x, rotation.y, rotation.z);
        domino.collisionResponse = (mesh) => {
            if (window.dominoSoundCount < 1) {
                const audio = new Audio('../../../../assets/sounds/chips.mp3');
                audio.play().then();
                window.dominoSoundCount++;
            }
        };
        domino.name = 'domino';

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

        const shape = new Ammo.btBoxShape(new Ammo.btVector3(30, 40, 30));
        shape.getMargin(0.05);

        let rigidBody = createAmmoRigidBody(
            shape,
            domino,
            0.5,
            50,
            position,
            mass
        );
        domino.userData.physicsBody = rigidBody;
        g_ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_BOX,
            COLLISION_GROUP_SPHERE |
            COLLISION_GROUP_BOX |
            COLLISION_GROUP_MOVABLE |
            COLLISION_GROUP_PLANE
        );

        addMeshToScene(domino);
        g_rigidBodies.push(domino);
        rigidBody.threeMesh = domino;
    });
}
