// sync-video.js - VERSI FINAL DENGAN DELAY DAN VISUAL LOADING

// ---------------------------------------------
// 1. INISIASI LENIS (SMOOTH SCROLL)
// ---------------------------------------------
function initSmoothScroll() {
    // Cek apakah Lenis sudah dimuat (Wajib Link di HTML)
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis library not found. Smooth scroll dinonaktifkan.");
        return;
    }
    
    const lenis = new Lenis({
        duration: 1.2,      // Durasi scroll
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing effect
        direction: 'vertical', 
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.4, // Sensitivitas mouse
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Fungsi untuk memperbarui Lenis di setiap frame (Loop Animasi)
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    console.log("Lenis Smooth Scroll Activated.");
}

// !!! DIHAPUS: initSmoothScroll();
// Kita panggil di startEverything() agar ada delay.


// ---------------------------------------------
// 2. LOGIC SINKRONISASI VIDEO & ANTI-DRIFT
// ---------------------------------------------

let players = [];
let syncInterval = null;

// FUNGSI PENCEGAH DRIFT (ANTI-PERGESERAN WAKTU)
function startDriftCheck() {
    if (syncInterval) clearInterval(syncInterval);

    // Cek setiap 500ms (0.5 detik)
    syncInterval = setInterval(() => {
        if (players.length !== 2) return;

        Promise.all(players.map(p => p.getCurrentTime()))
        .then(times => {
            const timeKiri = times[0];
            const timeKanan = times[1];
            
            // Batas Toleransi Drift: 0.1 detik
            const drift = Math.abs(timeKiri - timeKanan);

            if (drift > 0.1) {
                const syncTime = Math.min(timeKiri, timeKanan);
                
                // Paksa kedua video ke waktu terkecil (video yang paling lambat)
                players.map(p => p.setCurrentTime(syncTime));

                console.warn(`[DRIFT] Dideteksi ${drift.toFixed(3)}s. Sinkronisasi paksa ke ${syncTime.toFixed(2)}s.`);
            }
        })
        .catch(error => {
            // Biarkan error jika player sedang buffering atau belum stabil
        });
    }, 500); 
}

// FUNGSI UTAMA: MENGINISIASI DAN SINKRONISASI AWAL
function initializePlayers() {
    const iframeKiri = document.querySelector('#video-kiri');
    const iframeKanan = document.querySelector('#video-kanan');

    if (!iframeKiri || !iframeKanan || typeof Vimeo === 'undefined') {
        // Coba inisiasi lagi setelah 200ms jika Vimeo API belum dimuat
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
            console.log("Kedua player siap (LOADED). Memaksa PLAY simultan.");

            // 1. Memaksa play
            Promise.all(players.map(p => p.play()))
            .then(() => {
                // 2. Jeda 500ms untuk stabilisasi buffering
                setTimeout(() => {
                    // 3. Sinkronisasi waktu awal
                    Promise.all(players.map(p => p.getCurrentTime()))
                    .then(times => {
                        const syncTime = Math.min(...times);
                        
                        Promise.all(players.map(p => p.setCurrentTime(syncTime)))
                        .then(() => {
                            // Tampilkan video secara simultan (Fade-in)
                            iframeKiri.classList.add('is-ready');
                            iframeKanan.classList.add('is-ready');

                            // HILANGKAN SKELETON LOADING (Tambahkan class is-loaded ke WRAPPER)
                            iframeKiri.closest('.video-wrapper').classList.add('is-loaded');
                            iframeKanan.closest('.video-wrapper').classList.add('is-loaded');

                            console.log(`[AWAL] Sinkronisasi Awal Selesai di ${syncTime.toFixed(2)}s. Loading Visual Dihapus.`);
                            
                            // 4. Mulai pengecekan anti-drift
                            startDriftCheck(); 
                        });
                    });
                }, 500); 
            })
            .catch(error => {
                // Fallback: Tampilkan video walaupun mungkin autoplay diblokir
                iframeKiri.classList.add('is-ready');
                iframeKanan.classList.add('is-ready');
                console.error("Gagal Autoplay. Blokir browser:", error);

                // Hapus loading visual agar user bisa klik play manual
                iframeKiri.closest('.video-wrapper').classList.add('is-loaded');
                iframeKanan.closest('.video-wrapper').classList.add('is-loaded');
            });
        }
    }

    playerKiri.on('loaded', attemptToPlayAndSync);
    playerKanan.on('loaded', attemptToPlayAndSync);
}


// ---------------------------------------------
// 3. INJEKSI DELAY (FIX FREEZE AWAL)
// ---------------------------------------------

// Fungsi pembungkus untuk memulai semua script berat
function startEverything() {
    initSmoothScroll(); 
    initializePlayers();
}

// Tunda inisiasi Lenis dan Vimeo API selama 1 detik (1000ms)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(startEverything, 1000); 
});


