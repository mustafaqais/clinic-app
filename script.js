const firebaseConfig = {
    apiKey: "AIzaSyCgS-TYiCiVIjUrPSkf_z4U837v8LoRUMY",
    authDomain: "mustafaqais-31e2c.firebaseapp.com",
    projectId: "mustafaqais-31e2c",
    storageBucket: "mustafaqais-31e2c.firebasestorage.app",
    messagingSenderId: "835445727081",
    appId: "1:835445727081:web:f5ba7a8d8a241fcbe627f8",
    measurementId: "G-DL042BQE94"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const FOUNDER_EMAIL = "musqaqa009@gmail.com"; 
let isRegisterMode = false;
let pendingUserPass = "";
let currentUserId = null;
let currentPatientId = null;
let currentVisitIdForModal = null;
let currentDoctorRxImage = localStorage.getItem('doctor_rx_template') || '';
let isConfigMode = false;
let isUserSecretary = false;
let isSubscriptionExpired = false;
let patientsListenerUnsubscribe = null;

// إعدادات لوحة التحكم (محدثة لتشمل الحقول الثلاثة الجديدة)
let specialtyConfig = JSON.parse(localStorage.getItem('clinic_specialty_config')) || {
    chiefComplaint: true,
    historyPresentIllness: true,
    reviewOfSystems: true,
    medHistory: true,
    vitals: true,
    labs: true,
    scans: true,
    notes: true,
    rx: true,
    attachments: true,
    obsGyn: false,
    ortho: false,
    neuro: false,
    peds: false,
    derm: false,
    ent: false,
    ophthal: false,
    cardio: false
};

let currentLang = localStorage.getItem('clinic_lang') || 'ar';
let isDarkMode = localStorage.getItem('clinic_dark_mode') === 'true';

const translations = {
    ar: {
        loginTitle: "تسجيل الدخول",
        loginSub: "تسجيل الدخول إلى نظام العيادة السحابي",
        registerTitle: "إنشاء حساب جديد",
        registerSub: "أنشئ حساباً جديداً لإدارة عيادتك بكفاءة",
        emailLabel: "البريد الإلكتروني / رقم الموبايل",
        passLabel: "كلمة المرور",
        btnLogin: "تسجيل الدخول",
        btnRegister: "إنشاء الحساب",
        headerTitle: "نظام عيادة ماستر",
        headerSub: "لوحة التحكم السحابية الآمنة",
        txtBack: "رجوع",
        archive: "أرشيف المرضى",
        newPatient: "مريض جديد",
        sortNewest: "الأحدث أولاً",
        sortOldest: "الأقدم أولاً",
        footer: "نظام عيادة ماستر المتقدم v17.30"
    },
    en: {
        loginTitle: "User Login",
        loginSub: "Sign in securely to your clinic cloud system",
        registerTitle: "Register New Account",
        registerSub: "Create a new account",
        emailLabel: "Email or Phone",
        passLabel: "Password",
        btnLogin: "Login",
        btnRegister: "Register",
        headerTitle: "Clinic Master System",
        headerSub: "Cloud Secure Dashboard",
        txtBack: "Back",
        archive: "Patients Archive",
        newPatient: "New Patient",
        sortNewest: "Newest First",
        sortOldest: "Oldest First",
        footer: "Clinic Master Network v17.30"
    }
};

let patients = JSON.parse(localStorage.getItem('clinic_patients')) || [];
let trashBin = JSON.parse(localStorage.getItem('clinic_trash')) || [];
let medicalDict = JSON.parse(localStorage.getItem('clinic_dict')) || {
    labs: ["CBC", "RBS", "Lipid Profile", "HbA1c", "LFT", "KFT"],
    scans: ["Chest X-Ray", "Abdominal Ultrasound", "Brain MRI", "CT Scan"],
    drugs: ["Paracetamol 500mg 1x3", "Amoxicillin 500mg 1x3", "Metformin 500mg 1x2"],
    notes: ["Upper Respiratory Tract Infection", "Acute Gastroenteritis"],
    mh_history: ["Appendectomy", "Cholecystectomy", "Penicillin Allergy"],
    chiefComplaint: ["Headache", "Cough", "Fever", "Chest pain", "Abdominal pain"],
    hpi: ["Progressive onset", "Acute onset", "Associated with nausea"],
    ros: ["No fever, no chills", "Normal bowel habits", "No shortness of breath"]
};

let secretaryAccount = JSON.parse(localStorage.getItem('clinic_sec_account')) || { email: "", password: "" };

function toggleDropdownMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('headerDropdownMenu');
    menu.classList.toggle('show');
}

