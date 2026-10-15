// ==========================================
// Clinic Master - Tablet Print & Touch (print-tablet.js)
// خاص بأجهزة الآيباد والتابلت (محدث لمنع القص وضبط الطباعة بدقة)
// ==========================================

let isTabletConfigMode = false;

function toggleRxConfigMode() {
    isTabletConfigMode = !isTabletConfigMode;
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        if (isTabletConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
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
    isTabletConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));

    const container = document.getElementById('rxCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

    const rxLayoutData = {};
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        
        rxLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%'
        };
    });

    localStorage.setItem('doctor_rx_layout_tablet', JSON.stringify(rxLayoutData));
    alert('تم حفظ إعدادات الآيباد والتابلت بنجاح!');
}

function printPrescriptionDirectly() {
    prepareRxBackground();
    
    // إخفاء رمز Rx البرمجي لضمان نظافة الطباعة على التابلت
    const container = document.getElementById('rxCanvasContainer');
    const rxSymbol = container ? container.querySelector('#rxDragBoxTreatment div:nth-child(2)') : null;
    if (rxSymbol) rxSymbol.style.display = 'none';

    document.body.classList.add('is-printing-rx-only');
    document.body.classList.remove('is-printing-report-only');
    
    setTimeout(() => { window.print(); }, 500);
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-rx-only'); 
        if (rxSymbol) rxSymbol.style.display = '';
    }, 1500);
}

function printMedicalReportDirectly() {
    document.body.classList.add('is-printing-report-only');
    document.body.classList.remove('is-printing-rx-only');
    
    setTimeout(() => { window.print(); }, 500);
    
    setTimeout(() => { 
        document.body.classList.remove('is-printing-report-only'); 
    }, 1500);
}

// دعم اللمس للآيباد والتابلت لتحريك الصناديق في وضع الضبط
document.addEventListener('DOMContentLoaded', () => {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('rxCanvasContainer');

    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        box.addEventListener('touchstart', e => {
            if (!isTabletConfigMode || e.target.tagName === 'BUTTON') return;
            if (e.touches.length === 1 && container) {
                activeBox = box;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                const cWidth = container.clientWidth;
                const cHeight = container.clientHeight;
                initialLeftPct = (box.offsetLeft / cWidth) * 100;
                initialTopPct = (box.offsetTop / cHeight) * 100;
            }
        }, { passive: true });

        box.addEventListener('touchmove', e => {
            if (!activeBox || activeBox !== box || !container) return;
            if (e.touches.length === 1) {
                let dx = e.touches[0].clientX - startX;
                let dy = e.touches[0].clientY - startY;
                const cWidth = container.clientWidth;
                const cHeight = container.clientHeight;
                let newLeftPct = initialLeftPct + (dx / cWidth) * 100;
                let newTopPct = initialTopPct + (dy / cHeight) * 100;
                box.style.left = newLeftPct + '%';
                box.style.top = newTopPct + '%';
                e.preventDefault();
            }
        }, { passive: false });

        box.addEventListener('touchend', () => { activeBox = null; });
    });
});
