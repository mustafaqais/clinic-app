// ==========================================
// Clinic Master - Mobile Medical Report Print (print-mobile-report.js)
// ==========================================

if (typeof window.isConfigMode === 'undefined') {
    window.isConfigMode = false;
}

function toggleReportConfigMode() {
    isConfigMode = !isConfigMode;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        if (isConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateReportConfigModeUI();
}

function updateReportConfigModeUI() {
    const hint = document.getElementById('repModeHint');
    const saveBtn = document.getElementById('repSaveLayoutBtn');
    if (isConfigMode) {
        if (hint) hint.innerText = 'Report Config Mode Active';
        if (saveBtn) saveBtn.style.display = 'block';
    } else {
        if (hint) hint.innerText = '';
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function changeReportBoxFontSize(boxType, delta) {
    const map = {
        patientText: 'repPatientText',
        titleText: 'repTitleText',
        toText: 'repToText',
        detailsText: 'repDetailsText',
        dateText: 'repDateText',
        signatureText: 'repSignatureText'
    };
    const el = document.getElementById(map[boxType]);
    if (!el) return;
    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
    el.style.fontSize = (currentSize + delta) + 'px';
}

function saveReportLayoutPositions() {
    isConfigMode = false;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateReportConfigModeUI();

    const container = document.getElementById('repCanvasContainer');
    if (!container) return;
    const cWidth = container.clientWidth || 1;
    const cHeight = container.clientHeight || 1;

    const repLayoutData = {};
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        const widthPct = (box.offsetWidth / cWidth) * 100;

        repLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%',
            width: widthPct + '%',
            fontSize: box.querySelector('div, span, p') ? window.getComputedStyle(box.querySelector('div, span, p')).fontSize : '1rem'
        };
    });

    localStorage.setItem('doctor_report_layout_mobile', JSON.stringify(repLayoutData));
    localStorage.setItem('doctor_report_layout', JSON.stringify(repLayoutData));
    
    if (typeof saveSettingsToCloudAndLocal === 'function') {
        saveSettingsToCloudAndLocal();
    }

    alert('تم حفظ إعدادات تخطيط التقرير الطبي بنجاح!');
}

function printMedicalReportDirectly() {
    isConfigMode = false;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateReportConfigModeUI();

    const container = document.getElementById('repCanvasContainer');
    if (!container) return;

    let savedReportImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    let bgImg = container.querySelector('.rep-bg-img');
    if (!bgImg && savedReportImg) {
        bgImg = document.createElement('img');
        bgImg.className = 'rep-bg-img';
        container.insertBefore(bgImg, container.firstChild);
    }
    if (bgImg && savedReportImg) {
        bgImg.src = savedReportImg;
        bgImg.style.display = 'block';
    }

    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    // تفعيل كلاس طباعة التقرير تماماً كالنسخة الأصلية
    document.body.classList.add('is-printing-report-only');
    document.body.classList.remove('is-printing-rx-only');

    const rxModal = document.getElementById('rxModal');
    let rxWasOpen = false;
    if (rxModal && (rxModal.style.display === 'flex' || window.getComputedStyle(rxModal).display === 'flex')) {
        rxModal.style.display = 'none';
        rxWasOpen = true;
    }

    setTimeout(() => {
        window.print();
    }, 400);

    setTimeout(() => {
        document.body.classList.remove('is-printing-report-only');
        controls.forEach(c => c.style.display = '');
        if (rxWasOpen && rxModal) {
            rxModal.style.display = 'flex';
        }
    }, 1500);
}
