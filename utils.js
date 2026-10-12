function exportJsonBackup() {
    const backupData = {
        exportDate: new Date().toISOString(),
        version: "17.28",
        patients: patients,
        trashBin: trashBin,
        medicalDict: medicalDict,
        rxImage: currentDoctorRxImage,
        rxLayout: JSON.parse(localStorage.getItem('doctor_rx_layout') || '{}'),
        secretaryAccount: secretaryAccount,
        specialtyConfig: specialtyConfig
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Clinic_Master_Backup_${getTodayFormatted()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert('Backup exported successfully!');
}

function calculateBmiLive() {
    const w = parseFloat(document.getElementById('bmiWeight').value);
    const h = parseFloat(document.getElementById('bmiHeight').value);
    const scoreDisplay = document.getElementById('bmiScoreDisplay');
    const badgeContainer = document.getElementById('bmiBadgeContainer');

    if (!w || !h || w <= 0 || h <= 0) {
        scoreDisplay.innerText = '—';
        badgeContainer.innerHTML = '<span class="bmi-badge" style="background:#f1f5f9; color:#64748b;">أدخل الوزن والطول للحساب</span>';
        return;
    }

    const hM = h / 100;
    const bmi = (w / (hM * hM)).toFixed(1);
    scoreDisplay.innerText = bmi;
}
