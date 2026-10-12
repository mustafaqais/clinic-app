/* ==========================================================
   CLINIC MASTER SYSTEM - CLOUD ULTIMATE EDITION v17.28
   JavaScript Engine - Full Integration with Chief Complaint, HPI & ROS
   ========================================================== */

// Firebase Configuration & Initialization (Placeholder or User Configured)
const firebaseConfig = {
    apiKey: "AIzaSyD-Placeholder-Key-ClinicMaster",
    authDomain: "clinic-master-cloud.firebaseapp.com",
    projectId: "clinic-master-cloud",
    storageBucket: "clinic-master-cloud.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Global Application State
let currentUser = null;
let currentLang = 'ar';
let isDarkMode = false;
let patients = [];
let activePatientId = null;
let specialtiesConfig = {
    chiefComplaint: true,
    hpi: true,
    ros: true,
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

let medicalDictionary = {
    drugs: [
        { name: "Paracetamol 500mg", dose: "1 tab q8h" },
        { name: "Amoxicillin 500mg", dose: "1 cap q8h for 7 days" },
        { name: "Omeprazole 20mg", dose: "1 cap daily before breakfast" },
        { name: "Metformin 500mg", dose: "1 tab bd" },
        { name: "Atorvastatin 20mg", dose: "1 tab at night" },
        { name: "Diclofenac Sodium 50mg", dose: "1 tab tid after food" }
    ],
    chiefComplaint: [
        "Severe headache for 3 days",
        "Acute chest pain radiating to left arm",
        "Persistent dry cough and shortness of breath",
        "High fever and generalized body ache",
        "Upper abdominal pain after meals",
        "Lower back pain radiating to right leg",
        "Dizziness and vertigo when changing position"
    ],
    hpi: [
        "Symptoms started gradually 3 days ago, moderate in severity, aggravated by movement and relieved by rest.",
        "Acute onset of symptoms 24 hours ago, continuous, sharp pain with no prior similar episodes.",
        "Progressive worsening over the past week associated with nausea and general fatigue."
    ],
    ros: [
        "CNS: No history of fits, dizziness, or visual disturbances.",
        "CVS: No chest pain, palpitation, or orthopnea.",
        "RS: No chronic cough, hemoptysis, or wheezing.",
        "GIS: Normal appetite, bowel habits regular, no abdominal pain.",
        "GUS: Normal frequency, no dysuria or hematuria."
    ],
    labs: [
        "CBC (Complete Blood Count)",
        "FBS (Fasting Blood Sugar)",
        "HbA1c (Glycated Hemoglobin)",
        "Lipid Profile",
        "Liver Function Tests (LFT)",
        "Kidney Function Tests (KFT)",
        "General Urine Examination (GUE)",
        "Stool Analysis",
        "TSH, T3, T4"
    ],
    scans: [
        "Chest X-Ray (CXR)",
        "Abdominal & Pelvic Ultrasound",
        "Echocardiography (Echo)",
        "Brain MRI with Contrast",
        "Lumbosacral Spine X-Ray",
        "ECG (Electrocardiogram)"
    ],
    notes: [
        "Patient is stable, conscious, oriented to time and place.",
        "Advised to maintain adequate hydration and proper diet.",
        "Follow up after one week with lab results.",
        "Referred to specialist consultation for further evaluation."
    ],
    mh_history: [
        "Type 2 Diabetes Mellitus on oral hypoglycemics",
        "Essential Hypertension well controlled",
        "Bronchial Asthma on inhalers",
        "No known chronic illnesses"
    ]
};

let rxTemplateDataUrl = "";
let rxLayoutPositions = {
    patientDetails: { top: 20, left: 15, fontSize: 13 },
    date: { top: 20, left: 250, fontSize: 12 },
    vitals: { top: 80, left: 15, fontSize: 11 },
    treatment: { top: 150, left: 15, fontSize: 12 }
};

// Translations Object
const translations = {
    ar: {
        headerTitle: "نظام عيادة ماستر",
        headerSub: "لوحة التحكم السحابية الآمنة",
        authTitle: "تسجيل الدخول",
        authSubText: "تسجيل الدخول إلى نظام العيادة السحابي",
        lblEmail: "البريد الإلكتروني / رقم الموبايل",
        lblPass: "كلمة المرور",
        authSubmitBtn: "تسجيل الدخول",
        authSwitchText: "ليس لديك حساب؟ <span onclick='toggleAuthMode()'>سجل الآن</span>",
        newPatient: "مريض جديد",
        newPatientSub: "تسجيل وحفظ السجلات",
        archive: "أرشيف المرضى",
        archiveSub: "بحث وسجل الزيارات",
        rxTemplate: "ترويسة الروشتة",
        rxTemplateSub: "صورة ترويسة الوصفة الطبية",
        specialties: "لوحة تحكم الاختصاصات",
        specialtiesSub: "تخصيص وتفعيل الحقول الطبية",
        dictionary: "القاموس الطبي",
        dictionarySub: "إدارة الأدوية والجرعات",
        analytics: "إحصائيات وتحليلات العيادة",
        analyticsSub: "مؤشرات الأداء ونسب المرضى",
        backup: "النسخ الاحتياطي",
        backupSub: "تصدير أو استلاف ملف البيانات",
        trash: "سلة المهملات",
        trashSub: "استعادة العناصر المحذوفة",
        settings: "إعدادات الحساب",
        settingsSub: "خيارات البريد وكلمة المرور",
        footerText: "شبكة عيادة ماستر v17.28"
    },
    en: {
        headerTitle: "Clinic Master System",
        headerSub: "Secure Cloud Control Panel",
        authTitle: "User Login",
        authSubText: "Sign in to Clinic Cloud System",
        lblEmail: "Email / Phone Number",
        lblPass: "Password",
        authSubmitBtn: "Sign In",
        authSwitchText: "Don't have an account? <span onclick='toggleAuthMode()'>Register Now</span>",
        newPatient: "New Patient",
        newPatientSub: "Register & save records",
        archive: "Patients Archive",
        archiveSub: "Search & visit history",
        rxTemplate: "RX Template",
        rxTemplateSub: "Prescription header image",
        specialties: "Specialties Dashboard",
        specialtiesSub: "Customize & enable medical fields",
        dictionary: "Medical Dictionary",
        dictionarySub: "Manage drugs & doses",
        analytics: "Clinic Analytics",
        analyticsSub: "Performance metrics & patient ratios",
        backup: "Backup & Restore",
        backupSub: "Export or upload data file",
        trash: "Trash Bin",
        trashSub: "Recover deleted items",
        settings: "Account Settings",
        settingsSub: "Email & password options",
        footerText: "Clinic Master Network v17.28"
    }
};

// Initialization on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    checkOnlineStatus();
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Auth state observer
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
            loadUserDataFromCloud();
        } else {
            currentUser = null;
            document.getElementById('authScreen').style.display = 'flex';
            document.getElementById('appContainer').style.display = 'none';
        }
    });

    initDragAndDropRx();
});

