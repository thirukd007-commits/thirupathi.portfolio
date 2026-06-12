// WebGL AI Core Component for the Hero Section using Three.js

export function initAICore() {
    const container = document.getElementById('ai-core-container');
    const canvas = document.getElementById('ai-core-canvas');
    if (!canvas || !container) return;

    let scene, camera, renderer;
    let coreMesh, wireframeShell;
    let orbitRings = [];
    let particleRing;
    
    // Animation control parameters
    let rotationSpeedMultiplier = 1;
    let targetSpeedMultiplier = 1;
    let pulseScale = 1;
    let targetPulseScale = 1;

    function init() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Scene & Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        camera.position.z = 250;

        // 2. Renderer (Transparent background for integration into the CSS grid)
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 3. Core Objects
        createCoreLayers();

        // 4. Orbit Rings
        createOrbitRings();

        // 5. Satellite Particle Systems
        createSatelliteParticles();

        // 6. Lighting
        const ambientLight = new THREE.AmbientLight(0x0a101d, 1);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00f5ff, 4, 300);
        pointLight1.position.set(50, 50, 50);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x7c4dff, 3, 300);
        pointLight2.position.set(-50, -50, 50);
        scene.add(pointLight2);

        // 7. Event Listeners
        window.addEventListener('resize', onResize);
        container.addEventListener('mouseenter', onMouseEnter);
        container.addEventListener('mouseleave', onMouseLeave);
        container.addEventListener('click', triggerPulse);

        // Start local frame animation
        animate();
    }

    function createCoreLayers() {
        // A. Inner glowing Core
        const coreGeo = new THREE.SphereGeometry(30, 64, 64);
        const coreMat = new THREE.MeshPhongMaterial({
            color: 0x00f5ff,
            emissive: 0x005577,
            shininess: 100,
            transparent: true,
            opacity: 0.85,
            wireframe: false
        });
        coreMesh = new THREE.Mesh(coreGeo, coreMat);
        scene.add(coreMesh);

        // B. Outer wireframe Shell (Techno details)
        const shellGeo = new THREE.SphereGeometry(38, 24, 24);
        const shellMat = new THREE.MeshBasicMaterial({
            color: 0x7c4dff,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending
        });
        wireframeShell = new THREE.Mesh(shellGeo, shellMat);
        scene.add(wireframeShell);
    }

    function createOrbitRings() {
        const ringConfigs = [
            { radius: 55, tube: 0.6, radialSeg: 8, tubularSeg: 100, color: 0x00d4ff, rotationSpeed: { x: 0.005, y: 0.01, z: 0.002 } },
            { radius: 65, tube: 0.4, radialSeg: 8, tubularSeg: 100, color: 0x7c4dff, rotationSpeed: { x: -0.01, y: 0.004, z: 0.008 } },
            { radius: 75, tube: 0.3, radialSeg: 8, tubularSeg: 100, color: 0x00ffb3, rotationSpeed: { x: 0.002, y: -0.008, z: 0.005 } }
        ];

        ringConfigs.forEach(config => {
            const geometry = new THREE.TorusGeometry(config.radius, config.tube, config.radialSeg, config.tubularSeg);
            const material = new THREE.MeshBasicMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const ringMesh = new THREE.Mesh(geometry, material);
            
            // Offset initial rotation angles
            ringMesh.rotation.x = Math.random() * Math.PI;
            ringMesh.rotation.y = Math.random() * Math.PI;

            scene.add(ringMesh);
            orbitRings.push({ mesh: ringMesh, speeds: config.rotationSpeed });
        });
    }

    function createSatelliteParticles() {
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Distribute particles in a flat ring orbiting the core
            const angle = Math.random() * Math.PI * 2;
            const radius = 45 + Math.random() * 25;
            
            // Slight noise on height to create a fuzzy orbit disk
            positions[i] = radius * Math.cos(angle);
            positions[i + 1] = (Math.random() - 0.5) * 8; // Z-axis height
            positions[i + 2] = radius * Math.sin(angle);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const dotTexture = createSatelliteDotTexture();
        const material = new THREE.PointsMaterial({
            color: 0x00f5ff,
            size: 2.2,
            map: dotTexture,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particleRing = new THREE.Points(geometry, material);
        // Tilt the whole ring system relative to the viewport
        particleRing.rotation.x = Math.PI / 3;
        particleRing.rotation.y = Math.PI / 12;
        scene.add(particleRing);
    }

    // Helper: circular dot texture generator
    function createSatelliteDotTexture() {
        const c = document.createElement('canvas');
        c.width = 16;
        c.height = 16;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(0, 245, 255, 0.8)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const tex = new THREE.Texture(c);
        tex.needsUpdate = true;
        return tex;
    }

    function onMouseEnter() {
        targetSpeedMultiplier = 2.5; // Accelerate rotation on hover
    }

    function onMouseLeave() {
        targetSpeedMultiplier = 1.0;
    }

    function triggerPulse() {
        targetPulseScale = 1.35; // Expand core
        // Animate color flash using simple parameters
        if (coreMesh) {
            coreMesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                coreMesh.material.color.setHex(0x00f5ff);
            }, 150);
        }
        
        setTimeout(() => {
            targetPulseScale = 1.0; // Shrink back
        }, 300);
    }

    function onResize() {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Time constant for continuous wave deformation
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // 1. Interpolate variables for smooth dynamics
        rotationSpeedMultiplier += (targetSpeedMultiplier - rotationSpeedMultiplier) * 0.05;
        pulseScale += (targetPulseScale - pulseScale) * 0.1;

        // 2. Rotate core elements
        if (coreMesh) {
            coreMesh.rotation.y += 0.005 * rotationSpeedMultiplier;
            coreMesh.rotation.x += 0.002 * rotationSpeedMultiplier;

            // Apply pulse scale
            coreMesh.scale.setScalar(pulseScale);
        }

        if (wireframeShell) {
            // Rotates in opposite direction
            wireframeShell.rotation.y -= 0.008 * rotationSpeedMultiplier;
            wireframeShell.rotation.z += 0.003 * rotationSpeedMultiplier;
            
            // Deform shell slightly over time (holographic scan effect)
            wireframeShell.scale.setScalar(pulseScale * (1 + Math.sin(elapsed * 4) * 0.02));
        }

        // 3. Rotate outer rings
        orbitRings.forEach(ring => {
            ring.mesh.rotation.x += ring.speeds.x * rotationSpeedMultiplier;
            ring.mesh.rotation.y += ring.speeds.y * rotationSpeedMultiplier;
            ring.mesh.rotation.z += ring.speeds.z * rotationSpeedMultiplier;
            
            // Rings also inherit a part of the core pulse scale
            const ringScaleFactor = 1 + (pulseScale - 1) * 0.5;
            ring.mesh.scale.setScalar(ringScaleFactor);
        });

        // 4. Orbit the particles
        if (particleRing) {
            particleRing.rotation.z += 0.008 * rotationSpeedMultiplier;
            
            // Animate particles expanding slightly with core pulse
            particleRing.scale.setScalar(pulseScale);
        }

        renderer.render(scene, camera);
    }

    init();
}
