// ==========================================
// Clinic Master - Mobile RX Print (print-mobile-rx.js) - Fixed Version
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (container) {
        // جلب صورة الترويسة المحفوظة من الـ localStorage وتطبيقها مباشرة على الـ img الخلفية
        let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
        let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
        
        if (bgImg) {
            if (savedRxImg) {
                bgImg.src = savedRxImg;
                bgImg.style.display = 'block';
                bgImg.style.visibility = 'visible';
            } else {
                bgImg.style.display = 'none';
            }
        }
    }

    const rxSymbol = container ? container.querySelector('#rxDragBoxTreatment div:nth-child(2)') : null;
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');
    
    setTimeout(() => { window.print(); }, 600);
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-rx-only'); 
        if (rxSymbol) rxSymbol.style.display = '';
    }, 1800);
}
