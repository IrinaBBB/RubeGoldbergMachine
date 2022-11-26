// noinspection DuplicatedCode

let g_transform;

export const IMPULSE_FORCE = 10;
export let g_ammoPhysicsWorld;
export let g_rigidBodies = [];
let g_checkCollisions = false;

/**
 * Create Ammo World
 */
export function createAmmoWorld(checkCollisions = true) {
    g_checkCollisions = checkCollisions;
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

    /**
     * Create ammo physics world
     */
    g_ammoPhysicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        overlappingPairCache,
        solver,
        collisionConfiguration
    );

    /**
     * Set gravity
     */
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

    /** Collision detection */
    if (g_checkCollisions)
        checkCollisions(deltaTime);
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

/** For rigid bodies that are NOT kinetic  */
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

// Finner alle manifolds, gjennomløper og gjør noe dersom kollison mellom kulene:
function checkCollisions(deltaTime) {
    // Finner alle mulige kollisjonspunkter/kontaktpunkter (broad phase):
    let numManifolds = g_ammoPhysicsWorld.getDispatcher().getNumManifolds();
    // Gjennomløper alle kontaktpunkter:
    for (let i = 0; i < numManifolds; i++) {
        // contactManifold er et btPersistentManifold-objekt:
        let contactManifold = g_ammoPhysicsWorld.getDispatcher().getManifoldByIndexInternal(i);
        let numContacts = contactManifold.getNumContacts();
        if (numContacts > 0) {
            // Henter objektene som er involvert:
            // getBody0() og getBody1() returnerer et btCollisionObject,
            // gjøres derfor om til btRigidBody-objekter vha. Ammo.castObject():
            let rbObject0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
            let rbObject1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
            let threeMesh0 = rbObject0.threeMesh;
            let threeMesh1 = rbObject1.threeMesh;
            if (threeMesh0 && threeMesh1) {
                for (let j = 0; j < numContacts; j++) {
                    let contactPoint = contactManifold.getContactPoint(j);
                    const distance = contactPoint.getDistance();
                    if (distance <= 0) {
                        // Vi har en kollisjon og er
                        // kun interessert i kollisjon mellom kulene:
                        if ((threeMesh0.name === 'sphere' && threeMesh1.name === 'sphere') ||
                            threeMesh1.name === 'sphere' && threeMesh0.name === 'sphere') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }

                        if ((threeMesh0.name === 'movable' && threeMesh1.name === 'domino') ||
                            threeMesh1.name === 'domino' && threeMesh0.name === 'movable') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }

                        if ((threeMesh0.name === 'fish' && threeMesh1.name === 'mushroom') ||
                            threeMesh1.name === 'mushroom' && threeMesh0.name === 'fish') {
                            if (typeof threeMesh0.collisionResponseSplash === 'function')
                                threeMesh0.collisionResponseSplash(threeMesh0);
                            if (typeof threeMesh1.collisionResponseSplash === 'function')
                                threeMesh1.collisionResponseSplash(threeMesh1);
                        }

                        if ((threeMesh0.name === 'pendulumArm' && threeMesh1.name === 'pendulumArm') ||
                            threeMesh1.name === 'pendulumArm' && threeMesh0.name === 'pendulumArm') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }
                        if ((threeMesh0.name === 'pendulumArm' && threeMesh1.name === 'mushroom') ||
                            threeMesh1.name === 'mushroom' && threeMesh0.name === 'pendulumArm') {
                            if (typeof threeMesh0.collisionResponseSplash === 'function')
                                threeMesh0.collisionResponseSplash(threeMesh0);
                            if (typeof threeMesh1.collisionResponseSplash === 'function')
                                threeMesh1.collisionResponseSplash(threeMesh1);
                        }
                        if ((threeMesh0.name === 'rocket' && threeMesh1.name === 'domino') ||
                            threeMesh1.name === 'domino' && threeMesh0.name === 'rocket') {
                            if (typeof threeMesh0.collisionResponseSplash === 'function')
                                threeMesh0.collisionResponseSplash(threeMesh0);
                            if (typeof threeMesh1.collisionResponseSplash === 'function')
                                threeMesh1.collisionResponseSplash(threeMesh1);
                        }

                        if ((threeMesh0.name === 'movable' && threeMesh1.name === 'pendulumArm') ||
                            threeMesh1.name === 'pendulumArm' && threeMesh0.name === 'movable') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }
                        if ((threeMesh0.name === 'movable' && threeMesh1.name === 'balloon') ||
                            threeMesh1.name === 'balloon' && threeMesh0.name === 'movable') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }

                        if ((threeMesh0.name === 'pendulumArm' && threeMesh1.name === 'balloon') ||
                            threeMesh1.name === 'balloon' && threeMesh0.name === 'pendulumArm') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }

                        if ((threeMesh0.name === 'balloon' && threeMesh1.name === 'plank') ||
                            threeMesh1.name === 'plank' && threeMesh0.name === 'balloon') {
                            if (typeof threeMesh0.collisionResponse === 'function')
                                threeMesh0.collisionResponse(threeMesh0);
                            if (typeof threeMesh1.collisionResponse === 'function')
                                threeMesh1.collisionResponse(threeMesh1);
                        }
                    }
                }
            }
        }
    }
}