function checkOnlineStatus() {
    const banner = document.getElementById('networkStatusBar');
    if (navigator.onLine) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'block';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const t = translations[currentLang];
    document.getElementById('headerTitle').innerText = t.headerTitle;
    document.getElementById('headerSub').innerText = t.headerSub;
    document.getElementById('authTitle').innerText = t.authTitle;
    document.getElementById('authSubText').innerText = t.authSubText;
    document.getElementById('lblEmail').innerText = t.lblEmail;
    document.getElementById('lblPass').innerText = t.lblPass;
    document.getElementById('authSubmitBtn').innerText = t.authSubmitBtn;
    document.getElementById('authSwitchText').innerHTML = t.authSwitchText;
    document.getElementById('footerText').innerText = t.footerText;

    // Update Menu Cards
    document.getElementById('menuNewPatientTitle').innerText = t.newPatient;
    document.getElementById('menuNewPatientSub').innerText = t.newPatientSub;
    document.getElementById('menuArchiveTitle').innerText = t.archive;
    document.getElementById('menuArchiveSub').innerText = t.archiveSub;
    document.getElementById('menuRxTitle').innerText = t.rxTemplate;
    document.getElementById('menuRxSub').innerText = t.rxTemplateSub;
    document.getElementById('menuSpecTitle').innerText = t.specialties;
    document.getElementById('menuSpecSub').innerText = t.specialtiesSub;
    document.getElementById('menuDictTitle').innerText = t.dictionary;
    document.getElementById('menuDictSub').innerText = t.dictionarySub;
    document.getElementById('menuAnalyticsTitle').innerText = t.analytics;
    document.getElementById('menuAnalyticsSub').innerText = t.analyticsSub;
    document.getElementById('menuBackupTitle').innerText = t.backup;
    document.getElementById('menuBackupSub').innerText = t.backupSub;
    document.getElementById('menuTrashTitle').innerText = t.trash;
    document.getElementById('menuTrashSub').innerText = t.trashSub;
    document.getElementById('menuSettingsTitle').innerText = t.settings;
    document.getElementById('menuSettingsSub').innerText = t.settingsSub;

    document.body.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.style.backgroundColor = '#020617';
        document.getElementById('darkModeIcon').className = 'fa-solid fa-sun';
        document.getElementById('dropDarkModeText').innerText = 'الوضع الفاتح';
    } else {
        document.body.style.backgroundColor = '#0f172a';
        document.getElementById('darkModeIcon').className = 'fa-solid fa-moon';
        document.getElementById('dropDarkModeText').innerText = 'وضع الظلام الطبي';
    }
}

function toggleDropdownMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('headerDropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function() {
    const menu = document.getElementById('headerDropdownMenu');
    if (menu) menu.style.display = 'none';
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('authPassword');
    const btn = document.getElementById('togglePasswordBtn');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        btn.className = 'fa-solid fa-eye-slash toggle-password';
    } else {
        passInput.type = 'password';
        btn.className = 'fa-solid fa-eye toggle-password';
    }
}

let isRegisterMode = false;
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById('authTitle');
    const sub = document.getElementById('authSubText');
    const btn = document.getElementById('authSubmitBtn');
    const switchTxt = document.getElementById('authSwitchText');
    const phoneBox = document.getElementById('registerPhoneBox');

    if (isRegisterMode) {
        title.innerText = "Register New Account";
        sub.innerText = "إنشاء حساب طبي جديد في عيادة ماستر";
        btn.innerText = "إنشاء الحساب";
        switchTxt.innerHTML = 'لديك حساب بالفعل؟ <span onclick="toggleAuthMode()">تسجيل الدخول</span>';
        phoneBox.style.display = 'block';
    } else {
        title.innerText = "User Login";
        sub.innerText = "تسجيل الدخول إلى نظام العيادة السحابي";
        btn.innerText = "تسجيل الدخول";
        switchTxt.innerHTML = 'ليس لديك حساب؟ <span onclick="toggleAuthMode()">سجل الآن</span>';
        phoneBox.style.display = 'none';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPassword').value;

    try {
        if (isRegisterMode) {
            const userCred = await auth.createUserWithEmailAndPassword(email, pass);
            currentUser = userCred.user;
            await saveUserDataToCloud();
            alert('تم إنشاء الحساب بنجاح!');
        } else {
            const userCred = await auth.signInWithEmailAndPassword(email, pass);
            currentUser = userCred.user;
            await loadUserDataFromCloud();
        }
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
        navigateToMainScreen();
    } catch (error) {
        alert('خطأ في المصادقة: ' + error.message);
    }
}

function logoutUser() {
    auth.signOut().then(() => {
        currentUser = null;
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('authScreen').style.display = 'flex';
    });
}

function resetPassword() {
    const email = document.getElementById('authEmail').value.trim();
    if (!email) {
        alert('يرجى إدخال البريد الإلكتروني أولاً لإرسال رابط إعادة تعيين كلمة المرور.');
        return;
    }
    auth.sendPasswordResetEmail(email).then(() => {
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.');
    }).catch(err => {
        alert('خطأ: ' + err.message);
    });
}

// Navigation Helper
let navigationStack = [];
function navigateTo(screenId, title, sub) {
    const screens = ['mainScreen', 'specialtiesDashboardScreen', 'permissionsScreen', 'backupScreen', 'settingsScreen', 'analyticsScreen', 'addPatientScreen', 'rxTemplateScreen', 'archiveScreen', 'trashScreen', 'medicalRecordScreen', 'dictScreen', 'networkScreen'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });

    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    const backBtn = document.getElementById('backBtn');
    if (screenId === 'mainScreen') {
        backBtn.style.display = 'none';
        navigationStack = [];
    } else {
        backBtn.style.display = 'flex';
        navigationStack.push(screenId);
    }

    if (title) document.getElementById('headerTitle').innerText = title;
    if (sub) document.getElementById('headerSub').innerText = sub;
}

function navigateToMainScreen() {
    navigateTo('mainScreen', translations[currentLang].headerTitle, translations[currentLang].headerSub);
}

function goBackScreen() {
    if (navigationStack.length > 1) {
        navigationStack.pop();
        const prev = navigationStack[navigationStack.length - 1];
        navigateTo(prev);
    } else {
        navigateToMainScreen();
    }
}

// Cloud Data Sync
async function saveUserDataToCloud() {
    if (!currentUser) return;
    const dataToSave = {
        patients: patients,
        specialtiesConfig: specialtiesConfig,
        medicalDictionary: medicalDictionary,
        rxTemplateDataUrl: rxTemplateDataUrl,
        rxLayoutPositions: rxLayoutPositions,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await db.collection('clinics').doc(currentUser.uid).set(dataToSave, { merge: true });
    } catch (err) {
        console.error('Error saving to cloud:', err);
    }
}

