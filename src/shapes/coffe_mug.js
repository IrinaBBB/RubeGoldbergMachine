import {DRACOLoader} from "three/addons/loaders/DRACOLoader";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import {createAmmoRigidBody, g_ammoPhysicsWorld, g_rigidBodies} from "../helpers/myAmmoHelper";
import {addMeshToScene} from "../helpers/myThreeHelper";
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE
} from "../helpers/threeAmmoShapes";
import * as THREE from "three";

export function createOBJCoffeMug(
    mass = 100,
    position = { x: 0.1, y: 0.1, z: 0.1 },
    scale = {
        x: 1,
        y: 1,
        z: 1,
    },
    quaternion = { x: 0, y: 0, z: 0, w: 1 },
    rotation = { x: 0, y: Math.PI / 2, z: 0 }
) {
    window.coffeSoundCount = 0;
    window.loader = new OBJLoader();

    //Bruker OBJLoader:
    function loadModel() {
        loadGeoOnlyModel();
        //loadGeoAndMaterialModel();
    }

    function loadGeoOnlyModel() {
        let loader = new OBJLoader();

        //Laster kun geometrien dvs. obj-fila:
        loader.load('../../../../assets/models/coffe_cup-obj/coffe_cup.obj', function (loadedMesh) {
            let material = new THREE.MeshLambertMaterial({color: 0x5C3A21});
            // loadedMesh er en gruppe med mesh.
            // Setter samme materiale på alle disse.
            // Beregn normaler på nytt for korrekt shading.
            loadedMesh.children.forEach(function (child) {
                child.material = material;
            });
            loadedMesh.scale.set(2, 2, 2);
            //g_scene.add(loadedMesh);
        });
    }

//Bruker MTLLoader & OBJLoader
    function loadGeoAndMaterialModel() {
        let mesh = null;
        let mtlLoader = new MTLLoader();
        let modelName = 'coffe';  //gubbe, male, ant1, ftorso

        //Laster først materiale:
        mtlLoader.load('../../../../assets/models/coffe_cup-obj/' + modelName + '.mtl', function (materials) {
            materials.preload();
            let objLoader = new OBJLoader();
            objLoader.setMaterials(materials);

            //...deretter geometrien:
            objLoader.load('../../../../assets/models/coffe_cup-obj/' + modelName + '.obj', function (object) {
                mesh = object;
                mesh.position.y = 0;
                mesh.scale.set(1, 1, 1);

                //Plukker ut deler av modellen, for animasjon f.eks.:
                if (modelName === 'coffe') {
                    mesh.scale.set(1, 1, 1);
                    /* LA STÅ!
                    let  arm = mesh.getObjectByName("BOPED_L_arm_fore"); //.children[2].children[0];
                    arm.rotation.y = Math.PI / 3;
                    arm.material.opacity = 0.6;
                    arm.material.transparent = true;
                    arm.material.depthTest = false;
                    arm.material.side = THREE.DoubleSide;
                    let  finger = mesh.getObjectByName("BOPED_R_hand_finger11");
                    finger.material.opacity = 0.6;
                    finger.material.transparent = true;
                    finger.rotation.z = Math.PI / 4;
                     */
                }
            });

        });
    }



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
        'coffe',
        0.5,
        50,
        position,
        mass
    );
    'coffe'.userData.physicsBody = rigidBody;
    g_ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_BOX,
        COLLISION_GROUP_SPHERE |
        COLLISION_GROUP_BOX |
        COLLISION_GROUP_MOVABLE |
        COLLISION_GROUP_PLANE
    );

    addMeshToScene('coffe');
    g_rigidBodies.push('coffe');
    rigidBody.threeMesh = 'coffe';
}
