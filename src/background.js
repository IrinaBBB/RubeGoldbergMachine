import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

async function loadModel() {
    const loader = new GLTFLoader();

    const backgroundData = await loader.loadAsync('/assets/models/Another_bedroom.glb')

    console.log('It Works!', backgroundData);

}

export {loadModel}