window.addEventListener('click', function() {
    const menu = document.getElementById('headerDropdownMenu');
    if (menu && menu.classList.contains('show')) menu.classList.remove('show');
});

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('clinic_dark_mode', isDarkMode);
    applyDarkModeState();
}

function applyDarkModeState() {
    const iconEl = document.getElementById('darkModeIcon');
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (iconEl) { iconEl.className = "fa-solid fa-sun"; iconEl.style.color = "#fbbf24"; }
    } else {
        document.body.classList.remove('dark-mode');
        if (iconEl) { iconEl.className = "fa-solid fa-moon"; iconEl.style.color = "#6366f1"; }
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('clinic_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    const t = translations[currentLang];
    document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    const titleEl = document.getElementById('headerTitle');
    if (titleEl) titleEl.innerText = localStorage.getItem('clinic_custom_brand_name') || t.headerTitle;
}

let screenHistory = ['mainScreen'];

function navigateTo(screenId, title = null, sub = 'Cloud Secure Dashboard', saveState = true) {
    hideAllScreensInner();
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";
    document.getElementById('headerTitle').innerText = screenId === 'mainScreen' ? customBrandName : (title || customBrandName);
    document.getElementById('headerSub').innerText = sub;

    if (saveState) {
        sessionStorage.setItem('current_screen', screenId);
        if (screenId !== 'medicalRecordScreen') {
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        }
    }

    if (screenId === 'mainScreen') {
        document.getElementById('backBtn').style.display = 'none';
        screenHistory = ['mainScreen'];
    } else {
        document.getElementById('backBtn').style.display = 'flex';
        if (screenHistory[screenHistory.length - 1] !== screenId) screenHistory.push(screenId);
    }
}

function goBackScreen() {
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const prevScreen = screenHistory[screenHistory.length - 1];
        hideAllScreensInner();
        document.getElementById(prevScreen).style.display = 'block';
        sessionStorage.setItem('current_screen', prevScreen);
        if (prevScreen === 'mainScreen') document.getElementById('backBtn').style.display = 'none';
    } else {
        showMainMenu();
    }
}

function hideAllScreensInner() {
    const screens = ['mainScreen', 'addPatientScreen', 'rxTemplateScreen', 'specialtiesDashboardScreen', 'archiveScreen', 'trashScreen', 'medicalRecordScreen', 'dictScreen', 'networkScreen', 'analyticsScreen', 'settingsScreen', 'backupScreen', 'permissionsScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    applyLanguage();
    applyDarkModeState();

    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUserId = user.uid;
            let dataOwnerUid = user.uid;
            try {
                const secQuery = await db.collection('network_hierarchy').where('secretaryEmail', '==', user.email.toLowerCase()).get();
                if (!secQuery.empty) dataOwnerUid = secQuery.docs[0].id;
            } catch (e) { console.log(e); }

            patients = JSON.parse(localStorage.getItem(`clinic_patients_${dataOwnerUid}`)) || patients;
            setupFounderInterfaceAfterAuth();
        } else {
            currentUserId = null;
            document.getElementById('appContainer').style.display = 'none';
            document.getElementById('authScreen').style.display = 'flex';
        }
    });
});

function setupFounderInterfaceAfterAuth() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('cardPermissions').style.display = 'flex';
    navigateTo('mainScreen');
}

function showMainMenu() {
    navigateTo('mainScreen');
}

