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
let targetNodeUidToDelete = null;
let targetNodeEmailToDelete = null;
let targetNodeUidForNameEdit = null;

let specialtyConfig = JSON.parse(localStorage.getItem('clinic_specialty_config')) || {
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
        regEmailLabel: "البريد الإلكتروني",
        regPhoneLabel: "رقم الموبايل (اختياري)",
        passLabel: "كلمة المرور",
        forgotPass: "نسيت كلمة المرور؟",
        btnLogin: "تسجيل الدخول",
        btnRegister: "إنشاء الحساب",
        switchRegister: "ليس لديك حساب؟ <span onclick=\"toggleAuthMode()\">سجل الآن</span>",
        switchLogin: "لديك حساب بالفعل؟ <span onclick=\"toggleAuthMode()\">سجل الدخول</span>",
        
        activTitle: "تفعيل الحساب مطلوب",
        activSub: "يرجى إدخال رمز التفعيل أو الاشتراك الخاص بك.",
        lblActivCode: "رمز التفعيل / الاشتراك",
        btnActivate: "تفعيل النظام",

        headerTitle: "نظام عيادة ماستر",
        headerSub: "لوحة التحكم السحابية الآمنة",
        txtBack: "رجوع",
        dropLang: "تغيير اللغة (عربي / English)",
        dropDarkMode: "وضع الظلام الطبي",
        dropSupport: "الدعم الفني والاشتراك",
        dropLogout: "تسجيل الخروج",

        group1: "العمليات اليومية",
        newPatient: "مريض جديد",
        newPatientSub: "تسجيل وحفظ السجلات",
        archive: "أرشيف المرضى",
        archiveSub: "البحث وسجل الزيارات",

        group2: "الوصفات والأدوات الطبية",
        rxTemplate: "قالب الوصفة (RX)",
        rxTemplateSub: "صورة ترويسة الوصفة",
        specialtiesDash: "لوحة تحكم الاختصاصات",
        specialtiesDashSub: "تخصيص وتفعيل الحقول الطبية",
        dict: "القاموس الطبي",
        dictSub: "إدارة الأدوية والجرعات",

        group3: "التقارير والإحصائيات",
        analytics: "إحصائيات العيادة والتقارير",
        analyticsSub: "مؤشرات الأداء، نسب المرضى والأدوية الأكثر صرفاً",

        group4: "النظام والصيانة",
        backup: "النسخ الاحتياطي واستعادة البيانات",
        backupSub: "تصدير أو رفع ملف البيانات",
        trash: "سلة المهملات",
        trashSub: "استعادة العناصر المحذوفة",
        settings: "إعدادات الحساب",
        settingsSub: "خيارات البريد وكلمة المرور",
        permissions: "إدارة السكرتير",
        permissionsSub: "إنشاء الحساب والصلاحيات",
        networkDb: "قاعدة بيانات الشبكة",
        networkDbSub: "المستخدمين وبيانات الدخول",

        footer: "نظام عيادة ماستر المتقدم v17.28",

        patInfoTitle: "المعلومات الشخصية",
        lblPatName: "الاسم الكامل *",
        lblPatSubName: "اسم الجد الرابع / العشيرة / ملاحظة (اختياري)",
        lblPatAge: "العمر *",
        lblPatGender: "الجنس",
        optSelGender: "اختر الجنس",
        optMale: "ذكر",
        optFemale: "أنثى",
        lblPatMarital: "الحالة الزوجية",
        optSelMarital: "اختر الحالة",
        optSingle: "أعزب / عزباء",
        optMarried: "متزوج / متزوجة",
        optDivorced: "مطلق / مطلقة",
        optWidow: "أرمل / أرملة",
        lblPatJob: "المهنة",
        optSelJob: "اختر المهنة",
        optJobEmp: "موظف",
        optJobFree: "عمل حر",
        optJobHouse: "ربة منزل",
        optJobStud: "طالب",
        optJobOther: "أخرى",
        lblPatPhone: "رقم الهاتـف",
        lblPatDate: "تاريخ الزيارة الأولية",
        btnSavePatRec: "حفظ وفتح السجل الطبي",

        searchPlaceholder: "🔍 البحث بالاسم أو رقم الهاتف...",
        optAllGenders: "جميع الأجناس",
        optFilterMale: "ذكور",
        optFilterFemale: "إناث",
        optAllAges: "جميع الأعمار",
        optChild: "أطفال (< 18)",
        optAdult: "بالغين (18 - 50)",
        optSenior: "كبار السن (> 50)",
        sortNewest: "الأحدث أولاً",
        sortOldest: "الأقدم أولاً",

        txtEdit: "تعديل",
        txtDelete: "حذف",
        btnDownloadPDF: "تحميل تقرير ملف المريض الشامل PDF",
        btnAddVisit: "+ إضافة زيارة جديدة",

        optCatDrugs: "الأدوية والجرعات",
        optCatLabs: "تحاليل المختبر",
        optCatScans: "الأشعة والرنين",
        optCatNotes: "التشخيص والملاحظات",
        optCatMh: "مصطلحات التاريخ المرضي",

        trashTitleText: "سلة المهملات",
        txtEmptyTranslation: "إفراغ سلة المهملات",
        trashSubText: "يمكنك استعادة المرضى أو الزيارات المحذوفة إلى أماكنها الأصلية فوراً.",

        chronicNames: {
            "Hypertension": "ارتفاع ضغط الدم",
            "Diabetes": "مرض السكري",
            "Asthma": "الربو",
            "Epilepsy": "الصرع",
            "Arthritis": "التهاب المفاصل",
            "Malignancy": "أورام خبيثة",
            "Hepatitis": "التهاب الكبد الوبائي",
            "Chronic kidney dis": "أمراض الكلى المزمنة",
            "IHD": "قصور الشريان التاجي"
        },
        mhOtherText: "أخرى",
        mhLblChronic: "الأمراض المزمنة",
        mhLblAdmission: "الدخول السابق للمستشفى",
        mhLblSurgery: "العمليات الجراحية السابقة",
        mhLblFamily: "التاريخ العائلي",
        mhLblAllergy: "حساسية الأدوية",
        mhLblChronicDrugs: "استخدام الأدوية المزمنة",
        mhLblSmoking: "حالة التدخين",
        mhLblAlcohol: "تناول الكحول",
        mhLblNotes: "ملاحظات إضافية",
        btnMhDone: "تم الحفظ",
        optSmok1: "غير مدخن",
        optSmok2: "مدخن",
        optSmok3: "مدخن سلبي",
        optAlc1: "لا يتناول الكحول",
        optAlc2: "مدمن كحول",
        optAlc3: "شارب اجتماعي",
        bmiTitleText: "حساب مؤشر كتلة الجسم",
        lblBmiWeight: "الوزن (كغ)",
        lblBmiHeight: "الطول (سم)",
        lblBmiScore: "مؤشر كتلة الجسم (BMI):",
        bmiBadgeInitial: "أدخل الوزن والطول للحساب",
        btnBmiAgree: "موافق وحفظ",
        editPatHeader: "تعديل معلومات المريض",
        editLblName: "الاسم الكامل *",
        editLblSubName: "اسم الجد الرابع / العشيرة / ملاحظة (اختياري)",
        editLblAge: "العمر *",
        editLblGender: "الجنس",
        editOptGender: "اختر الجنس",
        editOptMale: "ذكر",
        editOptFemale: "أنثى",
        editLblMarital: "الحالة الزوجية",
        editOptMarital: "اختر الحالة",
        editOptSingle: "أعزب / عزباء",
        editOptMarried: "متزوج / متزوجة",
        editOptDivorced: "مطلق / مطلقة",
        editOptWidow: "أرمل / أرملة",
        editLblJob: "المهنة",
        editOptJob: "اختر المهنة",
        editLblPhone: "رقم الهاتف",
        btnSaveEdit: "حفظ التغييرات"
    },
    en: {
        loginTitle: "User Login",
        loginSub: "Sign in securely to your clinic cloud system",
        registerTitle: "Register New Account",
        registerSub: "Create a new account to manage your clinic efficiently",
        emailLabel: "Email or Phone Number",
        regEmailLabel: "Email Address",
        regPhoneLabel: "Phone Number (Optional)",
        passLabel: "Password",
        forgotPass: "Forgot Password?",
        btnLogin: "Login",
        btnRegister: "Register Account",
        switchRegister: "Don't have an account? <span onclick=\"toggleAuthMode()\">Register Now</span>",
        switchLogin: "Already have an account? <span onclick=\"toggleAuthMode()\">Login</span>",
        
        activTitle: "Account Activation Required",
        activSub: "Please enter your activation code.",
        lblActivCode: "Activation / Subscription Code",
        btnActivate: "Activate System",

        headerTitle: "Clinic Master System",
        headerSub: "Cloud Secure Dashboard",
        txtBack: "Back",
        dropLang: "Switch Language",
        dropDarkMode: "Medical Dark Mode",
        dropSupport: "Technical Support",
        dropLogout: "Logout",

        group1: "Daily Operations",
        newPatient: "New Patient",
        newPatientSub: "Register & save records",
        archive: "Patients Archive",
        archiveSub: "Search & visit history",

        group2: "RX & Medical Tools",
        rxTemplate: "RX Template",
        rxTemplateSub: "Prescription header image",
        specialtiesDash: "Specialties Dashboard",
        specialtiesDashSub: "Customize and enable clinical fields",
        dict: "Medical Dictionary",
        dictSub: "Manage drugs & doses",

        group3: "Reports & Stats",
        analytics: "Clinic Analytics & Stats",
        analyticsSub: "Performance metrics, patient ratios & top prescribed medications",

        group4: "System & Maintenance",
        backup: "Backup & Restore",
        backupSub: "Export or upload data file",
        trash: "Trash Bin",
        trashSub: "Recover deleted items",
        settings: "Account Settings",
        settingsSub: "Email & password options",
        permissions: "Secretary Management",
        permissionsSub: "Create account & permissions",
        networkDb: "Network Database",
        networkDbSub: "Users & credentials",

        footer: "Clinic Master Network v17.28",

        patInfoTitle: "Personal Information",
        lblPatName: "Full Name *",
        lblPatSubName: "Grandfather Name / Tribe / Note (Optional)",
        lblPatAge: "Age *",
        lblPatGender: "Gender",
        optSelGender: "Select Gender",
        optMale: "Male",
        optFemale: "Female",
        lblPatMarital: "Marital Status",
        optSelMarital: "Select Status",
        optSingle: "Single",
        optMarried: "Married",
        optDivorced: "Divorced",
        optWidow: "Widow",
        lblPatJob: "Occupation",
        optSelJob: "Select Occupation",
        optJobEmp: "Employee",
        optJobFree: "Free Business",
        optJobHouse: "Housewife",
        optJobStud: "Student",
        optJobOther: "Other",
        lblPatPhone: "Phone Number",
        lblPatDate: "Initial Visit Date",
        btnSavePatRec: "Save & Open Medical Record",

        searchPlaceholder: "🔍 Search by Name or Phone Number...",
        optAllGenders: "All Genders",
        optFilterMale: "Male",
        optFilterFemale: "Female",
        optAllAges: "All Age Groups",
        optChild: "Children (< 18)",
        optAdult: "Adults (18 - 50)",
        optSenior: "Seniors (> 50)",
        sortNewest: "Newest First",
        sortOldest: "Oldest First",

        txtEdit: "Edit",
        txtDelete: "Delete",
        btnDownloadPDF: "Download Comprehensive PDF Report",
        btnAddVisit: "+ Add New Visit",

        optCatDrugs: "Medications & Doses",
        optCatLabs: "Lab Tests",
        optCatScans: "Radiology & Scans",
        optCatNotes: "Diagnosis & Notes",
        optCatMh: "Medical History Terms",

        trashTitleText: "Trash Bin",
        txtEmptyTranslation: "Empty Trash",
        trashSubText: "You can restore deleted patients or specific visits back to their original locations instantly.",

        chronicNames: {
            "Hypertension": "Hypertension",
            "Diabetes": "Diabetes",
            "Asthma": "Asthma",
            "Epilepsy": "Epilepsy",
            "Arthritis": "Arthritis",
            "Malignancy": "Malignancy",
            "Hepatitis": "Hepatitis",
            "Chronic kidney dis": "Chronic kidney dis",
            "IHD": "IHD"
        },
        mhOtherText: "Other",
        mhLblChronic: "Chronic Diseases",
        mhLblAdmission: "Previous admission to hospital",
        mhLblSurgery: "Past surgery",
        mhLblFamily: "Family history",
        mhLblAllergy: "Drugs allergy",
        mhLblChronicDrugs: "Chronic use of drugs",
        mhLblSmoking: "Smoking status",
        mhLblAlcohol: "Drinking Alcohol",
        mhLblNotes: "Notes",
        btnMhDone: "Done & Save",
        optSmok1: "Non-smoker",
        optSmok2: "Smoker",
        optSmok3: "Passive smoker",
        optAlc1: "Non-drinker",
        optAlc2: "Alcohol drinker",
        optAlc3: "Social drinker",
        bmiTitleText: "BMI Calculator",
        lblBmiWeight: "Weight (kg)",
        lblBmiHeight: "Height (cm)",
        lblBmiScore: "Body Mass Index (BMI Score):",
        bmiBadgeInitial: "Enter weight & height to calculate",
        btnBmiAgree: "Agree & Save",
        editPatHeader: "Edit Patient Information",
        editLblName: "Full Name *",
        editLblSubName: "Grandfather Name / Tribe / Note (Optional)",
        editLblAge: "Age *",
        editLblGender: "Gender",
        editOptGender: "Select Gender",
        editOptMale: "Male",
        editOptFemale: "Female",
        editLblMarital: "Marital Status",
        editOptMarital: "Select Status",
        editOptSingle: "Single",
        editOptMarried: "Married",
        editOptDivorced: "Divorced",
        editOptWidow: "Widow",
        editLblJob: "Occupation",
        editOptJob: "Select Occupation",
        editLblPhone: "Phone Number",
        btnSaveEdit: "Save Changes"
    }
};

function toggleDropdownMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('headerDropdownMenu');
    if (menu) menu.classList.toggle('show');
}

window.addEventListener('click', function() {
    const menu = document.getElementById('headerDropdownMenu');
    if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
    }
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
        if (iconEl) {
            iconEl.className = "fa-solid fa-sun";
            iconEl.style.color = "#fbbf24";
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (iconEl) {
            iconEl.className = "fa-solid fa-moon";
            iconEl.style.color = "#6366f1";
        }
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('clinic_lang', currentLang);
    applyLanguage();
    
    const archiveScreen = document.getElementById('archiveScreen');
    const dictScreen = document.getElementById('dictScreen');
    const recScreen = document.getElementById('medicalRecordScreen');

    if (archiveScreen && archiveScreen.style.display === 'block') {
        openPatientsArchive();
    } else if (dictScreen && dictScreen.style.display === 'block') {
        renderDictTerms();
    } else if (recScreen && recScreen.style.display === 'block' && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) renderVisits(patient.visits || [], false);
    }
}

