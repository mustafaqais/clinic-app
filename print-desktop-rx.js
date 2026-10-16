// ==========================================
// Clinic Master - Desktop RX Print (print-desktop-rx.js) - Final Optimized
// ==========================================

function printPrescriptionDirectly() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let bgImg = container.querySelector('.rx-bg-img');
    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    
    if (!bgImg && savedRxImg) {
        bgImg = document.createElement('img');
        bgImg.src = savedRxImg;
        bgImg.className = 'rx-bg-img';
        container.insertBefore(bgImg, container.firstChild);
    } else if (bgImg && savedRxImg) {
        bgImg.src = savedRxImg;
        bgImg.style.display = 'block';
    }

    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');
    
    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');
    
    const reportModal = document.getElementById('medicalReportModal');
    let reportWasOpen = false;
    if (reportModal && (reportModal.style.display === 'flex' || window.getComputedStyle(reportModal).display === 'flex')) {
        reportModal.style.display = 'none';
        reportWasOpen = true;
    }

    const executePrint = () => {
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing-rx-only');
                controls.forEach(c => c.style.display = '');
                if (reportWasOpen && reportModal) {
                    reportModal.style.display = 'flex';
                }
            }, 1000);
        }, 500);
    };

    if (bgImg && savedRxImg) {
        if (bgImg.complete) {
            executePrint();
        } else {
            bgImg.onload = executePrint;
            bgImg.onerror = executePrint;
        }
    } else {
        executePrint();
    }
}