async function loadUserDataFromCloud() {
    if (!currentUser) return;
    try {
        const doc = await db.collection('clinics').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.patients) patients = data.patients;
            if (data.specialtiesConfig) {
                specialtiesConfig = data.specialtiesConfig;
                syncSpecialtiesCheckboxes();
            }
            if (data.medicalDictionary) medicalDictionary = data.medicalDictionary;
            if (data.rxTemplateDataUrl) {
                rxTemplateDataUrl = data.rxTemplateDataUrl;
                const img = document.getElementById('rxPreviewImg');
                img.src = rxTemplateDataUrl;
                img.style.display = 'block';
                document.getElementById('noRxText').style.display = 'none';
            }
            if (data.rxLayoutPositions) rxLayoutPositions = data.rxLayoutPositions;
        }
        navigateToMainScreen();
    } catch (err) {
        console.error('Error loading from cloud:', err);
        navigateToMainScreen();
    }
}

// Specialties Dashboard Logic
function openSpecialtiesDashboard() {
    syncSpecialtiesCheckboxes();
    navigateTo('specialtiesDashboardScreen', 'لوحة تحكم الاختصاصات', 'تخصيص وتفعيل الحقول الطبية');
}

function syncSpecialtiesCheckboxes() {
    // Shared fields
    document.getElementById('mod_chiefComplaint').checked = specialtiesConfig.chiefComplaint !== false;
    document.getElementById('mod_hpi').checked = specialtiesConfig.hpi !== false;
    document.getElementById('mod_ros').checked = specialtiesConfig.ros !== false;
    document.getElementById('mod_medHistory').checked = specialtiesConfig.medHistory !== false;
    document.getElementById('mod_vitals').checked = specialtiesConfig.vitals !== false;
    document.getElementById('mod_labs').checked = specialtiesConfig.labs !== false;
    document.getElementById('mod_scans').checked = specialtiesConfig.scans !== false;
    document.getElementById('mod_notes').checked = specialtiesConfig.notes !== false;
    document.getElementById('mod_rx').checked = specialtiesConfig.rx !== false;
    document.getElementById('mod_attachments').checked = specialtiesConfig.attachments !== false;

    // Advanced specialty fields
    document.getElementById('mod_obsGyn').checked = !!specialtiesConfig.obsGyn;
    document.getElementById('mod_ortho').checked = !!specialtiesConfig.ortho;
    document.getElementById('mod_neuro').checked = !!specialtiesConfig.neuro;
    document.getElementById('mod_peds').checked = !!specialtiesConfig.peds;
    document.getElementById('mod_derm').checked = !!specialtiesConfig.derm;
    document.getElementById('mod_ent').checked = !!specialtiesConfig.ent;
    document.getElementById('mod_ophthal').checked = !!specialtiesConfig.ophthal;
    document.getElementById('mod_cardio').checked = !!specialtiesConfig.cardio;
}

function saveSpecialtiesDashboardConfig() {
    specialtiesConfig.chiefComplaint = document.getElementById('mod_chiefComplaint').checked;
    specialtiesConfig.hpi = document.getElementById('mod_hpi').checked;
    specialtiesConfig.ros = document.getElementById('mod_ros').checked;
    specialtiesConfig.medHistory = document.getElementById('mod_medHistory').checked;
    specialtiesConfig.vitals = document.getElementById('mod_vitals').checked;
    specialtiesConfig.labs = document.getElementById('mod_labs').checked;
    specialtiesConfig.scans = document.getElementById('mod_scans').checked;
    specialtiesConfig.notes = document.getElementById('mod_notes').checked;
    specialtiesConfig.rx = document.getElementById('mod_rx').checked;
    specialtiesConfig.attachments = document.getElementById('mod_attachments').checked;

    specialtiesConfig.obsGyn = document.getElementById('mod_obsGyn').checked;
    specialtiesConfig.ortho = document.getElementById('mod_ortho').checked;
    specialtiesConfig.neuro = document.getElementById('mod_neuro').checked;
    specialtiesConfig.peds = document.getElementById('mod_peds').checked;
    specialtiesConfig.derm = document.getElementById('mod_derm').checked;
    specialtiesConfig.ent = document.getElementById('mod_ent').checked;
    specialtiesConfig.ophthal = document.getElementById('mod_ophthal').checked;
    specialtiesConfig.cardio = document.getElementById('mod_cardio').checked;

    saveUserDataToCloud();
    alert('تم حفظ إعدادات الاختصاصات والحقول الطبية بنجاح!');
    navigateToMainScreen();
}

// Patient Management
function saveNewPatient(e) {
    e.preventDefault();
    const name = document.getElementById('pName').value.trim();
    const subName = document.getElementById('pSubName').value.trim();
    const age = document.getElementById('pAge').value;
    const gender = document.getElementById('pGender').value;
    const marital = document.getElementById('pMarital').value;
    const job = document.getElementById('pJob').value;
    const phone = document.getElementById('pPhone').value.trim();
    const date = document.getElementById('pDate').value || new Date().toISOString().split('T')[0];

    const newPat = {
        id: 'pat_' + Date.now(),
        name: name,
        subName: subName,
        age: age,
        gender: gender,
        marital: marital,
        job: job,
        phone: phone,
        createdAt: date,
        visits: [
            {
                visitId: 'visit_' + Date.now(),
                date: date,
                chiefComplaint: '',
                hpi: '',
                ros: '',
                medHistory: { chronic: [], admission: '', surgery: '', family: '', allergy: '', chronicDrugs: '', smoking: 'Non-smoker', alcohol: 'Non-drinker', notes: '' },
                vitals: { bp: '', pulse: '', temp: '', weight: '', height: '', bmi: '' },
                labs: [],
                scans: [],
                notes: '',
                rx: [],
                attachments: [],
                specialtyData: {}
            }
        ],
        deleted: false
    };

    patients.unshift(newPat);
    activePatientId = newPat.id;
    saveUserDataToCloud();
    document.getElementById('patientForm').reset();
    openMedicalRecord(activePatientId);
}

function openPatientsArchive() {
    navigateTo('archiveScreen', 'أرشيف المرضى', 'بحث وسجل الزيارات');
    filterPatients();
}