function applyLanguage() {
    const t = translations[currentLang];
    const isAr = currentLang === 'ar';
    if (document.body) document.body.style.direction = isAr ? 'rtl' : 'ltr';

    const safeSet = (id, text, isHtml = false) => {
        const el = document.getElementById(id);
        if (el) {
            if (isHtml) el.innerHTML = text;
            else el.innerText = text;
        }
    };

    safeSet('authTitle', isRegisterMode ? t.registerTitle : t.loginTitle);
    safeSet('authSubText', isRegisterMode ? t.registerSub : t.loginSub);
    safeSet('lblEmail', isRegisterMode ? t.regEmailLabel : t.emailLabel);
    safeSet('lblRegPhone', t.regPhoneLabel);
    safeSet('lblPass', t.passLabel);
    
    const forgotBtn = document.getElementById('forgotPassBtn');
    if (forgotBtn) forgotBtn.style.display = isRegisterMode ? 'none' : 'block';
    
    safeSet('authSubmitBtn', isRegisterMode ? t.btnRegister : t.btnLogin);
    safeSet('authSwitchText', isRegisterMode ? t.switchLogin : t.switchRegister, true);

    safeSet('activTitle', t.activTitle);
    safeSet('activSub', t.activSub);
    safeSet('lblActivCode', t.lblActivCode);
    safeSet('btnActivate', t.btnActivate);

    const savedCustomName = localStorage.getItem('clinic_custom_brand_name');
    safeSet('headerTitle', savedCustomName || "نظام عيادة ماستر");
    safeSet('headerSub', t.headerSub);
    safeSet('txtBack', t.txtBack);
    
    safeSet('dropLangText', t.dropLang);
    safeSet('dropDarkModeText', t.dropDarkMode);
    safeSet('dropSupportText', t.dropSupport);
    safeSet('dropLogoutText', t.dropLogout);

    const secGrp1 = document.getElementById('secGroup1');
    if (secGrp1) secGrp1.innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${t.group1}`;
    safeSet('menuNewPatientTitle', t.newPatient);
    safeSet('menuNewPatientSub', t.newPatientSub);
    safeSet('menuArchiveTitle', t.archive);
    safeSet('menuArchiveSub', t.archiveSub);

    const secGrp2 = document.getElementById('secGroup2');
    if (secGrp2) secGrp2.innerHTML = `<i class="fa-solid fa-file-prescription"></i> ${t.group2}`;
    safeSet('menuRxTitle', t.rxTemplate);
    safeSet('menuRxSub', t.rxTemplateSub);
    safeSet('menuSpecTitle', t.specialtiesDash);
    safeSet('menuSpecSub', t.specialtiesDashSub);
    safeSet('menuDictTitle', t.dict);
    safeSet('menuDictSub', t.dictSub);

    const secGrp3 = document.getElementById('secGroup3');
    if (secGrp3) secGrp3.innerHTML = `<i class="fa-solid fa-chart-pie"></i> ${t.group3}`;
    safeSet('menuAnalyticsTitle', t.analytics);
    safeSet('menuAnalyticsSub', t.analyticsSub);

    const secGrp4 = document.getElementById('secGroup4');
    if (secGrp4) secGrp4.innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${t.group4}`;
    safeSet('menuBackupTitle', t.backup);
    safeSet('menuBackupSub', t.backupSub);
    safeSet('menuTrashTitle', t.trash);
    safeSet('menuTrashSub', t.trashSub);
    safeSet('menuSettingsTitle', t.settings);
    safeSet('menuSettingsSub', t.settingsSub);
    safeSet('menuPermTitle', t.permissions);
    safeSet('menuPermSub', t.permissionsSub);
    safeSet('menuNetTitle', t.networkDb);
    safeSet('menuNetSub', t.networkDbSub);

    const patInfo = document.getElementById('patInfoTitle');
    if (patInfo) patInfo.innerHTML = `<i class="fa-solid fa-id-card"></i> ${t.patInfoTitle}`;
    safeSet('lblPatName', t.lblPatName);
    safeSet('lblPatSubName', t.lblPatSubName);
    safeSet('lblPatAge', t.lblPatAge);
    safeSet('lblPatGender', t.lblPatGender);
    safeSet('optSelGender', t.optSelGender);
    safeSet('optMale', t.optMale);
    safeSet('optFemale', t.optFemale);
    safeSet('lblPatMarital', t.lblPatMarital);
    safeSet('optSelMarital', t.optSelMarital);
    safeSet('optSingle', t.optSingle);
    safeSet('optMarried', t.optMarried);
    safeSet('optDivorced', t.optDivorced);
    safeSet('optWidow', t.optWidow);
    safeSet('lblPatJob', t.lblPatJob);
    safeSet('optSelJob', t.optSelJob);
    safeSet('optJobEmp', t.optJobEmp);
    safeSet('optJobFree', t.optJobFree);
    safeSet('optJobHouse', t.optJobHouse);
    safeSet('optJobStud', t.optJobStud);
    safeSet('optJobOther', t.optJobOther);
    safeSet('lblPatPhone', t.lblPatPhone);
    safeSet('lblPatDate', t.lblPatDate);
    
    const savePat = document.getElementById('btnSavePatRec');
    if (savePat) savePat.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${t.btnSavePatRec}`;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    safeSet('optAllGenders', t.optAllGenders);
    safeSet('optFilterMale', t.optFilterMale);
    safeSet('optFilterFemale', t.optFilterFemale);
    safeSet('optAllAges', t.optAllAges);
    safeSet('optChild', t.optChild);
    safeSet('optAdult', t.optAdult);
    safeSet('optSenior', t.optSenior);
    
    safeSet('optSortNewest', t.sortNewest);
    safeSet('optSortOldest', t.sortOldest);

    safeSet('txtEdit', t.txtEdit);
    safeSet('txtDelete', t.txtDelete);
    
    const downPdf = document.getElementById('btnDownloadPDF');
    if (downPdf) downPdf.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${t.btnDownloadPDF}`;
    
    const addVisitMain = document.getElementById('btnAddVisitMain');
    if (addVisitMain) addVisitMain.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> ${t.btnAddVisit}`;

    safeSet('optCatDrugs', t.optCatDrugs);
    safeSet('optCatLabs', t.optCatLabs);
    safeSet('optCatScans', t.optCatScans);
    safeSet('optCatNotes', t.optCatNotes);
    safeSet('optCatMh', t.optCatMh);

    const trashTitle = document.getElementById('trashTitleText');
    if (trashTitle) trashTitle.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${t.trashTitleText}`;
    safeSet('txtEmptyTrash', t.txtEmptyTranslation);
    safeSet('trashSubText', t.trashSubText);

    const mhTitle = document.getElementById('mhHeaderTitle');
    if (mhTitle) mhTitle.innerHTML = `<i class="fa-solid fa-notes-medical" style="color:#0d9488;"></i> ${t.mhHeaderTitle || 'Medical History Details'}`;
    safeSet('mhLblChronic', t.mhLblChronic);
    safeSet('mhOtherText', t.mhOtherText);
    safeSet('mhLblAdmission', t.mhLblAdmission);
    safeSet('mhLblSurgery', t.mhLblSurgery);
    safeSet('mhLblFamily', t.mhLblFamily);
    safeSet('mhLblAllergy', t.mhLblAllergy);
    safeSet('mhLblChronicDrugs', t.mhLblChronicDrugs);
    safeSet('mhLblSmoking', t.mhLblSmoking);
    safeSet('mhLblAlcohol', t.mhLblAlcohol);
    safeSet('mhLblNotes', t.mhLblNotes);
    
    const btnMhDone = document.getElementById('btnMhDone');
    if (btnMhDone) btnMhDone.innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnMhDone}`;

    safeSet('optSmok1', t.optSmok1);
    safeSet('optSmok2', t.optSmok2);
    safeSet('optSmok3', t.optSmok3);
    safeSet('optAlc1', t.optAlc1);
    safeSet('optAlc2', t.optAlc2);
    safeSet('optAlc3', t.optAlc3);

    const bmiTitle = document.getElementById('bmiTitleText');
    if (bmiTitle) bmiTitle.innerHTML = `<i class="fa-solid fa-calculator" style="color:#0284c7;"></i> ${t.bmiTitleText}`;
    safeSet('lblBmiWeight', t.lblBmiWeight);
    safeSet('lblBmiHeight', t.lblBmiHeight);
    safeSet('lblBmiScore', t.lblBmiScore);
    safeSet('bmiBadgeInitial', t.bmiBadgeInitial);
    
    const btnBmiAgree = document.getElementById('btnBmiAgree');
    if (btnBmiAgree) btnBmiAgree.innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnBmiAgree}`;

    const editPatHeader = document.getElementById('editPatHeader');
    if (editPatHeader) editPatHeader.innerHTML = `<i class="fa-solid fa-user-pen" style="color:#0d9488;"></i> ${t.editPatHeader}`;
    safeSet('editLblName', t.editLblName);
    safeSet('editLblSubName', t.editLblSubName);
    safeSet('editLblAge', t.editLblAge);
    safeSet('editLblGender', t.editLblGender);
    safeSet('editOptGender', t.editOptGender);
    safeSet('editOptMale', t.editOptMale);
    safeSet('editOptFemale', t.editOptFemale);
    safeSet('editLblMarital', t.editLblMarital);
    safeSet('editOptMarital', t.editOptMarital);
    safeSet('editOptSingle', t.editOptSingle);
    safeSet('editOptMarried', t.editOptMarried);
    safeSet('editOptDivorced', t.editOptDivorced);
    safeSet('editOptWidow', t.editOptWidow);
    safeSet('editLblJob', t.editLblJob);
    safeSet('editOptJob', t.editOptJob);
    safeSet('editLblPhone', t.editLblPhone);
    
    const btnSaveEdit = document.getElementById('btnSaveEdit');
    if (btnSaveEdit) btnSaveEdit.innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnSaveEdit}`;

    document.querySelectorAll('.mh-cond-text').forEach(span => {
        const key = span.getAttribute('data-cond');
        if (t.chronicNames && t.chronicNames[key]) {
            span.innerText = t.chronicNames[key];
        }
    });

    safeSet('footerText', t.footer);
}

let patients = JSON.parse(localStorage.getItem('clinic_patients')) || [];
let trashBin = JSON.parse(localStorage.getItem('clinic_trash')) || [];
let medicalDict = JSON.parse(localStorage.getItem('clinic_dict')) || {
    labs: ["CBC", "RBS", "Lipid Profile", "HbA1c", "LFT", "KFT"],
    scans: ["Chest X-Ray", "Abdominal Ultrasound", "Brain MRI", "CT Scan"],
    drugs: ["Paracetamol 500mg 1x3", "Amoxicillin 500mg 1x3", "Metformin 500mg 1x2"],
    notes: ["Upper Respiratory Tract Infection", "Acute Gastroenteritis"],
    mh_history: ["Appendectomy", "Cholecystectomy", "Penicillin Allergy", "Cesarean Section"]
};

let secretaryAccount = JSON.parse(localStorage.getItem('clinic_sec_account')) || { email: "", password: "" };

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const bar = document.getElementById('networkStatusBar');
    if (!bar) return;
    if (!navigator.onLine) {
        bar.classList.add('offline');
        bar.innerText = "⚠ Offline Mode - Changes saved locally, will sync when online";
    } else {
        bar.classList.remove('offline');
        bar.style.display = 'none';
        syncLocalDataToCloud();
    }
}

function syncLocalDataToCloud() {
    if (!currentUserId || !navigator.onLine) return;
    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;

    patients.forEach(patient => {
        db.collection('users_data').doc(ownerUid).collection('patients').doc(String(patient.id)).set(patient)
            .catch(err => console.log("Sync error:", err));
    });
    
    db.collection('users_data').doc(ownerUid).set({
        rxImage: currentDoctorRxImage,
        dictionary: medicalDict,
        trashBin: trashBin,
        secretaryAccount: secretaryAccount,
        specialtyConfig: specialtyConfig,
        updatedAt: new Date().toISOString()
    }, { merge: true }).catch(err => console.log("Settings sync error:", err));
}

function generateKey(type) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = type + "-";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function generateNewKey(type) {
    let prefix = "TRL";
    let days = 14;
    if (type === 'EXT') { prefix = "EXT"; days = 7; }
    else if (type === 'ANNUAL') { prefix = "ANN"; days = 365; }

    const newCode = generateKey(prefix);
    const codeDocRef = db.collection('activation_keys').doc(newCode);

    try {
        await codeDocRef.set({
            code: newCode,
            type: type,
            durationDays: days,
            isUsed: false,
            createdAt: new Date().toISOString()
        });
        const dynCode = document.getElementById('dynamicFounderCode');
        const hint = document.getElementById('keyTypeHint');
        if (dynCode) dynCode.innerText = newCode;
        if (hint) hint.innerText = `Generated (${type}) valid for ${days} days.`;
    } catch (e) {
        alert('Error generating key: ' + e.message);
    }
}

let screenHistory = ['mainScreen'];

function navigateTo(screenId, title = null, sub = 'Cloud Secure Dashboard', saveState = true) {
    if (!isSubscriptionExpired) {
        autoSaveMedicalRecord();
    }
    hideAllScreensInner();
    
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";
    const headerTitleText = (screenId === 'mainScreen') ? customBrandName : (title || customBrandName);

    const titleEl = document.getElementById('headerTitle');
    const subEl = document.getElementById('headerSub');
    if (titleEl) titleEl.innerText = headerTitleText;
    if (subEl) subEl.innerText = sub;

    if (saveState) {
        sessionStorage.setItem('current_screen', screenId);
        sessionStorage.setItem('header_title', headerTitleText);
        sessionStorage.setItem('header_sub', sub);
        if (screenId !== 'medicalRecordScreen') {
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        }
    }

    const backBtn = document.getElementById('backBtn');
    if (screenId === 'mainScreen') {
        if (backBtn) backBtn.style.display = 'none';
        screenHistory = ['mainScreen'];
    } else {
        if (backBtn) backBtn.style.display = 'flex';
        if (screenHistory[screenHistory.length - 1] !== screenId) {
            screenHistory.push(screenId);
        }
    }
}

function goBackScreen() {
    if (!isSubscriptionExpired) {
        autoSaveMedicalRecord();
    }
    if (screenHistory.length > 1) {
        screenHistory.pop();
        const prevScreen = screenHistory[screenHistory.length - 1];
        
        hideAllScreensInner();
        const target = document.getElementById(prevScreen);
        if (target) target.style.display = 'block';
        sessionStorage.setItem('current_screen', prevScreen);

        const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";
        const titleEl = document.getElementById('headerTitle');
        const subEl = document.getElementById('headerSub');
        const backBtn = document.getElementById('backBtn');

        if (prevScreen === 'mainScreen') {
            if (backBtn) backBtn.style.display = 'none';
            if (titleEl) titleEl.innerText = customBrandName;
            if (subEl) subEl.innerText = translations[currentLang].headerSub;
            sessionStorage.setItem('header_title', customBrandName);
            sessionStorage.setItem('header_sub', translations[currentLang].headerSub);
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        } else if (prevScreen === 'archiveScreen') {
            if (titleEl) titleEl.innerText = translations[currentLang].archive;
            if (subEl) subEl.innerText = 'Advanced search, filters & records';
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        }
    } else {
        showMainMenu();
    }
}

window.addEventListener('popstate', function(event) {
    event.preventDefault();
    const mhModal = document.getElementById('medHistoryModal');
    const bmiModal = document.getElementById('bmiCalculatorModal');
    const rxModal = document.getElementById('rxModal');
    const editModal = document.getElementById('editPatientModal');
    const suppModal = document.getElementById('supportModal');

    if (mhModal && mhModal.style.display === 'flex') {
        closeMedHistoryModal();
        return;
    }
    if (bmiModal && bmiModal.style.display === 'flex') {
        closeBmiModal();
        return;
    }
    if (rxModal && rxModal.style.display === 'flex') {
        closeRxModal();
        return;
    }
    if (editModal && editModal.style.display === 'flex') {
        closeEditPatientModal();
        return;
    }
    if (suppModal && suppModal.style.display === 'flex') {
        closeSupportModal();
        return;
    }
    if (screenHistory.length > 1) {
        goBackScreen();
    } else {
        history.pushState(null, '', window.location.href);
    }
});

history.pushState(null, '', window.location.href);

function hideAllScreensInner() {
    const screens = [
        'mainScreen', 'addPatientScreen', 'rxTemplateScreen', 
        'specialtiesDashboardScreen', 'archiveScreen', 'trashScreen', 
        'medicalRecordScreen', 'dictScreen', 'networkScreen', 
        'analyticsScreen', 'settingsScreen', 'backupScreen', 'permissionsScreen'
    ];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const pDateEl = document.getElementById('pDate');
    if (pDateEl) pDateEl.value = getTodayFormatted();
    
    applyLanguage();
    applyDarkModeState();

    if (!navigator.onLine) {
        const bar = document.getElementById('networkStatusBar');
        if (bar) {
            bar.classList.add('offline');
            bar.style.display = 'block';
        }
    }

    try {
        auth.onAuthStateChanged(async user => {
            if (user) {
                currentUserId = user.uid;
                let dataOwnerUid = user.uid;
                isUserSecretary = false;

                try {
                    const secQuery = await db.collection('network_hierarchy').where('secretaryEmail', '==', user.email.toLowerCase()).get();
                    if (!secQuery.empty) {
                        const doctorDoc = secQuery.docs[0];
                        dataOwnerUid = doctorDoc.id;
                        sessionStorage.setItem('target_doctor_uid', dataOwnerUid);
                        isUserSecretary = true;
                    } else {
                        const directDoc = await db.collection('network_hierarchy').doc(user.uid).get();
                        if (directDoc.exists && directDoc.data().doctorUid) {
                            dataOwnerUid = directDoc.data().doctorUid;
                            sessionStorage.setItem('target_doctor_uid', dataOwnerUid);
                            isUserSecretary = true;
                        }
                    }
                } catch (e) {
                    console.log("Secretary query error:", e);
                }

                await loadDoctorBranding(dataOwnerUid);

                patients = JSON.parse(localStorage.getItem(`clinic_patients_${dataOwnerUid}`)) || patients;
                trashBin = JSON.parse(localStorage.getItem(`clinic_trash_${dataOwnerUid}`)) || trashBin;

                if (patientsListenerUnsubscribe) {
                    patientsListenerUnsubscribe();
                }

                if (navigator.onLine) {
                    db.collection('users_data').doc(dataOwnerUid).get().then(doc => {
                        if (doc.exists) {
                            const data = doc.data();
                            if (data.rxImage) {
                                currentDoctorRxImage = data.rxImage;
                                localStorage.setItem('doctor_rx_template', currentDoctorRxImage);
                            }
                            if (data.rxLayout) {
                                localStorage.setItem('doctor_rx_layout', JSON.stringify(data.rxLayout));
                            }
                            if (data.dictionary) {
                                medicalDict = data.dictionary;
                                if (!medicalDict.mh_history) medicalDict.mh_history = ["Appendectomy", "Cholecystectomy", "Penicillin Allergy"];
                                localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
                            }
                            if (data.trashBin) {
                                trashBin = data.trashBin;
                                localStorage.setItem(`clinic_trash_${dataOwnerUid}`, JSON.stringify(trashBin));
                            }
                            if (data.secretaryAccount) {
                                secretaryAccount = data.secretaryAccount;
                                localStorage.setItem('clinic_sec_account', JSON.stringify(secretaryAccount));
                            }
                            if (data.specialtyConfig) {
                                specialtyConfig = data.specialtyConfig;
                                localStorage.setItem('clinic_specialty_config', JSON.stringify(specialtyConfig));
                            }
                        }
                    }).catch(err => console.log(err));

                    patientsListenerUnsubscribe = db.collection('users_data').doc(dataOwnerUid).collection('patients')
                        .onSnapshot(snapshot => {
                            let cloudPatients = [];
                            snapshot.forEach(doc => {
                                cloudPatients.push(doc.data());
                            });
                            patients = cloudPatients;
                            localStorage.setItem(`clinic_patients_${dataOwnerUid}`, JSON.stringify(patients));
                            localStorage.setItem('clinic_patients', JSON.stringify(patients));

                            const archiveScreen = document.getElementById('archiveScreen');
                            const recScreen = document.getElementById('medicalRecordScreen');

                            if (archiveScreen && archiveScreen.style.display === 'block') {
                                filterPatients();
                            } else if (recScreen && recScreen.style.display === 'block' && currentPatientId) {
                                const pat = patients.find(p => Number(p.id) === Number(currentPatientId));
                                if (pat) {
                                    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT')) return;
                                    renderVisits(pat.visits || [], false);
                                } else {
                                    showMainMenu();
                                }
                            }
                        }, err => console.log("Real-time listener error:", err));
                }

                if (user.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase()) {
                    setupFounderInterfaceAfterAuth();
                } else {
                    checkUserSubscriptionStatus(user.uid, isUserSecretary);
                }
            } else {
                if (patientsListenerUnsubscribe) patientsListenerUnsubscribe();
                currentUserId = null;
                isUserSecretary = false;
                isSubscriptionExpired = false;
                sessionStorage.removeItem('target_doctor_uid');
                const activScreen = document.getElementById('activationScreen');
                const appCont = document.getElementById('appContainer');
                const authScreen = document.getElementById('authScreen');
                if (activScreen) activScreen.style.display = 'none';
                if (appCont) appCont.style.display = 'none';
                if (authScreen) authScreen.style.display = 'flex';
            }
        });
    } catch (e) {
        console.log("Auth init error:", e);
    }

    initDraggableElements();
    loadSavedRxLayout();
});

async function loadDoctorBranding(ownerUid) {
    try {
        const docRef = await db.collection('network_hierarchy').doc(ownerUid).get();
        if (docRef.exists) {
            const data = docRef.data();
            const customName = data.doctorName || "نظام عيادة ماستر";
            localStorage.setItem('clinic_custom_brand_name', customName);
            const titleEl = document.getElementById('headerTitle');
            if (titleEl && sessionStorage.getItem('current_screen') === 'mainScreen') {
                titleEl.innerText = customName;
            }
        }
    } catch (e) {
        console.log("Branding load error:", e);
    }
}

async function checkUserSubscriptionStatus(uid, isSecretary = false) {
    let expiryDateStr = localStorage.getItem(`sub_expiry_${uid}`);

    if (navigator.onLine) {
        try {
            const docRef = await db.collection('network_hierarchy').doc(uid).get();
            if (docRef.exists) {
                const data = docRef.data();
                if (data.expiryDate) {
                    expiryDateStr = data.expiryDate;
                    localStorage.setItem(`sub_expiry_${uid}`, expiryDateStr);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (isSecretary) {
        setupClientInterfaceAfterAuth(null, true);
        return;
    }

    if (expiryDateStr && new Date().getTime() < new Date(expiryDateStr).getTime()) {
        isSubscriptionExpired = false;
        setupClientInterfaceAfterAuth(expiryDateStr, false);
    } else {
        isSubscriptionExpired = true;
        setupReadOnlyModeAfterExpiration(expiryDateStr);
    }
}

function setupReadOnlyModeAfterExpiration(expiryDateIso) {
    const authSc = document.getElementById('authScreen');
    const actSc = document.getElementById('activationScreen');
    const appCont = document.getElementById('appContainer');
    const foundPanel = document.getElementById('founderControlPanel');
    const netCard = document.getElementById('networkMenuCard');
    const cardPerm = document.getElementById('cardPermissions');

    if (authSc) authSc.style.display = 'none';
    if (actSc) actSc.style.display = 'none';
    if (appCont) appCont.style.display = 'flex';
    if (foundPanel) foundPanel.style.display = 'none';
    if (netCard) netCard.style.display = 'none';
    if (cardPerm) cardPerm.style.display = 'none';
    showAllCardsForDoctor();

    const cardNewPat = document.getElementById('cardNewPatient');
    if (cardNewPat) {
        cardNewPat.classList.add('disabled-card');
        cardNewPat.onclick = function() {
            alert('⚠ انتهت صلاحية الاشتراك. التطبيق يعمل في وضع القراءة فقط.');
            openSupportModal();
        };
    }

    const banner = document.getElementById('subStatusBanner');
    const titleEl = document.getElementById('subBannerTitle');
    const textEl = document.getElementById('subBannerText');
    if (banner) banner.style.display = 'flex';
    if (banner) banner.className = 'sub-status-banner expired';
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> انتهت صلاحية الاشتراك - وضع القراءة فقط`;
    if (textEl) textEl.innerText = `انتهى اشتراكك. يمكنك تصفح الأرشيف وقراءة الملفات والتقارير بحرية تامة أو تجديد الكود.`;

    restorePreviousScreenState();
}

