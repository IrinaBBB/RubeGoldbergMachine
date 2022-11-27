import {applyImpulse, createAmmoRigidBody, g_ammoPhysicsWorld, g_rigidBodies} from "../helpers/myAmmoHelper";
import {addMeshToScene} from "../helpers/myThreeHelper";
import {TessellateModifier} from "three/addons/modifiers/TessellateModifier";
import {vertShader, fragShader, uniforms } from "../helpers/shaders";
import {
    COLLISION_GROUP_BOX,
    COLLISION_GROUP_MOVABLE,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE
} from "../helpers/threeAmmoShapes";
import * as THREE from "three";
import scene from "three/addons/offscreen/scene";
export let explosionMesh;
export let explode = false;

export function createExplosion(){
    const uniforms = {
        amplitude: {value: 0.0},
    };

    //window.dominoSoundCount = 0;
    let explosionBox = new THREE.BoxBufferGeometry(15,15,15);
    explosionBox.position.x = -15;
    explosionBox.position.y = 10;
    explosionBox.position.z = 40;
    const tessellateModifier = new TessellateModifier(8,6);
    explosionBox = tessellateModifier.modify(explosionBox);

    const numFaces = explosionBox.attributes.position.count / 3;

    const colors = new Float32Array(numFaces * 3 * 3);
    const vel = new Float32Array( numFaces * 3 * 3);

    const color = new THREE.Color();
    const l = 0.5;
    const s = 1.0;

    for (let f = 0; f < numFaces; f ++) {
        const index = 9 * f;
        const h = 0.5 + Math.random();
        color.setHSL(h, s, l);

        let dirX = Math.random() * 2 - 1;
        let dirY = Math.random() * 2 - 1;
        let dirZ = Math.random() * 2 - 1;

        for (let i = 0; i < 3; i ++){
            colors[ index + (3 * i)] = color.r;
            colors[index + (3 * i) + 1] = color.g;
            colors[index + (3 * i) + 2] = color.b;

            vel[ index + (3 * i)] = dirX;
            vel[ index + (3 * i) + 1] = dirY;
            vel[ index + (3 * i) + 2] = dirZ;
        }
    }

    explosionBox.setAttribute( 'customColor', new THREE.BufferAttribute(colors, 3));
    explosionBox.setAttribute('vel', new THREE.BufferAttribute(vel, 3));

    console.log(explosionBox);

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertShader').textContent,
        fragmentShader: document.getElementById('fragShader').textContent,
    });

    explosionMesh = new THREE.Mesh( explosionBox, shaderMaterial);
    scene.add(explosionMesh);
    //addMeshToScene(explosionMesh);
    explosionMesh.name = 'explosionMesh';

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
        explosionMesh,
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

    explosionMesh.collisionResponseSplash = (mesh) => {
        if (window.splashCount < 1) {
            const audio = new Audio(
                '../../../../assets/sounds/explosion.mp3'
            );
            audio.play().then();
            window.splashCount++;
            explode = true;

        }
        //applyImpulse(mesh.userData.physicsBody, 100, { x: 0, y: 1, z: 0 });
    };

    explosionMesh.userData.physicsBody = rigidBody;
    //addMeshToScene(domino);
    g_rigidBodies.push(explosionMesh);
    rigidBody.threeMesh = explosionMesh;
}
