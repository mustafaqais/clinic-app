// ==========================================
// Clinic Master - Mobile Medical Report Print (print-mobile-report.js)
// ==========================================

function printMedicalReportDirectly() {
    const container = document.getElementById('repCanvasContainer');
    if (container) {
        let bgImg = container.querySelector('.rx-bg-img');
        let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
        if (bgImg && savedRxImg) {
            bgImg.src = savedRxImg;
            bgImg.style.display = 'block';
        }
    }

    document.body.classList.add('is-printing-report-only');
    document.body.classList.remove('is-printing-rx-only');
    
    setTimeout(() => { window.print(); }, 600);
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-report-only'); 
    }, 1800);
}