function filterPatients() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const genderFilter = document.getElementById('filterGender').value;
    const ageGroupFilter = document.getElementById('filterAgeGroup').value;
    const sortFilter = document.getElementById('filterSort').value;

    let filtered = patients.filter(p => !p.deleted);

    if (q) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q)) || (p.subName && p.subName.toLowerCase().includes(q)));
    }

    if (genderFilter) {
        filtered = filtered.filter(p => p.gender === genderFilter);
    }

    if (ageGroupFilter) {
        filtered = filtered.filter(p => {
            const ageNum = parseInt(p.age) || 0;
            if (ageGroupFilter === 'child') return ageNum < 18;
            if (ageGroupFilter === 'adult') return ageNum >= 18 && ageNum <= 50;
            if (ageGroupFilter === 'senior') return ageNum > 50;
            return true;
        });
    }

    filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return sortFilter === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    const container = document.getElementById('patientsList');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b; font-size:0.85rem;">لا توجد نتائج مطابقة للبحث.</div>`;
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.style.cssText = 'cursor: pointer; transition: all 0.2s; margin-bottom: 10px; padding: 14px;';
        card.onclick = () => openMedicalRecord(p.id);
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <h4 style="font-family:'El Messiri',serif; font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:4px;">${p.name} ${p.subName ? '<span style="color:#64748b; font-size:0.85rem;">(' + p.subName + ')</span>' : ''}</h4>
                    <p style="font-size:0.8rem; color:#64748b; margin-bottom:6px;">العمر: ${p.age} سنة | الجنس: ${p.gender || 'غير محدد'} | الهاتف: ${p.phone || '—'}</p>
                </div>
                <div style="background:#f0fdfa; color:#0d9488; padding:4px 8px; border-radius:8px; font-size:0.75rem; font-weight:700;">
                    ${p.visits ? p.visits.length : 0} زيارة
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function openMedicalRecord(patientId) {
    activePatientId = patientId;
    const p = patients.find(x => x.id === patientId);
    if (!p) return;

    navigateTo('medicalRecordScreen', p.name, 'السجل الطبي الشامل');
    document.getElementById('recPatientName').innerText = p.name + (p.subName ? ' (' + p.subName + ')' : '');
    document.getElementById('recPatientMeta').innerHTML = `العمر: ${p.age} سنة | الجنس: ${p.gender || '—'} | الحالة: ${p.marital || '—'} | المهنة: ${p.job || '—'} | الهاتف: ${p.phone || '—'} | تاريخ التسجيل: ${p.createdAt || '—'}`;

    renderVisits(p);
}

