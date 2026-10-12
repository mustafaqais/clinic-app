function openMedicalRecord(id, saveState = true) {
    currentPatientId = id;
    navigateTo('medicalRecordScreen', 'Patient Medical Record', 'View details', saveState);
    const patient = patients.find(p => Number(p.id) === Number(id));
    if (patient) {
        document.getElementById('recPatientName').innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
        document.getElementById('recPatientMeta').innerHTML = `Age: ${patient.age} | Gender: ${patient.gender || 'N/A'} | Marital: ${patient.marital || 'N/A'} | Job: ${patient.job || 'N/A'} | Phone: ${patient.phone || 'N/A'}`;
        renderVisits(patient.visits || [], true);
    }
}

function addNewVisit() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    patient.visits.unshift({ visitId: Date.now(), date: getTodayFormatted(), medHistory: {}, notes: '', attachments: [] });
    savePatientToCloudAndLocal(patient);
    renderVisits(patient.visits, true);
}

function handleLiveInput(textarea, category, visitId) {
    if (isUserSecretary || isSubscriptionExpired) return;
    autoResizeTextarea(textarea);
    const val = textarea.value.trim();
    const box = document.getElementById(`suggestions-${category}-${visitId}`);
    const saveBar = document.getElementById(`save-bar-${category}-${visitId}`);
    
    if (!val || val.length < 1) {
        if (box) box.style.display = 'none';
        if (saveBar) saveBar.style.display = 'none';
        updateVisitFieldData(visitId, category, textarea.value);
        return;
    }

    const lines = textarea.value.split('\n');
    const currentLine = lines[lines.length - 1].trim();

    if (currentLine.length > 0) {
        if (saveBar) {
            saveBar.style.display = 'flex';
            document.getElementById(`line-text-${category}-${visitId}`).innerText = currentLine;
        }
        const terms = medicalDict[category] || [];
        const matches = terms.filter(t => t.toLowerCase().includes(currentLine.toLowerCase()) && t.toLowerCase() !== currentLine.toLowerCase());

        if (matches.length > 0 && box) {
            box.innerHTML = matches.map(m => `<div class="suggestion-item" onmousedown="selectSuggestion('${category}', ${visitId}, '${m.replace(/'/g, "\\'")}')">${m}</div>`).join('');
            box.style.display = 'block';
        } else if (box) box.style.display = 'none';
    } else {
        if (saveBar) saveBar.style.display = 'none';
        if (box) box.style.display = 'none';
    }

    updateVisitFieldData(visitId, category, textarea.value);
}
