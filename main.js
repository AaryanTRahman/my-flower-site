// ============================================
// IMPORT THREE.JS
// ============================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log("🌸 Three.js starting...");

// ============================================
// SCENE SETUP
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// ============================================
// CAMERA SETUP
// ============================================
const camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 3, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Point camera at origin


// ============================================
// RENDERER SETUP
// ============================================
const canvas = document.getElementById('canvas3d');
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true
});

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

console.log("✅ Scene, camera, renderer created");

// ============================================
// LIGHTS
// ============================================
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);


console.log("✅ Lights added");

// ============================================
// VARIABLES FOR FLOWER AND ANIMATION
// ============================================
let mixer = null;
let flowerAction = null;
let flower = null;
window.morphMeshes = []; // ADD THIS LINE HERE - before loader.load()
let animationDuration = 0;

// ============================================
// LOAD FLOWER MODEL
// ============================================
const loader = new GLTFLoader();

console.log("📦 Loading flower.glb...");

loader.load(
    'Flower11/Flower11.gltf',
    
    // SUCCESS
    (gltf) => {
        console.log("✅ Flower loaded successfully!");
        
        // Add flower to scene
        flower = gltf.scene;
        scene.add(flower);
        
        // Position flower at center
        flower.position.set(0, 0, 0);

        // Fix transparency rendering on all meshes
        flower.traverse((child) => {
            if (child.isMesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                materials.forEach(mat => {
                    // Check if material has an alpha/transparency map
                    if (mat.alphaMap || mat.map?.image) {
                        
                        // Use alphaTest for hard edges (petals, leaves)
                        // This cuts out pixels below the threshold cleanly
                        mat.alphaTest = 0.9; // Adjust 0.0-1.0 (higher = more cutoff)
                        
                        // Enable transparency
                        mat.transparent = true;
                        
                        // CRITICAL: Fixes dark fringing on edges
                        mat.premultipliedAlpha = false;
                        
                        // Render both sides of petals (no backface culling)
                        mat.side = THREE.DoubleSide;
                        
                        // Make sure depth write is correct
                        mat.depthWrite = true;
                        mat.depthTest = true;
                        
                        mat.needsUpdate = true;
                        
                        console.log("Fixed transparency on material:", mat.name);
                    }
                });
                
                // Collect morph meshes SEPARATELY - this is critical!
                if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
                 window.morphMeshes.push(child);
                    console.log("✅ Added morph mesh:", child.name, "| Morphs:", child.morphTargetInfluences.length);
                    
                }
            }
        });

        
        console.log("✅ Total morph meshes found:", window.morphMeshes.length);
        

        flower.castShadow = true;
        flower.receiveShadow = true;
        
        console.log("✅ Flower added to scene");
        
        // Setup animation if exists
        if (gltf.animations && gltf.animations.length > 0) {
            console.log("✅ Found animation!");
            console.log("   - Duration:", gltf.animations[0].duration, "seconds");
            console.log("   - Tracks:", gltf.animations[0].tracks.length);
            
            // Create animation mixer
            mixer = new THREE.AnimationMixer(flower);
            
            // Get the animation clip
            const clip = gltf.animations[0];
            flowerAction = mixer.clipAction(clip);
            
            // Store duration
            animationDuration = clip.duration;
            
            // Setup for scroll control
            flowerAction.play();
            flowerAction.paused = true; // Pause immediately - we control it with scroll
            flowerAction.setLoop(THREE.LoopOnce);
            flowerAction.clampWhenFinished = true;
            
            console.log("✅ Animation ready for scroll control");
            
        } else {
            console.warn("⚠️ No animations found in GLTF");
        }
    },
    
    // PROGRESS
    (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(0);
        console.log("   Loading:", percent + "%");
    },
    
    // ERROR
    (error) => {
        console.error("❌ Error loading flower:", error);
    }
);



// // ============================================
// // SCROLL CONTROL
// // ============================================
// window.addEventListener('scroll', () => {
//     // Only run if animation is loaded
//     if (!mixer || !flowerAction || animationDuration === 0) {
//         return;
//     }
    
//     // Calculate scroll progress (0 to 1)
//     const scrollTop = window.scrollY;
//     const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
//     const scrollProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
    
//     // Calculate animation time based on scroll
//     const targetTime = scrollProgress * animationDuration;
    
//     // Set animation to that exact time
//     mixer.setTime(targetTime);

//     mixer.update(0);
    
//     // Debug log (comment out if too spammy)
//     console.log("📜 Scroll:", (scrollProgress * 100).toFixed(0) + "% | Animation:", targetTime.toFixed(2) + "s");
// });

// ============================================
// SCROLL CONTROL - ALTERNATIVE METHOD
// ============================================
window.addEventListener('scroll', () => {
    if (!mixer || !flowerAction || animationDuration === 0) {
        return;
    }
    
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, scrollTop / scrollHeight));
    
    const targetTime = scrollProgress * animationDuration;
    
    // Method 1: Set time and update
    flowerAction.time = targetTime;
    mixer.update(0);
    
    // Method 2: If above doesn't work, force evaluate the action
    flowerAction.getMixer().update(0);
    
    console.log("📜 Scroll:", (scrollProgress * 100).toFixed(0) + "% | Animation:", targetTime.toFixed(2) + "s");
});

console.log("✅ Scroll listener added");

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);
    
    // DO NOT UPDATE MIXER - we control it manually with scroll
    // (If you call mixer.update() here, it will override scroll control)
    
    // Optional: rotate flower slowly
    if (flower) {
        flower.rotation.y += 0.001;
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Start animation loop
animate();

console.log("✅ Render loop started");

// ============================================
// HANDLE WINDOW RESIZE
// ============================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("✅ Setup complete! Scroll to animate the flower 🌸");
