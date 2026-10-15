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