function renderVisits(patient) {
    const container = document.getElementById('visitsContainer');
    container.innerHTML = '';

    if (!patient.visits || patient.visits.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b;">لا توجد زيارات مسجلة لهذا المريض.</div>`;
        return;
    }

    patient.visits.forEach((v, index) => {
        const visitCard = document.createElement('div');
        visitCard.className = 'group-card';
        visitCard.style.marginTop = '14px';

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:12px;">
                <span style="font-family:'El Messiri',serif; font-weight:700; color:#0f766e; font-size:0.95rem;">
                    <i class="fa-solid fa-calendar-day"></i> زيارة رقم (${patient.visits.length - index}) بتاريخ: <input type="date" value="${v.date}" onchange="updateVisitDate('${v.visitId}', this.value)" style="border:1px solid #cbd5e1; border-radius:6px; padding:2px 6px; font-size:0.8rem;">
                </span>
                <div style="display:flex; gap:6px;">
                    <button type="button" onclick="openRxModalForVisit('${v.visitId}')" style="background:#0d9488; color:white; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; font-weight:700; cursor:pointer;"><i class="fa-solid fa-file-prescription"></i> الروشتة</button>
                    <button type="button" onclick="deleteVisit('${v.visitId}')" style="background:#ef4444; color:white; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; font-weight:700; cursor:pointer;"><i class="fa-solid fa-trash"></i> حذف</button>
                </div>
            </div>
        `;

        // 1. Chief Complaint
        if (specialtiesConfig.chiefComplaint !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">الشكوى الرئيسية (Chief Complaint)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="1" placeholder="أدخل الشكوى الرئيسية للمريض..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'chiefComplaint')" onblur="hideVisitSuggestions('${v.visitId}', 'chiefComplaint')">${v.chiefComplaint || ''}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-chiefComplaint"></div>
                        <div class="live-save-bar" id="save-bar-${v.visitId}-chiefComplaint">
                            <span>حفظ في القاموس: "<strong id="line-text-${v.visitId}-chiefComplaint"></strong>"</span>
                            <button type="button" class="btn-live-save" onmousedown="saveVisitLineToDict(event, '${v.visitId}', 'chiefComplaint')">حفظ</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. History of Present Illness (HPI)
        if (specialtiesConfig.hpi !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">تاريخ المرض الحالي (History of Present Illness - HPI)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="2" placeholder="أدخل تفاصيل تطور المرض الحالي والأعراض..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'hpi')" onblur="hideVisitSuggestions('${v.visitId}', 'hpi')">${v.hpi || ''}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-hpi"></div>
                        <div class="live-save-bar" id="save-bar-${v.visitId}-hpi">
                            <span>حفظ في القاموس: "<strong id="line-text-${v.visitId}-hpi"></strong>"</span>
                            <button type="button" class="btn-live-save" onmousedown="saveVisitLineToDict(event, '${v.visitId}', 'hpi')">حفظ</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. Review of Other Systems (ROS)
        if (specialtiesConfig.ros !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">مراجعة بقية الأجهزة والأعراض (Review of Other Systems - ROS)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="2" placeholder="مراجعة بقية الأجهزة (CNS, CVS, RS, GIS, GUS)..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'ros')" onblur="hideVisitSuggestions('${v.visitId}', 'ros')">${v.ros || ''}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-ros"></div>
                        <div class="live-save-bar" id="save-bar-${v.visitId}-ros">
                            <span>حفظ في القاموس: "<strong id="line-text-${v.visitId}-ros"></strong>"</span>
                            <button type="button" class="btn-live-save" onmousedown="saveVisitLineToDict(event, '${v.visitId}', 'ros')">حفظ</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 4. Medical History Button / Summary
        if (specialtiesConfig.medHistory !== false) {
            html += `
                <div style="margin-bottom: 10px;">
                    <button type="button" onclick="openMedHistoryModalForVisit('${v.visitId}')" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; font-size:0.8rem; font-weight:700; cursor:pointer; color:#0f172a; width:100%; text-align:left; display:flex; justify-content:space-between; align-items:center;">
                        <span><i class="fa-solid fa-notes-medical" style="color:#0d9488;"></i> التاريخ المرضي والأمراض المزمنة (Medical History)</span>
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            `;
        }

        // 5. Vitals & BMI
        if (specialtiesConfig.vitals !== false) {
            html += `
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-bottom:10px;">
                    <div class="field-box" style="margin-bottom:0;">
                        <span class="field-label">ضغط الدم (BP mmHg)</span>
                        <div class="input-wrapper"><input type="text" value="${v.vitals.bp || ''}" placeholder="120/80" oninput="updateVisitVitals('${v.visitId}', 'bp', this.value)"></div>
                    </div>
                    <div class="field-box" style="margin-bottom:0;">
                        <span class="field-label">النبض (Pulse /min)</span>
                        <div class="input-wrapper"><input type="text" value="${v.vitals.pulse || ''}" placeholder="75" oninput="updateVisitVitals('${v.visitId}', 'pulse', this.value)"></div>
                    </div>
                    <div class="field-box" style="margin-bottom:0;">
                        <span class="field-label">الحرارة (°C)</span>
                        <div class="input-wrapper"><input type="text" value="${v.vitals.temp || ''}" placeholder="37" oninput="updateVisitVitals('${v.visitId}', 'temp', this.value)"></div>
                    </div>
                    <div class="field-box" style="margin-bottom:0; position:relative;">
                        <span class="field-label">الوزن وطول / BMI</span>
                        <div style="display:flex; gap:4px;">
                            <input type="number" value="${v.vitals.weight || ''}" placeholder="كجم" oninput="updateVisitVitals('${v.visitId}', 'weight', this.value)" style="flex:1;">
                            <input type="number" value="${v.vitals.height || ''}" placeholder="سم" oninput="updateVisitVitals('${v.visitId}', 'height', this.value)" style="flex:1;">
                            <button type="button" onclick="openBmiModalForVisit('${v.visitId}')" style="background:#0284c7; color:white; border:none; border-radius:6px; padding:4px 8px; cursor:pointer;" title="حساب كتلة الجسم"><i class="fa-solid fa-calculator"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 6. Labs & Scans
        if (specialtiesConfig.labs !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">تحاليل المختبر (Lab Tests)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="1" placeholder="اطلب التحاليل..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'labs')" onblur="hideVisitSuggestions('${v.visitId}', 'labs')">${Array.isArray(v.labs) ? v.labs.join(', ') : (v.labs || '')}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-labs"></div>
                    </div>
                </div>
            `;
        }

        if (specialtiesConfig.scans !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">الأشعة والرنين (Radiology & Scans)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="1" placeholder="اطلب الأشعة..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'scans')" onblur="hideVisitSuggestions('${v.visitId}', 'scans')">${Array.isArray(v.scans) ? v.scans.join(', ') : (v.scans || '')}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-scans"></div>
                    </div>
                </div>
            `;
        }

        // 7. Notes & Diagnosis
        if (specialtiesConfig.notes !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">التشخيص والملاحظات السريرية (Diagnosis & Notes)</span>
                    <div class="input-wrapper" style="position: relative;">
                        <textarea rows="2" placeholder="اكتب التشخيص والملاحظات..." oninput="handleVisitLiveInput(this, '${v.visitId}', 'notes')" onblur="hideVisitSuggestions('${v.visitId}', 'notes')">${v.notes || ''}</textarea>
                        <div class="suggestions-box" id="suggestions-${v.visitId}-notes"></div>
                        <div class="live-save-bar" id="save-bar-${v.visitId}-notes">
                            <span>حفظ في القاموس: "<strong id="line-text-${v.visitId}-notes"></strong>"</span>
                            <button type="button" class="btn-live-save" onmousedown="saveVisitLineToDict(event, '${v.visitId}', 'notes')">حفظ</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 8. RX Medications
        if (specialtiesConfig.rx !== false) {
            html += `
                <div class="field-box">
                    <span class="field-label">الوصفة الطبية والعلاجية (RX Medications)</span>
                    <div style="display:flex; gap:6px; margin-bottom:6px;">
                        <input type="text" id="drugInput-${v.visitId}" placeholder="اسم الدواء والجرعة..." style="flex:1; border:1px solid #cbd5e1; border-radius:8px; padding:6px 10px; font-size:0.85rem;" onkeydown="if(event.key==='Enter') { addDrugToVisit('${v.visitId}'); event.preventDefault(); }">
                        <button type="button" onclick="addDrugToVisit('${v.visitId}')" style="background:#0d9488; color:white; border:none; border-radius:8px; padding:6px 12px; font-size:0.8rem; font-weight:700; cursor:pointer;"><i class="fa-solid fa-plus"></i> إضافة</button>
                    </div>
                    <div id="rxList-${v.visitId}" style="display:flex; flex-direction:column; gap:4px;">
                        ${(v.rx || []).map((drug, dIndex) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 10px; border-radius:6px; font-size:0.82rem;">
                                <span><strong>${dIndex + 1}.</strong>${drug.name} — <span style="color:#0d9488;">${drug.dose}</span></span>
                                <button type="button" onclick="removeDrugFromVisit('${v.visitId}',${dIndex})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        visitCard.innerHTML = html;
        container.appendChild(visitCard);
    });
}

function addNewVisit() {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;

    const newV = {
        visitId: 'visit_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        chiefComplaint: '',
        hpi: '',
        ros: '',
        medHistory: { chronic: [], admission: '', surgery: '', family: '', allergy: '', chronicDrugs: '', smoking: 'Non-smoker', alcohol: 'Non-drinker', notes: '' },
        vitals: { bp: '', pulse: '', temp: '', weight: '', height: '', bmi: '' },
        labs: [],
        scans: [],
        notes: '',
        rx: [],
        attachments: [],
        specialtyData: {}
    };

    if (!p.visits) p.visits = [];
    p.visits.unshift(newV);
    saveUserDataToCloud();
    renderVisits(p);
}

function deleteVisit(visitId) {
    if (!confirm('هل أنت متأكد من حذف هذه الزيارة؟')) return;
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;

    p.visits = p.visits.filter(v => v.visitId !== visitId);
    saveUserDataToCloud();
    renderVisits(p);
}

function updateVisitDate(visitId, val) {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v) {
        v.date = val;
        saveUserDataToCloud();
    }
}

function updateVisitVitals(visitId, field, val) {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v) {
        v.vitals[field] = val;
        if (field === 'weight' || field === 'height') {
            const wt = parseFloat(v.vitals.weight);
            const ht = parseFloat(v.vitals.height);
            if (wt > 0 && ht > 0) {
                const bmi = (wt / Math.pow(ht / 100, 2)).toFixed(1);
                v.vitals.bmi = bmi;
            }
        }
        saveUserDataToCloud();
    }
}

// Live Autocomplete & Dictionary Management
function handleVisitLiveInput(textarea, visitId, fieldKey) {
    const val = textarea.value;
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v) {
        v[fieldKey] = val;
        saveUserDataToCloud();
    }

    const suggestionsBox = document.getElementById(`suggestions-${visitId}-${fieldKey}`);
    const saveBar = document.getElementById(`save-bar-${visitId}-${fieldKey}`);
    const lineText = document.getElementById(`line-text-${visitId}-${fieldKey}`);

    let dictKey = fieldKey;
    if (fieldKey === 'labs' || fieldKey === 'scans' || fieldKey === 'notes' || fieldKey === 'chiefComplaint' || fieldKey === 'hpi' || fieldKey === 'ros') {
        // maps correctly to medicalDictionary keys
    }

    const terms = medicalDictionary[dictKey] || [];
    const query = val.trim().toLowerCase();

    if (query.length > 0) {
        const matches = terms.filter(t => {
            const str = typeof t === 'string' ? t : (t.name + ' ' + t.dose);
            return str.toLowerCase().includes(query);
        });

        if (matches.length > 0) {
            suggestionsBox.innerHTML = matches.map(m => {
                const displayStr = typeof m === 'string' ? m : `${m.name} (${m.dose})`;
                return `<div class="suggestion-item" onclick="selectVisitSuggestion('${visitId}', '${fieldKey}', '${displayStr.replace(/'/g, "\\'")}')">${displayStr}</div>`;
            }).join('');
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }

        if (saveBar) {
            lineText.innerText = val;
            saveBar.style.display = 'flex';
        }
    } else {
        suggestionsBox.style.display = 'none';
        if (saveBar) saveBar.style.display = 'none';
    }
}

