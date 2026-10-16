// ==========================================
// Clinic Master - Mobile RX Print (print-mobile-rx.js) - Complete File
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
    let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    if (bgImg && savedRxImg) {
        bgImg.src = savedRxImg;
        bgImg.style.display = 'block';
        bgImg.style.visibility = 'visible';
    }

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');
    
    setTimeout(() => {
        window.print();
    }, 500);
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-rx-only'); 
        if (rxSymbol) rxSymbol.style.display = '';
    }, 1500);
}
