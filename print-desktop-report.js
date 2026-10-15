// ==========================================
// Clinic Master - Desktop Medical Report Print (print-desktop-report.js)
// ==========================================

let isDesktopRepConfigMode = false;

function toggleRepConfigMode() {
    isDesktopRepConfigMode = !isDesktopRepConfigMode;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        if (isDesktopRepConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateDesktopRepConfigModeUI();
}

function updateDesktopRepConfigModeUI() {
    const hint = document.getElementById('repModeHint');
    const saveBtn = document.getElementById('repSaveLayoutBtn');
    if (isDesktopRepConfigMode) {
        if (hint) hint.innerText = 'Desktop Report Config Mode Active';
        if (saveBtn) saveBtn.style.display = 'block';
    } else {
        if (hint) hint.innerText = '';
        if (saveBtn) saveBtn.style.display = 'none';
    }
}

function changeRepBoxFontSize(boxType, delta) {
    const map = {
        patient: 'repPatientText',
        title: 'repTitleText',
        to: 'repToText',
        details: 'repDetailsText'
    };
    const el = document.getElementById(map[boxType]);
    if (!el) return;
    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
    el.style.fontSize = (currentSize + delta) + 'px';
}

function saveRepLayoutPositions() {
    isDesktopRepConfigMode = false;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateDesktopRepConfigModeUI();

    const container = document.getElementById('repCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

    const repLayoutData = {};
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        const widthPct = (box.offsetWidth / cWidth) * 100;

        repLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%',
            width: widthPct + '%'
        };
    });

    localStorage.setItem('doctor_rep_layout_desktop', JSON.stringify(repLayoutData));
    alert('تم حفظ إعدادات تقرير الحاسبة بنجاح!');
}

function printMedicalReportDirectly() {
    isDesktopRepConfigMode = false;
    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateDesktopRepConfigModeUI();

    const container = document.getElementById('repCanvasContainer');
    if (container) {
        let bgImg = container.querySelector('.rx-bg-img');
        let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
        if (bgImg && savedRxImg) {
            bgImg.src = savedRxImg;
            bgImg.style.display = 'block';
        }
    }

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

document.addEventListener('DOMContentLoaded', () => {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('repCanvasContainer');

    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        box.addEventListener('mousedown', e => {
            if (!isDesktopRepConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
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
