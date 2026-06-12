// Core Interactions, Telemetry Diagnostics, and Canvas Constellation Map

export function initSectionInteractions() {
    // --- Navigation Scroll State ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
        // Close menu on link clicks
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
            });
        });
    }

    // --- Diagnostics Updates (FPS & Ping) ---
    const fpsCounter = document.getElementById('fps-counter');
    const pingCounter = document.getElementById('ping-counter');
    
    let lastLoopTime = performance.now();
    let frameCount = 0;
    
    function updateFPS() {
        const now = performance.now();
        frameCount++;
        if (now - lastLoopTime >= 1000) {
            const currentFPS = (frameCount * 1000 / (now - lastLoopTime)).toFixed(1);
            if (fpsCounter) fpsCounter.textContent = currentFPS;
            frameCount = 0;
            lastLoopTime = now;
            
            // Randomly oscillate ping between 10ms and 15ms to simulate realistic active uplink
            if (pingCounter) {
                const randPing = Math.floor(10 + Math.random() * 6);
                pingCounter.textContent = `${randPing}ms`;
            }
        }
        requestAnimationFrame(updateFPS);
    }
    requestAnimationFrame(updateFPS);

    // --- Stats Counter Count-Up (Intersection Observer) ---
    const statSection = document.getElementById('about');
    const counters = document.querySelectorAll('.count-up');
    let countersAnimated = false;

    if (statSection && counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    counters.forEach(counter => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        const isFloat = target % 1 !== 0;
                        const duration = 2000; // 2 seconds
                        const startTime = performance.now();

                        function count(now) {
                            const elapsed = now - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            // Ease out quad
                            const easeProgress = progress * (2 - progress);
                            const val = easeProgress * target;
                            
                            counter.textContent = isFloat ? val.toFixed(1) : Math.floor(val);

                            if (progress < 1) {
                                requestAnimationFrame(count);
                            } else {
                                counter.textContent = isFloat ? target.toFixed(1) : target;
                            }
                        }
                        requestAnimationFrame(count);
                    });
                }
            });
        }, { threshold: 0.2 });

        observer.observe(statSection);
    }

    // --- Timeline Scroll Progress ---
    const timelineProgress = document.getElementById('timeline-progress');
    const experienceSection = document.getElementById('experience');
    
    if (timelineProgress && experienceSection) {
        window.addEventListener('scroll', () => {
            const rect = experienceSection.getBoundingClientRect();
            const sectionHeight = experienceSection.offsetHeight;
            const scrollProgress = Math.min(Math.max(-rect.top / (sectionHeight - window.innerHeight), 0), 1);
            timelineProgress.style.height = `${scrollProgress * 100}%`;
        });
    }

    // --- AI Cards Mouse Glowing Shader Coordinates ---
    const aiCards = document.querySelectorAll('.ai-card');
    aiCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const glowEl = card.querySelector('.ai-card-glow');
            if (glowEl) {
                glowEl.style.setProperty('--x', `${x}px`);
                glowEl.style.setProperty('--y', `${y}px`);
            }
        });
    });

    // --- Interactive Skills Constellation Canvas ---
    initConstellationCanvas();

    // --- Contact Signal Terminal Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const terminalLogs = document.getElementById('terminal-logs');
    const resetBtn = document.getElementById('terminal-reset');

    if (contactForm && terminalLogs) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameVal = document.getElementById('name').value;
            const emailVal = document.getElementById('email').value;
            const msgVal = document.getElementById('message').value;

            // Hide form and show terminal
            contactForm.classList.add('hidden');
            terminalLogs.classList.remove('hidden');

            // Log sequence
            const logContainer = terminalLogs;
            logContainer.innerHTML = ''; // Clear existing contents

            const steps = [
                { text: `>> [SYSTEM]: Initializing communication bridge...`, class: 'info', delay: 0 },
                { text: `>> [ENCRYPT]: Compiling AES-256 transmission packet...`, class: 'info', delay: 600 },
                { text: `>> [PACKET]: Transmitter Identity: ${nameVal}`, class: 'info', delay: 1200 },
                { text: `>> [PACKET]: Uplink Return Node: ${emailVal}`, class: 'info', delay: 1800 },
                { text: `>> [PACKET]: Payload Size: ${msgVal.length} bytes encrypted.`, class: 'info', delay: 2400 },
                { text: `>> [HANDSHAKE]: Reaching deep-space router node.thirupathi.dev...`, class: 'info', delay: 3000 },
                { text: `>> [CONNECTING]: Ping status 12ms. Synced.`, class: 'info', delay: 3600 },
                { text: `>> [SUCCESS]: Signal fully synchronized! Status Code: 200 OK.`, class: 'success', delay: 4200 }
            ];

            steps.forEach(step => {
                setTimeout(() => {
                    const row = document.createElement('div');
                    row.className = `log-row ${step.class}`;
                    row.textContent = step.text;
                    logContainer.appendChild(row);
                    
                    // Auto-scroll inside terminal container if needed
                    logContainer.scrollTop = logContainer.scrollHeight;
                }, step.delay);
            });

            // Append reset button at the end of logs
            setTimeout(() => {
                const rBtn = document.createElement('button');
                rBtn.id = 'terminal-reset';
                rBtn.className = 'btn btn-secondary btn-sm mt-4 font-mono';
                rBtn.textContent = 'ESTABLISH NEW CONNECTION';
                rBtn.addEventListener('click', resetTerminalForm);
                logContainer.appendChild(rBtn);
            }, steps[steps.length - 1].delay + 500);
        });
    }

    function resetTerminalForm() {
        if (contactForm && terminalLogs) {
            contactForm.reset();
            terminalLogs.classList.add('hidden');
            contactForm.classList.remove('hidden');
        }
    }
}

