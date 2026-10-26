// ==========================================
// Clinic Master - Desktop Medical Report Print (print-desktop-report.js - Fixed & Optimized)
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
    alert('تم حفظ إعدادات تقرير الحاسبة بنجاح وثبات الأماكن!');
}

function loadRepLayoutPositions() {
    const savedJson = localStorage.getItem('doctor_rep_layout_desktop');
    if (!savedJson) return;

    try {
        const savedLayout = JSON.parse(savedJson);
        for (const [boxId, data] of Object.entries(savedLayout)) {
            const box = document.getElementById(boxId);
            if (box && data) {
                if (data.top) box.style.top = data.top;
                if (data.left) box.style.left = data.left;
                if (data.width) box.style.width = data.width;
            }
        }
    } catch (e) {
        console.log("Error loading desktop report layout:", e);
    }
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

// تفعيل السحب والإفلات باستخدام نظام Pointer Events الآمن والثابت
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('repCanvasContainer');
    if (!container) return;

    // تحميل الأماكن المحفوظة مسبقاً فور تحميل الصفحة
    loadRepLayoutPositions();

    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        box.style.touchAction = 'none';
        let activeBox = null;
        let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;

        box.addEventListener('pointerdown', e => {
            if (!isDesktopRepConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;
            
            initialLeftPct = (box.offsetLeft / cWidth) * 100;
            initialTopPct = (box.offsetTop / cHeight) * 100;
            
            box.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        box.addEventListener('pointermove', e => {
            if (!activeBox || activeBox !== box) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;

            let newLeftPct = initialLeftPct + (dx / cWidth) * 100;
            let newTopPct = initialTopPct + (dy / cHeight) * 100;

            box.style.left = newLeftPct + '%';
            box.style.top = newTopPct + '%';
        });

        box.addEventListener('pointerup', e => {
            if (activeBox === box) {
                activeBox = null;
                if (box.hasPointerCapture(e.pointerId)) {
                    box.releasePointerCapture(e.pointerId);
                }
            }
        });
    });
});
