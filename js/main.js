// Core Web Application Bootstrapper

import { initSpaceBackground } from './space-background.js';
import { initAICore } from './ai-core.js';
import { initSectionInteractions } from './sections.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Holographic Preloader Progress
    initPreloader();

    // 2. Initialize Three.js Components
    initSpaceBackground();
    initAICore();

    // 3. Initialize Interactive Components & Telemetry Updates
    initSectionInteractions();

    // 4. Initialize Smooth Scrolling (Lenis)
    initSmoothScroll();

    // 5. Initialize GSAP Scroll Reveals and Effects
    initGSAPReveals();

    // 6. Magnetic Button Interactive Effects
    initMagneticButtons();
});

// --- Preloader Boot Sequence Simulation ---
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');
    const statusText = preloader ? preloader.querySelector('.preloader-status') : null;

    if (!preloader || !progressBar) return;

    let progress = 0;
    const duration = 1200; // 1.2s boot simulation
    const intervalTime = 30;
    const step = (intervalTime / duration) * 100;

    const statusUpdates = [
        { threshold: 10, text: "CONNECTING TO TACTICAL ORBITER..." },
        { threshold: 30, text: "ENABLING CORE COGNITIVE PIPELINES..." },
        { threshold: 60, text: "SYNCHRONIZING VECTOR DATABASE NODE..." },
        { threshold: 85, text: "DOWNLINK SECURED. LOADING VISUALIZERS..." },
        { threshold: 100, text: "SYSTEM ACTIVE. APERTURE OPEN." }
    ];

    const timer = setInterval(() => {
        progress += step;
        progressBar.style.width = `${Math.min(progress, 100)}%`;

        // Update boot diagnostic console status
        const currentStatus = statusUpdates.find(u => progress <= u.threshold);
        if (currentStatus && statusText) {
            statusText.textContent = currentStatus.text;
        }

        if (progress >= 100) {
            clearInterval(timer);
            
            // Fade out preloader screen
            setTimeout(() => {
                preloader.classList.add('fade-out');
                
                // Trigger page-in animations using GSAP
                animateHeroReveal();
            }, 300);
        }
    }, intervalTime);
}

// --- Lenis Smooth Scroll Setup ---
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Linear-style smooth curve
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    if (typeof gsap !== 'undefined' && gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSize(0);
    }

    // Connect anchor links smooth scroll redirection
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                lenis.scrollTo(targetEl, { offset: -80 });
            }
        });
    });
}

// --- Hero Reveal Entry Animation ---
function animateHeroReveal() {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline();
    
    tl.fromTo('.navbar', 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    tl.fromTo('#hero-badge', 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
        "-=0.4"
    );

    tl.fromTo('.hero-heading span', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        "-=0.3"
    );

    tl.fromTo('.hero-desc', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        "-=0.4"
    );

    tl.fromTo('.hero-actions .btn', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
        "-=0.4"
    );

    tl.fromTo('.hero-socials', 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4 },
        "-=0.3"
    );

    tl.fromTo('#ai-core-container', 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.75)' },
        "-=1.0"
    );
}

// --- Section Reveal Animations on Scroll ---
function initGSAPReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const revealSections = document.querySelectorAll('.scroll-reveal');
    revealSections.forEach(section => {
        gsap.fromTo(section, 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    once: true
                }
            }
        );
    });

    // Make individual project/AI cards scale up subtly as they enter viewport
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        // Skip animating about/hero child elements if handled above
        if (card.closest('#hero') || card.closest('#about')) return;

        gsap.fromTo(card,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    once: true
                }
            }
        );
    });
}

// --- Magnetic Button Elements ---
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            // Get relative position of cursor inside button boundary
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Shift button content slightly towards cursor
            gsap.to(this, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', function() {
            // Snap back to base position
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}
