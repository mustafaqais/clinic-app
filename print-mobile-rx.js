// ==========================================
// Clinic Master - Mobile RX Print (print-mobile-rx.js) - Final Robust Fix
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
    let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    if (bgImg && savedRxImg) {
        bgImg.onload = function() {
            setTimeout(() => {
                window.print();
                cleanupMobileAfterPrint(rxSymbol);
            }, 400);
        };
        bgImg.onerror = function() {
            window.print();
            cleanupMobileAfterPrint(rxSymbol);
        };
        bgImg.src = savedRxImg;
        bgImg.style.display = 'block';
        bgImg.style.visibility = 'visible';
        bgImg.style.opacity = '1';

        if (bgImg.complete) {
            setTimeout(() => {
                window.print();
                cleanupMobileAfterPrint(rxSymbol);
            }, 400);
        }
    } else {
        setTimeout(() => {
            window.print();
            cleanupMobileAfterPrint(rxSymbol);
        }, 400);
    }
}

function cleanupMobileAfterPrint(rxSymbol) {
    setTimeout(() => {
        document.body.classList.remove('is-printing-rx-only');
        if (rxSymbol) rxSymbol.style.display = '';
    }, 1200);
}
