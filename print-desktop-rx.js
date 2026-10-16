// ==========================================
// Clinic Master - Desktop RX Print (print-desktop-rx.js) - Ultimate Direct Print Fix
// ==========================================

let isConfigMode = false;

function toggleRxConfigMode() {
    isConfigMode = !isConfigMode;
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        if (isConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateConfigModeUI();
}

function updateConfigModeUI() {
    const hint = document.getElementById('rxModeHint');
    const saveBtn = document.getElementById('rxSaveLayoutBtn');
    if (isConfigMode) {
        if (hint) hint.innerText = 'Desktop RX Config Mode Active';
        if (saveBtn) saveBtn.style.display = 'block';
    } else {
        if (hint) hint.innerText = '';
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function changeBoxFontSize(boxType, delta) {
    const map = {
        patientDetails: 'rxDragPatientDetailsText',
        date: 'rxDragDateText',
        vitals: 'rxDragVitalsText',
        treatment: 'rxDragTreatmentText'
    };
    const el = document.getElementById(map[boxType]);
    if (!el) return;
    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
    el.style.fontSize = (currentSize + delta) + 'px';
}

function saveRxLayoutPositions() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;
    const cWidth = container.clientWidth || 1;
    const cHeight = container.clientHeight || 1;

    const rxLayoutData = {};
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        const widthPct = (box.offsetWidth / cWidth) * 100;

        rxLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%',
            width: widthPct + '%',
            fontSize: box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text') ? window.getComputedStyle(box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text')).fontSize : '1rem'
        };
    });

    localStorage.setItem('doctor_rx_layout_desktop', JSON.stringify(rxLayoutData));
    localStorage.setItem('doctor_rx_layout', JSON.stringify(rxLayoutData));
    
    if (typeof saveSettingsToCloudAndLocal === 'function') {
        saveSettingsToCloudAndLocal();
    }

    alert('تم حفظ إعدادات روشتة الحاسبة بنجاح!');
}

function printPrescriptionDirectly() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    // جلب رابط الصورة المحفوظة
    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    
    let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
    
    if (!bgImg) {
        bgImg = document.createElement('img');
        bgImg.id = 'rxBgImg';
        bgImg.className = 'rx-bg-img';
        container.insertBefore(bgImg, container.firstChild);
    }

    if (savedRxImg) {
        bgImg.src = savedRxImg;
        // إجبار ظهور الصورة وتنسيقها لتملأ الحاوي أثناء الطباعة
        bgImg.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; display: block !important; visibility: visible !important; opacity: 1 !important;";
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

    // الانتظار حتى يتم تحميل الصورة تماماً قبل إعطاء أمر الـ print
    const runPrint = () => {
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

    if (savedRxImg) {
        if (bgImg.complete && bgImg.naturalWidth !== 0) {
            runPrint();
        } else {
            bgImg.onload = runPrint;
            bgImg.onerror = runPrint;
        }
    } else {
        runPrint();
    }
}
