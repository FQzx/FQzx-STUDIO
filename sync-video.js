let globalLenis;
const MOBILE_BREAKPOINT = 480;

document.addEventListener('DOMContentLoaded', loopAnimation);

function initSmoothScroll() {
    // Remove mobile check to enable smooth scroll on all devices
    if (typeof Lenis === 'undefined') {
        return;
    }

    globalLenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.5,
        smoothTouch: true,
        touchMultiplier: 1.5,
        infinite: false,
        lerp: 0.15 // Reduced from 0.1 for better performance
    });

    function raf(time) {
        globalLenis.raf(time);
        // fade elements before they reach the header
        fadeBeforeHeader();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // fallback: if Lenis isn't active, still run fade checks on scroll
    window.addEventListener('scroll', () => {
        if (!globalLenis) fadeBeforeHeader();
    }, { passive: true });
    window.addEventListener('load', fadeBeforeHeader);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement && globalLenis) {
                globalLenis.scrollTo(targetElement, {
                    duration: 1.5,
                    offset: -170
                });
            } else if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

let players = [];
let syncInterval = null;

function startDriftCheck() {
    if (syncInterval) clearInterval(syncInterval);

    syncInterval = setInterval(() => {
        if (players.length !== 2) return;

        Promise.all(players.map(p => p.getCurrentTime()))
            .then(times => {
                const timeKiri = times[0];
                const timeKanan = times[1];

                const drift = Math.abs(timeKiri - timeKanan);

                if (drift > 0.15) { // Increased tolerance from 0.1 to 0.15
                    const syncTime = Math.min(timeKiri, timeKanan);
                    players.map(p => p.setCurrentTime(syncTime));
                }
            })
            .catch(error => {
                // Silent fail
            });
    }, 800); // Increased interval from 500 to 800ms for less CPU usage
}

function initializePlayers() {
    const iframeKiri = document.querySelector('#video-kiri');
    const iframeKanan = document.querySelector('#video-kanan');

    if (!iframeKiri || !iframeKanan || typeof Vimeo === 'undefined') {
        if (typeof Vimeo === 'undefined') {
            setTimeout(initializePlayers, 200);
        }
        return;
    }

    const playerKiri = new Vimeo.Player(iframeKiri);
    const playerKanan = new Vimeo.Player(iframeKanan);
    players = [playerKiri, playerKanan];

    let loadedCount = 0;

    function attemptToPlayAndSync() {
        loadedCount++;

        if (loadedCount === 2) {
            Promise.all(players.map(p => p.play()))
                .then(() => {
                    setTimeout(() => {
                        Promise.all(players.map(p => p.getCurrentTime()))
                            .then(times => {
                                const syncTime = Math.min(...times);

                                Promise.all(players.map(p => p.setCurrentTime(syncTime)))
                                    .then(() => {
                                        iframeKiri.classList.add('is-ready');
                                        iframeKanan.classList.add('is-ready');

                                        iframeKiri.closest('.video-wrapper').classList.add('is-loaded');
                                        iframeKanan.closest('.video-wrapper').classList.add('is-loaded');

                                        startDriftCheck();
                                    });
                            });
                    }, 500);
                })
                .catch(error => {
                    iframeKiri.classList.add('is-ready');
                    iframeKanan.classList.add('is-ready');
                    iframeKiri.closest('.video-wrapper').classList.add('is-loaded');
                    iframeKanan.closest('.video-wrapper').classList.add('is-loaded');
                });
        }
    }

    playerKiri.on('loaded', attemptToPlayAndSync);
    playerKanan.on('loaded', attemptToPlayAndSync);
}

function initMobileScrollAnimations() {

    const animatedSections = [
        { selector: '#header', delay: 0 },
        { selector: '#intro', delay: 1 },
        { selector: '#flexintro', delay: 2 },
        { selector: '#content', delay: 1 },
        { selector: '#who', delay: 0 },
        { selector: '#about', delay: 1 },
        { selector: '#titlecompetence', delay: 0 },
        { selector: '#competence', delay: 1 },
        { selector: '#skills a', delay: 2, multiple: true },
        { selector: '#projects', delay: 0 },
        { selector: '#projectsexplain', delay: 1 },
        { selector: '#videocontent', delay: 2 },
        { selector: '.form-container', delay: 1 },
        { selector: '#wrapmed', delay: 2 },
        { selector: '#copyright', delay: 3 }
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
                el.classList.add(`scroll-delay-${section.delay}`);
                observer.observe(el);
            }
        });
    });
}