function setupFounderInterfaceAfterAuth() {
    isSubscriptionExpired = false;
    const authSc = document.getElementById('authScreen');
    const actSc = document.getElementById('activationScreen');
    const appCont = document.getElementById('appContainer');
    const foundPanel = document.getElementById('founderControlPanel');
    const netCard = document.getElementById('networkMenuCard');
    const cardPerm = document.getElementById('cardPermissions');
    const banner = document.getElementById('subStatusBanner');

    if (authSc) authSc.style.display = 'none';
    if (actSc) actSc.style.display = 'none';
    if (appCont) appCont.style.display = 'flex';
    if (foundPanel) foundPanel.style.display = 'block';
    if (netCard) netCard.style.display = 'flex';
    if (cardPerm) cardPerm.style.display = 'flex';
    if (banner) banner.style.display = 'none';
    isUserSecretary = false;
    
    const cardNewPat = document.getElementById('cardNewPatient');
    if (cardNewPat) {
        cardNewPat.classList.remove('disabled-card');
        cardNewPat.onclick = function() {
            navigateTo('addPatientScreen', translations[currentLang].newPatient, translations[currentLang].newPatientSub);
        };
    }

    restorePreviousScreenState();
    checkMandatoryMonthlyBackup();
}

function setupClientInterfaceAfterAuth(expiryDateIso, isSecretary = false) {
    isSubscriptionExpired = false;
    const authSc = document.getElementById('authScreen');
    const actSc = document.getElementById('activationScreen');
    const appCont = document.getElementById('appContainer');
    const foundPanel = document.getElementById('founderControlPanel');
    const netCard = document.getElementById('networkMenuCard');

    if (authSc) authSc.style.display = 'none';
    if (actSc) actSc.style.display = 'none';
    if (appCont) appCont.style.display = 'flex';
    if (foundPanel) foundPanel.style.display = 'none';
    if (netCard) netCard.style.display = 'none';

    const cardNewPat = document.getElementById('cardNewPatient');
    if (cardNewPat) {
        cardNewPat.classList.remove('disabled-card');
        cardNewPat.onclick = function() {
            navigateTo('addPatientScreen', translations[currentLang].newPatient, translations[currentLang].newPatientSub);
        };
    }

    const cardPerm = document.getElementById('cardPermissions');
    const cardRx = document.getElementById('cardRxTemplate');
    const cardSpec = document.getElementById('cardSpecialtiesDashboard');
    const cardDict = document.getElementById('cardDict');
    const cardAna = document.getElementById('cardAnalytics');
    const cardBack = document.getElementById('cardBackup');
    const cardTrash = document.getElementById('cardTrash');
    const cardSet = document.getElementById('cardSettings');
    const banner = document.getElementById('subStatusBanner');

    if (isSecretary) {
        isUserSecretary = true;
        if (cardPerm) cardPerm.style.display = 'none';
        if (cardRx) cardRx.style.display = 'none';
        if (cardSpec) cardSpec.style.display = 'none';
        if (cardDict) cardDict.style.display = 'none';
        if (cardAna) cardAna.style.display = 'none';
        if (cardBack) cardBack.style.display = 'none';
        if (cardTrash) cardTrash.style.display = 'none';
        if (cardSet) cardSet.style.display = 'none';
        if (banner) banner.style.display = 'none';
    } else {
        isUserSecretary = false;
        if (cardPerm) cardPerm.style.display = 'flex';
        showAllCardsForDoctor();
    }

    if (expiryDateIso && !isSecretary) {
        const now = new Date().getTime();
        const expiryTime = new Date(expiryDateIso).getTime();
        const diffTime = expiryTime - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const titleEl = document.getElementById('subBannerTitle');
        const textEl = document.getElementById('subBannerText');
        if (banner) banner.style.display = 'flex';
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Active Subscription`;
        if (textEl) textEl.innerText = `You have ${diffDays} day(s) remaining.`;
    }

    restorePreviousScreenState();
    if (!isSecretary) {
        checkMandatoryMonthlyBackup();
    }
}

function checkMandatoryMonthlyBackup() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const todayDateStr = getTodayFormatted();
    const lastMandatoryBackupDate = localStorage.getItem('last_mandatory_backup_date');

    if (dayOfMonth === 1 && lastMandatoryBackupDate !== todayDateStr) {
        const modal = document.getElementById('mandatoryBackupModal');
        if (modal) modal.style.display = 'flex';
    }
}

function executeMandatoryBackup() {
    exportJsonBackup();
    const todayDateStr = getTodayFormatted();
    localStorage.setItem('last_mandatory_backup_date', todayDateStr);
    const modal = document.getElementById('mandatoryBackupModal');
    if (modal) modal.style.display = 'none';
    alert('تم حفظ النسخة الاحتياطية بنجاح!');
}

function openSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) modal.style.display = 'flex';
}

function closeSupportModal() {
    const modal = document.getElementById('supportModal');
    if (modal) modal.style.display = 'none';
}

function openActivationScreenForRenewal() {
    const appCont = document.getElementById('appContainer');
    const actSc = document.getElementById('activationScreen');
    const actInput = document.getElementById('activationInput');

    if (appCont) appCont.style.display = 'none';
    if (actSc) actSc.style.display = 'flex';
    if (actInput) {
        actInput.value = '';
        actInput.focus();
    }
}

function cancelRenewal() {
    const actSc = document.getElementById('activationScreen');
    const appCont = document.getElementById('appContainer');
    if (actSc) actSc.style.display = 'none';
    if (appCont) appCont.style.display = 'flex';
}

function restorePreviousScreenState() {
    const savedScreen = sessionStorage.getItem('current_screen');
    const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";
    const savedTitle = sessionStorage.getItem('header_title') || customBrandName;
    const savedSub = sessionStorage.getItem('header_sub') || translations[currentLang].headerSub;
    const savedPatientId = sessionStorage.getItem('current_patient_id');

    if (savedScreen && savedScreen !== 'mainScreen' && document.getElementById(savedScreen)) {
        if (isUserSecretary && ['rxTemplateScreen', 'specialtiesDashboardScreen', 'dictScreen', 'analyticsScreen', 'backupScreen', 'trashScreen', 'settingsScreen', 'permissionsScreen'].includes(savedScreen)) {
            navigateTo('mainScreen', customBrandName, translations[currentLang].headerSub, false);
            return;
        }
        if (savedScreen === 'medicalRecordScreen' && savedPatientId) {
            openMedicalRecord(Number(savedPatientId), false);
        } else {
            navigateTo(savedScreen, savedTitle, savedSub, false);
        }
    } else {
        navigateTo('mainScreen', customBrandName, translations[currentLang].headerSub, false);
    }
}

async function verifyActivationCode() {
    const actInput = document.getElementById('activationInput');
    const inputCode = actInput ? actInput.value.trim().toUpperCase() : '';
    if (!inputCode) { alert('Please enter an activation code.'); return; }

    if (!navigator.onLine) {
        alert('Internet connection required.');
        return;
    }

    try {
        const keyRef = db.collection('activation_keys').doc(inputCode);
        const keyDoc = await keyRef.get();

        if (!keyDoc.exists) {
            alert('Invalid activation code!');
            return;
        }

        const keyData = keyDoc.data();
        if (keyData.isUsed === true) {
            alert('This activation code has already been used!');
            return;
        }

        const durationDays = keyData.durationDays || 14;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        const expiryDateIso = expiryDate.toISOString();

        await keyRef.update({
            isUsed: true,
            usedBy: auth.currentUser ? auth.currentUser.email : 'Unknown',
            usedAt: new Date().toISOString()
        });

        const user = auth.currentUser;
        if (user) {
            localStorage.setItem(`sub_expiry_${user.uid}`, expiryDateIso);
            await db.collection('network_hierarchy').doc(user.uid).set({
                email: user.email,
                password: pendingUserPass || 'Saved',
                role: 'Client Node',
                isActivated: true,
                expiryDate: expiryDateIso,
                activatedAt: new Date().toISOString()
            }, { merge: true });
        }

        alert('System activated / renewed successfully!');
        const actSc = document.getElementById('activationScreen');
        if (actSc) actSc.style.display = 'none';
        isSubscriptionExpired = false;
        setupClientInterfaceAfterAuth(expiryDateIso, false);

    } catch (err) {
        alert('Error during activation: ' + err.message);
    }
}

function savePatientToCloudAndLocal(patientObj) {
    if (!currentUserId || isSubscriptionExpired) return;
    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;

    const idx = patients.findIndex(p => Number(p.id) === Number(patientObj.id));
    if (idx !== -1) {
        patients[idx] = patientObj;
    } else {
        patients.unshift(patientObj);
    }
    localStorage.setItem(`clinic_patients_${ownerUid}`, JSON.stringify(patients));
    localStorage.setItem('clinic_patients', JSON.stringify(patients));

    if (navigator.onLine) {
        db.collection('users_data').doc(ownerUid).collection('patients').doc(String(patientObj.id)).set(patientObj)
            .catch(err => console.log("Cloud save error:", err));
    }
}

function saveTrashToCloudAndLocal() {
    if (!currentUserId || isSubscriptionExpired) return;
    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;

    localStorage.setItem(`clinic_trash_${ownerUid}`, JSON.stringify(trashBin));
    localStorage.setItem('clinic_trash', JSON.stringify(trashBin));

    if (navigator.onLine) {
        db.collection('users_data').doc(ownerUid).set({
            trashBin: trashBin,
            updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.log("Trash sync error:", err));
    }
}

function saveSettingsToCloudAndLocal() {
    if (!currentUserId || isSubscriptionExpired) return;
    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;

    localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
    localStorage.setItem('doctor_rx_template', currentDoctorRxImage);
    localStorage.setItem('clinic_sec_account', JSON.stringify(secretaryAccount));
    localStorage.setItem('clinic_specialty_config', JSON.stringify(specialtyConfig));

    const rxLayoutData = {};
    document.querySelectorAll('.draggable-box').forEach(box => {
        const textEl = box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text');
        rxLayoutData[box.id] = {
            top: box.style.top,
            left: box.style.left,
            fontSize: textEl ? window.getComputedStyle(textEl).fontSize : '1rem'
        };
    });
    localStorage.setItem('doctor_rx_layout', JSON.stringify(rxLayoutData));

    if (navigator.onLine) {
        db.collection('users_data').doc(ownerUid).set({
            rxImage: currentDoctorRxImage,
            rxLayout: rxLayoutData,
            dictionary: medicalDict,
            secretaryAccount: secretaryAccount,
            specialtyConfig: specialtyConfig,
            updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => console.log("Settings save error:", err));
    }
}

function getTodayFormatted() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    applyLanguage();
    const phoneBox = document.getElementById('registerPhoneBox');
    if (phoneBox) phoneBox.style.display = isRegisterMode ? 'block' : 'none';
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('authPassword');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    if (!passInput) return;
    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye');
            toggleBtn.classList.add('fa-eye-slash');
        }
    } else {
        passInput.type = 'password';
        if (toggleBtn) {
            toggleBtn.classList.remove('fa-eye-slash');
            toggleBtn.classList.add('fa-eye');
        }
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const emailEl = document.getElementById('authEmail');
    const passEl = document.getElementById('authPassword');
    if (!emailEl || !passEl) return;

    const identifier = emailEl.value.trim();
    const pass = passEl.value;

    if (isRegisterMode) {
        const phoneEl = document.getElementById('regPhoneInput');
        const phone = phoneEl ? phoneEl.value.trim() : '';
        auth.createUserWithEmailAndPassword(identifier, pass)
            .then(async res => {
                pendingUserPass = pass;
                currentUserId = res.user.uid;
                
                try {
                    await db.collection('network_hierarchy').doc(currentUserId).set({
                        email: identifier.toLowerCase(),
                        phone: phone || '',
                        password: pass,
                        role: identifier.toLowerCase() === FOUNDER_EMAIL.toLowerCase() ? 'Founder' : 'Client Node',
                        isActivated: identifier.toLowerCase() === FOUNDER_EMAIL.toLowerCase(),
                        doctorName: "نظام عيادة ماستر",
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                } catch (err) {
                    console.log("Error:", err);
                }

                if (identifier.toLowerCase() === FOUNDER_EMAIL.toLowerCase()) {
                    const expiryDate = new Date();
                    expiryDate.setFullYear(expiryDate.getFullYear() + 10);
                    localStorage.setItem(`sub_expiry_${res.user.uid}`, expiryDate.toISOString());
                    setupFounderInterfaceAfterAuth();
                } else {
                    const authSc = document.getElementById('authScreen');
                    const actSc = document.getElementById('activationScreen');
                    if (authSc) authSc.style.display = 'none';
                    if (actSc) actSc.style.display = 'flex';
                }
            })
            .catch(err => alert('خطأ: ' + err.message));
    } else {
        let loginEmail = identifier;
        
        if (!identifier.includes('@') && navigator.onLine) {
            try {
                const queryPromise = db.collection('network_hierarchy').where('phone', '==', identifier).get();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
                const querySnap = await Promise.race([queryPromise, timeoutPromise]);
                if (!querySnap.empty) {
                    loginEmail = querySnap.docs[0].data().email;
                }
            } catch (err) {
                console.log("Phone login lookup bypassed:", err);
            }
        }

        auth.signInWithEmailAndPassword(loginEmail, pass)
            .then(async res => {
                currentUserId = res.user.uid;
                let dataOwnerUid = res.user.uid;
                let isSec = false;

                try {
                    const secQuery = await db.collection('network_hierarchy').where('secretaryEmail', '==', loginEmail.toLowerCase()).get();
                    if (!secQuery.empty) {
                        const doctorDoc = secQuery.docs[0];
                        dataOwnerUid = doctorDoc.id;
                        sessionStorage.setItem('target_doctor_uid', dataOwnerUid);
                        isSec = true;
                    } else {
                        const directDoc = await db.collection('network_hierarchy').doc(res.user.uid).get();
                        if (directDoc.exists && directDoc.data().doctorUid) {
                            dataOwnerUid = directDoc.data().doctorUid;
                            sessionStorage.setItem('target_doctor_uid', dataOwnerUid);
                            isSec = true;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }

                await loadDoctorBranding(dataOwnerUid);

                const authSc = document.getElementById('authScreen');
                if (authSc) authSc.style.display = 'none';

                if (isSec) {
                    const appCont = document.getElementById('appContainer');
                    const cardPerm = document.getElementById('cardPermissions');
                    const banner = document.getElementById('subStatusBanner');
                    if (appCont) appCont.style.display = 'flex';
                    if (cardPerm) cardPerm.style.display = 'none';
                    if (banner) banner.style.display = 'none';
                    isUserSecretary = true;
                    applySecretaryUIVisibility();
                    restorePreviousScreenState();
                } else if (loginEmail.toLowerCase() === FOUNDER_EMAIL.toLowerCase()) {
                    setupFounderInterfaceAfterAuth();
                } else {
                    checkUserSubscriptionStatus(res.user.uid, false);
                }
            })
            .catch(err => alert('خطأ: ' + err.message));
    }
}

function showAllCardsForDoctor() {
    const ids = [
        'cardNewPatient', 'cardArchive', 'cardRxTemplate', 
        'cardSpecialtiesDashboard', 'cardDict', 'cardAnalytics', 
        'cardBackup', 'cardTrash', 'cardSettings', 'cardPermissions'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    });
}

function applySecretaryUIVisibility() {
    const showIds = ['cardNewPatient', 'cardArchive'];
    const hideIds = [
        'cardRxTemplate', 'cardSpecialtiesDashboard', 'cardDict', 
        'cardAnalytics', 'cardBackup', 'cardTrash', 'cardSettings', 'cardPermissions'
    ];
    showIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'flex'; });
    hideIds.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
}

function calculateVisitChildGrowth(visitId) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const ageMonthsEl = document.getElementById(`pedsAgeMonths-${visitId}`);
    const weightEl = document.getElementById(`pedsWeight-${visitId}`);
    const heightEl = document.getElementById(`pedsHeight-${visitId}`);

    const ageMonths = ageMonthsEl ? parseFloat(ageMonthsEl.value) : NaN;
    const weight = weightEl ? parseFloat(weightEl.value) : NaN;
    const height = heightEl ? parseFloat(heightEl.value) : NaN;

    if (!ageMonths || isNaN(ageMonths) || ageMonths < 0) {
        alert('الرجاء إدخال عمر الطفل بالأشهر أولاً.');
        return;
    }

    let weightStatus = 'وزن طبيعي (Normal Weight - P15-P85)';
    let heightStatus = 'طول طبيعي (Normal Height - P15-P85)';
    let weightColor = '#166534';
    let heightColor = '#166534';

    const expectedWeight = (ageMonths * 0.5) + 3.3;
    const expectedHeight = (ageMonths * 1.5) + 50;

    if (!isNaN(weight)) {
        if (weight < expectedWeight * 0.8) {
            weightStatus = 'نحافة ملحوظة أو نقص بالوزن (< P3)';
            weightColor = '#b91c1c';
        } else if (weight > expectedWeight * 1.25) {
            weightStatus = 'زيادة وزن محتملة (> P85)';
            weightColor = '#c2410c';
        }
    }

    if (!isNaN(height)) {
        if (height < expectedHeight * 0.88) {
            heightStatus = 'قصر قامة / تقزم محتمل (< P3)';
            heightColor = '#b91c1c';
        } else if (height > expectedHeight * 1.12) {
            heightStatus = 'طول أعلى من المعدل';
            heightColor = '#0284c7';
        }
    }

    const resultText = `
        • <b>تقييم الوزن:</b> <span style="color:${weightColor}; font-weight:700;">${weightStatus}</span><br>
        • <b>تقييم الطول:</b> <span style="color:${heightColor}; font-weight:700;">${heightStatus}</span>
    `;

    visit.pedsGrowthResult = resultText;
    savePatientToCloudAndLocal(patient);
    renderVisits(patient.visits, false);
}

function openSpecialtiesDashboard() {
    navigateTo('specialtiesDashboardScreen', 'لوحة تحكم الاختصاصات', 'تخصيص وتفعيل الحقول الطبية');
    
    const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
    setChecked('mod_medHistory', specialtyConfig.medHistory);
    setChecked('mod_vitals', specialtyConfig.vitals);
    setChecked('mod_labs', specialtyConfig.labs);
    setChecked('mod_scans', specialtyConfig.scans);
    setChecked('mod_notes', specialtyConfig.notes);
    setChecked('mod_rx', specialtyConfig.rx);
    setChecked('mod_attachments', specialtyConfig.attachments);

    setChecked('mod_obsGyn', specialtyConfig.obsGyn);
    setChecked('mod_ortho', specialtyConfig.ortho);
    setChecked('mod_neuro', specialtyConfig.neuro);
    setChecked('mod_peds', specialtyConfig.peds);
    setChecked('mod_derm', specialtyConfig.derm);
    setChecked('mod_ent', specialtyConfig.ent);
    setChecked('mod_ophthal', specialtyConfig.ophthal);
    setChecked('mod_cardio', specialtyConfig.cardio);
}

function saveSpecialtiesDashboardConfig() {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    const getChecked = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
    specialtyConfig = {
        medHistory: getChecked('mod_medHistory'),
        vitals: getChecked('mod_vitals'),
        labs: getChecked('mod_labs'),
        scans: getChecked('mod_scans'),
        notes: getChecked('mod_notes'),
        rx: getChecked('mod_rx'),
        attachments: getChecked('mod_attachments'),
        obsGyn: getChecked('mod_obsGyn'),
        ortho: getChecked('mod_ortho'),
        neuro: getChecked('mod_neuro'),
        peds: getChecked('mod_peds'),
        derm: getChecked('mod_derm'),
        ent: getChecked('mod_ent'),
        ophthal: getChecked('mod_ophthal'),
        cardio: getChecked('mod_cardio')
    };

    saveSettingsToCloudAndLocal();
    alert('تم حفظ إعدادات لوحة تحكم الاختصاصات بنجاح!');
    showMainMenu();
}

function openPermissionsManager() {
    navigateTo('permissionsScreen', 'Secretary Management', 'Create account & permissions');
    const emailIn = document.getElementById('secEmailInput');
    const passIn = document.getElementById('secPassInput');
    if (emailIn) emailIn.value = secretaryAccount.email || '';
    if (passIn) passIn.value = secretaryAccount.password || '';
}

async function saveSecretaryAccount() {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    const emailIn = document.getElementById('secEmailInput');
    const passIn = document.getElementById('secPassInput');
    const email = emailIn ? emailIn.value.trim() : '';
    const password = passIn ? passIn.value : '';

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const secUid = userCred.user.uid;
        secretaryAccount = { email, password };
        
        if (currentUserId) {
            await db.collection('network_hierarchy').doc(currentUserId).set({
                secretaryEmail: email.toLowerCase()
            }, { merge: true });

            await db.collection('network_hierarchy').doc(secUid).set({
                email: email,
                password: password,
                role: 'Secretary Node',
                doctorUid: currentUserId,
                isActivated: true,
                createdAt: new Date().toISOString()
            });
        }

        saveSettingsToCloudAndLocal();
        alert('Secretary account created successfully!');
    } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
            secretaryAccount = { email, password };
            if (currentUserId) {
                await db.collection('network_hierarchy').doc(currentUserId).set({
                    secretaryEmail: email.toLowerCase()
                }, { merge: true });
            }
            saveSettingsToCloudAndLocal();
            alert('Secretary account updated successfully!');
        } else {
            alert('Error: ' + e.message);
        }
    }
}

async function deleteSecretaryAccount() {
    if (isSubscriptionExpired) return;
    if (confirm('Are you sure you want to delete secretary account?')) {
        secretaryAccount = { email: "", password: "" };
        const emailIn = document.getElementById('secEmailInput');
        const passIn = document.getElementById('secPassInput');
        if (emailIn) emailIn.value = '';
        if (passIn) passIn.value = '';
        
        if (currentUserId) {
            await db.collection('network_hierarchy').doc(currentUserId).set({
                secretaryEmail: "",
            }, { merge: true });
        }

        saveSettingsToCloudAndLocal();
        alert('Secretary account revoked.');
    }
}

function saveSecretaryPermissions() {
    alert('Permissions saved.');
    showMainMenu();
}

function resetPassword() {
    const emailIn = document.getElementById('authEmail');
    const identifier = emailIn ? emailIn.value : '';
    if (!identifier) { alert('Enter email first.'); return; }
    auth.sendPasswordResetEmail(identifier)
        .then(() => alert('Reset link sent!'))
        .catch(err => alert(err.message));
}

function logoutUser() {
    if (!isSubscriptionExpired) {
        autoSaveMedicalRecord();
    }
    sessionStorage.clear();
    if (patientsListenerUnsubscribe) patientsListenerUnsubscribe();
    auth.signOut().then(() => {
        currentUserId = null;
        isUserSecretary = false;
        isSubscriptionExpired = false;
        patients = [];
        trashBin = [];
        const appCont = document.getElementById('appContainer');
        const authSc = document.getElementById('authScreen');
        if (appCont) appCont.style.display = 'none';
        if (authSc) authSc.style.display = 'flex';
    });
}

function openBackupManager() {
    navigateTo('backupScreen', 'Backup Manager', 'Export and restore data');
    const fileIn = document.getElementById('backupFileInput');
    if (fileIn) fileIn.value = '';
}

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

function restoreFromUploadedFile(input) {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!parsed.patients || !Array.isArray(parsed.patients)) {
                    alert('Invalid backup file.');
                    return;
                }

                if (confirm(`Restore data with (${parsed.patients.length}) patients?`)) {
                    patients = parsed.patients;
                    trashBin = parsed.trashBin || [];
                    medicalDict = parsed.medicalDict || medicalDict;
                    if (parsed.rxImage) currentDoctorRxImage = parsed.rxImage;
                    if (parsed.rxLayout) localStorage.setItem('doctor_rx_layout', JSON.stringify(parsed.rxLayout));
                    if (parsed.secretaryAccount) secretaryAccount = parsed.secretaryAccount;
                    if (parsed.specialtyConfig) specialtyConfig = parsed.specialtyConfig;

                    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;
                    if (ownerUid) {
                        localStorage.setItem(`clinic_patients_${ownerUid}`, JSON.stringify(patients));
                        localStorage.setItem(`clinic_trash_${ownerUid}`, JSON.stringify(trashBin));
                    }
                    saveSettingsToCloudAndLocal();
                    syncLocalDataToCloud();

                    alert('Backup restored successfully!');
                    showMainMenu();
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        };
        reader.readAsText(file);
    }
}

function openAccountSettings() {
    navigateTo('settingsScreen', 'Account Settings', 'Change email and password');
    const user = auth.currentUser;
    const curEmail = document.getElementById('currentAccountEmail');
    const newEmail = document.getElementById('newAccountEmail');
    const confPass = document.getElementById('confirmEmailPass');
    const newPass = document.getElementById('newAccountPassword');

    if (user && curEmail) curEmail.value = user.email || '';
    if (newEmail) newEmail.value = '';
    if (confPass) confPass.value = '';
    if (newPass) newPass.value = '';
}

function updateAccountEmail() {
    const newEmailEl = document.getElementById('newAccountEmail');
    const passEl = document.getElementById('confirmEmailPass');
    const curEmailEl = document.getElementById('currentAccountEmail');
    const user = auth.currentUser;

    const newEmail = newEmailEl ? newEmailEl.value.trim() : '';
    const password = passEl ? passEl.value : '';

    if (!newEmail || !password) {
        alert('Please enter new email and current password.');
        return;
    }

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    user.reauthenticateWithCredential(credential).then(() => {
        user.updateEmail(newEmail).then(() => {
            alert('Email updated!');
            if (curEmailEl) curEmailEl.value = newEmail;
        }).catch(error => alert('Error: ' + error.message));
    }).catch(error => alert('Incorrect password: ' + error.message));
}

function updateAccountPassword() {
    const newPassEl = document.getElementById('newAccountPassword');
    const newPass = newPassEl ? newPassEl.value : '';
    const user = auth.currentUser;

    if (!newPass || newPass.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    if (confirm('Change password?')) {
        user.updatePassword(newPass).then(() => {
            alert('Password changed!');
            if (newPassEl) newPassEl.value = '';
        }).catch(error => alert('Error: ' + error.message));
    }
}

function sendPasswordResetEmailFromSettings() {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    auth.sendPasswordResetEmail(user.email).then(() => {
        alert('Reset email sent!');
    }).catch(error => alert('Error: ' + error.message));
}

function openRxTemplateManager() {
    navigateTo('rxTemplateScreen', 'RX Template', 'Header customization');
    const previewImg = document.getElementById('rxPreviewImg');
    const noText = document.getElementById('noRxText');

    if (currentDoctorRxImage) {
        if (previewImg) {
            previewImg.src = currentDoctorRxImage;
            previewImg.style.display = 'block';
        }
        if (noText) noText.style.display = 'none';
    } else {
        if (previewImg) previewImg.style.display = 'none';
        if (noText) noText.style.display = 'block';
    }
}

function saveRxTemplateImage() {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    const fileInput = document.getElementById('rxImageFileInput');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                const maxDim = 900;

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

                currentDoctorRxImage = canvas.toDataURL('image/jpeg', 0.70);
                saveSettingsToCloudAndLocal();
                alert('Prescription header saved!');
                openRxTemplateManager();
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select an image.');
    }
}

async function scanFromDesktopScanner(visitId) {
    alert("جاري الاتصال بالسكانر المكتبي وسحب المستند...");

    try {
        const response = await fetch('http://localhost:5000/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && data.image) {
            const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
            if (!patient) return;
            const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
            if (!visit) return;

            if (!visit.attachments) visit.attachments = [];
            visit.attachments.push({ name: "Desktop_Scan_" + Date.now() + ".jpg", dataUrl: data.image });

            savePatientToCloudAndLocal(patient);
            renderVisits(patient.visits, false);
            alert("تم سحب المستند من السكانر وتخزينه بنجاح!");
        } else {
            alert("تعذر السحب من السكانر: " + (data.error || "تأكد من توصيل الجهاز."));
        }
    } catch (err) {
        console.error(err);
        alert("فشل الاتصال بالجسر المحلي. تأكد أن نافذة البايثون السوداء تعمل على حاسوب العيادة.");
    }
}

function openNetworkHierarchy() {
    navigateTo('networkScreen', 'قاعدة بيانات الشبكة', 'إدارة المستخدمين والأسماء البارزة');
    const container = document.getElementById('networkTreeContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center; color:#64748b;">Loading...</p>';

    if (!navigator.onLine) {
        container.innerHTML = '<p style="text-align:center; color:#b91c1c;">Internet required.</p>';
        return;
    }

    db.collection('network_hierarchy').get().then(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:#64748b;">No users found.</p>';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const nodeUid = doc.id;
            const userEmail = data.email || data.secretaryEmail || 'User';
            const currentDocName = data.doctorName || 'غير مسجل';
            const isFounder = userEmail.toLowerCase() === FOUNDER_EMAIL.toLowerCase();

            html += `
                <div class="node-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">
                    <div class="node-info">
                        <h5 style="margin:0; font-size:0.85rem; color:#0f172a;"><i class="fa-solid fa-envelope" style="color:#0d9488;"></i> ${userEmail}</h5>
                        <p style="margin:2px 0; font-size:0.75rem; color:#64748b;"><b>الاسم البارز:</b> <span style="color:#0d9488; font-weight:700;">${currentDocName}</span></p>
                        <p style="margin:0; font-size:0.75rem; color:#64748b;"><b>Password:</b> ${data.password || 'N/A'}</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                        <span class="node-badge" style="font-size:0.68rem; padding:2px 6px; background:#e0f2fe; color:#0369a1; border-radius:4px;">${data.role || 'Client'}</span>
                        <div style="display:flex; gap:4px;">
                            <button onclick="promptFounderEditName('${nodeUid}', '${(data.doctorName || '').replace(/'/g, "\\'")}', '${userEmail}')" style="background:#ccfbf1; color:#0f766e; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-pen"></i> اسم</button>
                            ${!isFounder ? `<button onclick="promptFounderDeleteNode('${nodeUid}', '${userEmail.replace(/'/g, "\\'")}')" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

function promptFounderEditName(nodeUid, currentName, userEmail) {
    targetNodeUidForNameEdit = nodeUid;
    const emailDisp = document.getElementById('editNameTargetEmail');
    const nameInput = document.getElementById('founderInputDoctorName');
    const modal = document.getElementById('founderEditNameModal');

    if (emailDisp) emailDisp.innerText = userEmail;
    if (nameInput) nameInput.value = currentName !== 'غير مسجل' ? currentName : '';
    if (modal) modal.style.display = 'flex';
}

function closeFounderEditNameModal() {
    const modal = document.getElementById('founderEditNameModal');
    if (modal) modal.style.display = 'none';
    targetNodeUidForNameEdit = null;
}

async function executeFounderUpdateDoctorName() {
    const nameInput = document.getElementById('founderInputDoctorName');
    const newName = nameInput ? nameInput.value.trim() : '';
    if (!targetNodeUidForNameEdit) return;

    try {
        await db.collection('network_hierarchy').doc(targetNodeUidForNameEdit).set({
            doctorName: newName || "نظام عيادة ماستر"
        }, { merge: true });

        closeFounderEditNameModal();
        alert('تم تحديث اسم الطبيب/العيادة بنجاح!');
        openNetworkHierarchy();
    } catch (e) {
        alert('خطأ أثناء التحديث: ' + e.message);
    }
}

function promptFounderDeleteNode(nodeUid, nodeEmail) {
    targetNodeUidToDelete = nodeUid;
    targetNodeEmailToDelete = nodeEmail;
    const emailDisp = document.getElementById('delTargetEmailDisplay');
    const passInput = document.getElementById('founderConfirmPassInput');
    const modal = document.getElementById('founderDeleteModal');

    if (emailDisp) emailDisp.innerText = nodeEmail;
    if (passInput) passInput.value = '';
    if (modal) modal.style.display = 'flex';
}

function closeFounderDeleteModal() {
    const modal = document.getElementById('founderDeleteModal');
    if (modal) modal.style.display = 'none';
    targetNodeUidToDelete = null;
    targetNodeEmailToDelete = null;
}

async function executeFounderDeleteAccount() {
    const passInput = document.getElementById('founderConfirmPassInput');
    const inputPass = passInput ? passInput.value : '';
    if (!inputPass) return;

    try {
        const founderDoc = await db.collection('network_hierarchy').doc(currentUserId).get();
        if (founderDoc.exists && founderDoc.data().password && inputPass !== founderDoc.data().password) {
            alert('Incorrect password.');
            return;
        }

        if (!targetNodeUidToDelete) return;
        await db.collection('network_hierarchy').doc(targetNodeUidToDelete).delete();
        
        closeFounderDeleteModal();
        alert('Account deleted.');
        openNetworkHierarchy();
    } catch (e) {
        alert('Error: ' + e.message);
    }
}

function openAnalyticsDashboard() {
    navigateTo('analyticsScreen', 'Clinic Analytics', 'Smart performance');

    const totalPatients = patients.length;
    let todayVisitsCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    const todayStr = getTodayFormatted();
    const drugFrequency = {};

    patients.forEach(p => {
        if (p.gender === 'Male') maleCount++;
        else if (p.gender === 'Female') femaleCount++;

        if (p.visits) {
            p.visits.forEach(v => {
                if (v.date === todayStr) todayVisitsCount++;
                if (v.drugs) {
                    v.drugs.split('\n').forEach(line => {
                        let cleanDrug = line.replace(/^\d+[-–]\s*/, '').trim();
                        if (cleanDrug) drugFrequency[cleanDrug] = (drugFrequency[cleanDrug] || 0) + 1;
                    });
                }
            });
        }
    });

    const safeText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    safeText('statTotalPatients', totalPatients);
    safeText('statTodayVisits', todayVisitsCount);
    safeText('statMaleCount', maleCount);
    safeText('statFemaleCount', femaleCount);

    const totalGender = maleCount + femaleCount;
    const malePct = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 50;
    const femalePct = totalGender > 0 ? 100 - malePct : 50;

    const maleBar = document.getElementById('ratioMaleBar');
    const femaleBar = document.getElementById('ratioFemaleBar');
    const maleTxt = document.getElementById('ratioMaleText');
    const femaleTxt = document.getElementById('ratioFemaleText');

    if (maleBar) maleBar.style.width = `${malePct}%`;
    if (femaleBar) femaleBar.style.width = `${femalePct}%`;
    if (maleTxt) maleTxt.innerText = `Male: ${malePct}%`;
    if (femaleTxt) femaleTxt.innerText = `Female: ${femalePct}%`;

    const sortedDrugs = Object.entries(drugFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDrugsContainer = document.getElementById('topDrugsList');

    if (topDrugsContainer) {
        topDrugsContainer.innerHTML = sortedDrugs.length === 0 
            ? '<p style="font-size:0.8rem; color:#64748b; text-align:center;">No data.</p>'
            : sortedDrugs.map(([drug, count], idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; border-radius:10px; font-size:0.85rem; font-weight:600;">
                    <span>${idx + 1}. ${drug}</span>
                    <span style="background:#ccfbf1; color:#0f766e; padding:2px 8px; border-radius:6px; font-size:0.75rem;">${count} times</span>
                </div>
            `).join('');
    }
}

