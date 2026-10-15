// ==========================================
// Clinic Master - Desktop Print & Drag (print-desktop.js)
// خاص بالحاسبات المكتبية والشاشات الكبيرة
// ==========================================

let isConfigMode = false;

function toggleRxConfigMode() {
    isConfigMode = !isConfigMode;
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        if (isConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateDesktopConfigModeUI();
}

function updateDesktopConfigModeUI() {
    const hint = document.getElementById('rxModeHint');
    const saveBtn = document.getElementById('rxSaveLayoutBtn');
    if (isConfigMode) {
        if (hint) hint.innerText = 'Desktop Config Mode Active';
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
    updateDesktopConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

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
    alert('تم حفظ إعدادات حاسبة المكتب بنجاح!');
}

function printPrescriptionDirectly() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateDesktopConfigModeUI();

    prepareRxBackground();
    const container = document.getElementById('rxCanvasContainer');
    const controls = container ? container.querySelectorAll('.box-font-controls') : [];
    controls.forEach(c => c.style.display = 'none');

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    setTimeout(() => { window.print(); }, 400);

    setTimeout(() => {
        document.body.classList.remove('is-printing-rx-only');
        controls.forEach(c => c.style.display = '');
    }, 1500);
}

function printMedicalReportDirectly() {
    const container = document.getElementById('repCanvasContainer');
    const controls = container ? container.querySelectorAll('.box-font-controls') : [];
    controls.forEach(c => c.style.display = 'none');

    document.body.classList.add('is-printing-report-only');
    document.body.classList.remove('is-printing-rx-only');

    setTimeout(() => { window.print(); }, 400);

    setTimeout(() => {
        document.body.classList.remove('is-printing-report-only');
        controls.forEach(c => c.style.display = '');
    }, 1500);
}

// تهيئة السحب بالفأرة للحاسبة
document.addEventListener('DOMContentLoaded', () => {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('rxCanvasContainer');

    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        box.addEventListener('mousedown', e => {
            if (!isConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;
            
            initialLeftPct = (box.offsetLeft / cWidth) * 100;
            initialTopPct = (box.offsetTop / cHeight) * 100;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', e => {
            if (!activeBox || !container) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;

            let newLeftPct = initialLeftPct + (dx / cWidth) * 100;
            let newTopPct = initialTopPct + (dy / cHeight) * 100;

            activeBox.style.left = newLeftPct + '%';
            activeBox.style.top = newTopPct + '%';
        });

        document.addEventListener('mouseup', () => {
            activeBox = null;
        });
    });
});
