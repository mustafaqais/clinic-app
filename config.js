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
    menu.classList.toggle('show');
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
    
    if (document.getElementById('archiveScreen').style.display === 'block') {
        openPatientsArchive();
    } else if (document.getElementById('dictScreen').style.display === 'block') {
        renderDictTerms();
    } else if (document.getElementById('medicalRecordScreen').style.display === 'block' && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) renderVisits(patient.visits || [], false);
    }
}

function applyLanguage() {
    const t = translations[currentLang];
    const isAr = currentLang === 'ar';
    document.body.style.direction = isAr ? 'rtl' : 'ltr';

    document.getElementById('authTitle').innerText = isRegisterMode ? t.registerTitle : t.loginTitle;
    document.getElementById('authSubText').innerText = isRegisterMode ? t.registerSub : t.loginSub;
    document.getElementById('lblEmail').innerText = isRegisterMode ? t.regEmailLabel : t.emailLabel;
    document.getElementById('lblRegPhone').innerText = t.regPhoneLabel;
    document.getElementById('lblPass').innerText = t.passLabel;
    document.getElementById('forgotPassBtn').style.display = isRegisterMode ? 'none' : 'block';
    document.getElementById('authSubmitBtn').innerText = isRegisterMode ? t.btnRegister : t.btnLogin;
    document.getElementById('authSwitchText').innerHTML = isRegisterMode ? t.switchLogin : t.switchRegister;

    document.getElementById('activTitle').innerText = t.activTitle;
    document.getElementById('activSub').innerText = t.activSub;
    document.getElementById('lblActivCode').innerText = t.lblActivCode;
    document.getElementById('btnActivate').innerText = t.btnActivate;

    const savedCustomName = localStorage.getItem('clinic_custom_brand_name');
    document.getElementById('headerTitle').innerText = savedCustomName || "نظام عيادة ماستر";
    document.getElementById('headerSub').innerText = t.headerSub;
    document.getElementById('txtBack').innerText = t.txtBack;
    
    document.getElementById('dropLangText').innerText = t.dropLang;
    document.getElementById('dropDarkModeText').innerText = t.dropDarkMode;
    document.getElementById('dropSupportText').innerText = t.dropSupport;
    document.getElementById('dropLogoutText').innerText = t.dropLogout;

    document.getElementById('secGroup1').innerHTML = `<i class="fa-solid fa-stethoscope"></i> ${t.group1}`;
    document.getElementById('menuNewPatientTitle').innerText = t.newPatient;
    document.getElementById('menuNewPatientSub').innerText = t.newPatientSub;
    document.getElementById('menuArchiveTitle').innerText = t.archive;
    document.getElementById('menuArchiveSub').innerText = t.archiveSub;

    document.getElementById('secGroup2').innerHTML = `<i class="fa-solid fa-file-prescription"></i> ${t.group2}`;
    document.getElementById('menuRxTitle').innerText = t.rxTemplate;
    document.getElementById('menuRxSub').innerText = t.rxTemplateSub;
    document.getElementById('menuSpecTitle').innerText = t.specialtiesDash;
    document.getElementById('menuSpecSub').innerText = t.specialtiesDashSub;
    document.getElementById('menuDictTitle').innerText = t.dict;
    document.getElementById('menuDictSub').innerText = t.dictSub;

    document.getElementById('secGroup3').innerHTML = `<i class="fa-solid fa-chart-pie"></i> ${t.group3}`;
    document.getElementById('menuAnalyticsTitle').innerText = t.analytics;
    document.getElementById('menuAnalyticsSub').innerText = t.analyticsSub;

    document.getElementById('secGroup4').innerHTML = `<i class="fa-solid fa-shield-halved"></i> ${t.group4}`;
    document.getElementById('menuBackupTitle').innerText = t.backup;
    document.getElementById('menuBackupSub').innerText = t.backupSub;
    document.getElementById('menuTrashTitle').innerText = t.trash;
    document.getElementById('menuTrashSub').innerText = t.trashSub;
    document.getElementById('menuSettingsTitle').innerText = t.settings;
    document.getElementById('menuSettingsSub').innerText = t.settingsSub;
    document.getElementById('menuPermTitle').innerText = t.permissions;
    document.getElementById('menuPermSub').innerText = t.permissionsSub;
    document.getElementById('menuNetTitle').innerText = t.networkDb;
    document.getElementById('menuNetSub').innerText = t.networkDbSub;

    document.getElementById('patInfoTitle').innerHTML = `<i class="fa-solid fa-id-card"></i> ${t.patInfoTitle}`;
    document.getElementById('lblPatName').innerText = t.lblPatName;
    document.getElementById('lblPatSubName').innerText = t.lblPatSubName;
    document.getElementById('lblPatAge').innerText = t.lblPatAge;
    document.getElementById('lblPatGender').innerText = t.lblPatGender;
    document.getElementById('optSelGender').innerText = t.optSelGender;
    document.getElementById('optMale').innerText = t.optMale;
    document.getElementById('optFemale').innerText = t.optFemale;
    document.getElementById('lblPatMarital').innerText = t.lblPatMarital;
    document.getElementById('optSelMarital').innerText = t.optSelMarital;
    document.getElementById('optSingle').innerText = t.optSingle;
    document.getElementById('optMarried').innerText = t.optMarried;
    document.getElementById('optDivorced').innerText = t.optDivorced;
    document.getElementById('optWidow').innerText = t.optWidow;
    document.getElementById('lblPatJob').innerText = t.lblPatJob;
    document.getElementById('optSelJob').innerText = t.optSelJob;
    document.getElementById('optJobEmp').innerText = t.optJobEmp;
    document.getElementById('optJobFree').innerText = t.optJobFree;
    document.getElementById('optJobHouse').innerText = t.optJobHouse;
    document.getElementById('optJobStud').innerText = t.optJobStud;
    document.getElementById('optJobOther').innerText = t.optJobOther;
    document.getElementById('lblPatPhone').innerText = t.lblPatPhone;
    document.getElementById('lblPatDate').innerText = t.lblPatDate;
    document.getElementById('btnSavePatRec').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${t.btnSavePatRec}`;

    document.getElementById('searchInput').placeholder = t.searchPlaceholder;
    document.getElementById('optAllGenders').innerText = t.optAllGenders;
    document.getElementById('optFilterMale').innerText = t.optFilterMale;
    document.getElementById('optFilterFemale').innerText = t.optFilterFemale;
    document.getElementById('optAllAges').innerText = t.optAllAges;
    document.getElementById('optChild').innerText = t.optChild;
    document.getElementById('optAdult').innerText = t.optAdult;
    document.getElementById('optSenior').innerText = t.optSenior;

    const sortNewestEl = document.getElementById('optSortNewest');
    if (sortNewestEl) sortNewestEl.innerText = t.sortNewest;
    const sortOldestEl = document.getElementById('optSortOldest');
    if (sortOldestEl) sortOldestEl.innerText = t.sortOldest;

    document.getElementById('txtEdit').innerText = t.txtEdit;
    document.getElementById('txtDelete').innerText = t.txtDelete;
    document.getElementById('btnDownloadPDF').innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${t.btnDownloadPDF}`;
    document.getElementById('btnAddVisitMain').innerHTML = `<i class="fa-solid fa-calendar-plus"></i> ${t.btnAddVisit}`;

    document.getElementById('optCatDrugs').innerText = t.optCatDrugs;
    document.getElementById('optCatLabs').innerText = t.optCatLabs;
    document.getElementById('optCatScans').innerText = t.optCatScans;
    document.getElementById('optCatNotes').innerText = t.optCatNotes;
    document.getElementById('optCatMh').innerText = t.optCatMh;

    document.getElementById('trashTitleText').innerHTML = `<i class="fa-solid fa-trash-can"></i> ${t.trashTitleText}`;
    document.getElementById('txtEmptyTrash').innerText = t.txtEmptyTranslation;
    document.getElementById('trashSubText').innerText = t.trashSubText;

    document.getElementById('mhHeaderTitle').innerHTML = `<i class="fa-solid fa-notes-medical" style="color:#0d9488;"></i> ${t.mhHeaderTitle || 'Medical History Details'}`;
    document.getElementById('mhLblChronic').innerText = t.mhLblChronic;
    document.getElementById('mhOtherText').innerText = t.mhOtherText;
    document.getElementById('mhLblAdmission').innerText = t.mhLblAdmission;
    document.getElementById('mhLblSurgery').innerText = t.mhLblSurgery;
    document.getElementById('mhLblFamily').innerText = t.mhLblFamily;
    document.getElementById('mhLblAllergy').innerText = t.mhLblAllergy;
    document.getElementById('mhLblChronicDrugs').innerText = t.mhLblChronicDrugs;
    document.getElementById('mhLblSmoking').innerText = t.mhLblSmoking;
    document.getElementById('mhLblAlcohol').innerText = t.mhLblAlcohol;
    document.getElementById('mhLblNotes').innerText = t.mhLblNotes;
    document.getElementById('btnMhDone').innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnMhDone}`;

    document.getElementById('optSmok1').innerText = t.optSmok1;
    document.getElementById('optSmok2').innerText = t.optSmok2;
    document.getElementById('optSmok3').innerText = t.optSmok3;
    document.getElementById('optAlc1').innerText = t.optAlc1;
    document.getElementById('optAlc2').innerText = t.optAlc2;
    document.getElementById('optAlc3').innerText = t.optAlc3;

    document.getElementById('bmiTitleText').innerHTML = `<i class="fa-solid fa-calculator" style="color:#0284c7;"></i> ${t.bmiTitleText}`;
    document.getElementById('lblBmiWeight').innerText = t.lblBmiWeight;
    document.getElementById('lblBmiHeight').innerText = t.lblBmiHeight;
    document.getElementById('lblBmiScore').innerText = t.lblBmiScore;
    document.getElementById('bmiBadgeInitial').innerText = t.bmiBadgeInitial;
    document.getElementById('btnBmiAgree').innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnBmiAgree}`;

    document.getElementById('editPatHeader').innerHTML = `<i class="fa-solid fa-user-pen" style="color:#0d9488;"></i> ${t.editPatHeader}`;
    document.getElementById('editLblName').innerText = t.editLblName;
    document.getElementById('editLblSubName').innerText = t.editLblSubName;
    document.getElementById('editLblAge').innerText = t.editLblAge;
    document.getElementById('editLblGender').innerText = t.editLblGender;
    document.getElementById('editOptGender').innerText = t.editOptGender;
    document.getElementById('editOptMale').innerText = t.editOptMale;
    document.getElementById('editOptFemale').innerText = t.editOptFemale;
    document.getElementById('editLblMarital').innerText = t.editLblMarital;
    document.getElementById('editOptMarital').innerText = t.editOptMarital;
    document.getElementById('editOptSingle').innerText = t.editOptSingle;
    document.getElementById('editOptMarried').innerText = t.editOptMarried;
    document.getElementById('editOptDivorced').innerText = t.editOptDivorced;
    document.getElementById('editOptWidow').innerText = t.editOptWidow;
    document.getElementById('editLblJob').innerText = t.editLblJob;
    document.getElementById('editOptJob').innerText = t.editOptJob;
    document.getElementById('editLblPhone').innerText = t.editLblPhone;
    document.getElementById('btnSaveEdit').innerHTML = `<i class="fa-solid fa-check"></i> ${t.btnSaveEdit}`;

    document.querySelectorAll('.mh-cond-text').forEach(span => {
        const key = span.getAttribute('data-cond');
        if (t.chronicNames && t.chronicNames[key]) {
            span.innerText = t.chronicNames[key];
        }
    });

    document.getElementById('footerText').innerText = t.footer;
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
        document.getElementById('dynamicFounderCode').innerText = newCode;
        document.getElementById('keyTypeHint').innerText = `Generated (${type}) valid for ${days} days.`;
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

    document.getElementById('headerTitle').innerText = headerTitleText;
    document.getElementById('headerSub').innerText = sub;

    if (saveState) {
        sessionStorage.setItem('current_screen', screenId);
        sessionStorage.setItem('header_title', headerTitleText);
        sessionStorage.setItem('header_sub', sub);
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
        document.getElementById(prevScreen).style.display = 'block';
        sessionStorage.setItem('current_screen', prevScreen);

        const customBrandName = localStorage.getItem('clinic_custom_brand_name') || "نظام عيادة ماستر";

        if (prevScreen === 'mainScreen') {
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('headerTitle').innerText = customBrandName;
            document.getElementById('headerSub').innerText = translations[currentLang].headerSub;
            sessionStorage.setItem('header_title', customBrandName);
            sessionStorage.setItem('header_sub', translations[currentLang].headerSub);
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        } else if (prevScreen === 'archiveScreen') {
            document.getElementById('headerTitle').innerText = translations[currentLang].archive;
            document.getElementById('headerSub').innerText = 'Advanced search, filters & records';
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        }
    } else {
        showMainMenu();
    }
}