function exportPatientMedicalReportPDF() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;

    const safeText = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    safeText('pdfRepName', patient.name + (patient.subName ? ` (${patient.subName})` : ''));
    safeText('pdfRepAge', patient.age);
    safeText('pdfRepGender', patient.gender || 'N/A');
    safeText('pdfRepMarital', patient.marital || 'N/A');
    safeText('pdfRepJob', patient.job || 'N/A');
    safeText('pdfRepPhone', patient.phone || 'N/A');
    safeText('pdfRepDateLabel', `Generated on: ${new Date().toLocaleString()}`);

    const visitsContainer = document.getElementById('pdfRepVisitsContainer');
    const visits = patient.visits || [];

    if (visitsContainer) {
        visitsContainer.innerHTML = visits.length === 0 
            ? '<p style="font-size:0.85rem; color:#64748b;">No visits.</p>'
            : visits.map((v, idx) => `
                <div style="background: #ffffff; border: 1.5px solid #94a3b8; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                    <div style="background: #0f172a; color: #ffffff; padding: 6px 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; justify-content: space-between;">
                        <span>Visit #${visits.length - idx}</span><span>Date: ${v.date || 'N/A'}</span>
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 6px;"><strong>Diagnosis & Notes:</strong> ${v.notes || 'None'}</div>
                    ${v.drugs ? `<div style="font-size: 0.8rem; margin-top: 4px;"><strong>Medications:</strong> ${v.drugs}</div>` : ''}
                </div>
            `).join('');
    }

    const reportContainer = document.getElementById('pdfReportExportContainer');
    if (reportContainer) {
        html2canvas(reportContainer, { scale: 2, useCORS: true }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Medical_Report_${patient.name.replace(/\s+/g, '_')}.pdf`);
        });
    }
}

function openBmiCalculator(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const bmiW = document.getElementById('bmiWeight');
    const bmiH = document.getElementById('bmiHeight');
    const bmiModal = document.getElementById('bmiCalculatorModal');

    if (bmiW) bmiW.value = visit.bmiWeight || '';
    if (bmiH) bmiH.value = visit.bmiHeight || '';
    calculateBmiLive();
    if (bmiModal) bmiModal.style.display = 'flex';
}

function closeBmiModal() {
    if (!isSubscriptionExpired && currentVisitIdForModal && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) {
            const visit = patient.visits.find(v => Number(v.visitId) === Number(currentVisitIdForModal));
            if (visit) {
                const wInput = document.getElementById('bmiWeight');
                const hInput = document.getElementById('bmiHeight');
                const w = wInput ? wInput.value : '';
                const h = hInput ? hInput.value : '';
                visit.bmiWeight = w;
                visit.bmiHeight = h;
                if (w && h && Number(h) > 0) {
                    const hM = Number(h) / 100;
                    visit.bmiScore = (Number(w) / (hM * hM)).toFixed(1);
                } else {
                    visit.bmiScore = '';
                }
                savePatientToCloudAndLocal(patient);
                renderVisits(patient.visits, false);
            }
        }
    }
    const bmiModal = document.getElementById('bmiCalculatorModal');
    if (bmiModal) bmiModal.style.display = 'none';
}

function calculateBmiLive() {
    const wInput = document.getElementById('bmiWeight');
    const hInput = document.getElementById('bmiHeight');
    const w = wInput ? parseFloat(wInput.value) : NaN;
    const h = hInput ? parseFloat(hInput.value) : NaN;
    const scoreDisplay = document.getElementById('bmiScoreDisplay');
    const badgeContainer = document.getElementById('bmiBadgeContainer');

    if (!w || !h || w <= 0 || h <= 0) {
        if (scoreDisplay) scoreDisplay.innerText = '—';
        if (badgeContainer) badgeContainer.innerHTML = '<span class="bmi-badge" style="background:#f1f5f9; color:#64748b;">أدخل الوزن والطول للحساب</span>';
        return;
    }

    const hM = h / 100;
    const bmi = (w / (hM * hM)).toFixed(1);
    if (scoreDisplay) scoreDisplay.innerText = bmi;

    let badgeText = '';
    let badgeStyle = '';

    if (bmi < 18.5) {
        badgeText = `نحافة (Underweight: ${bmi})`;
        badgeStyle = 'background:#fef3c7; color:#d97706;';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        badgeText = `وزن طبيعي (Normal: ${bmi})`;
        badgeStyle = 'background:#dcfce7; color:#15803d;';
    } else if (bmi >= 25 && bmi <= 29.9) {
        badgeText = `زيادة وزن (Overweight: ${bmi})`;
        badgeStyle = 'background:#ffedd5; color:#c2410c;';
    } else {
        badgeText = `سمنة (Obese: ${bmi})`;
        badgeStyle = 'background:#fee2e2; color:#b91c1c;';
    }

    if (badgeContainer) badgeContainer.innerHTML = `<span class="bmi-badge" style="${badgeStyle}">${badgeText}</span>`;
}

function autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

function handleDrugsInput(textarea, visitId) {
    if (isUserSecretary || isSubscriptionExpired) return;
    autoResizeTextarea(textarea);
    handleLiveInput(textarea, 'drugs', visitId);
}

function handleDrugsKeyDown(event, textarea, visitId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '\n\n' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        autoResizeTextarea(textarea);
        handleLiveInput(textarea, 'drugs', visitId);
    }
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
            const lineTextSpan = document.getElementById(`line-text-${category}-${visitId}`);
            if (lineTextSpan) lineTextSpan.innerText = currentLine;
        }
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
    const textarea = document.getElementById(`${category === 'drugs' ? 'vDrugs' : category === 'labs' ? 'vLabs' : category === 'scans' ? 'vScans' : 'vNotes'}-${visitId}`);
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    lines[lines.length - 1] = term;
    textarea.value = lines.join('\n') + '\n';
    autoResizeTextarea(textarea);

    const box = document.getElementById(`suggestions-${category}-${visitId}`);
    const bar = document.getElementById(`save-bar-${category}-${visitId}`);
    if (box) box.style.display = 'none';
    if (bar) bar.style.display = 'none';

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
        saveSettingsToCloudAndLocal();
        const btn = document.getElementById(`btn-save-${category}-${visitId}`);
        if (btn) {
            btn.innerText = 'Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.innerText = 'Save';
                btn.classList.remove('saved');
                const bar = document.getElementById(`save-bar-${category}-${visitId}`);
                if (bar) bar.style.display = 'none';
            }, 1000);
        }
    }
}

function handleMhLiveInput(inputEl, inputKey) {
    autoResizeTextarea(inputEl);
    const val = inputEl.value.trim();
    const box = document.getElementById(`suggestions-${inputKey}`);
    const saveBar = document.getElementById(`save-bar-${inputKey}`);

    if (!val || val.length < 1) {
        if (box) box.style.display = 'none';
        if (saveBar) saveBar.style.display = 'none';
        return;
    }

    const lines = inputEl.value.split('\n');
    const currentLine = lines[lines.length - 1].trim();

    if (currentLine.length > 0) {
        if (saveBar) {
            saveBar.style.display = 'flex';
            const lineTextSpan = document.getElementById(`line-text-${inputKey}`);
            if (lineTextSpan) lineTextSpan.innerText = currentLine;
        }
        const terms = medicalDict.mh_history || [];
        const matches = terms.filter(t => t.toLowerCase().includes(currentLine.toLowerCase()) && t.toLowerCase() !== currentLine.toLowerCase());

        if (matches.length > 0 && box) {
            box.innerHTML = matches.map(m => `<div class="suggestion-item" onmousedown="selectMhSuggestion('${inputKey}', '${m.replace(/'/g, "\\'")}')">${m}</div>`).join('');
            box.style.display = 'block';
        } else if (box) {
            box.style.display = 'none';
        }
    } else {
        if (saveBar) saveBar.style.display = 'none';
        if (box) box.style.display = 'none';
    }
}

