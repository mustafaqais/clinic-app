    function saveMhLineToDict(event, inputKey) {
        event.preventDefault();
        const textSpan = document.getElementById(`line-text-${inputKey}`);
        if (!textSpan) return;
        const lineText = textSpan.innerText.trim();
        if (lineText && !medicalDict.mh_history.includes(lineText)) {
            medicalDict.mh_history.push(lineText);
            saveSettingsToCloudAndLocal();
            const btn = document.getElementById(`btn-save-${inputKey}`);
            if (btn) {
                btn.innerText = 'Saved!';
                btn.classList.add('saved');
                setTimeout(() => {
                    btn.innerText = 'Save';
                    btn.classList.remove('saved');
                    document.getElementById(`save-bar-${inputKey}`).style.display = 'none';
                }, 1000);
            }
        }
    }

    function toggleOtherInput() {
        const chk = document.getElementById('mh-other-check');
        const box = document.getElementById('mh-other-box');
        if (chk && box) {
            box.style.display = chk.checked ? 'block' : 'none';
            if (chk.checked) document.getElementById('mh-cd-other').focus();
        }
    }

    let currentVisitForMh = null;

    function openMedHistoryModal(visitId) {
        currentVisitForMh = visitId;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;
        const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
        if (!visit) return;

        const mh = visit.medicalHistory || {};
        const checkboxes = document.querySelectorAll('.mh-cd');
        checkboxes.forEach(cb => {
            cb.checked = mh.chronic && mh.chronic.includes(cb.value);
        });

        const otherCheck = document.getElementById('mh-other-check');
        const otherBox = document.getElementById('mh-other-box');
        if (mh.otherChronic) {
            otherCheck.checked = true;
            otherBox.style.display = 'block';
            document.getElementById('mh-cd-other').value = mh.otherChronic;
        } else {
            otherCheck.checked = false;
            otherBox.style.display = 'none';
            document.getElementById('mh-cd-other').value = '';
        }

        document.getElementById('mh-prev-admission').value = mh.admission || '';
        document.getElementById('mh-past-surgery').value = mh.surgery || '';
        document.getElementById('mh-family-history').value = mh.family || '';
        document.getElementById('mh-drug-allergy').value = mh.allergy || '';
        document.getElementById('mh-chronic-drugs').value = mh.chronicDrugs || '';
        document.getElementById('mh-smoking').value = mh.smoking || 'Non-smoker';
        document.getElementById('mh-alcohol').value = mh.alcohol || 'Non-drinker';
        document.getElementById('mh-notes').value = mh.notes || '';

        document.getElementById('medHistoryModal').style.display = 'flex';
    }

    function closeMedHistoryModal() {
        if (!isSubscriptionExpired && currentVisitForMh !== null && currentPatientId) {
            const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
            if (patient) {
                const visit = patient.visits.find(v => Number(v.visitId) === Number(currentVisitForMh));
                if (visit) {
                    const chronicList = [];
                    document.querySelectorAll('.mh-cd').forEach(cb => {
                        if (cb.checked) chronicList.push(cb.value);
                    });

                    const otherChecked = document.getElementById('mh-other-check').checked;
                    const otherVal = otherChecked ? document.getElementById('mh-cd-other').value.trim() : '';

                    visit.medicalHistory = {
                        chronic: chronicList,
                        otherChronic: otherVal,
                        admission: document.getElementById('mh-prev-admission').value,
                        surgery: document.getElementById('mh-past-surgery').value,
                        family: document.getElementById('mh-family-history').value,
                        allergy: document.getElementById('mh-drug-allergy').value,
                        chronicDrugs: document.getElementById('mh-chronic-drugs').value,
                        smoking: document.getElementById('mh-smoking').value,
                        alcohol: document.getElementById('mh-alcohol').value,
                        notes: document.getElementById('mh-notes').value
                    };

                    savePatientToCloudAndLocal(patient);
                    renderVisits(patient.visits, false);
                }
            }
        }
        document.getElementById('medHistoryModal').style.display = 'none';
        currentVisitForMh = null;
    }

    function saveNewPatient(e) {
        e.preventDefault();
        if (isSubscriptionExpired) {
            alert('التطبيق في وضع القراءة فقط.');
            return;
        }
        const name = document.getElementById('pName').value.trim();
        const subName = document.getElementById('pSubName').value.trim();
        const age = parseInt(document.getElementById('pAge').value);
        const gender = document.getElementById('pGender').value;
        const marital = document.getElementById('pMarital').value;
        const job = document.getElementById('pJob').value;
        const phone = document.getElementById('pPhone').value.trim();
        const date = document.getElementById('pDate').value || getTodayFormatted();

        if (!name || isNaN(age)) {
            alert('Please fill required fields.');
            return;
        }

        const newPatientObj = {
            id: Date.now(),
            name,
            subName,
            age,
            gender,
            marital,
            job,
            phone,
            createdAt: date,
            visits: [
                {
                    visitId: Date.now(),
                    date: date,
                    vitals: { bp: '', temp: '', pulse: '', resp: '', spo2: '', weight: '', height: '' },
                    labs: '',
                    scans: '',
                    notes: '',
                    drugs: '',
                    attachments: [],
                    medicalHistory: {}
                }
            ]
        };

        savePatientToCloudAndLocal(newPatientObj);
        document.getElementById('patientForm').reset();
        document.getElementById('pDate').value = getTodayFormatted();

        openMedicalRecord(newPatientObj.id, true);
    }

    function openPatientsArchive() {
        navigateTo('archiveScreen', translations[currentLang].archive, 'Search & visit history');
        renderPatientsList(patients);
    }

    function filterPatients() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        const genderFilter = document.getElementById('filterGender').value;
        const ageFilter = document.getElementById('filterAgeGroup').value;

        const filtered = patients.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(query) || (p.phone && p.phone.includes(query)) || (p.subName && p.subName.toLowerCase().includes(query));
            const matchesGender = !genderFilter || p.gender === genderFilter;
            
            let matchesAge = true;
            if (ageFilter === 'child') matchesAge = p.age < 18;
            else if (ageFilter === 'adult') matchesAge = p.age >= 18 && p.age <= 50;
            else if (ageFilter === 'senior') matchesAge = p.age > 50;

            return matchesQuery && matchesGender && matchesAge;
        });

        renderPatientsList(filtered);
    }

    function renderPatientsList(list) {
        const container = document.getElementById('patientsList');
        if (!list || list.length === 0) {
            container.innerHTML = '<div class="group-card" style="text-align:center; color:#64748b; padding:30px;"><i class="fa-solid fa-address-book" style="font-size:35px; margin-bottom:8px; color:#cbd5e1;"></i><p>No patients found.</p></div>';
            return;
        }

        container.innerHTML = list.map(p => `
            <div class="patient-card" onclick="openMedicalRecord(${p.id})">
                <div class="patient-card-header">
                    <h4>${p.name} ${p.subName ? `<span style="font-size:0.8rem; color:#64748b; font-weight:normal;">(${p.subName})</span>` : ''}</h4>
                    <span style="font-size:0.75rem; color:#0d9488; font-weight:700;"><i class="fa-solid fa-calendar-days"></i> ${p.visits && p.visits.length > 0 ? p.visits[p.visits.length - 1].date : p.createdAt}</span>
                </div>
                <div class="patient-card-meta">
                    <span><i class="fa-solid fa-user"></i> ${p.age} yrs</span>
                    <span><i class="fa-solid fa-venus-mars"></i> ${p.gender || 'N/A'}</span>
                    <span><i class="fa-solid fa-phone"></i> ${p.phone || 'N/A'}</span>
                    <span><i class="fa-solid fa-notes-medical"></i> ${p.visits ? p.visits.length : 0} visits</span>
                </div>
            </div>
        `).join('');
    }

    function openMedicalRecord(patientId, saveState = true) {
        currentPatientId = patientId;
        const patient = patients.find(p => Number(p.id) === Number(patientId));
        if (!patient) return;

        navigateTo('medicalRecordScreen', 'Medical Record', patient.name, saveState);
        sessionStorage.setItem('current_patient_id', patientId);

        document.getElementById('recPatientName').innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
        document.getElementById('recPatientMeta').innerHTML = `
            <b>Age:</b> ${patient.age} yrs | <b>Gender:</b> ${patient.gender || 'N/A'} | 
            <b>Marital:</b> ${patient.marital || 'N/A'} | <b>Job:</b> ${patient.job || 'N/A'} | 
            <b>Phone:</b> ${patient.phone || 'N/A'} | <b>Registered:</b> ${patient.createdAt || 'N/A'}
        `;

        renderVisits(patient.visits || [], false);
    }

    function renderVisits(visits, autoSave = true) {
        const container = document.getElementById('visitsContainer');
        if (!visits || visits.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b;">No visits recorded.</p>';
            return;
        }

        const isSec = isUserSecretary;
        const readOnlyAttr = (isSec || isSubscriptionExpired) ? 'readonly disabled' : '';
        const cfg = specialtyConfig;

        container.innerHTML = visits.map((v, idx) => {
            const visitNum = visits.length - idx;
            const vitals = v.vitals || {};
            const mh = v.medicalHistory || {};
            const hasMhData = (mh.chronic && mh.chronic.length > 0) || mh.admission || mh.surgery || mh.family || mh.allergy || mh.chronicDrugs || mh.notes;
            const attachments = v.attachments || [];

            return `
                <div class="group-card visit-card" id="visitCard-${v.visitId}" style="margin-top: 14px;">
                    <div class="visit-header">
                        <div style="font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:#0f172a;">
                            <i class="fa-solid fa-calendar-check" style="color:#0d9488;"></i> Visit #${visitNum}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="date" value="${v.date || getTodayFormatted()}" onchange="updateVisitFieldData(${v.visitId}, 'date', this.value)" ${readOnlyAttr} style="font-size:0.78rem; padding:4px 8px; border:1px solid #cbd5e1; border-radius:6px; background:#fff;">
                            ${visits.length > 1 && !isSec && !isSubscriptionExpired ? `<button type="button" onclick="deleteVisit(${v.visitId})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>` : ''}
                        </div>
                    </div>

                    ${cfg.medHistory ? `
                        <div style="margin-bottom: 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 0.8rem; font-weight: 800; color: #0f766e;"><i class="fa-solid fa-notes-medical"></i> Medical History</span>
                                <button type="button" class="btn-main" onclick="openMedHistoryModal(${v.visitId})" ${isSubscriptionExpired ? 'disabled' : ''} style="background: #0d9488; padding: 4px 10px; font-size: 0.72rem; width: auto; margin-top: 0;">
                                    <i class="fa-solid fa-pen-to-square"></i> ${hasMhData ? 'Edit History' : '+ Add History'}
                                </button>
                            </div>
                            ${hasMhData ? `
                                <div style="font-size: 0.78rem; color: #334155; line-height: 1.4;">
                                    ${mh.chronic && mh.chronic.length > 0 ? `<div><b>Chronic:</b> ${mh.chronic.join(', ')} ${mh.otherChronic ? ', ' + mh.otherChronic : ''}</div>` : ''}
                                    ${mh.allergy ? `<div><b>Allergy:</b> ${mh.allergy}</div>` : ''}
                                    ${mh.smoking ? `<div><b>Smoking:</b> ${mh.smoking}</div>` : ''}
                                </div>
                            ` : '<div style="font-size: 0.75rem; color: #94a3b8;">No medical history recorded for this visit.</div>'}
                        </div>
                    ` : ''}

                    ${cfg.vitals ? `
                        <div style="margin-bottom: 12px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <span style="font-size: 0.8rem; font-weight: 800; color: #0284c7;"><i class="fa-solid fa-heart-pulse"></i> Vital Signs & BMI</span>
                                <button type="button" class="btn-main" onclick="openBmiCalculator(${v.visitId})" style="background: #0284c7; padding: 4px 10px; font-size: 0.72rem; width: auto; margin-top: 0;">
                                    <i class="fa-solid fa-calculator"></i> BMI Calculator
                                </button>
                            </div>
                            <div class="vitals-grid">
                                <div class="vital-box"><span class="vital-label">BP (mmHg)</span><input type="text" value="${vitals.bp || ''}" oninput="updateVisitVitals(${v.visitId}, 'bp', this.value)" placeholder="120/80" ${readOnlyAttr}></div>
                                <div class="vital-box"><span class="vital-label">Temp (°C)</span><input type="text" value="${vitals.temp || ''}" oninput="updateVisitVitals(${v.visitId}, 'temp', this.value)" placeholder="37" ${readOnlyAttr}></div>
                                <div class="vital-box"><span class="vital-label">Pulse (bpm)</span><input type="text" value="${vitals.pulse || ''}" oninput="updateVisitVitals(${v.visitId}, 'pulse', this.value)" placeholder="75" ${readOnlyAttr}></div>
                                <div class="vital-box"><span class="vital-label">Resp (/min)</span><input type="text" value="${vitals.resp || ''}" oninput="updateVisitVitals(${v.visitId}, 'resp', this.value)" placeholder="18" ${readOnlyAttr}></div>
                                <div class="vital-box"><span class="vital-label">SpO2 (%)</span><input type="text" value="${vitals.spo2 || ''}" oninput="updateVisitVitals(${v.visitId}, 'spo2', this.value)" placeholder="98" ${readOnlyAttr}></div>
                                <div class="vital-box"><span class="vital-label">Weight (kg)</span><input type="text" value="${vitals.weight || ''}" oninput="updateVisitVitals(${v.visitId}, 'weight', this.value)" placeholder="70" ${readOnlyAttr}></div>
                            </div>
                            ${v.bmiScore ? `<div style="margin-top: 8px; font-size: 0.78rem; font-weight: 700; color: #0f766e;">BMI Score: ${v.bmiScore}</div>` : ''}
                        </div>
                    ` : ''}

                    ${cfg.peds ? `
                        <div style="margin-bottom: 12px; background: #f0fdfa; border: 1.5px solid #99f6e4; border-radius: 10px; padding: 10px;">
                            <span style="font-size: 0.8rem; font-weight: 800; color: #0d9488; display: block; margin-bottom: 8px;"><i class="fa-solid fa-child"></i> نمو الطفل البيومتري (WHO Growth Percentiles)</span>
                            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label">عمر الطفل (بالأشهر)</span><div class="input-wrapper"><input type="number" id="growthAgeM-${v.visitId}" value="${v.pedsGrowthAge \vert{}\vert{} ''}" placeholder="أشهر" ${readOnlyAttr}></div></div>
                                <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label">الوزن الحالي (كغ)</span><div class="input-wrapper"><input type="number" id="growthW-${v.visitId}" value="${v.pedsGrowthW \vert{}\vert{} ''}" placeholder="كغ" ${readOnlyAttr}></div></div>
                                <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label">الطول (سم)</span><div class="input-wrapper"><input type="number" id="growthH-${v.visitId}" value="${v.pedsGrowthH \vert{}\vert{} ''}" placeholder="سم" ${readOnlyAttr}></div></div>
                            </div>
                            <button type="button" class="btn-main" onclick="calculateVisitGrowthPercentiles(${v.visitId})" style="background:#0d9488; padding:6px; font-size:0.75rem; margin-bottom:6px;"><i class="fa-solid fa-chart-line"></i> حساب المخطط والنسب</button>
                            <div id="growthRes-${v.visitId}" style="font-size:0.78rem; color:#334155; background:#fff; padding:8px; border-radius:6px; border:1px solid #cbd5e1; display:${v.pedsGrowthAge ? 'block' : 'none'};">
                                ${v.pedsGrowthAge ? `• <b>عمر الطفل:</b> ${v.pedsGrowthAge} أشهر<br>• متابعة نمو معيار منظمة الصحة العالمية (WHO).` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${cfg.obsGyn ? `
                        <div style="margin-bottom: 12px; background: #fdf2f8; border: 1.5px solid #fbcfe8; border-radius: 10px; padding: 10px;">
                            <span style="font-size: 0.8rem; font-weight: 800; color: #be185d; display: block; margin-bottom: 8px;"><i class="fa-solid fa-person-pregnant"></i> متابعة النسائية والتوليد (Obstetrics & Gynecology)</span>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div class="field-box" style="margin-bottom:0;"><span class="field-label">تاريخ آخر دورة (LMP)</span><div class="input-wrapper"><input type="date" value="${v.obsLmp || ''}" onchange="updateVisitFieldData(${v.visitId}, 'obsLmp', this.value)" ${readOnlyAttr}></div></div>
                                <div class="field-box" style="margin-bottom:0;"><span class="field-label">موعد الولادة المتوقع (EDD)</span><div class="input-wrapper"><input type="date" value="${v.obsEdd || ''}" onchange="updateVisitFieldData(${v.visitId}, 'obsEdd', this.value)" ${readOnlyAttr}></div></div>
                                <div class="field-box" style="margin-bottom:0;"><span class="field-label">عدد الأحمال / الولادات (Gravidity/Parity)</span><div class="input-wrapper"><input type="text" value="${v.obsGp \vert{}\vert{} ''}" oninput="updateVisitFieldData(${v.visitId}, 'obsGp', this.value)" placeholder="G2 P1 A0" ${readOnlyAttr}></div></div>
                                <div class="field-box" style="margin-bottom:0;"><span class="field-label">أسبوع الحمل الحالي (Weeks)</span><div class="input-wrapper"><input type="text" value="${v.obsWeeks || ''}" oninput="updateVisitFieldData(${v.visitId}, 'obsWeeks', this.value)" placeholder="24 weeks" ${readOnlyAttr}></div></div>
                            </div>
                        </div>
                    ` : ''}

                    ${cfg.labs ? `
                        <div class="field-box">
                            <span class="field-label" style="color:#0284c7; font-weight:800;"><i class="fa-solid fa-vial"></i> Lab Tests</span>
                            <div class="input-wrapper" style="position:relative;">
                                <textarea id="vLabs-${v.visitId}" rows="1" placeholder="Enter lab tests..." oninput="handleLiveInput(this, 'labs', ${v.visitId})" onblur="hideSuggestions('labs', ${v.visitId})" ${readOnlyAttr}>${v.labs || ''}</textarea>
                                <div class="suggestions-box" id="suggestions-labs-${v.visitId}"></div>
                                <div class="live-save-bar" id="save-bar-labs-${v.visitId}">
                                    <span>Save: "<strong id="line-text-labs-${v.visitId}"></strong>"</span>
                                    <button type="button" class="btn-live-save" id="btn-save-labs-${v.visitId}" onmousedown="saveLineToDict(event, 'labs', ${v.visitId})">Save</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${cfg.scans ? `
                        <div class="field-box">
                            <span class="field-label" style="color:#0284c7; font-weight:800;"><i class="fa-solid fa-xray"></i> Radiology & Scans</span>
                            <div class="input-wrapper" style="position:relative;">
                                <textarea id="vScans-${v.visitId}" rows="1" placeholder="Enter scans..." oninput="handleLiveInput(this, 'scans', ${v.visitId})" onblur="hideSuggestions('scans', ${v.visitId})" ${readOnlyAttr}>${v.scans || ''}</textarea>
                                <div class="suggestions-box" id="suggestions-scans-${v.visitId}"></div>
                                <div class="live-save-bar" id="save-bar-scans-${v.visitId}">
                                    <span>Save: "<strong id="line-text-scans-${v.visitId}"></strong>"</span>
                                    <button type="button" class="btn-live-save" id="btn-save-scans-${v.visitId}" onmousedown="saveLineToDict(event, 'scans', ${v.visitId})">Save</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${cfg.notes ? `
                        <div class="field-box">
                            <span class="field-label" style="color:#0f766e; font-weight:800;"><i class="fa-solid fa-stethoscope"></i> Diagnosis & Notes</span>
                            <div class="input-wrapper" style="position:relative;">
                                <textarea id="vNotes-${v.visitId}" rows="2" placeholder="Clinical diagnosis..." oninput="handleLiveInput(this, 'notes', ${v.visitId})" onblur="hideSuggestions('notes', ${v.visitId})" ${readOnlyAttr}>${v.notes || ''}</textarea>
                                <div class="suggestions-box" id="suggestions-notes-${v.visitId}"></div>
                                <div class="live-save-bar" id="save-bar-notes-${v.visitId}">
                                    <span>Save: "<strong id="line-text-notes-${v.visitId}"></strong>"</span>
                                    <button type="button" class="btn-live-save" id="btn-save-notes-${v.visitId}" onmousedown="saveLineToDict(event, 'notes', ${v.visitId})">Save</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${cfg.rx ? `
                        <div class="field-box">
                            <span class="field-label" style="color:#d97706; font-weight:800;"><i class="fa-solid fa-prescription"></i> RX Medications</span>
                            <div class="input-wrapper" style="position:relative;">
                                <textarea id="vDrugs-${v.visitId}" rows="3" placeholder="Enter medications & doses..." oninput="handleDrugsInput(this, ${v.visitId})" onkeydown="handleDrugsKeyDown(event, this, ${v.visitId})" onblur="hideSuggestions('drugs', ${v.visitId})" ${readOnlyAttr}>${v.drugs || ''}</textarea>
                                <div class="suggestions-box" id="suggestions-drugs-${v.visitId}"></div>
                                <div class="live-save-bar" id="save-bar-drugs-${v.visitId}">
                                    <span>Save: "<strong id="line-text-drugs-${v.visitId}"></strong>"</span>
                                    <button type="button" class="btn-live-save" id="btn-save-drugs-${v.visitId}" onmousedown="saveLineToDict(event, 'drugs', ${v.visitId})">Save</button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn-main" onclick="openPrescriptionModal(${v.visitId})" style="background: #16a34a; margin-top: 8px;">
                            <i class="fa-solid fa-print"></i> فتح وربط الروشتة (طباعة / PDF)
                        </button>
                    ` : ''}

                    ${cfg.attachments ? `
                        <div style="margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size:0.8rem; font-weight:800; color:#4f46e5;"><i class="fa-solid fa-paperclip"></i> المرفقات والكاميرا (${attachments.length})</span>${!isSec && !isSubscriptionExpired ? `
                                    <label style="background:#4f46e5; color:#fff; padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">
                                        <i class="fa-solid fa-camera"></i> إرفاق صورة <input type="file" accept="image/*" onchange="handleFileUpload(event, ${v.visitId})" style="display:none;">
                                    </label>
                                ` : ''}
                            </div>
                            <div class="attachments-grid">
                                ${attachments.map((att, attIdx) => `
                                    <div class="attachment-thumb">
                                        <img src="${att}" alt="Attachment" onclick="openImagePreview('${att}')">
                                        ${!isSec && !isSubscriptionExpired ? `<button type="button" onclick="deleteAttachment(${v.visitId},${attIdx})" title="حذف"><i class="fa-solid fa-xmark"></i></button>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        if (autoSave) {
            autoSaveMedicalRecord();
        }
    }

    function addNewVisit() {
        if (isSubscriptionExpired) {
            alert('التطبيق في وضع القراءة فقط.');
            return;
        }
        autoSaveMedicalRecord();
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;

        if (!patient.visits) patient.visits = [];
        const newVisitObj = {
            visitId: Date.now(),
            date: getTodayFormatted(),
            vitals: { bp: '', temp: '', pulse: '', resp: '', spo2: '', weight: '', height: '' },
            labs: '',
            scans: '',
            notes: '',
            drugs: '',
            attachments: [],
            medicalHistory: {}
        };

        patient.visits.unshift(newVisitObj);
        savePatientToCloudAndLocal(patient);
        renderVisits(patient.visits, false);
    }

    function updateVisitFieldData(visitId, field, val) {
        if (isSubscriptionExpired) return;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;
        const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
        if (!visit) return;

        visit[field] = val;
        savePatientToCloudAndLocal(patient);
    }

    function updateVisitVitals(visitId, vitalKey, val) {
        if (isSubscriptionExpired) return;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;
        const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
        if (!visit) return;

        if (!visit.vitals) visit.vitals = {};
        visit.vitals[vitalKey] = val;
        savePatientToCloudAndLocal(patient);
    }

    function autoSaveMedicalRecord() {
        if (!currentPatientId || isSubscriptionExpired) return;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient || !patient.visits) return;

        patient.visits.forEach(v => {
            const labsEl = document.getElementById(`vLabs-${v.visitId}`);
            if (labsEl) v.labs = labsEl.value;

            const scansEl = document.getElementById(`vScans-${v.visitId}`);
            if (scansEl) v.scans = scansEl.value;

            const notesEl = document.getElementById(`vNotes-${v.visitId}`);
            if (notesEl) v.notes = notesEl.value;

            const drugsEl = document.getElementById(`vDrugs-${v.visitId}`);
            if (drugsEl) v.drugs = drugsEl.value;
        });

        savePatientToCloudAndLocal(patient);
    }

    function openEditPatientModal() {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;

        document.getElementById('editPName').value = patient.name || '';
        document.getElementById('editPSubName').value = patient.subName || '';
        document.getElementById('editPAge').value = patient.age || '';
        document.getElementById('editPGender').value = patient.gender || '';
        document.getElementById('editPMarital').value = patient.marital || '';
        document.getElementById('editPJob').value = patient.job || '';
        document.getElementById('editPPhone').value = patient.phone || '';

        document.getElementById('editPatientModal').style.display = 'flex';
    }

    function closeEditPatientModal() {
        document.getElementById('editPatientModal').style.display = 'none';
    }

    function saveEditedPatient() {
        if (isSubscriptionExpired) {
            alert('التطبيق في وضع القراءة فقط.');
            return;
        }
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;

        const name = document.getElementById('editPName').value.trim();
        const subName = document.getElementById('editPSubName').value.trim();
        const age = parseInt(document.getElementById('editPAge').value);
        const gender = document.getElementById('editPGender').value;
        const marital = document.getElementById('editPMarital').value;
        const job = document.getElementById('editPJob').value;
        const phone = document.getElementById('editPPhone').value.trim();

        if (!name || isNaN(age)) {
            alert('Please fill required fields.');
            return;
        }

        patient.name = name;
        patient.subName = subName;
        patient.age = age;
        patient.gender = gender;
        patient.marital = marital;
        patient.job = job;
        patient.phone = phone;

        savePatientToCloudAndLocal(patient);
        closeEditPatientModal();
        openMedicalRecord(patient.id, false);
    }

    function confirmDeletePatientRecord() {
        if (isSubscriptionExpired) return;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;

        if (confirm(`Are you sure you want to delete patient (${patient.name})?`)) {
            trashBin.push({ type: 'patient', data: patient, deletedAt: new Date().toISOString() });
            saveTrashToCloudAndLocal();

            patients = patients.filter(p => Number(p.id) !== Number(currentPatientId));
            const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;
            if (ownerUid) {
                localStorage.setItem(`clinic_patients_${ownerUid}`, JSON.stringify(patients));
                localStorage.setItem('clinic_patients', JSON.stringify(patients));
                if (navigator.onLine) {
                    db.collection('users_data').doc(ownerUid).collection('patients').doc(String(currentPatientId)).delete().catch(err => console.log(err));
                }
            }

            alert('Patient moved to trash.');
            goBackScreen();
        }
    }

    function deleteVisit(visitId) {
        if (isSubscriptionExpired) return;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient || !patient.visits || patient.visits.length <= 1) {
            alert('Cannot delete the only remaining visit.');
            return;
        }

        if (confirm('Are you sure you want to delete this visit?')) {
            const vIdx = patient.visits.findIndex(v => Number(v.visitId) === Number(visitId));
            if (vIdx !== -1) {
                const removedVisit = patient.visits.splice(vIdx, 1)[0];
                trashBin.push({ type: 'visit', patientId: patient.id, data: removedVisit, deletedAt: new Date().toISOString() });
                saveTrashToCloudAndLocal();

                savePatientToCloudAndLocal(patient);
                renderVisits(patient.visits, false);
            }
        }
    }

    function openTrashBin() {
        navigateTo('trashScreen', 'Trash Bin', 'Recover deleted items');
        const container = document.getElementById('trashItemsContainer');
        const emptyBtn = document.getElementById('emptyTrashBtn');

        if (!trashBin || trashBin.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#64748b;">Trash bin is empty.</p>';
            emptyBtn.style.display = 'none';
            return;
        }

        emptyBtn.style.display = 'flex';
        container.innerHTML = trashBin.map((item, idx) => `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h5 style="font-size:0.9rem; color:#0f172a; margin-bottom:4px;">${item.type === 'patient' ? 'Patient: ' + item.data.name : 'Visit on ' + item.data.date}</h5>
                    <p style="font-size:0.72rem; color:#64748b;">Deleted at: ${new Date(item.deletedAt).toLocaleString()}</p>
                </div>
                <div style="display:flex; gap:6px;">
                    <button onclick="restoreTrashItem(${idx})" style="background:#0d9488; color:#fff; border:none; border-radius:6px; padding:6px 10px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-rotate-left"></i> Restore</button>
                    <button onclick="permanentDeleteTrashItem(${idx})" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:6px 10px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `).join('');
    }

    function restoreTrashItem(index) {
        if (isSubscriptionExpired) return;
        const item = trashBin.splice(index, 1)[0];
        if (item.type === 'patient') {
            patients.push(item.data);
            savePatientToCloudAndLocal(item.data);
        } else if (item.type === 'visit') {
            const patient = patients.find(p => Number(p.id) === Number(item.patientId));
            if (patient) {
                if (!patient.visits) patient.visits = [];
                patient.visits.push(item.data);
                savePatientToCloudAndLocal(patient);
            } else {
                alert('Associated patient not found.');
            }
        }
        saveTrashToCloudAndLocal();
        openTrashBin();
        alert('Item restored successfully!');
    }

    function permanentDeleteTrashItem(index) {
        if (isSubscriptionExpired) return;
        if (confirm('Permanently delete this item?')) {
            trashBin.splice(index, 1);
            saveTrashToCloudAndLocal();
            openTrashBin();
        }
    }

    function confirmEmptyTrash() {
        if (isSubscriptionExpired) return;
        if (confirm('Empty trash completely?')) {
            emptyTrashBin();
        }
    }

    function emptyTrashBin() {
        trashBin = [];
        saveTrashToCloudAndLocal();
        openTrashBin();
    }

    let activeRxVisitId = null;

    function openPrescriptionModal(visitId) {
        activeRxVisitId = visitId;
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;
        const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
        if (!visit) return;

        document.getElementById('rxDragPatientDetailsText').innerHTML = `<b>Name:</b> ${patient.name} (${patient.age} yrs, ${patient.gender || 'N/A'})`;
        document.getElementById('rxDragDateText').innerText = `Date: ${visit.date || getTodayFormatted()}`;
        document.getElementById('rxDragVitalsText').innerText = visit.vitals ? `BP: ${visit.vitals.bp || '—'} | Temp: ${visit.vitals.temp || '—'} | Weight: ${visit.vitals.weight || '—'}` : '';
        document.getElementById('rxDragTreatmentText').innerText = visit.drugs || 'No medications prescribed.';

        const container = document.getElementById('rxCanvasContainer');
        if (currentDoctorRxImage) {
            container.style.backgroundImage = `url(${currentDoctorRxImage})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
        } else {
            container.style.backgroundImage = 'none';
        }

        document.getElementById('rxModal').style.display = 'flex';
    }

    function closeRxModal() {
        document.getElementById('rxModal').style.display = 'none';
        activeRxVisitId = null;
    }

    function toggleRxConfigMode() {
        isConfigMode = !isConfigMode;
        const boxes = document.querySelectorAll('.draggable-box');
        const btn = document.getElementById('rxConfigToggleBtn');
        const saveLayoutBtn = document.getElementById('rxSaveLayoutBtn');
        const hint = document.getElementById('rxModeHint');

        if (isConfigMode) {
            boxes.forEach(b => b.classList.add('config-active'));
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Exit Config';
            saveLayoutBtn.style.display = 'flex';
            hint.innerText = 'Config Mode: Drag boxes and adjust font sizes.';
        } else {
            boxes.forEach(b => b.classList.remove('config-active'));
            btn.innerHTML = '<i class="fa-solid fa-sliders"></i> Configure Layout';
            saveLayoutBtn.style.display = 'none';
            hint.innerText = 'RX ready. (Click Configure Layout to edit)';
        }
    }

    function changeBoxFontSize(boxKey, delta) {
        let boxId = '';
        if (boxKey === 'patientDetails') boxId = 'dragBoxPatientDetails';
        else if (boxKey === 'date') boxId = 'dragBoxDate';
        else if (boxKey === 'vitals') boxId = 'dragBoxVitals';
        else if (boxKey === 'treatment') boxId = 'dragBoxTreatment';

        const box = document.getElementById(boxId);
        if (!box) return;
        const textEl = box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text');
        if (!textEl) return;

        let currentSize = parseFloat(window.getComputedStyle(textEl).fontSize);
        let newSize = currentSize + delta;
        if (newSize < 10) newSize = 10;
        if (newSize > 35) newSize = 35;
        textEl.style.fontSize = `${newSize}px`;
    }

    function saveRxLayoutPositions() {
        saveSettingsToCloudAndLocal();
        toggleRxConfigMode();
        alert('RX layout and fonts saved successfully!');
    }

    function loadSavedRxLayout() {
        try {
            const savedLayout = JSON.parse(localStorage.getItem('doctor_rx_layout'));
            if (!savedLayout) return;

            for (const [boxId, data] of Object.entries(savedLayout)) {
                const box = document.getElementById(boxId);
                if (box) {
                    if (data.top) box.style.top = data.top;
                    if (data.left) box.style.left = data.left;
                    if (data.fontSize) {
                        const textEl = box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text');
                        if (textEl) textEl.style.fontSize = data.fontSize;
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    function initDraggableElements() {
        const boxes = document.querySelectorAll('.draggable-box');
        boxes.forEach(box => {
            let isDragging = false;
            let startX, startY, initialX, initialY;

            box.addEventListener('mousedown', dragStart);
            box.addEventListener('touchstart', dragStart, { passive: false });

            function dragStart(e) {
                if (!isConfigMode) return;
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SPAN') return;
                isDragging = true;
                box.classList.add('dragging');

                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                initialX = clientX - box.offsetLeft;
                initialY = clientY - box.offsetTop;

                document.addEventListener('mousemove', drag);
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('mouseup', dragEnd);
                document.addEventListener('touchend', dragEnd);
            }

            function drag(e) {
                if (!isDragging) return;
                e.preventDefault();

                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                let x = clientX - initialX;
                let y = clientY - initialY;

                box.style.left = `${x}px`;
                box.style.top = `${y}px`;
            }

            function dragEnd() {
                isDragging = false;
                box.classList.remove('dragging');
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('mouseup', dragEnd);
                document.removeEventListener('touchend', dragEnd);
            }
        });
    }

    function printPrescriptionDirectly() {
        const container = document.getElementById('rxCanvasContainer');
        html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head><title>Print RX</title></head>
                <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                    <img src="${imgData}" style="max-width:100%; height:auto;" onload="window.print();window.close();" />
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }

    function openPrescriptionPDF() {
        const container = document.getElementById('rxCanvasContainer');
        html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Prescription_${Date.now()}.pdf`);
        });
    }

    function handleFileUpload(event, visitId) {
        if (isSubscriptionExpired) {
            alert('التطبيق في وضع القراءة فقط.');
            return;
        }
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                let width = img.width;
                let height = img.height;
                const maxDim = 800;

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

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);

                const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
                if (!patient) return;
                const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
                if (!visit) return;

                if (!visit.attachments) visit.attachments = [];
                visit.attachments.push(compressedDataUrl);

                savePatientToCloudAndLocal(patient);
                renderVisits(patient.visits, false);
            };
        };
        reader.readAsDataURL(file);
    }

    function deleteAttachment(visitId, attIndex) {
        if (isSubscriptionExpired) return;
        if (confirm('Delete this attachment?')) {
            const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
            if (!patient) return;
            const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
            if (!visit || !visit.attachments) return;

            visit.attachments.splice(attIndex, 1);
            savePatientToCloudAndLocal(patient);
            renderVisits(patient.visits, false);
        }
    }

    function openImagePreview(src) {
        document.getElementById('previewModalImg').src = src;
        document.getElementById('imagePreviewModal').style.display = 'flex';
    }

    function closeImagePreview() {
        document.getElementById('imagePreviewModal').style.display = 'none';
    }

    function showMainMenu() {
        if (!isSubscriptionExpired) {
            autoSaveMedicalRecord();
        }
        navigateTo('mainScreen', translations[currentLang].headerTitle, translations[currentLang].headerSub);
    }

    function renderDictTerms() {
        const cat = document.getElementById('dictCategorySelect').value;
        const container = document.getElementById('dictItemsList');
        const terms = medicalDict[cat] || [];

        container.innerHTML = `
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <input type="text" id="newDictTermInput" placeholder="Add new term..." style="flex:1; padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;">
                <button type="button" onclick="addNewDictTerm('${cat}')" style="background:#0d9488; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-weight:700; cursor:pointer;">Add</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                ${terms.map((t, idx) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; border-radius:8px; font-size:0.85rem;">
                        <span>${t}</span>
                        <button type="button" onclick="deleteDictTerm('${cat}',${idx})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function openDictionaryManager() {
        navigateTo('dictScreen', translations[currentLang].dict, translations[currentLang].dictSub);
        renderDictTerms();
    }

    function addNewDictTerm(cat) {
        if (isSubscriptionExpired) {
            alert('التطبيق في وضع القراءة فقط.');
            return;
        }
        const input = document.getElementById('newDictTermInput');
        const val = input.value.trim();
        if (!val) return;

        if (!medicalDict[cat]) medicalDict[cat] = [];
        if (!medicalDict[cat].includes(val)) {
            medicalDict[cat].push(val);
            saveSettingsToCloudAndLocal();
            renderDictTerms();
            input.value = '';
        }
    }

    function deleteDictTerm(cat, index) {
        if (isSubscriptionExpired) return;
        if (medicalDict[cat]) {
            medicalDict[cat].splice(index, 1);
            saveSettingsToCloudAndLocal();
            renderDictTerms();
        }
    }