function openSpecialtiesDashboard() {
    navigateTo('specialtiesDashboardScreen', 'لوحة تحكم الاختصاصات', 'تخصيص الحقول الطبية');
    
    document.getElementById('mod_chiefComplaint').checked = !!specialtyConfig.chiefComplaint;
    document.getElementById('mod_historyPresentIllness').checked = !!specialtyConfig.historyPresentIllness;
    document.getElementById('mod_reviewOfSystems').checked = !!specialtyConfig.reviewOfSystems;
    document.getElementById('mod_medHistory').checked = !!specialtyConfig.medHistory;
    document.getElementById('mod_vitals').checked = !!specialtyConfig.vitals;
    document.getElementById('mod_labs').checked = !!specialtyConfig.labs;
    document.getElementById('mod_scans').checked = !!specialtyConfig.scans;
    document.getElementById('mod_notes').checked = !!specialtyConfig.notes;
    document.getElementById('mod_rx').checked = !!specialtyConfig.rx;
    document.getElementById('mod_attachments').checked = !!specialtyConfig.attachments;

    document.getElementById('mod_obsGyn').checked = !!specialtyConfig.obsGyn;
    document.getElementById('mod_ortho').checked = !!specialtyConfig.ortho;
    document.getElementById('mod_neuro').checked = !!specialtyConfig.neuro;
    document.getElementById('mod_peds').checked = !!specialtyConfig.peds;
    document.getElementById('mod_derm').checked = !!specialtyConfig.derm;
    document.getElementById('mod_ent').checked = !!specialtyConfig.ent;
    document.getElementById('mod_ophthal').checked = !!specialtyConfig.ophthal;
    document.getElementById('mod_cardio').checked = !!specialtyConfig.cardio;
}

function saveSpecialtiesDashboardConfig() {
    specialtyConfig = {
        chiefComplaint: document.getElementById('mod_chiefComplaint').checked,
        historyPresentIllness: document.getElementById('mod_historyPresentIllness').checked,
        reviewOfSystems: document.getElementById('mod_reviewOfSystems').checked,
        medHistory: document.getElementById('mod_medHistory').checked,
        vitals: document.getElementById('mod_vitals').checked,
        labs: document.getElementById('mod_labs').checked,
        scans: document.getElementById('mod_scans').checked,
        notes: document.getElementById('mod_notes').checked,
        rx: document.getElementById('mod_rx').checked,
        attachments: document.getElementById('mod_attachments').checked,
        obsGyn: document.getElementById('mod_obsGyn').checked,
        ortho: document.getElementById('mod_ortho').checked,
        neuro: document.getElementById('mod_neuro').checked,
        peds: document.getElementById('mod_peds').checked,
        derm: document.getElementById('mod_derm').checked,
        ent: document.getElementById('mod_ent').checked,
        ophthal: document.getElementById('mod_ophthal').checked,
        cardio: document.getElementById('mod_cardio').checked
    };
    localStorage.setItem('clinic_specialty_config', JSON.stringify(specialtyConfig));
    alert('تم حفظ إعدادات الاختصاصات بنجاح!');
    showMainMenu();
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

// دالة عامة مرنة تدعم الضغط على Enter في جميع الحقول وتجنب أي قيود
function handleUniversalInput(textarea, category, visitId) {
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

    if (currentLine.length > 0 && saveBar) {
        saveBar.style.display = 'flex';
        const lineTextEl = document.getElementById(`line-text-${category}-${visitId}`);
        if (lineTextEl) lineTextEl.innerText = currentLine;
        
        const terms = medicalDict[category] || [];
        const matches = terms.filter(t => t.toLowerCase().includes(currentLine.toLowerCase()) && t.toLowerCase() !== currentLine.toLowerCase());
        if (matches.length > 0 && box) {
            box.innerHTML = matches.map(m => `<div class="suggestion-item" onmousedown="selectSuggestion('${category}', ${visitId}, '${m.replace(/'/g, "\\'")}')">${m}</div>`).join('');
            box.style.display = 'block';
        } else if (box) {
            box.style.display = 'none';
        }
    } else {
        if (saveBar) saveBar.style.display = 'none';
        if (box) box.style.display = 'none';
    }

    updateVisitFieldData(visitId, category, textarea.value);
}

function selectSuggestion(category, visitId, term) {
    const textarea = document.getElementById(`v${category.charAt(0).toUpperCase() + category.slice(1)}-${visitId}`);
    if (!textarea) return;
    const lines = textarea.value.split('\n');
    lines[lines.length - 1] = term;
    textarea.value = lines.join('\n') + '\n';
    autoResizeTextarea(textarea);
    document.getElementById(`suggestions-${category}-${visitId}`).style.display = 'none';
    document.getElementById(`save-bar-${category}-${visitId}`).style.display = 'none';
    updateVisitFieldData(visitId, category, textarea.value);
    textarea.focus();
}

function hideSuggestions(category, visitId) {
    setTimeout(() => {
        const box = document.getElementById(`suggestions-${category}-${visitId}`);
        const bar = document.getElementById(`save-bar-${category}-${visitId}`);
        if (box) box.style.display = 'none';
        if (bar) bar.style.display = 'none';
    }, 200);
}

function saveLineToDict(event, category, visitId) {
    event.preventDefault();
    const textSpan = document.getElementById(`line-text-${category}-${visitId}`);
    if (!textSpan) return;
    const lineText = textSpan.innerText.trim();
    if (lineText && medicalDict[category] && !medicalDict[category].includes(lineText)) {
        medicalDict[category].push(lineText);
        localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
        const btn = document.getElementById(`btn-save-${category}-${visitId}`);
        if (btn) {
            btn.innerText = 'Saved!';
            setTimeout(() => { btn.innerText = 'Save'; }, 1000);
        }
    }
}

function updateVisitFieldData(visitId, category, value) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;
    visit[category] = value;
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
}