function selectMhSuggestion(inputKey, term) {
    const el = inputKey === 'mh_other' ? document.getElementById('mh-cd-other') : document.getElementById(`mh-${inputKey.replace('mh_', '')}`);
    if (!el) return;

    const lines = el.value.split('\n');
    lines[lines.length - 1] = term;
    el.value = lines.join('\n') + '\n';
    autoResizeTextarea(el);

    const box = document.getElementById(`suggestions-${inputKey}`);
    const bar = document.getElementById(`save-bar-${inputKey}`);
    if (box) box.style.display = 'none';
    if (bar) bar.style.display = 'none';
    el.focus();
}

function hideMhSuggestions(inputKey) {
    setTimeout(() => {
        const box = document.getElementById(`suggestions-${inputKey}`);
        const bar = document.getElementById(`save-bar-${inputKey}`);
        if (box) box.style.display = 'none';
        if (bar) bar.style.display = 'none';
    }, 200);
}

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
                const bar = document.getElementById(`save-bar-${inputKey}`);
                if (bar) bar.style.display = 'none';
            }, 1000);
        }
    }
}

function toggleOtherInput() {
    const chk = document.getElementById('mh-other-check');
    const box = document.getElementById('mh-other-box');
    if (chk && box) box.style.display = chk.checked ? 'block' : 'none';
}

