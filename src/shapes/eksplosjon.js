import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {addMeshToScene} from "../helpers/myThreeHelper";


export let meshText;
export let uniforms2 = {

    amplitude: { value: 0.0 }

};

//const loader = new FontLoader();
  //  loader.load( 'three/fonts/helvetiker_bold.typeface.json', function ( font ) {

//} );

export function createText( font ) {

    //

    let text = new TextGeometry( 'THE END!', {

        font: font,

        size: 40,
        height: 5,
        curveSegments: 3,

        bevelThickness: 2,
        bevelSize: 1,
        bevelEnabled: true

    } );

    text.center();

    const tessellateModifier = new TessellateModifier( 8, 6 );

    text = tessellateModifier.modify( text );

    //

    const numFaces = text.attributes.position.count / 3;

    const colors = new Float32Array( numFaces * 3 * 3 );
    const displacement = new Float32Array( numFaces * 3 * 3 );

    const color = new THREE.Color();

    for ( let f = 0; f < numFaces; f ++ ) {

        const index = 9 * f;

        const h = 0.2 * Math.random();
        const s = 0.5 + 0.5 * Math.random();
        const l = 0.5 + 0.5 * Math.random();

        color.setHSL( h, s, l );

        const d = 10 * ( 0.5 - Math.random() );

        for ( let i = 0; i < 3; i ++ ) {

            colors[ index + ( 3 * i ) ] = color.r;
            colors[ index + ( 3 * i ) + 1 ] = color.g;
            colors[ index + ( 3 * i ) + 2 ] = color.b;

            displacement[ index + ( 3 * i ) ] = d;
            displacement[ index + ( 3 * i ) + 1 ] = d;
            displacement[ index + ( 3 * i ) + 2 ] = d;

        }

    }

    text.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    text.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

    //



    const shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: uniforms2,
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent

    } );

    //

    meshText = new THREE.Mesh( text, shaderMaterial );

    addMeshToScene( meshText );

    const container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

}

