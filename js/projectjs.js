// Global variable untuk Lenis agar bisa diakses di fungsi lain
let globalLenis; 
document.addEventListener('DOMContentLoaded', initSmoothScroll);
// ---------------------------------------------
// 1. INISIASI LENIS (SMOOTH SCROLL)
// ---------------------------------------------
function initSmoothScroll() {
    // Cek apakah Lenis sudah dimuat
    if (typeof Lenis === 'undefined') {
        console.warn("Lenis library not found. Smooth scroll dinonaktifkan.");
        return;
    }
    
    // Inisiasi lenis dan masukkan ke globalLenis
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

    // Fungsi untuk memperbarui Lenis di setiap frame (Loop Animasi)
    function raf(time) {
        globalLenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    console.log("Lenis Smooth Scroll Activated.");

    // --- LOGIKA SCROLL SAAT KLIK LINK INTERNAL ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); 
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                globalLenis.scrollTo(targetElement, {
                    duration: 1.5, 
                    offset: -100     // Offset 100px di atas elemen
                });
            }
        });
    });
    
    // Logika Scroll dari Hash di luar halaman DIBIARKAN KOSONG di sini, 
    // karena sudah ditangani di bagian 4 setelah inisiasi Lenis.
}