function hideVisitSuggestions(visitId, fieldKey) {
    setTimeout(() => {
        const sb = document.getElementById(`suggestions-${visitId}-${fieldKey}`);
        if (sb) sb.style.display = 'none';
    }, 250);
}

function selectVisitSuggestion(visitId, fieldKey, val) {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v) {
        v[fieldKey] = val;
        saveUserDataToCloud();
        renderVisits(p);
    }
}

function saveVisitLineToDict(e, visitId, fieldKey) {
    e.preventDefault();
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (!v) return;

    const val = v[fieldKey];
    if (val && !medicalDictionary[fieldKey].includes(val)) {
        medicalDictionary[fieldKey].push(val);
        saveUserDataToCloud();
        alert('تم حفظ العبارة في القاموس الطبي بنجاح!');
        const saveBar = document.getElementById(`save-bar-${visitId}-${fieldKey}`);
        if (saveBar) saveBar.style.display = 'none';
    }
}

// Dictionary Manager Screen
function openDictionaryManager() {
    navigateTo('dictScreen', 'القاموس الطبي', 'إدارة الأدوية والمصطلحات الطبية');
    renderDictTerms();
}

function renderDictTerms() {
    const cat = document.getElementById('dictCategorySelect').value;
    const list = document.getElementById('dictItemsList');
    list.innerHTML = '';

    const terms = medicalDictionary[cat] || [];

    let html = `
        <div style="display:flex; gap:6px; margin-bottom:14px;">
            <input type="text" id="newDictTermInput" placeholder="أضف مصطلح أو دواء جديد..." style="flex:1; border:1px solid #cbd5e1; border-radius:8px; padding:8px 12px; font-size:0.85rem;">
            <button type="button" onclick="addNewDictTerm()" style="background:#0d9488; color:white; border:none; border-radius:8px; padding:8px 16px; font-size:0.85rem; font-weight:700; cursor:pointer;"><i class="fa-solid fa-plus"></i> إضافة</button>
        </div>
    `;

    terms.forEach((t, idx) => {
        const displayStr = typeof t === 'string' ? t : `${t.name} — ${t.dose}`;
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; border-radius:8px; margin-bottom:6px; font-size:0.85rem;">
                <span>${displayStr}</span>
                <button type="button" onclick="deleteDictTerm('${cat}', ${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });

    list.innerHTML = html;
}

function addNewDictTerm() {
    const cat = document.getElementById('dictCategorySelect').value;
    const input = document.getElementById('newDictTermInput');
    const val = input.value.trim();
    if (!val) return;

    if (!medicalDictionary[cat]) medicalDictionary[cat] = [];
    medicalDictionary[cat].push(val);
    saveUserDataToCloud();
    input.value = '';
    renderDictTerms();
}

function deleteDictTerm(cat, index) {
    if (!medicalDictionary[cat]) return;
    medicalDictionary[cat].splice(index, 1);
    saveUserDataToCloud();
    renderDictTerms();
}

// RX & PDF Export Functions
let activeRxVisitId = null;
function openRxModalForVisit(visitId) {
    activeRxVisitId = visitId;
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (!v) return;

    document.getElementById('rxDragPatientDetailsText').innerText = `Name: ${p.name} | Age: ${p.age} | Gender: ${p.gender || '—'}`;
    document.getElementById('rxDragDateText').innerText = `Date: ${v.date}`;
    document.getElementById('rxDragVitalsText').innerText = `BP: ${v.vitals.bp || '—'} | Pulse: ${v.vitals.pulse || '—'} | Weight: ${v.vitals.weight || '—'}kg | BMI: ${v.vitals.bmi || '—'}`;
    
    document.getElementById('rxDragTreatmentText').innerHTML = (v.rx || []).map((d, i) => `<strong>${i + 1}.</strong> ${d.name} (${d.dose})`).join('<br>');

    document.getElementById('rxModal').style.display = 'flex';
}

function closeRxModal() {
    document.getElementById('rxModal').style.display = 'none';
}

function addDrugToVisit(visitId) {
    const input = document.getElementById(`drugInput-${visitId}`);
    const val = input.value.trim();
    if (!val) return;

    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v) {
        if (!v.rx) v.rx = [];
        v.rx.push({ name: val, dose: '1 tab daily' });
        saveUserDataToCloud();
        input.value = '';
        renderVisits(p);
    }
}

function removeDrugFromVisit(visitId, dIndex) {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (v && v.rx) {
        v.rx.splice(dIndex, 1);
        saveUserDataToCloud();
        renderVisits(p);
    }
}

function openRxTemplateManager() {
    navigateTo('rxTemplateScreen', 'ترويسة الروشتة', 'صورة ترويسة الوصفة الطبية');
}

function saveRxTemplateImage() {
    const fileInput = document.getElementById('rxImageFileInput');
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            rxTemplateDataUrl = e.target.result;
            const img = document.getElementById('rxPreviewImg');
            img.src = rxTemplateDataUrl;
            img.style.display = 'block';
            document.getElementById('noRxText').style.display = 'none';
            saveUserDataToCloud();
            alert('تم حفظ صورة ترويسة الروشتة بنجاح!');
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert('يرجى اختيار صورة أولاً.');
    }
}

let isRxConfigMode = false;
function toggleRxConfigMode() {
    isRxConfigMode = !isRxConfigMode;
    const btn = document.getElementById('rxConfigToggleBtn');
    const saveBtn = document.getElementById('rxSaveLayoutBtn');
    const boxes = document.querySelectorAll('.draggable-box');

    if (isRxConfigMode) {
        btn.style.background = '#0d9488';
        btn.style.color = '#fff';
        saveBtn.style.display = 'block';
        boxes.forEach(b => b.classList.add('config-active'));
    } else {
        btn.style.background = '#f0fdfa';
        btn.style.color = '#0d9488';
        saveBtn.style.display = 'none';
        boxes.forEach(b => b.classList.remove('config-active'));
    }
}

function changeBoxFontSize(boxName, delta) {
    if (rxLayoutPositions[boxName]) {
        rxLayoutPositions[boxName].fontSize = Math.max(8, (rxLayoutPositions[boxName].fontSize || 12) + delta);
        applyRxLayoutPositions();
    }
}

function saveRxLayoutPositions() {
    saveUserDataToCloud();
    toggleRxConfigMode();
    alert('تم حفظ تخطيط الروشتة والخطوط بنجاح!');
}

