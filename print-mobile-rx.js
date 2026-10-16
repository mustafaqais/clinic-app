// ==========================================
// Clinic Master - Mobile RX Print (print-mobile-rx.js) - Ultimate Force Fix
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg');
    let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    if (bgImg) {
        if (savedRxImg) {
            bgImg.src = savedRxImg;
            bgImg.style.display = 'block';
            bgImg.style.visibility = 'visible';
            bgImg.style.opacity = '1';
            bgImg.style.zIndex = '1';
        }
    }

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');
    
    setTimeout(() => {
        window.print();
    }, 1000); // زيادة وقت الانتظار للموبايل لضمان سحب الصورة ورسمها
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-rx-only'); 
        if (rxSymbol) rxSymbol.style.display = '';
    }, 2500);
}
