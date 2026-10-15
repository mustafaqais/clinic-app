// ==========================================
// Clinic Master - Desktop RX Print (print-desktop-rx.js)
// ==========================================

let isDesktopRxConfigMode = false;

function toggleRxConfigMode() {
    isDesktopRxConfigMode = !isDesktopRxConfigMode;
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        if (isDesktopRxConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateDesktopRxConfigModeUI();
}

function updateDesktopRxConfigModeUI() {
    const hint = document.getElementById('rxModeHint');
    const saveBtn = document.getElementById('rxSaveLayoutBtn');
    if (isDesktopRxConfigMode) {
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
    isDesktopRxConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateDesktopRxConfigModeUI();

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
    alert('تم حفظ إعدادات روشتة الحاسبة بنجاح!');
}

function printPrescriptionDirectly() {
    isDesktopRxConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateDesktopRxConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (container) {
        let bgImg = container.querySelector('#rxBgImg') || container.querySelector('.rx-bg-img');
        let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
        
        if (bgImg) {
            if (savedRxImg) {
                bgImg.src = savedRxImg;
                bgImg.style.display = 'block';
                bgImg.style.visibility = 'visible';
            } else {
                bgImg.style.display = 'none';
            }
        }
    }

    const controls = container ? container.querySelectorAll('.box-font-controls') : [];
    controls.forEach(c => c.style.display = 'none');

    const rxSymbol = container ? container.querySelector('#rxDragBoxTreatment div:nth-child(2)') : null;
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    setTimeout(() => { window.print(); }, 400);

    setTimeout(() => {
        document.body.classList.remove('is-printing-rx-only');
        controls.forEach(c => c.style.display = '');
        if (rxSymbol) rxSymbol.style.display = '';
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('rxCanvasContainer');

    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        box.addEventListener('mousedown', e => {
            if (!isDesktopRxConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
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
