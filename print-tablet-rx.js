// ==========================================
// Clinic Master - Tablet RX Print (print-tablet-rx.js) - Independent & Optimized
// ==========================================

function printPrescriptionDirectly() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    const executeTabletPrint = () => {
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing-rx-only');
                if (rxSymbol) rxSymbol.style.display = '';
            }, 1200);
        }, 600); // مهلة زمنية مخصصة للتابلت
    };

    if (bgImg) {
        if (savedRxImg) {
            bgImg.style.display = 'block';
            bgImg.style.visibility = 'visible';
            bgImg.style.opacity = '1';
            bgImg.style.zIndex = '1';

            if (bgImg.src !== savedRxImg) {
                bgImg.onload = executeTabletPrint;
                bgImg.onerror = executeTabletPrint;
                bgImg.src = savedRxImg;
            } else if (bgImg.complete) {
                executeTabletPrint();
            } else {
                bgImg.onload = executeTabletPrint;
            }
        } else {
            bgImg.style.display = 'none';
            executeTabletPrint();
        }
    } else {
        executeTabletPrint();
    }
}