function applyRxLayoutPositions() {
    for (const key in rxLayoutPositions) {
        const box = document.getElementById(`dragBox${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (box) {
            box.style.top = rxLayoutPositions[key].top + 'px';
            box.style.left = rxLayoutPositions[key].left + 'px';
            box.style.fontSize = rxLayoutPositions[key].fontSize + 'px';
        }
    }
}

function initDragAndDropRx() {
    // Simple drag implementation for RX canvas boxes
    let activeBox = null;
    let startX = 0, startY = 0;

    document.querySelectorAll('.draggable-box').forEach(box => {
        box.addEventListener('mousedown', (e) => {
            if (!isRxConfigMode) return;
            activeBox = box;
            startX = e.clientX - box.offsetLeft;
            startY = e.clientY - box.offsetTop;
            e.stopPropagation();
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeBox || !isRxConfigMode) return;
        const x = e.clientX - startX;
        const y = e.clientY - startY;
        activeBox.style.left = x + 'px';
        activeBox.style.top = y + 'px';

        const boxKey = activeBox.id.replace('dragBox', '').toLowerCase();
        if (rxLayoutPositions[boxKey]) {
            rxLayoutPositions[boxKey].left = x;
            rxLayoutPositions[boxKey].top = y;
        }
    });

    document.addEventListener('mouseup', () => {
        activeBox = null;
    });
}

function openPrescriptionPDF() {
    printPrescriptionDirectly();
}

function exportPatientMedicalReportPDF() {
    alert('جارٍ إعداد وتصدير التقرير الطبي الشامل بصيغة PDF...');
}

// Backup & Trash Management
function openBackupManager() {
    navigateTo('backupScreen', 'النسخ الاحتياطي', 'تصدير أو استلاف ملف البيانات');
}

function exportJsonBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        patients: patients,
        specialtiesConfig: specialtiesConfig,
        medicalDictionary: medicalDictionary,
        rxTemplateDataUrl: rxTemplateDataUrl
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `ClinicMaster_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
}

function restoreFromUploadedFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const json = JSON.parse(e.target.result);
            if (json.patients) patients = json.patients;
            if (json.specialtiesConfig) specialtiesConfig = json.specialtiesConfig;
            if (json.medicalDictionary) medicalDictionary = json.medicalDictionary;
            if (json.rxTemplateDataUrl) rxTemplateDataUrl = json.rxTemplateDataUrl;
            saveUserDataToCloud();
            alert('تم استعادة النسخة الاحتياطية بنجاح!');
            navigateToMainScreen();
        } catch (err) {
            alert('ملف النسخة الاحتياطية غير صالح: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function openTrashBin() {
    navigateTo('trashScreen', 'سلة المهملات', 'استعادة العناصر المحذوفة');
    renderTrashItems();
}

function renderTrashItems() {
    const container = document.getElementById('trashItemsContainer');
    const deletedPatients = patients.filter(p => p.deleted);
    container.innerHTML = '';

    if (deletedPatients.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:#64748b; font-size:0.85rem;">سلة المهملات فارغة.</div>`;
        return;
    }

    deletedPatients.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = 'background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;';
        item.innerHTML = `
            <span>${p.name} (${p.phone || 'بدون هاتف'})</span>
            <button onclick="restorePatient('${p.id}')" style="background:#0d9488; color:white; border:none; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer;">استعادة</button>
        `;
        container.appendChild(item);
    });
}

function restorePatient(id) {
    const p = patients.find(x => x.id === id);
    if (p) {
        p.deleted = false;
        saveUserDataToCloud();
        renderTrashItems();
    }
}

function confirmDeletePatientRecord() {
    if (!confirm('هل أنت متأكد من حذف هذا المريض ونقله إلى سلة المهملات؟')) return;
    const p = patients.find(x => x.id === activePatientId);
    if (p) {
        p.deleted = true;
        saveUserDataToCloud();
        navigateToMainScreen();
    }
}

// Analytics & Settings
function openAnalyticsDashboard() {
    navigateTo('analyticsScreen', 'إحصائيات العيادة', 'مؤشرات الأداء ونسب المرضى');
    calculateAnalytics();
}

function calculateAnalytics() {
    const active = patients.filter(p => !p.deleted);
    document.getElementById('statTotalPatients').innerText = active.length;
    
    const today = new Date().toISOString().split('T')[0];
    let todayVisitsCount = 0;
    let maleCount = 0;
    let femaleCount = 0;

    active.forEach(p => {
        if (p.gender === 'Male') maleCount++;
        if (p.gender === 'Female') femaleCount++;
        if (p.visits) {
            p.visits.forEach(v => {
                if (v.date === today) todayVisitsCount++;
            });
        }
    });

    document.getElementById('statTodayVisits').innerText = todayVisitsCount;
    document.getElementById('statMaleCount').innerText = maleCount;
    document.getElementById('statFemaleCount').innerText = femaleCount;

    const totalMF = maleCount + femaleCount;
    const malePct = totalMF > 0 ? Math.round((maleCount / totalMF) * 100) : 50;
    const femalePct = totalMF > 0 ? (100 - malePct) : 50;

    document.getElementById('ratioMaleBar').style.width = malePct + '%';
    document.getElementById('ratioFemaleBar').style.width = femalePct + '%';
    document.getElementById('ratioMaleText').innerText = `Male: ${malePct}%`;
    document.getElementById('ratioFemaleText').innerText = `Female: ${femalePct}%`;

    // Top prescribed drugs
    const drugCounts = {};
    active.forEach(p => {
        if (p.visits) {
            p.visits.forEach(v => {
                if (v.rx) {
                    v.rx.forEach(d => {
                        drugCounts[d.name] = (drugCounts[d.name] || 0) + 1;
                    });
                }
            });
        }
    });

    const sortedDrugs = Object.entries(drugCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDrugsList = document.getElementById('topDrugsList');
    topDrugsList.innerHTML = sortedDrugs.length === 0 ? '<span style="font-size:0.8rem; color:#64748b;">لا توجد وصفات مسجلة بعد.</span>' : sortedDrugs.map(d => `
        <div style="display:flex; justify-content:space-between; background:#f8fafc; border:1px solid #e2e8f0; padding:6px 10px; border-radius:6px; font-size:0.82rem;">
            <span>${d[0]}</span>
            <span style="font-weight:700; color:#0d9488;">${d[1]} مرة</span>
        </div>
    `).join('');
}

function openAccountSettings() {
    navigateTo('settingsScreen', 'إعدادات الحساب', 'خيارات البريد وكلمة المرور');
    if (currentUser) {
        document.getElementById('currentAccountEmail').value = currentUser.email || '';
    }
}

function updateAccountEmail() {
    const newEmail = document.getElementById('newEmailAddress').value.trim();
    const pass = document.getElementById('confirmEmailPass').value;
    if (!newEmail || !pass) {
        alert('يرجى إدخال البريد الجديد وكلمة المرور الحالية.');
        return;
    }
    const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, pass);
    currentUser.reauthenticateWithCredential(cred).then(() => {
        currentUser.updateEmail(newEmail).then(() => {
            alert('تم تحديث البريد الإلكتروني بنجاح!');
            openAccountSettings();
        }).catch(err => alert('خطأ: ' + err.message));
    }).catch(err => alert('كلمة المرور غير صحيحة: ' + err.message));
}

