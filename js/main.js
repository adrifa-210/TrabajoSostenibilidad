/**
 * LÓGICA PRINCIPAL - js/main.js
 * Funciona sin herramientas externas (Vanilla JS)
 **/

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initMobileMenu();
    initSmoothScroll();
    initParallax();
    initCardFlip();
});

/**
 * Hace que las tarjetas se den la vuelta solas al bajar con el móvil
 **/
function initCardFlip() {
    const observerOptions = {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // Detecta cuando la tarjeta está en el centro de la pantalla
        threshold: 0 // Se activa en cuanto toca esa zona central
    };

    const flipObserver = new IntersectionObserver((entries) => {
        // Solo ocurre en pantallas de móvil (menos de 968 píxeles de ancho)
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
 * Efecto de movimiento en el fondo del encabezado al bajar (Efecto Parallax)
 **/
function initParallax() {
    const heroBg = document.querySelector('.hero-bg-wrapper');
    if (!heroBg) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // Factor de movimiento: 0.8 (Se puede ajustar para más o menos movimiento)
        const val = scrolled * 0.8;
        heroBg.style.transform = `translate(-50%, calc(-50% + ${val}px))`;
    });
}

/**
 * Escuchador que activa animaciones cuando bajamos la página
 **/
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo se activa una vez
            }
        });
    }, observerOptions);

    // Elementos a los que aplicamos el efecto de aparecer suavemente
    const fadeElements = document.querySelectorAll('.fade-in, .card, .hero-content h1');
    fadeElements.forEach(el => observer.observe(el));
}

/**
 * Lógica para abrir y cerrar el menú en móviles
 **/
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
 * Suaviza el movimiento al pulsar enlaces que llevan a otras partes de la misma página
 **/
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

// Las animaciones ahora se gestionan principalmente con CSS para que no haya parpadeos al cargar