// --- Constellation Canvas Setup ---
function initConstellationCanvas() {
    const canvas = document.getElementById('skills-constellation-canvas');
    const container = canvas.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    
    // Scale canvas to parent bounds
    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    // Skill nodes definitions
    const nodes = [
        // AI / Vector Nodes (Center Cluster)
        { id: 0, name: "LLM Agent Swarms", category: "AI ENGINEERING", x: 0.5, y: 0.45, level: 94, desc: "Designing multi-agent frameworks, task networks, self-reflecting loops, and state-machine prompt controls.", val: "94%" },
        { id: 1, name: "Spectra Vector RAG", category: "AI ENGINEERING", x: 0.38, y: 0.55, level: 90, desc: "Implementing HNSW semantic indexes, cluster caching, meta-filtering algorithms, and high-dimensional spaces.", val: "90%" },
        { id: 2, name: "Computer Vision", category: "AI ENGINEERING", x: 0.62, y: 0.52, level: 88, desc: "Building convolutional network filters, satellite coordinate mapping, and surface geological alteration engines.", val: "88%" },
        
        // Frontend / WebGL Nodes (Left Cluster)
        { id: 3, name: "NextJS 15 / React 19", category: "FRONTEND CORE", x: 0.22, y: 0.35, level: 95, desc: "Constructing server components, static bundles, client state caches, and highly fluid layouts.", val: "95%" },
        { id: 4, name: "Three.js / WebGL / Canvas", category: "FRONTEND GRAPHICS", x: 0.18, y: 0.58, level: 90, desc: "Drafting high-performance GPU-bound simulations, starfield particle emitters, and procedural lighting matrices.", val: "90%" },
        { id: 5, name: "TypeScript / ES6 Modules", category: "FRONTEND CORE", x: 0.28, y: 0.25, level: 98, desc: "Architecting strongly typed system models, class structures, module import networks, and callback streams.", val: "98%" },

        // Backend Nodes (Bottom Left / Bottom Center)
        { id: 6, name: "Node.js / Express", category: "BACKEND INFRA", x: 0.45, y: 0.78, level: 92, desc: "Developing asynchronous event microservices, socket connections, API telemetry grids, and security layers.", val: "92%" },
        
        // Databases (Bottom Right Cluster)
        { id: 7, name: "MongoDB", category: "DATABASES", x: 0.68, y: 0.82, level: 89, desc: "Defining cluster schemas, pipeline query indexes, write performance caches, and replica sharding.", val: "89%" },
        { id: 8, name: "PostgreSQL", category: "DATABASES", x: 0.58, y: 0.74, level: 87, desc: "Optimizing relational indexes, transactions constraints, data warehouse structures, and SQL procedures.", val: "87%" },
        
        // Cloud & DevOps (Right Cluster)
        { id: 9, name: "AWS Cloud Stack", category: "DEVOPS & CLOUD", x: 0.82, y: 0.38, level: 85, desc: "Setting up auto-scaling serverless networks, cloud storage paths, and load balancing routers.", val: "85%" },
        { id: 10, name: "Docker Containers", category: "DEVOPS & CLOUD", x: 0.78, y: 0.6, level: 90, desc: "Bundling environment packages, staging multi-environment pipelines, and maintaining cluster orchestration.", val: "90%" }
    ];

    // Convert normalized coordinates [0,1] to pixels based on current canvas dimension
    nodes.forEach(node => {
        node.px = node.x * width;
        node.py = node.y * height;
        node.targetPx = node.px;
        node.targetPy = node.py;
        node.vx = (Math.random() - 0.5) * 0.15; // Drift velocities
        node.vy = (Math.random() - 0.5) * 0.15;
    });

    // Define connection pairs
    const connections = [
        [0, 1], [0, 2], [1, 2], // AI connections
        [3, 5], [3, 4], [4, 5], // Frontend connections
        [3, 0], [4, 1], // Frontend-AI bridges
        [6, 3], [6, 0], // Backend bridges
        [6, 7], [6, 8], [7, 8], // DB connections
        [8, 1], [7, 2], // DB-AI bridges
        [9, 10], [10, 6], [9, 0] // DevOps bridges
    ];

    // Interaction variables
    let mouseX = -1000;
    let mouseY = -1000;
    let hoveredNode = null;

    // Detail Panel elements
    const detailPanel = document.getElementById('skills-detail-panel');
    const skillName = document.getElementById('skill-name');
    const skillCategory = document.getElementById('skill-category');
    const skillLevel = document.getElementById('skill-level');
    const skillPercentage = document.getElementById('skill-percentage');
    const skillDesc = document.getElementById('skill-desc');
    const skillIcon = document.getElementById('skill-tech-icon');

    // Resize event
    window.addEventListener('resize', () => {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        
        // Re-scale positions
        nodes.forEach(node => {
            node.px = node.x * width;
            node.py = node.y * height;
        });
    });

    // Track mouse
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        // Proximity detection
        let minDistance = 25; // Snapping radius
        let foundNode = null;

        nodes.forEach(node => {
            const dx = mouseX - node.px;
            const dy = mouseY - node.py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDistance) {
                minDistance = dist;
                foundNode = node;
            }
        });

        if (foundNode !== hoveredNode) {
            hoveredNode = foundNode;
            if (hoveredNode) {
                updateDetailPanel(hoveredNode);
            }
        }
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function updateDetailPanel(node) {
        if (!detailPanel || !skillName || !skillCategory || !skillLevel || !skillPercentage || !skillDesc) return;
        
        // Animate detail changes
        skillName.textContent = node.name;
        skillCategory.textContent = node.category;
        skillPercentage.textContent = node.val;
        skillDesc.textContent = node.desc;
        
        // Star character symbol updates color depending on level
        if (skillIcon) {
            if (node.level >= 95) {
                skillIcon.textContent = "✦";
                skillIcon.style.color = "var(--color-emerald)";
            } else if (node.level >= 90) {
                skillIcon.textContent = "★";
                skillIcon.style.color = "var(--color-cyan-bright)";
            } else {
                skillIcon.textContent = "⚙";
                skillIcon.style.color = "var(--color-purple-light)";
            }
        }

        // Ease width transition
        skillLevel.style.width = `${node.level}%`;
    }

    // Animation Loop
    function renderConstellation() {
        requestAnimationFrame(renderConstellation);

        // Clear Canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Update positions (Add slow wandering drift)
        nodes.forEach(node => {
            node.px += node.vx;
            node.py += node.vy;

            // Constrain wandering boundary to 40px offsets from normalized target
            const basePx = node.x * width;
            const basePy = node.y * height;
            const maxOffset = 30;

            if (Math.abs(node.px - basePx) > maxOffset) {
                node.vx *= -1;
            }
            if (Math.abs(node.py - basePy) > maxOffset) {
                node.vy *= -1;
            }

            // Attract slightly towards mouse pointer if hovering
            if (hoveredNode && hoveredNode.id === node.id) {
                node.px += (mouseX - node.px) * 0.08;
                node.py += (mouseY - node.py) * 0.08;
            }
        });

        // 2. Draw connections (lines)
        connections.forEach(pair => {
            const nodeA = nodes[pair[0]];
            const nodeB = nodes[pair[1]];

            // Draw glowing path line
            ctx.beginPath();
            ctx.moveTo(nodeA.px, nodeB.py); // Dynamic bridge tracing
            ctx.moveTo(nodeA.px, nodeA.py);
            ctx.lineTo(nodeB.px, nodeB.py);

            // Set line style (highlight if hovered)
            const isPairHovered = hoveredNode && (hoveredNode.id === nodeA.id || hoveredNode.id === nodeB.id);
            
            if (isPairHovered) {
                ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)';
                ctx.lineWidth = 1.8;
                ctx.shadowColor = 'var(--color-cyan-glow)';
                ctx.shadowBlur = 8;
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.lineWidth = 0.8;
                ctx.shadowBlur = 0;
            }
            
            ctx.stroke();
        });

        // Reset shadow
        ctx.shadowBlur = 0;

        // 3. Draw nodes (stars)
        nodes.forEach(node => {
            const isHovered = hoveredNode && hoveredNode.id === node.id;
            const isConnectedToHovered = hoveredNode && connections.some(pair => {
                return (pair[0] === node.id && pair[1] === hoveredNode.id) || 
                       (pair[1] === node.id && pair[0] === hoveredNode.id);
            });

            // Pulse radius scale
            const pulse = 1 + Math.sin(Date.now() * 0.003 + node.id) * 0.12;
            const baseRadius = isHovered ? 8 : 4;
            const radius = baseRadius * pulse;

            // Draw glowing radial gradient star
            const grad = ctx.createRadialGradient(node.px, node.py, 0, node.px, node.py, radius * 3);
            
            if (isHovered) {
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.3, 'rgba(0, 245, 255, 0.8)');
                grad.addColorStop(1, 'rgba(0, 245, 255, 0)');
            } else if (isConnectedToHovered) {
                grad.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
                grad.addColorStop(0.5, 'rgba(0, 212, 255, 0.3)');
                grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
            } else {
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                grad.addColorStop(0.4, 'rgba(124, 77, 255, 0.2)');
                grad.addColorStop(1, 'rgba(124, 77, 255, 0)');
            }

            ctx.beginPath();
            ctx.arc(node.px, node.py, radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Inner star core dot
            ctx.beginPath();
            ctx.arc(node.px, node.py, isHovered ? 3 : 1.5, 0, Math.PI * 2);
            ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)';
            ctx.fill();

            // Render text label under star if hovered or connected
            if (isHovered || isConnectedToHovered) {
                ctx.fillStyle = isHovered ? '#00f5ff' : '#94a3b8';
                ctx.font = isHovered ? 'bold 10px Space Grotesk' : '9px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.fillText(node.name, node.px, node.py - (radius * 3) - 5);
            }
        });
    }

    // Begin drawing frame loops
    renderConstellation();
}
