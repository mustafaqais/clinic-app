function saveNewPatient(e) {
    e.preventDefault();
    const rawName = document.getElementById('pName').value.trim();
    const rawSubName = document.getElementById('pSubName').value.trim();

    const nameExists = patients.some(p => p.name.toLowerCase() === rawName.toLowerCase());
    if (nameExists && !rawSubName) {
        alert('⚠️ تنبيه: يوجد مريض بنفس الاسم مسجل مسبقاً! يرجى إدخال اسم الجد الرابع أو العشيرة أو ملاحظة تمييز.');
        document.getElementById('pSubName').focus();
        return;
    }

    const newPatient = {
        id: Date.now(),
        name: rawName,
        subName: rawSubName,
        age: Number(document.getElementById('pAge').value),
        gender: document.getElementById('pGender').value || 'Unspecified',
        marital: document.getElementById('pMarital').value || 'Single',
        job: document.getElementById('pJob').value || 'Unspecified',
        phone: document.getElementById('pPhone').value || 'N/A',
        visits: [{ visitId: Date.now(), date: getTodayFormatted(), medHistory: {}, notes: '', attachments: [] }]
    };
    patients.unshift(newPatient);
    savePatientToCloudAndLocal(newPatient);
    openMedicalRecord(newPatient.id);
}

function renderPatientsList(list) {
    const container = document.getElementById('patientsList');
    container.innerHTML = list.length === 0 
        ? '<p style="text-align:center; color:#64748b;">No matching patients found.</p>'
        : list.map(p => `
            <div class="patient-card" onclick="openMedicalRecord(${p.id})">
                <div class="patient-info">
                    <h4>${p.name} ${p.subName ? `<span style="font-size:0.75rem; color:#0d9488; font-weight:normal;">(${p.subName})</span>` : ''}</h4>
                    <p><i class="fa-solid fa-phone"></i> ${p.phone} | Age: ${p.age}</p>
                </div>
                <span class="badge-gender ${p.gender === 'Female' ? 'gender-female' : 'gender-male'}">${p.gender || 'N/A'}</span>
            </div>
        `).join('');
}

function filterPatients() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const gender = document.getElementById('filterGender').value;
    const ageGroup = document.getElementById('filterAgeGroup').value;
    const sortOrder = document.getElementById('filterSort').value;

    let filtered = patients.filter(p => {
        if (!p) return false;
        const fullNameFull = ((p.name || '') + " " + (p.subName || "")).toLowerCase();
        const matchQuery = fullNameFull.includes(query) || (p.phone && String(p.phone).includes(query));
        const matchGender = !gender || p.gender === gender;
        let matchAge = true;
        const age = Number(p.age) || 0;
        if (ageGroup === 'child') matchAge = age < 18;
        else if (ageGroup === 'adult') matchAge = age >= 18 && age <= 50;
        else if (ageGroup === 'senior') matchAge = age > 50;

        return matchQuery && matchGender && matchAge;
    });

    filtered.sort((a, b) => sortOrder === 'oldest' ? Number(a.id) - Number(b.id) : Number(b.id) - Number(a.id));
    renderPatientsList(filtered);
}
