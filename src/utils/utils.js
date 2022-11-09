import Stats from 'three/examples/jsm/libs/stats.module'
import TrackballControls from 'three-trackballcontrols'

/**
 * Initialize the statistics DOM-element
 *
 * @param {Number} type 0: fps, 1: ms, 2: mb, 3+: custom
 * @returns stats javascript object
 */
export function initStats(type) {

    const panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0
    const stats = new Stats()

    stats.showPanel(panelType) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    return stats
}

/**
 * Resizes the canvas on 'resize' event
 *
 * @returns void
 */
export function onResize() {
    window.camera.aspect = window.innerWidth / window.innerHeight
    window.camera.updateProjectionMatrix()
    window.renderer.setSize(window.innerWidth, window.innerHeight)
}

/**
 * Initialize trackball controls to control the scene
 *
 * @param {Camera} camera
 * @param {WebGLRenderer} renderer
 */
export function initTrackballControls(camera, renderer) {
    const trackballControls = new TrackballControls(camera, renderer.domElement);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.2;
    trackballControls.panSpeed = 0.8;
    trackballControls.noZoom = false;
    trackballControls.noPan = false;
    trackballControls.staticMoving = true;
    trackballControls.dynamicDampingFactor = 0.3;
    trackballControls.keys = [65, 83, 68];

    return trackballControls;
}