function openPatientsArchive() {
    navigateTo('archiveScreen', translations[currentLang].archive, 'Search & records');
    filterPatients();
}

function filterPatients() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = patients.filter(p => p.name.toLowerCase().includes(query) || (p.phone && p.phone.includes(query)));
    renderPatientsList(filtered);
}

function renderPatientsList(list) {
    const container = document.getElementById('patientsList');
    container.innerHTML = list.length === 0 
        ? '<p style="text-align:center; color:#64748b;">No patients found.</p>'
        : list.map(p => `
            <div class="patient-card" onclick="openMedicalRecord(${p.id})">
                <div class="patient-info">
                    <h4>${p.name} ${p.subName ? `(${p.subName})` : ''}</h4>
                    <p><i class="fa-solid fa-phone"></i> ${p.phone} | Age: ${p.age}</p>
                </div>
            </div>
        `).join('');
}

function openMedicalRecord(id) {
    currentPatientId = id;
    navigateTo('medicalRecordScreen', 'Patient Record', 'View details');
    const patient = patients.find(p => Number(p.id) === Number(id));
    if (patient) {
        document.getElementById('recPatientName').innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
        document.getElementById('recPatientMeta').innerHTML = `Age: ${patient.age} | Gender: ${patient.gender || 'N/A'} | Phone: ${patient.phone || 'N/A'}`;
        renderVisits(patient.visits || []);
    }
}

function addNewVisit() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    patient.visits.unshift({ visitId: Date.now(), date: new Date().toISOString().split('T')[0], medHistory: {}, notes: '', attachments: [] });
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
    renderVisits(patient.visits);
}

