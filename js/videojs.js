let globalLenis;
const MOBILE_BREAKPOINT = 480;

document.addEventListener('DOMContentLoaded', initSmoothScroll);

function initSmoothScroll() {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        return;
    }

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
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
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