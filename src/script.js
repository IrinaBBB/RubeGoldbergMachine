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
    //scene.background = new THREE.Color(0xdddddd);

    const light2 = new THREE.PointLight( 0xffffff, 2, 200 );
    light2.position.set(5, 10, 5);
    scene.add(light2);

    let loadedModel;
    const glftLoader = new GLTFLoader();
    glftLoader.load('./assets/models/Another_bedroom.glb', (gltfScene) => {
        loadedModel = gltfScene;
        // console.log(loadedModel);

        //gltfScene.scene.rotation.y = Math.PI / 8;
        //gltfScene.scene.position.y = 3;
        //gltfScene.scene.scale.set(10, 10, 10);
        scene.add(gltfScene.scene);
    });

    /*const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/models/Another_bedroom.glb', (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        root.traverse((obj) => {
            if (obj.castShadow !== undefined) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });})*/
    // Load background model
    /*const loader = new GLTFLoader();

    loader.load( 'assets/models/Another_bedroom.glb', function ( gltf ) {

        scene.add( gltf.scene );

    }, undefined, function ( error ) {

        console.error( error );

    } );*/
    /*const loader = new GLTFLoader()
    loader.load('./assets/models/Another_bedroom.glb', function (glb){
        console.log(glb)
        const root = glb.scene;
        root.scale.set(0.5, 0.5, 0.5)

        scene.add(root);
    }, function (error){
        console.log('An error occured, WHAT IS HAPPENING!')
    })

    const loader = new GLTFLoader();
    loader.load('./assets/models/Another_bedroom.glb', function (gltf){
        scene.add(gltf.scene);
        }
    );


    /*const lights = []
    lightHolder.children.forEach(child => {
        if (child.name === 'light') {
            lights.push(child)
        }
    })*/

    const light = new THREE.PointLight(0xffffff, 2, 200);
    light.position.set(4.5, 10, 4.5);
    scene.add(light);

    // CAMERA //
    //camera.position.x = 10
    camera.position.y = 1
    camera.position.z = 3
    camera.lookAt(scene.position)


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
