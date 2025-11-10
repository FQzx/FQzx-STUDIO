let globalLenis;
const MOBILE_BREAKPOINT = 480;

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initMobileScrollAnimations();
});

function initSmoothScroll() {
    // Initialize Lenis on all devices for consistent smooth scrolling
    if (typeof Lenis === 'undefined') {
        return;
    }

    globalLenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.4,
        smoothTouch: true,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1
    });

    function raf(time) {
        globalLenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement && globalLenis) {
                globalLenis.scrollTo(targetElement, {
                    duration: 1.5,
                    offset: -100
                });
            } else if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initMobileScrollAnimations() {

    const animatedSections = [
        { selector: '#header', delay: 0 },
        { selector: '#title', delay: 1 },
        { selector: '#titleex', delay: 2 },
        { selector: '.box', delay: 1, multiple: true },
        { selector: '#copyright', delay: 0 }
    ];

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '-20px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedSections.forEach(section => {
        const elements = section.multiple ? 
            document.querySelectorAll(section.selector) :
            [document.querySelector(section.selector)];

        elements.forEach((el, index) => {
            if (el) {
                el.classList.add('scroll-reveal');
                // For boxes, create staggered animation
                if (section.selector === '.box') {
                    el.classList.add(`scroll-delay-${index % 6}`); // Loop through 6 delay values
                } else {
                    el.classList.add(`scroll-delay-${section.delay}`);
                }
                observer.observe(el);
            }
        });
    });
}