function renderVisits(visits) {
    const container = document.getElementById('visitsContainer');
    const cfg = specialtyConfig;

    container.innerHTML = visits.map((v) => `
        <div class="visit-card" data-visit-id="${v.visitId}">
            <div class="visit-header">
                <span>Visit Date: ${v.date}</span>
            </div>

            ${cfg.chiefComplaint ? `
            <div class="field-box">
                <span class="field-label">Chief Complaint (الشكوى الرئيسية)</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vChiefComplaint-${v.visitId}" rows="1" placeholder="Enter chief complaint..." oninput="handleUniversalInput(this, 'chiefComplaint', ${v.visitId})" onblur="hideSuggestions('chiefComplaint', ${v.visitId})">${v.chiefComplaint || ''}</textarea>
                    <div class="suggestions-box" id="suggestions-chiefComplaint-${v.visitId}"></div>
                    <div class="live-save-bar" id="save-bar-chiefComplaint-${v.visitId}">
                        <span>Save: "<strong id="line-text-chiefComplaint-${v.visitId}"></strong>"</span>
                        <button type="button" class="btn-live-save" id="btn-save-chiefComplaint-${v.visitId}" onmousedown="saveLineToDict(event, 'chiefComplaint', ${v.visitId})">Save</button>
                    </div>
                </div>
            </div>
            ` : ''}

            ${cfg.historyPresentIllness ? `
            <div class="field-box">
                <span class="field-label">History of Present Illness (تاريخ المرض الحالي)</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vHpi-${v.visitId}" rows="1" placeholder="Enter history of present illness..." oninput="handleUniversalInput(this, 'hpi', ${v.visitId})" onblur="hideSuggestions('hpi', ${v.visitId})">${v.hpi || ''}</textarea>
                    <div class="suggestions-box" id="suggestions-hpi-${v.visitId}"></div>
                    <div class="live-save-bar" id="save-bar-hpi-${v.visitId}">
                        <span>Save: "<strong id="line-text-hpi-${v.visitId}"></strong>"</span>
                        <button type="button" class="btn-live-save" id="btn-save-hpi-${v.visitId}" onmousedown="saveLineToDict(event, 'hpi', ${v.visitId})">Save</button>
                    </div>
                </div>
            </div>
            ` : ''}

            ${cfg.reviewOfSystems ? `
            <div class="field-box">
                <span class="field-label">Review of Other Systems (مراجعة الأنظمة الأخرى)</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vRos-${v.visitId}" rows="1" placeholder="Enter review of other systems..." oninput="handleUniversalInput(this, 'ros', ${v.visitId})" onblur="hideSuggestions('ros', ${v.visitId})">${v.ros || ''}</textarea>
                    <div class="suggestions-box" id="suggestions-ros-${v.visitId}"></div>
                    <div class="live-save-bar" id="save-bar-ros-${v.visitId}">
                        <span>Save: "<strong id="line-text-ros-${v.visitId}"></strong>"</span>
                        <button type="button" class="btn-live-save" id="btn-save-ros-${v.visitId}" onmousedown="saveLineToDict(event, 'ros', ${v.visitId})">Save</button>
                    </div>
                </div>
            </div>
            ` : ''}

            ${cfg.notes ? `
            <div class="field-box">
                <span class="field-label">Diagnosis & Notes</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vNotes-${v.visitId}" rows="2" placeholder="Clinical notes..." oninput="handleUniversalInput(this, 'notes', ${v.visitId})" onblur="hideSuggestions('notes', ${v.visitId})">${v.notes || ''}</textarea>
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
                <span class="field-label">Prescribed Medications (RX)</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vDrugs-${v.visitId}" rows="3" placeholder="Write drugs..." oninput="handleUniversalInput(this, 'drugs', ${v.visitId})" onblur="hideSuggestions('drugs', ${v.visitId})">${v.drugs || ''}</textarea>
                    <div class="suggestions-box" id="suggestions-drugs-${v.visitId}"></div>
                    <div class="live-save-bar" id="save-bar-drugs-${v.visitId}">
                        <span>Save: "<strong id="line-text-drugs-${v.visitId}"></strong>"</span>
                        <button type="button" class="btn-live-save" id="btn-save-drugs-${v.visitId}" onmousedown="saveLineToDict(event, 'drugs', ${v.visitId})">Save</button>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `).join('');

    visits.forEach(v => {
        ['ChiefComplaint', 'Hpi', 'Ros', 'Notes', 'Drugs'].forEach(cat => {
            const el = document.getElementById(`v${cat}-${v.visitId}`);
            if (el) autoResizeTextarea(el);
        });
    });
}

function openDictionaryManager() {
    navigateTo('dictScreen', 'Medical Dictionary', 'Manage terms');
    renderDictTerms();
}

function renderDictTerms() {
    const cat = document.getElementById('dictCategorySelect').value;
    const terms = medicalDict[cat] || [];
    const container = document.getElementById('dictItemsList');
    container.innerHTML = terms.map((t, i) => `
        <div class="dict-tag"><span>${t}</span><button onclick="removeDictTerm('${cat}', ${i})">Delete</button></div>
    `).join('') + `
        <div style="display:flex; gap:8px; margin-top:12px;">
            <input type="text" id="newDictTermInput" placeholder="Add new term..." style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:8px;">
            <button class="btn-main" onclick="addNewDictTerm('${cat}')" style="width:auto; padding:0 16px;">Add</button>
        </div>
    `;
}

function addNewDictTerm(cat) {
    const input = document.getElementById('newDictTermInput');
    const val = input.value.trim();
    if (val && medicalDict[cat] && !medicalDict[cat].includes(val)) {
        medicalDict[cat].push(val);
        localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
        renderDictTerms();
    }
}

function removeDictTerm(cat, index) {
    if (medicalDict[cat]) {
        medicalDict[cat].splice(index, 1);
        localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
        renderDictTerms();
    }
}

function saveNewPatient(e) {
    e.preventDefault();
    const newPat = {
        id: Date.now(),
        name: document.getElementById('pName').value.trim(),
        subName: document.getElementById('pSubName').value.trim(),
        age: Number(document.getElementById('pAge').value),
        gender: document.getElementById('pGender').value || 'Unspecified',
        phone: document.getElementById('pPhone').value || 'N/A',
        visits: [{ visitId: Date.now(), date: new Date().toISOString().split('T')[0], medHistory: {}, notes: '', attachments: [] }]
    };
    patients.unshift(newPat);
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
    openMedicalRecord(newPat.id);
}
