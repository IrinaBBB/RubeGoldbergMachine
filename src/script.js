import './style.css'
import * as THREE from 'three'
import {GUI} from 'dat.gui'
import {initStats, initTrackballControls, onResize} from './utils/utils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

main();

function main() {
    const loadManager = new THREE.LoadingManager()
    window.loader = new THREE.TextureLoader(loadManager)

    window.addEventListener('resize', onResize, false)
    const stats = initStats(0)

    window.scene = new THREE.Scene()
    window.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000)
    window.renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0xaaaaaa))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    document.body.appendChild(renderer.domElement);
    scene.background = new THREE.Color(0xdddddd);

    //Axeshelper
    scene.add(new THREE.AxesHelper(500));

    //Load model
    let loadedModel;
    const glftLoader = new GLTFLoader();
    glftLoader.load('./assets/models/Another_bedroom.glb', (gltfScene) => {
        loadedModel = gltfScene;
        console.log(loadedModel);

        //gltfScene.scene.rotation.y = 50;
        //gltfScene.scene.position.y = 3;
       // gltfScene.scene.scale.set(10, 10, 10);
        scene.add(gltfScene.scene);
    });

    loadedModel.traverse(n => { if ( n.isMesh ) {
        n.castShadow = true;
        n.receiveShadow = true;
        if(n.material.map) n.material.map.anisotropy = 16;
    }});

    const heimLight = new THREE.HemisphereLight(0xffeeb1, 0x080820,2);
    heimLight.position.set(-50,25,25)
    heimLight.castShadow = true;
    scene.add(heimLight);

    const light =new THREE.SpotLight(0xffa95c,1);
    light.position.set(-100,100,50);
    light.castShadow = true;
    scene.add(light);

    light.shadow.bias = -0.0001;
    light.shadow.mapSize.width = 1024*4;
    light.shadow.mapSize.height = 1024*4;


    //const light = new THREE.PointLight(0xffffff, 2, 200);
    //light.position.set(4.5, 10, 4.5);
    //scene.add(light);

    // CAMERA //
    //camera.position.set(7,4,1);
    camera.position.x = 6
    camera.position.y = 4
    camera.position.z = -4
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
        renderer.shadowMap.enabled = true;

    }

    function animate() {
        light.position.set(camera.position.x + 10,
            camera.position.y + 10,
            camera.position.z + 10,);
    }




}
