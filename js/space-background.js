// WebGL Space Background Engine using Three.js

export function initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    let scene, camera, renderer;
    let starsGeometry, starsParticles;
    let dustGeometry, dustParticles;
    let nebulaPlanes = [];
    
    // Mouse interaction variables
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function init() {
        // 1. Scene & Camera Setup
        scene = new THREE.Scene();
        // Fog to fade objects into the deep darkness
        scene.fog = new THREE.FogExp2(0x050816, 0.0012);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.z = 500;

        // 2. Renderer Setup
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(scene.fog.color, 1);

        // 3. Layer 1: Distant Stars Field
        createStarField();

        // 4. Layer 2: Procedural Nebula Clouds
        createNebulaClouds();

        // 5. Layer 3: Space Dust / Floating Particles
        createSpaceDust();

        // 6. Lights
        const ambientLight = new THREE.AmbientLight(0x1a2636);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00d4ff, 2, 800);
        pointLight.position.set(0, 0, 200);
        scene.add(pointLight);

        // Listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onDocumentMouseMove);

        // Start animation loop
        animate();
    }

    function createStarField() {
        const starCount = 8000;
        starsGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const colorPalette = [
            new THREE.Color(0xffffff), // White
            new THREE.Color(0x00f5ff), // Cyan
            new THREE.Color(0x7c4dff), // Purple
            new THREE.Color(0x00ffb3)  // Emerald
        ];

        for (let i = 0; i < starCount * 3; i += 3) {
            // Distribute stars in a large sphere
            const radius = 900 + Math.random() * 600;
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);

            // Give random colors from the space tech theme palette
            const randColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i] = randColor.r;
            colors[i + 1] = randColor.g;
            colors[i + 2] = randColor.b;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create star circle sprite dynamically to avoid asset loading issues
        const starTexture = createCircleTexture('rgba(255, 255, 255, 1)', 16);

        const starsMaterial = new THREE.PointsMaterial({
            size: 1.8,
            map: starTexture,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        starsParticles = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starsParticles);
    }

    function createNebulaClouds() {
        // Create a canvas texture dynamically representing a soft gas cloud glow
        const nebulaTexture = createNebulaTexture();
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            map: nebulaTexture,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const planeGeo = new THREE.PlaneGeometry(800, 800);

        // Place multiple nebula planes at different depths and rotations
        const cloudCount = 5;
        for (let i = 0; i < cloudCount; i++) {
            const mesh = new THREE.Mesh(planeGeo, nebulaMaterial);
            mesh.position.set(
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 400,
                -100 - Math.random() * 500
            );
            mesh.rotation.z = Math.random() * Math.PI * 2;
            // Slowly rotate scale
            mesh.scale.setScalar(1.2 + Math.random() * 0.8);
            
            // Add custom rotation speeds
            mesh.userData = {
                rotSpeed: (Math.random() - 0.5) * 0.0005
            };

            scene.add(mesh);
            nebulaPlanes.push(mesh);
        }
    }

    function createSpaceDust() {
        const dustCount = 600;
        dustGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount * 3; i += 3) {
            // Space dust floats much closer to camera
            positions[i] = (Math.random() - 0.5) * 1200;
            positions[i + 1] = (Math.random() - 0.5) * 800;
            positions[i + 2] = (Math.random() - 0.5) * 800;
        }

        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const dustTexture = createCircleTexture('rgba(0, 245, 255, 0.8)', 32);

        const dustMaterial = new THREE.PointsMaterial({
            size: 3.5,
            map: dustTexture,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        dustParticles = new THREE.Points(dustGeometry, dustMaterial);
        scene.add(dustParticles);
    }

    // Helper: Dynamic circular point texture generator
    function createCircleTexture(colorStyle, size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const half = size / 2;
        
        const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, colorStyle);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        
        const tex = new THREE.Texture(c);
        tex.needsUpdate = true;
        return tex;
    }

    // Helper: Dynamic Nebula Texture generator
    function createNebulaTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        
        // Draw deep space gas clouds with gradients
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, 'rgba(124, 77, 255, 0.4)');  // Purple Core
        grad.addColorStop(0.3, 'rgba(0, 212, 255, 0.2)'); // Cyan glow
        grad.addColorStop(0.6, 'rgba(91, 108, 255, 0.08)'); // Indigo outer
        grad.addColorStop(1, 'rgba(0,0,0,0)');             // Empty space
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Add cloud fractal details
        for (let i = 0; i < 6; i++) {
            const rx = 128 + Math.random() * 256;
            const ry = 128 + Math.random() * 256;
            const rRad = 40 + Math.random() * 80;
            const subGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rRad);
            subGrad.addColorStop(0, 'rgba(0, 245, 255, 0.15)');
            subGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = subGrad;
            ctx.fillRect(0, 0, 512, 512);
        }

        const tex = new THREE.Texture(c);
        tex.needsUpdate = true;
        return tex;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onDocumentMouseMove(event) {
        // Normalize mouse positions to range [-1, 1]
        targetMouseX = (event.clientX - windowHalfX) / windowHalfX;
        targetMouseY = (event.clientY - windowHalfY) / windowHalfY;
    }

    function animate() {
        requestAnimationFrame(animate);

        // Linear interpolation for smooth camera lag (parallax effect)
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Drift camera slightly based on mouse
        camera.position.x = mouseX * 80;
        camera.position.y = -mouseY * 80;
        camera.lookAt(scene.position);

        // Rotate Starfield and Space dust slightly
        if (starsParticles) {
            starsParticles.rotation.y += 0.0001;
            starsParticles.rotation.x += 0.00005;
        }

        if (dustParticles) {
            // Make dust drift slowly downward
            const positions = dustParticles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.1; // Fall speed
                if (positions[i] < -400) {
                    positions[i] = 400; // Reset to top
                }
            }
            dustParticles.geometry.attributes.position.needsUpdate = true;
            dustParticles.rotation.y -= 0.0002;
        }

        // Animate nebula planes
        nebulaPlanes.forEach(plane => {
            plane.rotation.z += plane.userData.rotSpeed;
        });

        renderer.render(scene, camera);
    }

    init();
}