// teks acak scramble halo faiz //

const TARGET_ELEMENT = document.getElementById('halo');
const FINAL_TEXT = "Halo, Saya Faiz";

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-';

// PENGATURAN KECEPATAN SHUFFLE (Cepat)
const FRAME_DURATION = 15;  // Kecepatan pergantian frame
const SHUFFLE_STEPS = 10;   // Durasi langkah acak per karakter

// PENGATURAN LOOP DAN FADE-OUT
const PAUSE_DURATION = 1500;    // Jeda (ms) setelah teks penuh, sebelum fade-out
const FADE_OUT_DURATION = 300;  // Total durasi fade-out (ms)
const FADE_OUT_STEPS = 10;      // Jumlah langkah fade-out

function randomChar() {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

// ------------------------------------
// FUNGSI UTAMA SHUFFLE (Fade-In di dalamnya)
// ------------------------------------
function startScramble(callback) {
    let frame = 0;
    const queue = [];
    const TOTAL_FRAMES = FINAL_TEXT.length * SHUFFLE_STEPS; 
    
    // Inisialisasi antrian shuffle
    for (let i = 0; i < FINAL_TEXT.length; i++) {
        const value = FINAL_TEXT[i];
        const delay = SHUFFLE_STEPS * i;

        queue.push({ 
            finalChar: value, 
            startFrame: delay, 
            endFrame: delay + SHUFFLE_STEPS 
        });
    }

    // Loop animasi
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
        
        // Hitung Opacity (Fade-In)
        let opacity_progress = frame / TOTAL_FRAMES;
        if (opacity_progress > 1.0) { opacity_progress = 1.0; }
        TARGET_ELEMENT.style.opacity = opacity_progress;

        // Lanjutkan jika belum selesai
        if (charactersCompleted !== queue.length) {
            frame++;
            setTimeout(update, FRAME_DURATION);
        } else {
            // Animasi selesai, panggil callback (untuk melanjutkan ke Fade-Out)
            TARGET_ELEMENT.style.opacity = '1';
            TARGET_ELEMENT.textContent = FINAL_TEXT; 
            if (callback) callback();
        }
    }

    update();
}

// ------------------------------------
// FUNGSI FADE-OUT
// ------------------------------------
function fadeOut(callback) {
    let opacity = 1.0;
    const stepAmount = 1.0 / FADE_OUT_STEPS;

    function step() {
        opacity -= stepAmount;
        
        if (opacity <= 0) {
            TARGET_ELEMENT.style.opacity = 0;
            // Penting: Reset text content agar shuffle berikutnya dimulai dari kosong
            TARGET_ELEMENT.textContent = ''; 
            if (callback) callback(); // Fade out selesai, panggil loop lagi
            return;
        }
        
        TARGET_ELEMENT.style.opacity = opacity;
        
        // Hitung delay per langkah fade-out
        const stepDelay = FADE_OUT_DURATION / FADE_OUT_STEPS;
        setTimeout(step, stepDelay);
    }
    
    step();
}

// ------------------------------------
// FUNGSI LOOPING UTAMA
// ------------------------------------
function loopAnimation() {
    // 1. Mulai Shuffle (Fade-in terjadi selama shuffle)
    startScramble(() => {
        
        // 2. Jeda sejenak agar teks bisa dibaca
        setTimeout(() => {
            
            // 3. Mulai Fade-Out
            fadeOut(() => {
                
                // 4. Setelah Fade-Out selesai (opacity 0), ulangi loop
                loopAnimation();
            });
            
        }, PAUSE_DURATION);
    });
}

// Memulai fungsi saat seluruh HTML dimuat
document.addEventListener('DOMContentLoaded', loopAnimation);


// ---------------------------------------------
// 1. INISIASI LENIS (SMOOTH SCROLL)
// ---------------------------------------------
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis library not found. Smooth scroll dinonaktifkan.");
        return;
    }
    
    const lenis = new Lenis({
        duration: 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical', 
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 0.4, // Mungkin ini yang bikin scroll mouse lo 'aneh' (terlalu halus/lambat)
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    console.log("Lenis Smooth Scroll Activated.");

    // --- KODE BARU UNTUK KLIK LINK #ABOUT (GANTI SCROLL MANUAL) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Mencegah browser melakukan scroll instan bawaan
            e.preventDefault(); 
            
            const targetId = this.getAttribute('href');
            // Cek apakah target ada (misalnya: #about)
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Perintahkan Lenis untuk scroll ke target elemen
                lenis.scrollTo(targetElement, {
                    // Opsi tambahan Lenis (opsional)
                    duration: 1.5, // Bisa diset lebih lambat dari default lenis
                    offset: -180     // Jarak dari atas elemen
                });
            }
        });
    });
    // -----------------------------------------------------------------

}