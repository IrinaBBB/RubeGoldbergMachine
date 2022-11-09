import './style.css'
import * as THREE from 'three'
import {GUI} from 'dat.gui'
import {initStats, initTrackballControls, onResize} from './utils/utils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {loadModel} from "./background";

main();

function main() {
    const loadManager = new THREE.LoadingManager()
    window.loader = new THREE.TextureLoader(loadManager)

    window.addEventListener('resize', onResize, false)
    const stats = initStats(0)

    window.scene = new THREE.Scene()
    window.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    window.renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0xaaaaaa))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    scene.background = new THREE.Color(0xdddddd);

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/models/Another_bedroom.glb', (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        root.traverse((obj) => {
            if (obj.castShadow !== undefined) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });})
    /*// Load background model
    const loader = new GLTFLoader();

    loader.load( 'assets/models/Another_bedroom.glb', function ( gltf ) {

        scene.add( gltf.scene );

    }, undefined, function ( error ) {

        console.error( error );

    } );*/

    // LIGHTS //
    // taken from https://codepen.io/prisoner849/pen/RwbjwgZ?editors=0010
    // light holder
    const carProfileShape = new THREE.Shape([
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 0.25),
        new THREE.Vector2(0.65, 0.25),
        new THREE.Vector2(0.35, 0.5),
        new THREE.Vector2(-0.25, 0.5),
        new THREE.Vector2(-0.95, 0.25),
        new THREE.Vector2(-1, 0.25),
        new THREE.Vector2(-1, 0)
    ]);
    const carProfileGeometry = new THREE.ExtrudeBufferGeometry(carProfileShape, {depth: 1, bevelEnabled: false});
    carProfileGeometry.translate(0, 0, -0.5);
    carProfileGeometry.rotateY(-Math.PI * 0.5);
    const lightHolder = new THREE.Mesh(carProfileGeometry, new THREE.MeshLambertMaterial({color: "black"}));
    lightHolder.position.y = 2
    lightHolder.position.x = 15

    lightHolder.rotation.y = Math.PI / 2
    lightHolder.scale.x = 5

    // lights
    createLight(lightHolder, -0.3)
    createLight(lightHolder, 0.3)

    function createLight(base, shift) {
        let bulb = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshBasicMaterial())
        bulb.scale.setScalar(0.1)
        bulb.position.set(shift, 0.125, 1)
        base.add(bulb)
        let light = new THREE.SpotLight(0xff0000, 100, 50, THREE.MathUtils.degToRad(10), 0.5)
        light.name = 'light'
        light.position.set(shift, 0.125, 1)
        base.add(light)
        let lightTarget = new THREE.Object3D()
        lightTarget.position.set(shift, 0.125, 1 + 0.1)
        base.add(lightTarget)
        light.target = lightTarget
    }

    /*const lights = []
    lightHolder.children.forEach(child => {
        if (child.name === 'light') {
            lights.push(child)
        }
    })*/

    // CAMERA //
    camera.position.x = 10
    camera.position.y = 10
    camera.position.z = 50
    camera.lookAt(scene.position)

    // SUBTLE AMBIENT LIGHTNING //
    const ambientLight = new THREE.AmbientLight(0x3c3c3c, 1)
    scene.add(ambientLight)

    // SPOTLIGHT FOR THE SHADOWS //
    const spotLight = new THREE.SpotLight(0xffffff, 3, 500, 120)
    spotLight.position.set(-20, 100, -10)
    spotLight.castShadow = true
    scene.add(spotLight)



    //document.getElementById('webgl-output').appendChild(renderer.domElement)

    // TRACKBALL CONTROLS //
    const trackballControls = initTrackballControls(camera, renderer)
    const clock = new THREE.Clock()

    // GUI //
    const gui = new GUI()
    const parameters = {
        color: 0xff0000,
        }



    renderScene()

    window.trackStarted = false

    function renderScene() {
        stats.update()
        trackballControls.update(clock.getDelta())

        requestAnimationFrame(renderScene)
        renderer.render(scene, camera)
    }





}
