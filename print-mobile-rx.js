// ==========================================
// Clinic Master - Mobile RX Print (print-mobile-rx.js) - Fixed & Guaranteed
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg');
    let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    // دالة تنفيذ الطباعة وإرجاع العناصر لحالتها بعد الانتهاء
    const executeMobilePrint = () => {
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing-rx-only');
                if (rxSymbol) rxSymbol.style.display = '';
            }, 1200);
        }, 500);
    };

    if (bgImg) {
        if (savedRxImg) {
            bgImg.style.display = 'block';
            bgImg.style.visibility = 'visible';
            bgImg.style.opacity = '1';
            bgImg.style.zIndex = '1';

            if (bgImg.src !== savedRxImg) {
                bgImg.onload = executeMobilePrint;
                bgImg.onerror = executeMobilePrint;
                bgImg.src = savedRxImg;
            } else if (bgImg.complete) {
                executeMobilePrint();
            } else {
                bgImg.onload = executeMobilePrint;
            }
        } else {
            bgImg.style.display = 'none';
            executeMobilePrint();
        }
    } else {
        executeMobilePrint();
    }
}
