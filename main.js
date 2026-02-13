import * as THREE from 'three';

console.log("JavaScript is running!");

// ============================================
// SCENE SETUP
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// ============================================
// CAMERA
// ============================================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// ============================================
// RENDERER
// ============================================
const canvas = document.getElementById('canvas3d');
const renderer = new THREE.WebGLRenderer({ 
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// ============================================
// LIGHTS
// ============================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// ============================================
// TEST: Add a Simple Spinning Cube
// ============================================
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x6ab04c });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

console.log("Cube added to scene!");

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}
animate();

// ============================================
// HANDLE WINDOW RESIZE
// ============================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================
// SCROLL TEST
// ============================================
window.addEventListener('scroll', () => {
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    console.log("Scroll progress:", scrollProgress);
    
    // Scale the cube based on scroll
    const scale = 1 + scrollProgress * 2;
    cube.scale.set(scale, scale, scale);
});

console.log("Three.js setup complete!");