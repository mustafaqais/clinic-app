// ==========================================
// Clinic Master - Print Core Functions (print-core.js)
// وظائف مشتركة لجميع الأجهزة والتقارير الطبية
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

// ==========================================
// إدارة وحفظ إحداثيات التقرير الطبي مركزياً
// ==========================================

const REP_STORAGE_KEYS = ['clinic_rep_custom_layout', 'doctor_rep_layout_desktop', 'clinic_rep_layout_v1'];

function saveRepLayoutPositions() {
    const container = document.getElementById('repCanvasContainer');
    if (!container) return;
    const cWidth = container.clientWidth || 1;
    const cHeight = container.clientHeight || 1;

    const repLayoutData = {};
    const boxes = ['repDragBoxPatient', 'repDragBoxTitle', 'repDragBoxTo', 'repDragBoxDetails'];
    
    boxes.forEach(id => {
        const box = document.getElementById(id);
        if (box) {
            repLayoutData[id] = {
                top: ((box.offsetTop / cHeight) * 100) + '%',
                left: ((box.offsetLeft / cWidth) * 100) + '%',
                width: ((box.offsetWidth / cWidth) * 100) + '%',
                fontSize: window.getComputedStyle(box.querySelector('div:last-child') || box).fontSize
            };
        }
    });

    const jsonStr = JSON.stringify(repLayoutData);
    REP_STORAGE_KEYS.forEach(key => localStorage.setItem(key, jsonStr));

    alert('✨ تم حفظ مواقع وتنسيق التقرير الطبي بنجاح ولن تتغير أبداً!');
    
    if (typeof isDesktopRepConfigMode !== 'undefined' && isDesktopRepConfigMode) {
        toggleRepConfigMode();
    }
}

function loadSavedRepLayoutPositions() {
    let saved = null;
    for (const key of REP_STORAGE_KEYS) {
        saved = localStorage.getItem(key);
        if (saved) break;
    }
    if (!saved) return;
    
    try {
        const data = JSON.parse(saved);
        for (const boxId in data) {
            const box = document.getElementById(boxId);
            if (box && data[boxId]) {
                if (data[boxId].top) box.style.top = data[boxId].top;
                if (data[boxId].left) box.style.left = data[boxId].left;
                if (data[boxId].width) box.style.width = data[boxId].width;
                if (data[boxId].fontSize) {
                    const innerDiv = box.querySelector('div:last-child');
                    if (innerDiv) innerDiv.style.fontSize = data[boxId].fontSize;
                }
            }
        }
    } catch (e) {
        console.error("Error loading report layout:", e);
    }
}

// تفعيل استرجاع الأماكن تلقائياً عند تحميل الصفحة وفتح النافذة
document.addEventListener('DOMContentLoaded', () => {
    loadSavedRepLayoutPositions();
    setTimeout(loadSavedRepLayoutPositions, 100);
    setTimeout(loadSavedRepLayoutPositions, 400);

    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('repCanvasContainer');

    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        box.style.touchAction = 'none';

        box.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            
            if (container) {
                initialLeftPct = (box.offsetLeft / container.clientWidth) * 100;
                initialTopPct = (box.offsetTop / container.clientHeight) * 100;
            }
            e.stopPropagation();
        });
    });

    window.addEventListener('mousemove', e => {
        if (!activeBox || !container) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let newLeft = initialLeftPct + (dx / container.clientWidth) * 100;
        let newTop = initialTopPct + (dy / container.clientHeight) * 100;

        activeBox.style.left = newLeft + '%';
        activeBox.style.top = newTop + '%';
    });

    window.addEventListener('mouseup', () => {
        if (activeBox) {
            // حفظ تلقائي فوري عند الإفلات
            const repLayoutData = {};
            const cW = container ? container.clientWidth : 1;
            const cH = container ? container.clientHeight : 1;
            
            document.querySelectorAll('#medicalReportModal .draggable-box').forEach(b => {
                repLayoutData[b.id] = {
                    top: ((b.offsetTop / cH) * 100) + '%',
                    left: ((b.offsetLeft / cW) * 100) + '%',
                    width: ((b.offsetWidth / cW) * 100) + '%',
                    fontSize: window.getComputedStyle(b.querySelector('div:last-child') || b).fontSize
                };
            });
            const jsonStr = JSON.stringify(repLayoutData);
            REP_STORAGE_KEYS.forEach(key => localStorage.setItem(key, jsonStr));
        }
        activeBox = null;
    });
});
