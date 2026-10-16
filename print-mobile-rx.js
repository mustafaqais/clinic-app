// ==========================================
// Clinic Master - Mobile RX Print (Clean & Safe Version)
// ==========================================

if (typeof window.isConfigMode === 'undefined') {
    window.isConfigMode = false;
}

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
        if (hint) hint.innerText = 'Mobile RX Config Mode Active';
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

    localStorage.setItem('doctor_rx_layout_mobile', JSON.stringify(rxLayoutData));
    localStorage.setItem('doctor_rx_layout', JSON.stringify(rxLayoutData));
    
    if (typeof saveSettingsToCloudAndLocal === 'function') {
        saveSettingsToCloudAndLocal();
    }

    alert('تم حفظ إعدادات روشتة الموبايل بنجاح!');
}

function openPrescriptionPDF() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    let bgImg = container.querySelector('.rx-bg-img');
    if (!bgImg && savedRxImg) {
        bgImg = document.createElement('img');
        bgImg.className = 'rx-bg-img';
        container.insertBefore(bgImg, container.firstChild);
    }
    if (bgImg && savedRxImg) {
        bgImg.src = savedRxImg;
        bgImg.style.display = 'block';
    }

    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('Prescription_' + Date.now() + '.pdf');
        controls.forEach(c => c.style.display = '');
    });
}

function compressImageForPrint(dataUrl, callback) {
    if (!dataUrl) {
        callback(null);
        return;
    }
    const img = new Image();
    img.src = dataUrl;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
        } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = function() { callback(dataUrl); };
}

function printPrescriptionDirectly() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    compressImageForPrint(savedRxImg, function(compressedImg) {
        let bgImg = container.querySelector('.rx-bg-img');
        if (!bgImg) {
            bgImg = document.createElement('img');
            bgImg.className = 'rx-bg-img';
            container.insertBefore(bgImg, container.firstChild);
        }
        if (compressedImg) {
            bgImg.src = compressedImg;
            bgImg.style.display = 'block';
        }

        html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head><title>Print Prescription</title>
                        <style>
                            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #fff; }
                            img { max-width: 100%; height: auto; object-fit: contain; }
                            @media print { body { margin: 0; } img { width: 100vw; height: 100vh; } }
                        </style></head>
                        <body><img src="${imgData}" onload="window.print(); window.close();" /></body>
                    </html>
                `);
                printWindow.document.close();
            } else {
                openPrescriptionPDF();
            }
            controls.forEach(c => c.style.display = '');
        }).catch(err => {
            console.error("Print Error:", err);
            controls.forEach(c => c.style.display = '');
            openPrescriptionPDF();
        });
    });
}