function updateVisitFieldData(visitId, category, value) {
    if (isSubscriptionExpired) return;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    visit[category] = value;
    savePatientToCloudAndLocal(patient);
}

function handleLmpInput(visitId, lmpVal) {
    updateVisitFieldData(visitId, 'obsLmp', lmpVal);
    if (lmpVal) {
        let lmpDate = new Date(lmpVal);
        if (!isNaN(lmpDate.getTime())) {
            let eddDate = new Date(lmpDate.getTime() + (280 * 24 * 60 * 60 * 1000));
            let year = eddDate.getFullYear();
            let month = String(eddDate.getMonth() + 1).padStart(2, '0');
            let day = String(eddDate.getDate()).padStart(2, '0');
            let eddStr = `${year}-${month}-${day}`;
            
            const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
            if (patient) {
                const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
                if (visit) {
                    visit.obsEdd = eddStr;
                    savePatientToCloudAndLocal(patient);
                    const eddInput = document.getElementById(`obsEdd-${visitId}`);
                    if (eddInput) eddInput.value = eddStr;
                }
            }
        }
    }
}

function updateVisitDate(visitId, newDate) {
    if (isSubscriptionExpired) return;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    visit.date = newDate;
    savePatientToCloudAndLocal(patient);
}

function updateBpFields(visitId) {
    if (isSubscriptionExpired) return;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const sysEl = document.getElementById(`vBpSys-${visitId}`);
    const diasEl = document.getElementById(`vBpDias-${visitId}`);
    const sys = sysEl ? sysEl.value.trim() : '';
    const dias = diasEl ? diasEl.value.trim() : '';

    if (sys || dias) {
        visit.bp = `${sys || '___'}/${dias || '___'} mmHg`;
    } else {
        visit.bp = '';
    }
    savePatientToCloudAndLocal(patient);
}

function handleFileUpload(input, visitId) {
    if (isSubscriptionExpired) return;
    if (input.files && input.files.length > 0) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (!patient) return;
        const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
        if (!visit) return;

        if (!visit.attachments) visit.attachments = [];

        const filesArray = Array.from(input.files);
        let processedCount = 0;

        filesArray.forEach(file => {
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

                    visit.attachments.push({ name: file.name, dataUrl: compressedDataUrl });
                    processedCount++;

                    if (processedCount === filesArray.length) {
                        savePatientToCloudAndLocal(patient);
                        renderVisits(patient.visits, false);
                    }
                };
            };
            reader.readAsDataURL(file);
        });
    }
}

function previewAttachmentImage(imgSrc) {
    const modalImg = document.getElementById('previewModalImg');
    const modal = document.getElementById('imagePreviewModal');
    if (modalImg) modalImg.src = imgSrc;
    if (modal) modal.style.display = 'flex';
}

function closeImagePreview() {
    const modal = document.getElementById('imagePreviewModal');
    if (modal) modal.style.display = 'none';
}

function openEditPatientModal() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('editPName', patient.name);
    setVal('editPSubName', patient.subName);
    setVal('editPAge', patient.age);
    setVal('editPGender', patient.gender);
    setVal('editPMarital', patient.marital);
    setVal('editPJob', patient.job);
    setVal('editPPhone', patient.phone);

    const modal = document.getElementById('editPatientModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditPatientModal() {
    const modal = document.getElementById('editPatientModal');
    if (modal) modal.style.display = 'none';
}

function saveEditedPatient() {
    const nameEl = document.getElementById('editPName');
    const subNameEl = document.getElementById('editPSubName');
    const ageEl = document.getElementById('editPAge');
    const genderEl = document.getElementById('editPGender');
    const maritalEl = document.getElementById('editPMarital');
    const jobEl = document.getElementById('editPJob');
    const phoneEl = document.getElementById('editPPhone');

    const name = nameEl ? nameEl.value.trim() : '';
    const subName = subNameEl ? subNameEl.value.trim() : '';
    const age = ageEl ? Number(ageEl.value) : 0;
    if (!name || !age) return;

    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;

    patient.name = name;
    patient.subName = subName;
    patient.age = age;
    patient.gender = genderEl ? genderEl.value || 'Unspecified' : 'Unspecified';
    patient.marital = maritalEl ? maritalEl.value || 'Single' : 'Single';
    patient.job = jobEl ? jobEl.value || 'Unspecified' : 'Unspecified';
    patient.phone = phoneEl ? phoneEl.value || 'N/A' : 'N/A';

    savePatientToCloudAndLocal(patient);
    closeEditPatientModal();

    const recName = document.getElementById('recPatientName');
    const recMeta = document.getElementById('recPatientMeta');
    if (recName) recName.innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
    if (recMeta) recMeta.innerHTML = `Age: ${patient.age} | Gender: ${patient.gender} | Marital: ${patient.marital} | Job: ${patient.job} | Phone: ${patient.phone}`;
}

function confirmDeletePatientRecord() {
    if (confirm('Delete patient record?')) {
        const idx = patients.findIndex(p => Number(p.id) === Number(currentPatientId));
        if (idx !== -1) {
            trashBin.unshift({ type: 'patient', deletedAt: new Date().toLocaleString(), data: patients.splice(idx, 1)[0] });
            saveTrashToCloudAndLocal();
            localStorage.setItem('clinic_patients', JSON.stringify(patients));
        }
        openPatientsArchive();
    }
}

function confirmDeleteVisit(visitId) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient || patient.visits.length <= 1) return;
    if (confirm('Delete visit?')) {
        const vIndex = patient.visits.findIndex(v => Number(v.visitId) === Number(visitId));
        if (vIndex !== -1) {
            trashBin.unshift({ type: 'visit', patientId: patient.id, patientName: patient.name, deletedAt: new Date().toLocaleString(), data: patient.visits.splice(vIndex, 1)[0] });
            saveTrashToCloudAndLocal();
            savePatientToCloudAndLocal(patient);
            renderVisits(patient.visits, false);
        }
    }
}

function openTrashBin() {
    navigateTo('trashScreen', 'Trash Bin', 'Recover deleted items');
    renderTrashItems();
}

function renderTrashItems() {
    const container = document.getElementById('trashItemsContainer');
    if (!container) return;
    container.innerHTML = trashBin.length === 0 
        ? '<p style="text-align:center; color:#64748b;">Empty.</p>'
        : trashBin.map((item, index) => `
            <div class="trash-card">
                <div><h4>${item.data.name || item.patientName}</h4></div>
                <button class="btn-restore" onclick="restoreTrashItem(${index})">Restore</button>
            </div>
        `).join('');
}

function restoreTrashItem(index) {
    const item = trashBin.splice(index, 1)[0];
    if (item.type === 'patient') {
        patients.unshift(item.data);
        savePatientToCloudAndLocal(item.data);
    } else {
        const patient = patients.find(p => Number(p.id) === Number(item.patientId));
        if (patient) {
            patient.visits.unshift(item.data);
            savePatientToCloudAndLocal(patient);
        }
    }
    saveTrashToCloudAndLocal();
    renderTrashItems();
}

function confirmEmptyTrash() {
    trashBin = [];
    saveTrashToCloudAndLocal();
    renderTrashItems();
}

function openMedHistoryModal(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const mh = visit.medHistory || {};
    const checkboxes = document.querySelectorAll('.mh-cd');
    checkboxes.forEach(cb => {
        cb.checked = mh.conditions && mh.conditions.includes(cb.value);
    });

    const otherChk = document.getElementById('mh-other-check');
    const otherIn = document.getElementById('mh-cd-other');
    const otherBox = document.getElementById('mh-other-box');

    if (otherChk) otherChk.checked = !!mh.otherCondition;
    if (otherIn) otherIn.value = mh.otherCondition || '';
    if (otherBox) otherBox.style.display = mh.otherCondition ? 'block' : 'none';

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('mh-prev-admission', mh.admission);
    setVal('mh-past-surgery', mh.surgery);
    setVal('mh-family-history', mh.family);
    setVal('mh-drug-allergy', mh.allergy);
    setVal('mh-chronic-drugs', mh.chronicDrugs);
    setVal('mh-smoking', mh.smoking || 'Non-smoker');
    setVal('mh-alcohol', mh.alcohol || 'Non-drinker');
    setVal('mh-notes', mh.notes);

    const modal = document.getElementById('medHistoryModal');
    if (modal) modal.style.display = 'flex';
}