function startEverything() {
    initSmoothScroll();
    initializePlayers();
    initMobileScrollAnimations();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startEverything, 1000);
});

const initialHash = window.location.hash;

if (initialHash) {
    history.replaceState(null, null, window.location.pathname);

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const targetElement = document.querySelector(initialHash);

            if (targetElement && globalLenis) {
                globalLenis.scrollTo(targetElement, {
                    duration: 1.5,
                    offset: -150
                });
                history.pushState(null, null, initialHash);

            } else if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, initialHash);
            }
        }, 1050);
    });
}

const TARGET_ELEMENT = document.getElementById('halo');
const FINAL_TEXT = "Halo, Saya Faiz";

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const FRAME_DURATION = 20; // Increased from 15 for less CPU
const SHUFFLE_STEPS = 8; // Reduced from 10

const PAUSE_DURATION = 1500;
const FADE_OUT_DURATION = 300;
const FADE_OUT_STEPS = 8; // Reduced from 10

function randomChar() {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

function startScramble(callback) {
    let frame = 0;
    const queue = [];
    const TOTAL_FRAMES = FINAL_TEXT.length * SHUFFLE_STEPS;

    for (let i = 0; i < FINAL_TEXT.length; i++) {
        const value = FINAL_TEXT[i];
        const delay = SHUFFLE_STEPS * i;

        queue.push({
            finalChar: value,
            startFrame: delay,
            endFrame: delay + SHUFFLE_STEPS
        });
    }

    const update = () => {
        let output = '';
        let charactersCompleted = 0;

        for (let i = 0; i < queue.length; i++) {
            let item = queue[i];

            if (frame >= item.endFrame) {
                output += item.finalChar;
                charactersCompleted++;
            } else if (frame >= item.startFrame) {
                output += randomChar();
            } else {
                output += ' ';
            }
        }

        TARGET_ELEMENT.textContent = output;

        let opacity_progress = frame / TOTAL_FRAMES;
        if (opacity_progress > 1.0) { opacity_progress = 1.0; }
        TARGET_ELEMENT.style.opacity = opacity_progress;

        if (charactersCompleted !== queue.length) {
            frame++;
            requestAnimationFrame(update); // Changed from setTimeout to requestAnimationFrame
        } else {
            TARGET_ELEMENT.style.opacity = '1';
            TARGET_ELEMENT.textContent = FINAL_TEXT;
            if (callback) callback();
        }
    }

    update();
}

function fadeOut(callback) {
    let opacity = 1.0;
    const stepAmount = 1.0 / FADE_OUT_STEPS;
    let stepCount = 0;

    function step() {
        opacity -= stepAmount;
        stepCount++;

        if (opacity <= 0) {
            TARGET_ELEMENT.style.opacity = 0;
            TARGET_ELEMENT.textContent = '';
            if (callback) callback();
            return;
        }

        TARGET_ELEMENT.style.opacity = opacity;

        if (stepCount < FADE_OUT_STEPS) {
            setTimeout(step, FADE_OUT_DURATION / FADE_OUT_STEPS);
        }
    }

    step();
}

function loopAnimation() {
    startScramble(() => {
        setTimeout(() => {
            fadeOut(() => {
                loopAnimation();
            });
        }, PAUSE_DURATION);
    });
}

function loopAnimation() {
    startScramble(() => {
        setTimeout(() => {
            fadeOut(() => {
                loopAnimation();
            });
        }, PAUSE_DURATION);
    });
}

// Fade elements before they go under the header
function fadeBeforeHeader() {
    try {
        const header = document.getElementById('header');
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const els = document.querySelectorAll('.scroll-reveal');

        els.forEach(el => {
            // skip header itself and anything inside the header
            // also skip elements explicitly marked not to fade (data-no-fade) and the email box
            if (!el) return;
            if (el.id === 'header' || el.closest('#header')) return;
            if (el.id === 'contact' || el.closest('#contact')) return;
            if (el.hasAttribute && el.hasAttribute('data-no-fade')) return;

            const rect = el.getBoundingClientRect();
            // when element top is at or above header bottom + small offset, fade it
            if (rect.top <= headerH + 8) {
                el.classList.add('fade-under');
            } else {
                el.classList.remove('fade-under');
            }
        });
    } catch (e) {
        // ignore errors during early load
    }
}