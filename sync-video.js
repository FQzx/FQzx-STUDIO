// sync-video.js

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

// Panggil fungsi Lenis saat script dimuat
initSmoothScroll(); 


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

                            console.log(`[AWAL] Sinkronisasi Awal Selesai di ${syncTime.toFixed(2)}s.`);
                            
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
            });
        }
    }

    playerKiri.on('loaded', attemptToPlayAndSync);
    playerKanan.on('loaded', attemptToPlayAndSync);
}


// WAJIB: Hanya panggil ini sekali setelah semua fungsi didefinisikan
document.addEventListener('DOMContentLoaded', initializePlayers);