function closeMedHistoryModal() {
    if (!isSubscriptionExpired && currentVisitIdForModal && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) {
            const visit = patient.visits.find(v => Number(v.visitId) === Number(currentVisitIdForModal));
            if (visit) {
                const conditions = [];
                document.querySelectorAll('.mh-cd:checked').forEach(cb => conditions.push(cb.value));

                const otherChk = document.getElementById('mh-other-check');
                const otherIn = document.getElementById('mh-cd-other');
                const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

                visit.medHistory = {
                    conditions: conditions,
                    otherCondition: otherChk && otherChk.checked && otherIn ? otherIn.value : '',
                    admission: getVal('mh-prev-admission'),
                    surgery: getVal('mh-past-surgery'),
                    family: getVal('mh-family-history'),
                    allergy: getVal('mh-drug-allergy'),
                    chronicDrugs: getVal('mh-chronic-drugs'),
                    smoking: getVal('mh-smoking'),
                    alcohol: getVal('mh-alcohol'),
                    notes: getVal('mh-notes')
                };

                savePatientToCloudAndLocal(patient);
                renderVisits(patient.visits, false);
            }
        }
    }
    const modal = document.getElementById('medHistoryModal');
    if (modal) modal.style.display = 'none';
}

function openRxModal(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const safeText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
    safeText('rxDragPatientDetailsText', `Name: ${patient.name + (patient.subName ? ` (${patient.subName})` : '')} | Age: ${patient.age} | ${patient.gender || ''}`);
    safeText('rxDragDateText', visit.date || getTodayFormatted());
    
    const bpVal = visit.bp ? `BP: ${visit.bp}` : 'BP: _____ / _____ mmHg';
    const hrVal = visit.hr ? `HR: ${visit.hr} bpm` : 'HR: _____ bpm';
    const tempVal = visit.temp ? `Temp: ${visit.temp} °C` : 'Temp: _____ °C';
    const bmiVal = visit.bmiScore ? `BMI: ${visit.bmiScore}` : 'BMI: _____';

    safeText('rxDragVitalsText', `${bpVal} | ${hrVal} | ${tempVal} | ${bmiVal}`);
    safeText('rxDragTreatmentText', visit.drugs || 'No medications prescribed.');

    const container = document.getElementById('rxCanvasContainer');
    if (container) {
        const oldImg = container.querySelector('.rx-bg-img');
        if (oldImg) oldImg.remove();

        if (currentDoctorRxImage) {
            const img = document.createElement('img');
            img.src = currentDoctorRxImage;
            img.className = 'rx-bg-img';
            container.insertBefore(img, container.firstChild);
        }
    }

    loadSavedRxLayout();
    const rxModal = document.getElementById('rxModal');
    if (rxModal) rxModal.style.display = 'flex';
}

function closeRxModal() {
    const rxModal = document.getElementById('rxModal');
    if (rxModal) rxModal.style.display = 'none';
}

function toggleRxConfigMode() {
    isConfigMode = !isConfigMode;
    document.querySelectorAll('.draggable-box').forEach(box => {
        if (isConfigMode) box.classList.add('config-mode');
        else box.classList.remove('config-mode');
    });
    updateConfigModeUI();
}