function updateAccountPassword() {
    const newPass = document.getElementById('newAccountPassword').value;
    if (!newPass || newPass.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
        return;
    }
    currentUser.updatePassword(newPass).then(() => {
        alert('تم تغيير كلمة المرور بنجاح!');
        document.getElementById('newAccountPassword').value = '';
    }).catch(err => alert('خطأ: ' + err.message));
}

function sendPasswordResetEmailFromSettings() {
    if (!currentUser || !currentUser.email) return;
    auth.sendPasswordResetEmail(currentUser.email).then(() => {
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.');
    });
}

// Modals Support & BMI
function openSupportModal() {
    document.getElementById('supportModal').style.display = 'flex';
}
function closeSupportModal() {
    document.getElementById('supportModal').style.display = 'none';
}
let activeBmiVisitId = null;
function openBmiModalForVisit(visitId) {
    activeBmiVisitId = visitId;
    document.getElementById('bmiCalculatorModal').style.display = 'flex';
}
function closeBmiModal() {
    document.getElementById('bmiCalculatorModal').style.display = 'none';
    const p = patients.find(x => x.id === activePatientId);
    if (p) renderVisits(p);
}
function calculateBmiLive() {
    const wt = parseFloat(document.getElementById('bmiWeight').value);
    const ht = parseFloat(document.getElementById('bmiHeight').value);
    const scoreDisp = document.getElementById('bmiScoreDisplay');
    const badge = document.getElementById('bmiBadgeContainer');

    if (wt > 0 && ht > 0) {
        const bmi = (wt / Math.pow(ht / 100, 2)).toFixed(1);
        scoreDisp.innerText = bmi;
        let cat = '';
        let bg = '';
        if (bmi < 18.5) { cat = 'نحافة (Underweight)'; bg = '#38bdf8'; }
        else if (bmi < 25) { cat = 'وزن مثالي (Normal)'; bg = '#10b981'; }
        else if (bmi < 30) { cat = 'زيادة وزن (Overweight)'; bg = '#f59e0b'; }
        else { cat = 'سمنة مفرطة (Obese)'; bg = '#ef4444'; }
        badge.innerHTML = `<span class="bmi-badge" style="background:${bg}; color:#fff;">${cat}</span>`;

        if (activeBmiVisitId) {
            const p = patients.find(x => x.id === activePatientId);
            if (p) {
                const v = p.visits.find(x => x.visitId === activeBmiVisitId);
                if (v) {
                    v.vitals.weight = wt;
                    v.vitals.height = ht;
                    v.vitals.bmi = bmi;
                    saveUserDataToCloud();
                }
            }
        }
    } else {
        scoreDisp.innerText = '—';
        badge.innerHTML = `<span class="bmi-badge" style="background:#f1f5f9; color:#64748b;">أدخل الوزن والطول للحساب</span>`;
    }
}

let activeMedHistoryVisitId = null;
function openMedHistoryModalForVisit(visitId) {
    activeMedHistoryVisitId = visitId;
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    const v = p.visits.find(x => x.visitId === visitId);
    if (!v) return;

    if (!v.medHistory) v.medHistory = { chronic: [], admission: '', surgery: '', family: '', allergy: '', chronicDrugs: '', smoking: 'Non-smoker', alcohol: 'Non-drinker', notes: '' };
    
    // Load data into modal fields
    document.querySelectorAll('.mh-cd').forEach(cb => {
        cb.checked = v.medHistory.chronic.includes(cb.value);
    });
    document.getElementById('mh-prev-admission').value = v.medHistory.admission || '';
    document.getElementById('mh-past-surgery').value = v.medHistory.surgery || '';
    document.getElementById('mh-family-history').value = v.medHistory.family || '';
    document.getElementById('mh-drug-allergy').value = v.medHistory.allergy || '';
    document.getElementById('mh-chronic-drugs').value = v.medHistory.chronicDrugs || '';
    document.getElementById('mh-smoking').value = v.medHistory.smoking || 'Non-smoker';
    document.getElementById('mh-alcohol').value = v.medHistory.alcohol || 'Non-drinker';
    document.getElementById('mh-notes').value = v.medHistory.notes || '';

    document.getElementById('medHistoryModal').style.display = 'flex';
}

function closeMedHistoryModal() {
    if (activeMedHistoryVisitId) {
        const p = patients.find(x => x.id === activePatientId);
        if (p) {
            const v = p.visits.find(x => x.visitId === activeMedHistoryVisitId);
            if (v) {
                const chronic = [];
                document.querySelectorAll('.mh-cd:checked').forEach(cb => chronic.push(cb.value));
                v.medHistory = {
                    chronic: chronic,
                    admission: document.getElementById('mh-prev-admission').value,
                    surgery: document.getElementById('mh-past-surgery').value,
                    family: document.getElementById('mh-family-history').value,
                    allergy: document.getElementById('mh-drug-allergy').value,
                    chronicDrugs: document.getElementById('mh-chronic-drugs').value,
                    smoking: document.getElementById('mh-smoking').value,
                    alcohol: document.getElementById('mh-alcohol').value,
                    notes: document.getElementById('mh-notes').value
                };
                saveUserDataToCloud();
                renderVisits(p);
            }
        }
    }
    document.getElementById('medHistoryModal').style.display = 'none';
}

function toggleOtherInput() {
    const box = document.getElementById('mh-other-box');
    box.style.display = document.getElementById('mh-other-check').checked ? 'block' : 'none';
}

function handleMhLiveInput(textarea, key) {
    // MH live input logic
}
function hideMhSuggestions(key) {}
function saveMhLineToDict(e, key) { e.preventDefault(); }
function openEditPatientModal() {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    document.getElementById('editPName').value = p.name || '';
    document.getElementById('editPSubName').value = p.subName || '';
    document.getElementById('editPAge').value = p.age || '';
    document.getElementById('editPGender').value = p.gender || '';
    document.getElementById('editPMarital').value = p.marital || '';
    document.getElementById('editPJob').value = p.job || '';
    document.getElementById('editPPhone').value = p.phone || '';
    document.getElementById('editPatientModal').style.display = 'flex';
}
function closeEditPatientModal() {
    document.getElementById('editPatientModal').style.display = 'none';
}
function saveEditedPatient() {
    const p = patients.find(x => x.id === activePatientId);
    if (!p) return;
    p.name = document.getElementById('editPName').value.trim();
    p.subName = document.getElementById('editPSubName').value.trim();
    p.age = document.getElementById('editPAge').value;
    p.gender = document.getElementById('editPGender').value;
    p.marital = document.getElementById('editPMarital').value;
    p.job = document.getElementById('editPJob').value;
    p.phone = document.getElementById('editPPhone').value.trim();
    saveUserDataToCloud();
    closeEditPatientModal();
    openMedicalRecord(p.id);
}
function closeImagePreview() {
    document.getElementById('imagePreviewModal').style.display = 'none';
}
