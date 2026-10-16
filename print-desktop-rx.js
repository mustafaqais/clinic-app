// ==========================================
// Clinic Master - Desktop RX Print (print-desktop-rx.js) - Fixed & Guaranteed
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
            fontSize: '1rem'
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
    if (!container) return;

    let bgImg = container.querySelector('#rxBgImg');
    let savedRxImg = localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';

    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    const rxSymbol = container.querySelector('#rxDragBoxTreatment div:nth-child(2)');
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');

    // دالة تنفيذ الطباعة بعد التأكد من جاهزية الصورة
    const executePrint = () => {
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('is-printing-rx-only');
                controls.forEach(c => c.style.display = '');
                if (rxSymbol) rxSymbol.style.display = '';
            }, 1000);
        }, 400);
    };

    if (bgImg) {
        if (savedRxImg) {
            bgImg.style.display = 'block';
            bgImg.style.visibility = 'visible';
            bgImg.style.opacity = '1';
            
            // إذا كانت الصورة لم تحمل بعد أو تم تغيير رابطها
            if (bgImg.src !== savedRxImg) {
                bgImg.onload = executePrint;
                bgImg.onerror = executePrint;
                bgImg.src = savedRxImg;
            } else if (bgImg.complete) {
                executePrint();
            } else {
                bgImg.onload = executePrint;
            }
        } else {
            bgImg.style.display = 'none';
            executePrint();
        }
    } else {
        executePrint();
    }
}
