/**
 * MAIN LOGIC - js/main.js
 * Pure Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initMobileMenu();
    initSmoothScroll();
    initParallax();
    initCardFlip();
});

/**
 * Mobile Scroll-Triggered Card Flip
 */
function initCardFlip() {
    const observerOptions = {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // Solo el 10% central de la pantalla
        threshold: 0 // Intersecta en cuanto la tarjeta toque esa franja central
    };

    const flipObserver = new IntersectionObserver((entries) => {
        // Only trigger automatic flip on mobile viewports
        if (window.innerWidth >= 968) return;

        entries.forEach(entry => {
            const cardInner = entry.target.querySelector('.card-inner');
            if (!cardInner) return;

            if (entry.isIntersecting) {
                cardInner.classList.add('is-flipped');
            } else {
                cardInner.classList.remove('is-flipped');
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.card-container');
    cards.forEach(card => flipObserver.observe(card));
}

/**
 * Smooth Parallax Effect for Hero Background
 */
function initParallax() {
    const heroBg = document.querySelector('.hero-bg-wrapper');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // Parallax factor: 0.4 (Adjust for more/less movement)
        const val = scrolled * 0.8;
        heroBg.style.transform = `translate(-50%, calc(-50% + ${val}px))`;
    });
}

/**
 * Basic intersection observer for reveal animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, observerOptions);

    // Target elements
    const fadeElements = document.querySelectorAll('.fade-in, .card, .hero-content h1');
    fadeElements.forEach(el => observer.observe(el));
}

/**
 * Mobile Menu Toggle logic
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        const header = document.getElementById('main-header');
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            toggle.classList.toggle('is-active');
            header.classList.toggle('mobile-nav-open');
        });
    }
}

/**
 * Polyfill-like smooth scroll for older browsers 
 * (though html {scroll-behavior: smooth} handles it in modern ones)
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Helper: Add classes for animations if not present in HTML
const style = document.createElement('style');
style.innerHTML = `
    .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
    .fade-in.active { opacity: 1; transform: translateY(0); }
    
    .card { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    .card.active { opacity: 1; transform: translateY(0); }
    
    .hero-content h1 { opacity: 0; transform: translateX(-30px); transition: all 1s ease-out; }
    .hero-content h1.active { opacity: 1; transform: translateX(0); }
`;
document.head.appendChild(style);
