// ==========================================
// Clinic Master - Print Core Functions (print-core.js)
// وظائف مشتركة لجميع الأجهزة
// ==========================================

function closeRxModal() {
    const modal = document.getElementById('rxModal');
    if (modal) modal.style.display = 'none';
}

function closeMedicalReportModal() {
    const modal = document.getElementById('medicalReportModal');
    if (modal) modal.style.display = 'none';
}

function setRxPaperSize(size) {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;
    container.classList.remove('size-a4', 'size-a5');
    container.classList.add('size-' + size);
    localStorage.setItem('clinic_rx_paper_size', size);
}

function prepareRxBackground() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;
    let bgImg = container.querySelector('.rx-bg-img');
    let savedRxImg = typeof currentDoctorRxImage !== 'undefined' ? currentDoctorRxImage : (localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '');
    
    if (!bgImg && savedRxImg) {
        bgImg = document.createElement('img');
        bgImg.src = savedRxImg;
        bgImg.className = 'rx-bg-img';
        container.insertBefore(bgImg, container.firstChild);
    } else if (bgImg && savedRxImg) {
        bgImg.src = savedRxImg;
        bgImg.style.display = 'block';
    }
}
