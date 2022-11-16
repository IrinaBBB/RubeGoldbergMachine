// noinspection DuplicatedCode

let g_transform;

export const IMPULSE_FORCE = 10;
export let g_ammoPhysicsWorld;
export let g_rigidBodies = [];

/**
 * Create Ammo World
 */
export function createAmmoWorld() {
    /**
     * Helper object
     */
    g_transform = new Ammo.btTransform();

    /**
     * Initialize physics world
     */
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    g_ammoPhysicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration
    );
    g_ammoPhysicsWorld.setGravity(new Ammo.btVector3(0, -9.80665, 0));
}

/**
 * Create ammo rigid body
 */
export function createAmmoRigidBody(
    shape,
    threeMesh,
    restitution = 0.7,
    friction = 0.8,
    position = {
        x: 0,
        y: 50,
        z: 0,
    },
    mass = 1
) {
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

    let quaternion = threeMesh.quaternion;
    transform.setRotation(
        new Ammo.btQuaternion(
            quaternion.x,
            quaternion.y,
            quaternion.z,
            quaternion.w
        )
    );

    let scale = threeMesh.scale;
    shape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));

    let motionState = new Ammo.btDefaultMotionState(transform);
    let localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        shape,
        localInertia
    );
    let rigidBody = new Ammo.btRigidBody(rbInfo);
    rigidBody.setRestitution(restitution);
    rigidBody.setFriction(friction);

    return rigidBody;
}

export function updatePhysics(deltaTime) {
    // Step physics world:
    g_ammoPhysicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < g_rigidBodies.length; i++) {
        let mesh = g_rigidBodies[i];
        let rigidBody = mesh.userData.physicsBody;
        let motionState = rigidBody.getMotionState();
        if (motionState) {
            motionState.getWorldTransform(g_transform);
            let p = g_transform.getOrigin();
            let q = g_transform.getRotation();
            mesh.position.set(p.x(), p.y(), p.z());
            mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
        }
    }
}

export function moveRigidBody(movableMesh, direction) {
    let transform = new Ammo.btTransform();
    let motionState = movableMesh.userData.physicsBody.getMotionState();
    motionState.getWorldTransform(transform);
    let position = transform.getOrigin();
    transform.setOrigin(
        new Ammo.btVector3(
            position.x() + direction.x,
            position.y() + direction.y,
            position.z() + direction.z
        )
    );
    motionState.setWorldTransform(transform);
}

export function applyImpulse(
    rigidBody,
    force = IMPULSE_FORCE,
    direction = { x: 0, y: 1, z: 0 }
) {
    if (!rigidBody) return;
    rigidBody.activate(true);
    let impulseVector = new Ammo.btVector3(
        direction.x * force,
        direction.y * force,
        direction.z * force
    );
    rigidBody.applyCentralImpulse(impulseVector);
}
