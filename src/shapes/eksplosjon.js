/** Lånt av https://github.com/mrdoob/three.js/blob/master/examples/webgl_modifier_tessellation.html*/

import * as THREE from 'three';
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {addMeshToScene} from "../helpers/myThreeHelper";

export let meshText;
export let uniforms2 = {

    amplitude: { value: 0.0 }

};

export function explosion() {
    const fontLoader = new FontLoader()
    fontLoader.load(
        "/helpers/gentilis_bold.typeface.json",
        (font) => {
            let textGeometry = new TextGeometry(
                'THE END!',
                {
                    font: font,
                    size: 100,
                    height: 100,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 1,
                    bevelSize: 2,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

            textGeometry.name = 'text';
            textGeometry.center();

            const tessellateModifier = new TessellateModifier( 8, 6 );

            textGeometry = tessellateModifier.modify( textGeometry );

            const numFaces = textGeometry.attributes.position.count / 3;

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

            textGeometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
            textGeometry.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 3 ) );

            //



            const shaderMaterial = new THREE.ShaderMaterial( {

                uniforms: uniforms2,
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent

            } );

            //

            meshText = new THREE.Mesh( textGeometry, shaderMaterial );

            addMeshToScene( meshText );

            const container = document.getElementById( 'container' );
            container.appendChild( renderer.domElement );

        }
    );
}