function updateConfigModeUI() {
    const hint = document.getElementById('rxModeHint');
    const saveBtn = document.getElementById('rxSaveLayoutBtn');
    if (isConfigMode) {
        if (hint) hint.innerText = 'Config mode active';
        if (saveBtn) saveBtn.style.display = 'block';
    } else {
        if (hint) hint.innerText = 'RX ready';
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
    el.style.fontSize = `${currentSize + delta}px`;
}

function saveRxLayoutPositions() {
    isConfigMode = false;
    document.querySelectorAll('.draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();
    saveSettingsToCloudAndLocal();
    alert('RX Layout saved successfully!');
}

function loadSavedRxLayout() {
    const savedLayout = JSON.parse(localStorage.getItem('doctor_rx_layout') || '{}');
    for (const [boxId, data] of Object.entries(savedLayout)) {
        const box = document.getElementById(boxId);
        if (box && data) {
            if (data.top) box.style.top = data.top;
            if (data.left) box.style.left = data.left;
            if (data.fontSize) {
                const textEl = box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text');
                if (textEl) textEl.style.fontSize = data.fontSize;
            }
        }
    }
}

function printPrescriptionDirectly() {
    window.print();
}

function openPrescriptionPDF() {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;
    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Prescription_${Date.now()}.pdf`);
        controls.forEach(c => c.style.display = '');
    });
}

function initDraggableElements() {
    let activeBox = null;
    let startX = 0, startY = 0, initialX = 0, initialY = 0;

    document.querySelectorAll('.draggable-box').forEach(box => {
        box.addEventListener('pointerdown', e => {
            if (!isConfigMode || e.target.tagName === 'BUTTON') return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            initialX = box.offsetLeft;
            initialY = box.offsetTop;
            box.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        box.addEventListener('pointermove', e => {
            if (!activeBox || activeBox !== box) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            box.style.left = `${initialX + dx}px`;
            box.style.top = `${initialY + dy}px`;
        });

        box.addEventListener('pointerup', e => {
            if (activeBox === box) {
                activeBox = null;
                box.releasePointerCapture(e.pointerId);
            }
        });
    });
}

function autoSaveMedicalRecord() {}

function showMainMenu() {
    const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";
    navigateTo('mainScreen', customBrandName, translations[currentLang].headerSub);
}

function openPatientsArchive() {
    navigateTo('archiveScreen', translations[currentLang].archive, 'Search & records');
    
    setTimeout(() => {
        const genderEl = document.getElementById('filterGender');
        const ageGroupEl = document.getElementById('filterAgeGroup');
        const sortEl = document.getElementById('filterSort');

        const savedGender = localStorage.getItem('clinic_filter_gender');
        const savedAgeGroup = localStorage.getItem('clinic_filter_age_group');
        const savedSort = localStorage.getItem('clinic_filter_sort');

        if (genderEl && savedGender !== null) genderEl.value = savedGender;
        if (ageGroupEl && savedAgeGroup !== null) ageGroupEl.value = savedAgeGroup;
        if (sortEl && savedSort !== null) {
            sortEl.value = savedSort;
        } else if (sortEl) {
            sortEl.value = 'newest';
        }

        filterPatients();
    }, 50);
}

function filterPatients() {
    try {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        
        const genderEl = document.getElementById('filterGender');
        const ageGroupEl = document.getElementById('filterAgeGroup');
        const sortEl = document.getElementById('filterSort');

        const gender = genderEl ? genderEl.value : '';
        const ageGroup = ageGroupEl ? ageGroupEl.value : '';
        const sortOrder = sortEl ? sortEl.value : 'newest';

        if (genderEl && ageGroupEl && sortEl) {
            localStorage.setItem('clinic_filter_gender', gender);
            localStorage.setItem('clinic_filter_age_group', ageGroup);
            localStorage.setItem('clinic_filter_sort', sortOrder);
        }

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

        filtered.sort((a, b) => {
            const idA = Number(a && a.id) || 0;
            const idB = Number(b && b.id) || 0;
            return sortOrder === 'oldest' ? idA - idB : idB - idA;
        });

        renderPatientsList(filtered);
    } catch (e) {
        console.error("Filter error:", e);
    }
}

function openDictionaryManager() {
    navigateTo('dictScreen', 'Dictionary Manager', 'Manage terms');
    renderDictTerms();
}

function renderDictTerms() {
    const catSelect = document.getElementById('dictCategorySelect');
    const cat = catSelect ? catSelect.value : 'drugs';
    const terms = medicalDict[cat] || [];
    const container = document.getElementById('dictItemsList');
    if (!container) return;

    container.innerHTML = terms.length === 0 
        ? '<p style="text-align:center; color:#64748b;">No terms in this category.</p>'
        : terms.map((term, index) => `
            <div class="dict-tag">
                <span>${term}</span>
                <button onclick="removeDictTerm('${cat}', ${index})">Delete</button>
            </div>
        `).join('') + `
            <div style="display:flex; gap:8px; margin-top:12px;">
                <div class="input-wrapper" style="flex:1;"><input type="text" id="newDictTermInput" placeholder="Add new term..."></div>
                <button class="btn-main" onclick="addNewDictTerm('${cat}')" style="width:auto; padding:0 16px;">Add</button>
            </div>
        `;
}

function addNewDictTerm(cat) {
    const input = document.getElementById('newDictTermInput');
    if (!input) return;
    const val = input.value.trim();
    if (val && medicalDict[cat] && !medicalDict[cat].includes(val)) {
        medicalDict[cat].push(val);
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}

function removeDictTerm(category, index) {
    if (medicalDict[category]) {
        medicalDict[category].splice(index, 1);
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}

function saveNewPatient(e) {
    e.preventDefault();
    const pNameEl = document.getElementById('pName');
    const pSubNameEl = document.getElementById('pSubName');
    const pAgeEl = document.getElementById('pAge');
    const pGenderEl = document.getElementById('pGender');
    const pMaritalEl = document.getElementById('pMarital');
    const pJobEl = document.getElementById('pJob');
    const pPhoneEl = document.getElementById('pPhone');

    const rawName = pNameEl ? pNameEl.value.trim() : '';
    const rawSubName = pSubNameEl ? pSubNameEl.value.trim() : '';

    const nameExists = patients.some(p => p.name.toLowerCase() === rawName.toLowerCase());
    if (nameExists && !rawSubName) {
        alert('⚠️ تنبيه: يوجد مريض بنفس الاسم مسجل مسبقاً! يرجى إدخال اسم الجد الرابع أو العشيرة أو ملاحظة تمييز في حقل "اسم الجد الرابع/العشيرة" للمتابعة.');
        if (pSubNameEl) pSubNameEl.focus();
        return;
    }

    const newPatient = {
        id: Date.now(),
        name: rawName,
        subName: rawSubName,
        age: pAgeEl ? Number(pAgeEl.value) : 0,
        gender: pGenderEl ? pGenderEl.value || 'Unspecified' : 'Unspecified',
        marital: pMaritalEl ? pMaritalEl.value || 'Single' : 'Single',
        job: pJobEl ? pJobEl.value || 'Unspecified' : 'Unspecified',
        phone: pPhoneEl ? pPhoneEl.value || 'N/A' : 'N/A',
        visits: [{ visitId: Date.now(), date: getTodayFormatted(), medHistory: {}, notes: '', attachments: [] }]
    };
    patients.unshift(newPatient);
    savePatientToCloudAndLocal(newPatient);
    openMedicalRecord(newPatient.id);
}

function renderPatientsList(list) {
    const container = document.getElementById('patientsList');
    if (!container) return;
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

function openMedicalRecord(id, saveState = true) {
    currentPatientId = id;
    navigateTo('medicalRecordScreen', 'Patient Medical Record', 'View details', saveState);
    const patient = patients.find(p => Number(p.id) === Number(id));
    if (patient) {
        const recName = document.getElementById('recPatientName');
        const recMeta = document.getElementById('recPatientMeta');
        if (recName) recName.innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
        if (recMeta) recMeta.innerHTML = `Age: ${patient.age} | Gender: ${patient.gender || 'N/A'} | Marital: ${patient.marital || 'N/A'} | Job: ${patient.job || 'N/A'} | Phone: ${patient.phone || 'N/A'}`;
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

function renderVisits(visits, forceFullRender = true) {
    const container = document.getElementById('visitsContainer');
    if (!container) return;
    container.innerHTML = visits.map((v, index) => {
        const mh = v.medHistory || {};
        const t = translations[currentLang];
        let mhSummaryParts = [];
        
        if (mh.conditions && mh.conditions.length > 0) {
            const translatedConds = mh.conditions.map(c => (t.chronicNames && t.chronicNames[c]) ? t.chronicNames[c] : c);
            mhSummaryParts.push(`<b>الأمراض المزمنة:</b> ${translatedConds.join(', ')}`);
        }
        if (mh.otherCondition) mhSummaryParts.push(`<b>أخرى:</b> ${mh.otherCondition}`);
        if (mh.admission) mhSummaryParts.push(`<b>دخول المستشفى:</b> ${mh.admission}`);
        if (mh.surgery) mhSummaryParts.push(`<b>العمليات:</b> ${mh.surgery}`);
        if (mh.family) mhSummaryParts.push(`<b>التاريخ العائلي:</b> ${mh.family}`);
        if (mh.allergy) mhSummaryParts.push(`<b>حساسية الأدوية:</b> ${mh.allergy}`);
        if (mh.chronicDrugs) mhSummaryParts.push(`<b>أدوية مزمنة:</b> ${mh.chronicDrugs}`);
        if (mh.smoking) mhSummaryParts.push(`<b>التدخين:</b> ${mh.smoking}`);
        if (mh.alcohol) mhSummaryParts.push(`<b>الكحول:</b> ${mh.alcohol}`);
        if (mh.notes) mhSummaryParts.push(`<b>ملاحظات:</b> ${mh.notes}`);

        const mhSummaryText = mhSummaryParts.length > 0 ? mhSummaryParts.join(' | ') : 'لم يتم تسجيل تفاصيل التاريخ المرضي بعد.';

        let bpSys = '';
        let bpDias = '';
        if (v.bp && v.bp.includes('/')) {
            const parts = v.bp.split('/');
            bpSys = parts[0] !== '___' ? parts[0] : '';
            bpDias = parts[1] ? parts[1].replace(' mmHg', '').trim() : '';
        } else if (v.bp) {
            bpSys = v.bp;
        }

        const cfg = specialtyConfig;

        return `
        <div class="visit-card" data-visit-id="${v.visitId}">
            <div class="visit-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span>Visit Date:</span>
                    <input type="date" value="${v.date || getTodayFormatted()}" onchange="updateVisitDate(${v.visitId}, this.value)" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 2px 6px; font-size: 0.8rem; font-weight: 700; outline: none; cursor: pointer;">
                </div>
                ${visits.length > 1 ? `<button onclick="confirmDeleteVisit(${v.visitId})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:2px 8px; font-size:0.7rem; cursor:pointer;"><i class="fa-solid fa-trash"></i> Delete Visit</button>` : ''}
            </div>

            ${cfg.medHistory ? `
            <button type="button" class="btn-med-history" onclick="openMedHistoryModal(${v.visitId})">
                <span><i class="fa-solid fa-notes-medical" style="color:#0d9488;"></i> Medical History & Chronic Diseases</span>
                <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="medical-history-preview-card">
                ${mhSummaryText}
            </div>
            ` : ''}

            ${cfg.vitals ? `
            <button type="button" class="btn-bmi-trigger" onclick="openBmiCalculator(${v.visitId})">
                <span><i class="fa-solid fa-calculator" style="color:#0284c7;"></i> Vital Signs & BMI Calculator</span>
                <span style="font-size:0.75rem; background:#e0f2fe; padding:2px 8px; border-radius:6px;">Score: ${v.bmiScore || '—'}</span>
            </button>

            <div class="vital-box" style="margin-bottom: 12px;">
                <div class="vital-row">
                    <div class="vital-item">
                        <span class="vital-label"><i class="fa-solid fa-arrow-trend-up"></i> Systolic BP (الضغط العالي)</span>
                        <div class="vital-inputs"><input type="number" id="vBpSys-${v.visitId}" value="${bpSys}" placeholder="120" oninput="updateBpFields(${v.visitId})"><span>mmHg</span></div>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label"><i class="fa-solid fa-arrow-trend-down"></i> Diastolic BP (الضغط الواطي)</span>
                        <div class="vital-inputs"><input type="number" id="vBpDias-${v.visitId}" value="${bpDias}" placeholder="80" oninput="updateBpFields(${v.visitId})"><span>mmHg</span></div>
                    </div>
                </div>
                <div class="vital-row">
                    <div class="vital-item">
                        <span class="vital-label"><i class="fa-solid fa-heart"></i> Heart Rate (HR)</span>
                        <div class="vital-inputs"><input type="number" value="${v.hr || ''}" placeholder="75" oninput="updateVisitFieldData(${v.visitId}, 'hr', this.value)"><span>bpm</span></div>
                    </div>
                    <div class="vital-item">
                        <span class="vital-label"><i class="fa-solid fa-temperature-high"></i> Temperature</span>
                        <div class="vital-inputs"><input type="number" step="0.1" value="${v.temp || ''}" placeholder="37.0" oninput="updateVisitFieldData(${v.visitId}, 'temp', this.value)"><span>°C</span></div>
                    </div>
                </div>
                <div class="vital-row">
                    <div class="vital-item" style="grid-column: span 2;">
                        <span class="vital-label"><i class="fa-solid fa-weight-scale"></i> Weight</span>
                        <div class="vital-inputs"><input type="number" value="${v.bmiWeight || ''}" placeholder="70" oninput="updateVisitFieldData(${v.visitId}, 'bmiWeight', this.value)"><span>kg</span></div>
                    </div>
                </div>
            </div>
            ` : ''}

            ${cfg.obsGyn ? `
            <div class="group-card" style="background:#fce7f3; border-color:#f472b6; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#be185d; display:block; margin-bottom:10px;"><i class="fa-solid fa-person-pregnant"></i> تفاصيل النسائية والتوليد (Obstetrics & Gynecology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">LMP (آخر دورة)</span><div class="input-wrapper"><input type="date" id="obsLmp-${v.visitId}" value="${v.obsLmp || ''}" oninput="handleLmpInput(${v.visitId}, this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">EDD (موعد الولادة التلقائي)</span><div class="input-wrapper"><input type="date" id="obsEdd-${v.visitId}" value="${v.obsEdd || ''}" oninput="updateVisitFieldData(${v.visitId}, 'obsEdd', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Gravidity (عدد مرات الحمل - G)</span><div class="input-wrapper"><input type="text" value="${v.obsG || ''}" placeholder="مثال: G3" oninput="updateVisitFieldData(${v.visitId}, 'obsG', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Parity (الولادات - P)</span><div class="input-wrapper"><input type="text" value="${v.obsP || ''}" placeholder="مثال: P2" oninput="updateVisitFieldData(${v.visitId}, 'obsP', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Abortions (الإسقاطات - A)</span><div class="input-wrapper"><input type="text" value="${v.obsA || ''}" placeholder="مثال: A1" oninput="updateVisitFieldData(${v.visitId}, 'obsA', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات السونار والفحص السريري للنسائية</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب تفاصيل السونار أو الفحص النسائي..." oninput="updateVisitFieldData(${v.visitId}, 'obsNotes', this.value)" style="font-size:0.85rem;">${v.obsNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.ortho ? `
            <div class="group-card" style="background:#fef3c7; border-color:#f59e0b; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#b45309; display:block; margin-bottom:10px;"><i class="fa-solid fa-bone"></i> تقييم العظام والمفاصل والكسور (Orthopedics)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">المفصل / الإصابة المتأثرة</span><div class="input-wrapper"><input type="text" value="${v.orthoJoint || ''}" placeholder="مثال: مفصل الركبة اليمنى" oninput="updateVisitFieldData(${v.visitId}, 'orthoJoint', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">درجة الخشونة / الإصابة</span><div class="input-wrapper"><input type="text" value="${v.orthoGrade || ''}" placeholder="مثال: Grade II / خشونة متوسطة" oninput="updateVisitFieldData(${v.visitId}, 'orthoGrade', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">مدى الحركة والفحص الفيزيائي (Range of Motion)</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب نتائج الفحص الحركي والفيزيائي..." oninput="updateVisitFieldData(${v.visitId}, 'orthoNotes', this.value)" style="font-size:0.85rem;">${v.orthoNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.neuro ? `
            <div class="group-card" style="background:#f3e8ff; border-color:#c084fc; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#7e22ce; display:block; margin-bottom:10px;"><i class="fa-solid fa-brain"></i> فحص الجملة العصبية (Neurology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">مقياس غلاسكو للوعي (GCS)</span><div class="input-wrapper"><input type="text" value="${v.neuroGcs || ''}" placeholder="مثال: 15/15" oninput="updateVisitFieldData(${v.visitId}, 'neuroGcs', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الأعصاب القحفية (Cranial Nerves)</span><div class="input-wrapper"><input type="text" value="${v.neuroNerves || ''}" placeholder="مثال: Intact / سليمة" oninput="updateVisitFieldData(${v.visitId}, 'neuroNerves', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الفحص الحسي والحركي وملاحظات الأعصاب</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب تفاصيل الفحص العصبي..." oninput="updateVisitFieldData(${v.visitId}, 'neuroNotes', this.value)" style="font-size:0.85rem;">${v.neuroNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.peds ? `
            <div class="group-card" style="background:#e0f2fe; border-color:#38bdf8; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#0369a1; display:block; margin-bottom:10px;"><i class="fa-solid fa-child"></i> فحص الأطفال ومنحنيات النمو البيومترية (WHO Pediatrics)</span>
                
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">العمر بالأشهر</span><div class="input-wrapper"><input type="number" id="pedsAgeMonths-${v.visitId}" value="${v.pedsAgeMonths || ''}" placeholder="مثال: 12" oninput="updateVisitFieldData(${v.visitId}, 'pedsAgeMonths', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الوزن الحالي (كغ)</span><div class="input-wrapper"><input type="number" step="0.1" id="pedsWeight-${v.visitId}" value="${v.pedsWeight || ''}" placeholder="مثال: 9.5" oninput="updateVisitFieldData(${v.visitId}, 'pedsWeight', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الطول الحالي (سم)</span><div class="input-wrapper"><input type="number" step="0.1" id="pedsHeight-${v.visitId}" value="${v.pedsHeight || ''}" placeholder="مثال: 75" oninput="updateVisitFieldData(${v.visitId}, 'pedsHeight', this.value)" style="font-size:0.85rem;"></div></div>
                </div>

                <button type="button" class="btn-main" onclick="calculateVisitChildGrowth(${v.visitId})" style="background:#0284c7; padding:6px 12px; font-size:0.78rem; margin-top:4px; margin-bottom:8px;">
                    <i class="fa-solid fa-calculator"></i> حساب وتقييم نمو الطفل (WHO)
                </button>

                <div id="pedsGrowthResult-${v.visitId}" style="display:${v.pedsGrowthResult ? 'block' : 'none'}; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:8px; font-size:0.78rem; color:#14532d; margin-bottom:8px;">
                    ${v.pedsGrowthResult || ''}
                </div>

                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">حالة اللقاحات والمطعوم</span><div class="input-wrapper"><input type="text" value="${v.pedsVaccine || ''}" placeholder="مكتملة حسب العمر" oninput="updateVisitFieldData(${v.visitId}, 'pedsVaccine', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">نوع التغذية</span><div class="input-wrapper"><input type="text" value="${v.pedsFeeding || ''}" placeholder="طبيعية / صناعية" oninput="updateVisitFieldData(${v.visitId}, 'pedsFeeding', this.value)" style="font-size:0.85rem;"></div></div>
                </div>

                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات طب الأطفال والفحص السريري</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب ملاحظات الفحص..." oninput="updateVisitFieldData(${v.visitId}, 'pedsNotes', this.value)" style="font-size:0.85rem;">${v.pedsNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.derm ? `
            <div class="group-card" style="background:#ffedd5; border-color:#fb923c; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#c2410c; display:block; margin-bottom:10px;"><i class="fa-solid fa-hand-dots"></i> فحص الجلدية والتناسلية (Dermatology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">نوع الآفة الجلدية</span><div class="input-wrapper"><input type="text" value="${v.dermType || ''}" placeholder="مثال: Plaque / Papules" oninput="updateVisitFieldData(${v.visitId}, 'dermType', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">مكان التوزيع في الجسم</span><div class="input-wrapper"><input type="text" value="${v.dermSite || ''}" placeholder="مثال: الوجه والذراعين" oninput="updateVisitFieldData(${v.visitId}, 'dermSite', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات الفحص الجلدي ومصباح وود</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب وصف الطفح والتشخيص..." oninput="updateVisitFieldData(${v.visitId}, 'dermNotes', this.value)" style="font-size:0.85rem;">${v.dermNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.ent ? `
            <div class="group-card" style="background:#ecfdf5; border-color:#34d399; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#047857; display:block; margin-bottom:10px;"><i class="fa-solid fa-ear-deaf"></i> فحص الأذن والأنف والحنجرة (ENT)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">فحص الأذن (TM)</span><div class="input-wrapper"><input type="text" value="${v.entEar \vert{}\vert{} ''}" placeholder="مثال: غشاء الطبل طبيعي / احمرار" oninput="updateVisitFieldData(${v.visitId}, 'entEar', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الحلق واللوزتين</span><div class="input-wrapper"><input type="text" value="${v.entThroat || ''}" placeholder="مثال: احمرار اللوزتين Acute Tonsillitis" oninput="updateVisitFieldData(${v.visitId}, 'entThroat', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">فحص الأنف والجيوب وملاحظات ENT</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب تفاصيل فحص الأذن والأنف والحنجرة..." oninput="updateVisitFieldData(${v.visitId}, 'entNotes', this.value)" style="font-size:0.85rem;">${v.entNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.ophthal ? `
            <div class="group-card" style="background:#e0e7ff; border-color:#818cf8; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#4338ca; display:block; margin-bottom:10px;"><i class="fa-solid fa-eye"></i> فحص العيون (Ophthalmology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">حدة البصر (Visual Acuity)</span><div class="input-wrapper"><input type="text" value="${v.ophthalVa \vert{}\vert{} ''}" placeholder="RE: 6/6, LE: 6/9" oninput="updateVisitFieldData(${v.visitId}, 'ophthalVa', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ضغط العين (IOP)</span><div class="input-wrapper"><input type="text" value="${v.ophthalIop \vert{}\vert{} ''}" placeholder="مثال: 15 mmHg" oninput="updateVisitFieldData(${v.visitId}, 'ophthalIop', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">فحص قاع العين وملاحظات العيون</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب تفاصيل قاع العين والفحص..." oninput="updateVisitFieldData(${v.visitId}, 'ophthalNotes', this.value)" style="font-size:0.85rem;">${v.ophthalNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.cardio ? `
            <div class="group-card" style="background:#fee2e2; border-color:#f87171; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#b91c1c; display:block; margin-bottom:10px;"><i class="fa-solid fa-heart-pulse"></i> فحص القلب والشرايين (Cardiology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">تخطيط القلب (ECG)</span><div class="input-wrapper"><input type="text" value="${v.cardioEcg || ''}" placeholder="مثال: Normal Sinus Rhythm" oninput="updateVisitFieldData(${v.visitId}, 'cardioEcg', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">أصوات القلب (Heart Sounds)</span><div class="input-wrapper"><input type="text" value="${v.cardioSounds || ''}" placeholder="مثال: S1 S2 normal, no murmur" oninput="updateVisitFieldData(${v.visitId}, 'cardioSounds', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات الفحص القلبي الإضافية</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب نتائج الفحص القلبي..." oninput="updateVisitFieldData(${v.visitId}, 'cardioNotes', this.value)" style="font-size:0.85rem;">${v.cardioNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.labs ? `
            <div class="field-box">
                <span class="field-label">Lab Tests</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vLabs-${v.visitId}" rows="1" placeholder="Request lab tests..." oninput="handleLiveInput(this, 'labs', ${v.visitId})" onblur="hideSuggestions('labs', ${v.visitId})">${v.labs || ''}</textarea>
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
                <span class="field-label">Radiology & Scans</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vScans-${v.visitId}" rows="1" placeholder="Request radiology..." oninput="handleLiveInput(this, 'scans', ${v.visitId})" onblur="hideSuggestions('scans', ${v.visitId})">${v.scans || ''}</textarea>
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
                <span class="field-label">Diagnosis & Notes</span>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vNotes-${v.visitId}" rows="2" placeholder="Clinical notes & diagnosis..." oninput="handleLiveInput(this, 'notes', ${v.visitId})" onblur="hideSuggestions('notes', ${v.visitId})">${v.notes || ''}</textarea>
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
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span class="field-label" style="margin-bottom:0;">Prescribed Medications (RX)</span>
                    <button type="button" onclick="openRxModal(${v.visitId})" style="background:#fae8ff; color:#c084fc; border:none; border-radius:8px; padding:4px 10px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                        <i class="fa-solid fa-file-prescription"></i> Print RX Prescription
                    </button>
                </div>
                <div class="input-wrapper" style="position: relative;">
                    <textarea id="vDrugs-${v.visitId}" rows="3" placeholder="Write prescription drugs here..." oninput="handleDrugsInput(this, ${v.visitId})" onkeydown="handleDrugsKeyDown(event, this, ${v.visitId})" onblur="hideSuggestions('drugs', ${v.visitId})">${v.drugs || ''}</textarea>
                    <div class="suggestions-box" id="suggestions-drugs-${v.visitId}"></div>
                    <div class="live-save-bar" id="save-bar-drugs-${v.visitId}">
                        <span>Save: "<strong id="line-text-drugs-${v.visitId}"></strong>"</span>
                        <button type="button" class="btn-live-save" id="btn-save-drugs-${v.visitId}" onmousedown="saveLineToDict(event, 'drugs', ${v.visitId})">Save</button>
                    </div>
                </div>
            </div>
            ` : ''}

            ${cfg.attachments ? `
            <div class="field-box">
                <span class="field-label">Attachments & Medical Reports</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <label style="flex:1; background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:10px; padding:10px; text-align:center; font-size:0.8rem; font-weight:700; color:#475569; cursor:pointer;">
                        <i class="fa-solid fa-cloud-arrow-up"></i> رفع صور متعددة / ملف
                        <input type="file" accept="image/*,.pdf" multiple style="display:none;" onchange="handleFileUpload(this, ${v.visitId})">
                    </label>
                    <button type="button" onclick="scanFromDesktopScanner(${v.visitId})" style="flex:1; background:#f0fdfa; border:1px dashed #0d9488; border-radius:10px; padding:10px; font-size:0.8rem; font-weight:700; color:#0d9488; cursor:pointer;">
                        <i class="fa-solid fa-print"></i> سحب من السكانر (حاسبة)
                    </button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px;" id="attachments-container-${v.visitId}">
                    ${(v.attachments || []).map((att, aIdx) => {
                        if (!att || !att.dataUrl || att.dataUrl.length < 50) {
                            return `<div style="padding:6px 10px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; font-size:0.7rem; color:#b91c1c;">⚠️ صورة تالفة أو قديمة</div>`;
                        }
                        return `
                        <div style="position:relative; width:65px; height:65px; border-radius:10px; overflow:hidden; border:1px solid #cbd5e1; cursor:pointer;" onclick="previewAttachmentImage('${att.dataUrl}')">
                            <img src="${att.dataUrl}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                    `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    }).join('');

    visits.forEach(v => {
        const noteEl = document.getElementById(`vNotes-${v.visitId}`);
        const drugEl = document.getElementById(`vDrugs-${v.visitId}`);
        const labsEl = document.getElementById(`vLabs-${v.visitId}`);
        const scansEl = document.getElementById(`vScans-${v.visitId}`);
        if (noteEl) autoResizeTextarea(noteEl);
        if (drugEl) autoResizeTextarea(drugEl);
        if (labsEl) autoResizeTextarea(labsEl);
        if (scansEl) autoResizeTextarea(scansEl);
    });
}
