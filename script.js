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

    document.getElementById('headerTitle').innerText = t.headerTitle;
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

function navigateTo(screenId, title = 'Clinic Master System', sub = 'Cloud Secure Dashboard', saveState = true) {
    if (!isSubscriptionExpired) {
        autoSaveMedicalRecord();
    }
    hideAllScreensInner();
    
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    document.getElementById('headerTitle').innerText = title;
    document.getElementById('headerSub').innerText = sub;

    if (saveState) {
        sessionStorage.setItem('current_screen', screenId);
        sessionStorage.setItem('header_title', title);
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

        if (prevScreen === 'mainScreen') {
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('headerTitle').innerText = translations[currentLang].headerTitle;
            document.getElementById('headerSub').innerText = translations[currentLang].headerSub;
            sessionStorage.setItem('header_title', translations[currentLang].headerTitle);
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

window.addEventListener('popstate', function(event) {
    event.preventDefault();
    if (document.getElementById('medHistoryModal').style.display === 'flex') {
        closeMedHistoryModal();
        return;
    }
    if (document.getElementById('bmiCalculatorModal').style.display === 'flex') {
        closeBmiModal();
        return;
    }
    if (document.getElementById('rxModal') && document.getElementById('rxModal').style.display === 'flex') {
        closeRxModal();
        return;
    }
    if (document.getElementById('editPatientModal').style.display === 'flex') {
        closeEditPatientModal();
        return;
    }
    if (document.getElementById('supportModal').style.display === 'flex') {
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
    document.getElementById('mainScreen').style.display = 'none';
    document.getElementById('addPatientScreen').style.display = 'none';
    document.getElementById('rxTemplateScreen').style.display = 'none';
    document.getElementById('specialtiesDashboardScreen').style.display = 'none';
    document.getElementById('archiveScreen').style.display = 'none';
    document.getElementById('trashScreen').style.display = 'none';
    document.getElementById('medicalRecordScreen').style.display = 'none';
    document.getElementById('dictScreen').style.display = 'none';
    document.getElementById('networkScreen').style.display = 'none';
    document.getElementById('analyticsScreen').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('backupScreen').style.display = 'none';
    document.getElementById('permissionsScreen').style.display = 'none';
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

                        if (document.getElementById('archiveScreen').style.display === 'block') {
                            renderPatientsList(patients);
                        } else if (document.getElementById('medicalRecordScreen').style.display === 'block' && currentPatientId) {
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

    initDraggableElements();
    loadSavedRxLayout();
});

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
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('founderControlPanel').style.display = 'none';
    document.getElementById('networkMenuCard').style.display = 'none';
    document.getElementById('cardPermissions').style.display = 'none';
    showAllCardsForDoctor();

    const cardNewPat = document.getElementById('cardNewPatient');
    cardNewPat.classList.add('disabled-card');
    cardNewPat.onclick = function() {
        alert('⚠ انتهت صلاحية الاشتراك. التطبيق يعمل في وضع القراءة فقط.');
        openSupportModal();
    };

    const banner = document.getElementById('subStatusBanner');
    const titleEl = document.getElementById('subBannerTitle');
    const textEl = document.getElementById('subBannerText');
    banner.style.display = 'flex';
    banner.className = 'sub-status-banner expired';
    titleEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> انتهت صلاحية الاشتراك - وضع القراءة فقط`;
    textEl.innerText = `انتهى اشتراكك. يمكنك تصفح الأرشيف وقراءة الملفات والتقارير بحرية تامة أو تجديد الكود.`;

    restorePreviousScreenState();
}

function setupFounderInterfaceAfterAuth() {
    isSubscriptionExpired = false;
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('founderControlPanel').style.display = 'block';
    document.getElementById('networkMenuCard').style.display = 'flex';
    document.getElementById('cardPermissions').style.display = 'flex';
    document.getElementById('subStatusBanner').style.display = 'none'; 
    isUserSecretary = false;
    
    const cardNewPat = document.getElementById('cardNewPatient');
    cardNewPat.classList.remove('disabled-card');
    cardNewPat.onclick = function() {
        navigateTo('addPatientScreen', translations[currentLang].newPatient, translations[currentLang].newPatientSub);
    };

    restorePreviousScreenState();
    checkMandatoryMonthlyBackup();
}

function setupClientInterfaceAfterAuth(expiryDateIso, isSecretary = false) {
    isSubscriptionExpired = false;
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('founderControlPanel').style.display = 'none';
    document.getElementById('networkMenuCard').style.display = 'none';

    const cardNewPat = document.getElementById('cardNewPatient');
    cardNewPat.classList.remove('disabled-card');
    cardNewPat.onclick = function() {
        navigateTo('addPatientScreen', translations[currentLang].newPatient, translations[currentLang].newPatientSub);
    };

    if (isSecretary) {
        isUserSecretary = true;
        document.getElementById('cardPermissions').style.display = 'none';
        document.getElementById('cardRxTemplate').style.display = 'none';
        document.getElementById('cardSpecialtiesDashboard').style.display = 'none';
        document.getElementById('cardDict').style.display = 'none';
        document.getElementById('cardAnalytics').style.display = 'none';
        document.getElementById('cardBackup').style.display = 'none';
        document.getElementById('cardTrash').style.display = 'none';
        document.getElementById('cardSettings').style.display = 'none';
        document.getElementById('subStatusBanner').style.display = 'none';
    } else {
        isUserSecretary = false;
        document.getElementById('cardPermissions').style.display = 'flex';
        showAllCardsForDoctor();
    }

    if (expiryDateIso && !isSecretary) {
        const now = new Date().getTime();
        const expiryTime = new Date(expiryDateIso).getTime();
        const diffTime = expiryTime - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const banner = document.getElementById('subStatusBanner');
        const titleEl = document.getElementById('subBannerTitle');
        const textEl = document.getElementById('subBannerText');
        banner.style.display = 'flex';
        titleEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Active Subscription`;
        textEl.innerText = `You have ${diffDays} day(s) remaining.`;
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
        document.getElementById('mandatoryBackupModal').style.display = 'flex';
    }
}

function executeMandatoryBackup() {
    exportJsonBackup();
    const todayDateStr = getTodayFormatted();
    localStorage.setItem('last_mandatory_backup_date', todayDateStr);
    document.getElementById('mandatoryBackupModal').style.display = 'none';
    alert('تم حفظ النسخة الاحتياطية بنجاح!');
}

function openSupportModal() {
    document.getElementById('supportModal').style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('supportModal').style.display = 'none';
}

function openActivationScreenForRenewal() {
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('activationScreen').style.display = 'flex';
    document.getElementById('activationInput').value = '';
    document.getElementById('activationInput').focus();
}

function cancelRenewal() {
    document.getElementById('activationScreen').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
}

function restorePreviousScreenState() {
    const savedScreen = sessionStorage.getItem('current_screen');
    const savedTitle = sessionStorage.getItem('header_title') || translations[currentLang].headerTitle;
    const savedSub = sessionStorage.getItem('header_sub') || translations[currentLang].headerSub;
    const savedPatientId = sessionStorage.getItem('current_patient_id');

    if (savedScreen && savedScreen !== 'mainScreen' && document.getElementById(savedScreen)) {
        if (isUserSecretary && ['rxTemplateScreen', 'specialtiesDashboardScreen', 'dictScreen', 'analyticsScreen', 'backupScreen', 'trashScreen', 'settingsScreen', 'permissionsScreen'].includes(savedScreen)) {
            navigateTo('mainScreen', translations[currentLang].headerTitle, translations[currentLang].headerSub, false);
            return;
        }
        if (savedScreen === 'medicalRecordScreen' && savedPatientId) {
            openMedicalRecord(Number(savedPatientId), false);
        } else {
            navigateTo(savedScreen, savedTitle, savedSub, false);
        }
    } else {
        navigateTo('mainScreen', translations[currentLang].headerTitle, translations[currentLang].headerSub, false);
    }
}

async function verifyActivationCode() {
    const inputCode = document.getElementById('activationInput').value.trim().toUpperCase();
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
        document.getElementById('activationScreen').style.display = 'none';
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
        rxLayoutData[box.id] = {
            top: box.style.top,
            left: box.style.left,
            fontSize: box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text') ? window.getComputedStyle(box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text')).fontSize : '1rem'
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
    document.getElementById('registerPhoneBox').style.display = isRegisterMode ? 'block' : 'none';
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('authPassword');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const identifier = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPassword').value;

    if (isRegisterMode) {
        const phone = document.getElementById('regPhoneInput').value.trim();
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
                    document.getElementById('authScreen').style.display = 'none';
                    document.getElementById('activationScreen').style.display = 'flex';
                }
            })
            .catch(err => alert('خطأ: ' + err.message));
    } else {
        let loginEmail = identifier;
        if (!identifier.includes('@')) {
            try {
                const querySnap = await db.collection('network_hierarchy').where('phone', '==', identifier).get();
                if (!querySnap.empty) {
                    loginEmail = querySnap.docs[0].data().email;
                }
            } catch (err) {
                console.log(err);
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

                document.getElementById('authScreen').style.display = 'none';
                if (isSec) {
                    document.getElementById('appContainer').style.display = 'flex';
                    document.getElementById('cardPermissions').style.display = 'none';
                    document.getElementById('subStatusBanner').style.display = 'none';
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
    document.getElementById('cardNewPatient').style.display = 'flex';
    document.getElementById('cardArchive').style.display = 'flex';
    document.getElementById('cardRxTemplate').style.display = 'flex';
    document.getElementById('cardSpecialtiesDashboard').style.display = 'flex';
    document.getElementById('cardDict').style.display = 'flex';
    document.getElementById('cardAnalytics').style.display = 'flex';
    document.getElementById('cardBackup').style.display = 'flex';
    document.getElementById('cardTrash').style.display = 'flex';
    document.getElementById('cardSettings').style.display = 'flex';
    document.getElementById('cardPermissions').style.display = 'flex';
}

function applySecretaryUIVisibility() {
    document.getElementById('cardNewPatient').style.display = 'flex';
    document.getElementById('cardArchive').style.display = 'flex';
    document.getElementById('cardRxTemplate').style.display = 'none';
    document.getElementById('cardSpecialtiesDashboard').style.display = 'none';
    document.getElementById('cardDict').style.display = 'none';
    document.getElementById('cardAnalytics').style.display = 'none';
    document.getElementById('cardBackup').style.display = 'none';
    document.getElementById('cardTrash').style.display = 'none';
    document.getElementById('cardSettings').style.display = 'none';
    document.getElementById('cardPermissions').style.display = 'none';
}

function calculateVisitGrowthPercentiles(visitId) {
    const ageM = parseFloat(document.getElementById(`growthAgeM-${visitId}`).value);
    const w = parseFloat(document.getElementById(`growthW-${visitId}`).value);
    const h = parseFloat(document.getElementById(`growthH-${visitId}`).value);
    const resEl = document.getElementById(`growthRes-${visitId}`);

    if (!ageM || isNaN(ageM) || ageM < 0) {
        alert('الرجاء إدخال عمر الطفل بالأشهر صالحاً.');
        return;
    }

    let wStatus = 'وزن طبيعي (Normal Weight - P15-P85)';
    let hStatus = 'طول طبيعي (Normal Height - P15-P85)';
    let wColor = '#166534';
    let hColor = '#166534';

    const expW = (ageM * 0.5) + 3.3;
    const expH = (ageM * 1.5) + 50;

    if (w) {
        if (w < expW * 0.8) {
            wStatus = 'نحافة ملحوظة أو نقص بالوزن (Underweight - < P3)';
            wColor = '#b91c1c';
        } else if (w > expW * 1.25) {
            wStatus = 'زيادة وزن محتملة (Overweight - > P85)';
            wColor = '#c2410c';
        }
    }

    if (h) {
        if (h < expH * 0.88) {
            wStatus = 'قصر قامة / تقزم محتمل (Stunting - < P3)';
            wColor = '#b91c1c';
        } else if (h > expH * 1.12) {
            wStatus = 'طول أعلى من المعدل (Above average)';
            wColor = '#0284c7';
        }
    }

    resEl.innerHTML = `
        • <b>الوزن مقابل العمر:</b> <span style="color:${wColor};">${wStatus}</span><br>
        • <b>الطول مقابل العمر:</b> <span style="color:${hColor};">${hStatus}</span><br>
        • <b>توصية WHO:</b> متابعة المخطط البياني بانتظام.
    `;
    resEl.style.display = 'block';

    updateVisitFieldData(visitId, 'pedsGrowthAge', ageM);
    updateVisitFieldData(visitId, 'pedsGrowthW', w);
    updateVisitFieldData(visitId, 'pedsGrowthH', h);
}

function openSpecialtiesDashboard() {
    navigateTo('specialtiesDashboardScreen', translations[currentLang].specialtiesDash, translations[currentLang].specialtiesDashSub);
    
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
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    specialtyConfig = {
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

    saveSettingsToCloudAndLocal();
    alert('تم حفظ إعدادات لوحة تحكم الاختصاصات بنجاح!');
    showMainMenu();
}

function openPermissionsManager() {
    navigateTo('permissionsScreen', 'Secretary Management', 'Create account & permissions');
    document.getElementById('secEmailInput').value = secretaryAccount.email || '';
    document.getElementById('secPassInput').value = secretaryAccount.password || '';
}

async function saveSecretaryAccount() {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    const email = document.getElementById('secEmailInput').value.trim();
    const password = document.getElementById('secPassInput').value;

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
        document.getElementById('secEmailInput').value = '';
        document.getElementById('secPassInput').value = '';
        
        if (currentUserId) {
            await db.collection('network_hierarchy').doc(currentUserId).set({
                secretaryEmail: "",
            }, { merge: true });
        }

        saveSettingsToCloudAndLocal();
        alert('Secretary account revoked.');
    }
}

function resetPassword() {
    const identifier = document.getElementById('authEmail').value;
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
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('authScreen').style.display = 'flex';
    });
}

function openBackupManager() {
    navigateTo('backupScreen', 'Backup Manager', 'Export and restore data');
    document.getElementById('backupFileInput').value = '';
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
    if (user) {
        document.getElementById('currentAccountEmail').value = user.email || '';
    }
    document.getElementById('newAccountEmail').value = '';
    document.getElementById('confirmEmailPass').value = '';
    document.getElementById('newAccountPassword').value = '';
}

function updateAccountEmail() {
    const newEmail = document.getElementById('newAccountEmail').value.trim();
    const password = document.getElementById('confirmEmailPass').value;
    const user = auth.currentUser;

    if (!newEmail || !password) {
        alert('Please enter new email and current password.');
        return;
    }

    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    user.reauthenticateWithCredential(credential).then(() => {
        user.updateEmail(newEmail).then(() => {
            alert('Email updated!');
            document.getElementById('currentAccountEmail').value = newEmail;
        }).catch(error => alert('Error: ' + error.message));
    }).catch(error => alert('Incorrect password: ' + error.message));
}

function updateAccountPassword() {
    const newPass = document.getElementById('newAccountPassword').value;
    const user = auth.currentUser;

    if (!newPass || newPass.length < 6) {
        alert('Password must be at least 6 characters.');
        return;
    }

    if (confirm('Change password?')) {
        user.updatePassword(newPass).then(() => {
            alert('Password changed!');
            document.getElementById('newAccountPassword').value = '';
        }).catch(error => alert('Error: ' + error.message));
    }
}

function openRxTemplateManager() {
    navigateTo('rxTemplateScreen', 'RX Template', 'Header customization');
    const previewImg = document.getElementById('rxPreviewImg');
    const noText = document.getElementById('noRxText');

    if (currentDoctorRxImage) {
        previewImg.src = currentDoctorRxImage;
        previewImg.style.display = 'block';
        noText.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        noText.style.display = 'block';
    }
}

function saveRxTemplateImage() {
    if (isSubscriptionExpired) {
        alert('التطبيق في وضع القراءة فقط.');
        return;
    }
    const fileInput = document.getElementById('rxImageFileInput');
    if (fileInput.files && fileInput.files[0]) {
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

function openNetworkHierarchy() {
    navigateTo('networkScreen', 'Network Database', 'Users Control');
    const container = document.getElementById('networkTreeContainer');
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
            const isFounder = userEmail.toLowerCase() === FOUNDER_EMAIL.toLowerCase();

            html += `
                <div class="node-card">
                    <div class="node-info">
                        <h5><i class="fa-solid fa-envelope" style="color:#0d9488;"></i> ${userEmail}</h5>
                        <p><b>Password:</b> ${data.password || 'N/A'}</p>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
                        <span class="node-badge">${data.role || 'Client'}</span>
                        ${!isFounder ? `<button onclick="promptFounderDeleteNode('${nodeUid}', '${userEmail.replace(/'/g, "\\'")}')" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer;">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

function promptFounderDeleteNode(nodeUid, nodeEmail) {
    targetNodeUidToDelete = nodeUid;
    targetNodeEmailToDelete = nodeEmail;
    document.getElementById('delTargetEmailDisplay').innerText = nodeEmail;
    document.getElementById('founderConfirmPassInput').value = '';
    document.getElementById('founderDeleteModal').style.display = 'flex';
}

function closeFounderDeleteModal() {
    document.getElementById('founderDeleteModal').style.display = 'none';
    targetNodeUidToDelete = null;
    targetNodeEmailToDelete = null;
}

async function executeFounderDeleteAccount() {
    const inputPass = document.getElementById('founderConfirmPassInput').value;
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

    document.getElementById('statTotalPatients').innerText = totalPatients;
    document.getElementById('statTodayVisits').innerText = todayVisitsCount;
    document.getElementById('statMaleCount').innerText = maleCount;
    document.getElementById('statFemaleCount').innerText = femaleCount;

    const totalGender = maleCount + femaleCount;
    const malePct = totalGender > 0 ? Math.round((maleCount / totalGender) * 100) : 50;
    const femalePct = totalGender > 0 ? 100 - malePct : 50;

    document.getElementById('ratioMaleBar').style.width = `${malePct}%`;
    document.getElementById('ratioFemaleBar').style.width = `${femalePct}%`;
    document.getElementById('ratioMaleText').innerText = `Male: ${malePct}%`;
    document.getElementById('ratioFemaleText').innerText = `Female: ${femalePct}%`;

    const sortedDrugs = Object.entries(drugFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDrugsContainer = document.getElementById('topDrugsList');

    topDrugsContainer.innerHTML = sortedDrugs.length === 0 
        ? '<p style="font-size:0.8rem; color:#64748b; text-align:center;">No data.</p>'
        : sortedDrugs.map(([drug, count], idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; border-radius:10px; font-size:0.85rem; font-weight:600;">
                <span>${idx + 1}. ${drug}</span>
                <span style="background:#ccfbf1; color:#0f766e; padding:2px 8px; border-radius:6px; font-size:0.75rem;">${count} times</span>
            </div>
        `).join('');
}

// نافذة التحميل المخصصة المتوافقة مع تطبيق فايرفوكس PWA (باستخدام Blob)
function showPdfDownloadModal(blobUrl, filename) {
    let modal = document.getElementById('customPdfModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customPdfModal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; z-index:99999;';
        modal.innerHTML = `
            <div style="background:#ffffff; padding:22px; border-radius:16px; width:90%; max-width:340px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
                <i class="fa-solid fa-file-pdf" style="font-size:3rem; color:#0d9488; margin-bottom:10px;"></i>
                <h3 style="margin-bottom:8px; color:#0f172a; font-size:1.1rem; font-weight:800;">تم تجهيز ملف الـ PDF بنجاح</h3>
                <p style="color:#64748b; font-size:0.82rem; margin-bottom:16px; line-height:1.4;">اضغط على الزر أدناه لتحميل الملف مباشرة على جهازك:</p>
                <a id="customPdfDownloadLink" href="" download="" class="btn-main" style="display:block; background:#0d9488; color:#fff; padding:12px; border-radius:10px; text-decoration:none; font-weight:700; font-size:0.9rem; margin-bottom:10px;">تحميل الملف الآن</a>
                <button type="button" onclick="document.getElementById('customPdfModal').style.display='none'" style="background:#f1f5f9; color:#475569; border:none; padding:8px 16px; border-radius:8px; font-size:0.8rem; cursor:pointer; width:100%;">إلغاء</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const link = document.getElementById('customPdfDownloadLink');
    link.href = blobUrl;
    link.download = filename;
    modal.style.display = 'flex';
}

// 1. تقرير المريض الشامل (يحتوي على جميع المراجعات بكامل التفاصيل)
function exportPatientMedicalReportPDF() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;

    let exportContainer = document.getElementById('pdfReportExportContainer');
    if (!exportContainer) {
        exportContainer = document.createElement('div');
        exportContainer.id = 'pdfReportExportContainer';
        exportContainer.style.cssText = 'position:absolute; left:-9999px; top:0; width:210mm; background:#ffffff; visibility:hidden; z-index:-1000;';
        document.body.appendChild(exportContainer);
    }

    let visitsHtml = (patient.visits || []).map((v, idx) => {
        let mh = v.medHistory || {};
        let conditionsText = mh.conditions && mh.conditions.length > 0 ? `<b>الأمراض المزمنة:</b> ${mh.conditions.join(', ')}` : '';
        let mhText = '';
        if (conditionsText || mh.otherCondition || mh.admission || mh.surgery || mh.family || mh.allergy || mh.chronicDrugs || mh.smoking || mh.notes) {
            mhText = `
                <div style="margin-top:8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 0.78rem; line-height: 1.4;">
                    <strong>التاريخ المرضي:</strong> ${conditionsText} ${mh.otherCondition ? '| أخرى: ' + mh.otherCondition : ''} ${mh.admission ? '| دخول المستشفى: ' + mh.admission : ''} ${mh.surgery ? '| العمليات: ' + mh.surgery : ''} ${mh.allergy ? '| حساسية: ' + mh.allergy : ''} ${mh.smoking ? '| التدخين: ' + mh.smoking : ''}
                </div>
            `;
        }

        let vitalsText = `
            <div style="margin-top:8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 0.78rem;">
                <strong>العلامات الحيوية:</strong> ضغط الدم (BP): ${v.bp || '—'} | نبض القلب (HR): ${v.hr ? v.hr + ' bpm' : '—'} | الحرارة: ${v.temp ? v.temp + ' °C' : '—'} | الوزن: ${v.bmiWeight ? v.bmiWeight + ' kg' : '—'} (BMI: ${v.bmiScore || '—'})
            </div>
        `;

        let specialtyHtml = '';
        if (v.obsLmp || v.obsG) specialtyHtml += `<div style="margin-top:6px; background:#fce7f3; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>النسائية:</strong> LMP: ${v.obsLmp || '-'} | EDD: ${v.obsEdd || '-'} | G: ${v.obsG || '-'} P: ${v.obsP || '-'} A: ${v.obsA || '-'}<br>${v.obsNotes || ''}</div>`;
        if (v.orthoJoint) specialtyHtml += `<div style="margin-top:6px; background:#fef3c7; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>العظام:</strong> ${v.orthoJoint} (${v.orthoGrade || '-'})${v.orthoNotes ? ' - ' + v.orthoNotes : ''}</div>`;
        if (v.neuroGcs) specialtyHtml += `<div style="margin-top:6px; background:#f3e8ff; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>الأعصاب:</strong> GCS: ${v.neuroGcs} | الأعصاب: ${v.neuroNerves || '-'}${v.neuroNotes ? ' - ' + v.neuroNotes : ''}</div>`;
        if (v.pedsGrowthAge) specialtyHtml += `<div style="margin-top:6px; background:#e0f2fe; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>الأطفال:</strong> العمر: ${v.pedsGrowthAge} شهر | اللقاحات: ${v.pedsVaccine || '-'}${v.pedsNotes ? ' - ' + v.pedsNotes : ''}</div>`;
        if (v.dermType) specialtyHtml += `<div style="margin-top:6px; background:#ffedd5; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>الجلدية:</strong> ${v.dermType} (${v.dermSite || '-'})${v.dermNotes ? ' - ' + v.dermNotes : ''}</div>`;
        if (v.entEar) specialtyHtml += `<div style="margin-top:6px; background:#ecfdf5; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>أذن وأنف وحنجرة:</strong> ${v.entEar} | الحلق: ${v.entThroat || '-'}</div>`;
        if (v.ophthalVa) specialtyHtml += `<div style="margin-top:6px; background:#e0e7ff; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>العيون:</strong> VA: ${v.ophthalVa} | IOP: ${v.ophthalIop || '-'}</div>`;
        if (v.cardioEcg) specialtyHtml += `<div style="margin-top:6px; background:#fee2e2; padding:6px; border-radius:6px; font-size:0.75rem;"><strong>القلب:</strong> ECG: ${v.cardioEcg} | الأصوات: ${v.cardioSounds || '-'}</div>`;

        return `
            <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px; margin-bottom: 12px; font-size: 0.8rem; color: #1e293b;">
                <div style="background: #0f172a; color: #ffffff; padding: 6px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 700; display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>زيارة رقم #${(patient.visits || []).length - idx}</span>
                    <span>التاريخ: ${v.date || 'غير محدد'}</span>
                </div>
                ${mhText}
                ${vitalsText}
                ${specialtyHtml}
                ${v.labs ? `<div style="margin-top:6px; padding:6px; background:#f8fafc; border-radius:6px;"><strong>التحاليل:</strong> ${v.labs.replace(/\n/g, '<br>')}</div>` : ''}
                ${v.scans ? `<div style="margin-top:6px; padding:6px; background:#f8fafc; border-radius:6px;"><strong>الأشعة:</strong> ${v.scans.replace(/\n/g, '<br>')}</div>` : ''}
                ${v.notes ? `<div style="margin-top:6px; padding:6px; background:#f8fafc; border-radius:6px;"><strong>التشخيص والملاحظات:</strong> ${v.notes.replace(/\n/g, '<br>')}</div>` : ''}
                ${v.drugs ? `<div style="margin-top:6px; padding:6px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px;"><strong>الأدوية الموصوفة (RX):</strong><br>${v.drugs.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        `;
    }).join('');

    exportContainer.innerHTML = `
        <div style="padding: 20px; font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; background: #ffffff; color: #0f172a; width: 210mm; box-sizing: border-box;">
            <div style="border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 850;">تقرير السجل الطبي الشامل للمريض</h2>
                    <p style="margin: 3px 0 0 0; font-size: 0.75rem; color: #64748b;">نظام عيادة ماستر المتقدم - Comprehensive Medical Report</p>
                </div>
                <div style="text-align: left; font-size: 0.7rem; color: #64748b;">
                    تاريخ الإصدار: ${new Date().toLocaleString()}
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                <div><strong>اسم المريض:</strong> ${patient.name + (patient.subName ? ` (${patient.subName})` : '')}</div>
                <div><strong>العمر:</strong> ${patient.age} سنة</div>
                <div><strong>الجنس:</strong> ${patient.gender || 'غير محدد'}</div>
                <div><strong>الحالة الزوجية:</strong> ${patient.marital || 'غير محدد'}</div>
                <div><strong>المهنة:</strong> ${patient.job || 'غير محدد'}</div>
                <div><strong>رقم الهاتف:</strong> ${patient.phone || 'غير محدد'}</div>
            </div>

            <h3 style="font-size: 1rem; color: #0f172a; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">سجل الزيارات والتقييمات كاملة (${(patient.visits || []).length} زيارة مسجلة)</h3>
            <div>
                ${visitsHtml}
            </div>
        </div>
    `;

    exportContainer.style.visibility = 'visible';

    html2canvas(exportContainer, { scale: 2, useCORS: true, logging: false }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageHeight = 295;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        exportContainer.style.visibility = 'hidden';

        showPdfDownloadModal(blobUrl, `Comprehensive_Report_${patient.name.replace(/\s+/g, '_')}.pdf`);
    }).catch(err => {
        alert('حدث خطأ أثناء تحميل التقرير الشامل: ' + err.message);
        exportContainer.style.visibility = 'hidden';
    });
}

// 2. تقرير الزيارة الفردية (يختص بالمراجعة المحددة فقط وبأكبر قدر من التفاصيل)
function exportSingleVisitPDF(visitId) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = (patient.visits || []).find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    let exportContainer = document.getElementById('pdfReportExportContainer');
    if (!exportContainer) {
        exportContainer = document.createElement('div');
        exportContainer.id = 'pdfReportExportContainer';
        exportContainer.style.cssText = 'position:absolute; left:-9999px; top:0; width:210mm; background:#ffffff; visibility:hidden; z-index:-1000;';
        document.body.appendChild(exportContainer);
    }

    let mh = visit.medHistory || {};
    let conditionsText = mh.conditions && mh.conditions.length > 0 ? `<b>الأمراض المزمنة:</b> ${mh.conditions.join(', ')}` : '';
    let mhFullText = '';
    if (conditionsText || mh.otherCondition || mh.admission || mh.surgery || mh.family || mh.allergy || mh.chronicDrugs || mh.smoking || mh.notes) {
        mhFullText = `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 0.8rem; line-height: 1.5;">
                <strong style="color: #0f172a; display: block; margin-bottom: 4px;">التاريخ المرضي والأمراض المزمنة (لهذه المراجعة):</strong>
                ${conditionsText ? conditionsText + '<br>' : ''}
                ${mh.otherCondition ? `<b>أخرى:</b> ${mh.otherCondition}<br>` : ''}
                ${mh.admission ? `<b>دخول المستشفى:</b> ${mh.admission}<br>` : ''}
                ${mh.surgery ? `<b>العمليات:</b> ${mh.surgery}<br>` : ''}
                ${mh.family ? `<b>التاريخ العائلي:</b> ${mh.family}<br>` : ''}
                ${mh.allergy ? `<b>حساسية الأدوية:</b> ${mh.allergy}<br>` : ''}
                ${mh.chronicDrugs ? `<b>أدوية مزمنة:</b> ${mh.chronicDrugs}<br>` : ''}
                ${mh.smoking ? `<b>التدخين:</b> ${mh.smoking} | الكحول: ${mh.alcohol || 'N/A'}<br>` : ''}
                ${mh.notes ? `<b>ملاحظات التاريخ المرضي:</b> ${mh.notes}` : ''}
            </div>
        `;
    }

    let vitalsSummary = `
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div><strong>ضغط الدم (BP):</strong> ${visit.bp || 'غير مسجل'}</div>
            <div><strong>نبض القلب (HR):</strong> ${visit.hr ? visit.hr + ' bpm' : 'غير مسجل'}</div>
            <div><strong>درجة الحرارة:</strong> ${visit.temp ? visit.temp + ' °C' : 'غير مسجل'}</div>
            <div><strong>الوزن & BMI:</strong> ${visit.bmiWeight ? visit.bmiWeight + ' kg' : 'غير مسجل'} (BMI: ${visit.bmiScore || '—'})</div>
        </div>
    `;

    let specialtyHtml = '';
    if (visit.obsLmp || visit.obsEdd || visit.obsG) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#fce7f3; border:1px solid #f472b6; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>النسائية والتوليد:</strong> LMP: ${visit.obsLmp || '-'} | EDD: ${visit.obsEdd || '-'} | G: ${visit.obsG || '-'} P: ${visit.obsP || '-'} A: ${visit.obsA || '-'}<br>${visit.obsNotes || ''}</div>`;
    }
    if (visit.orthoJoint || visit.orthoGrade) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#fef3c7; border:1px solid #f59e0b; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>العظام والمفاصل:</strong> المفصل: ${visit.orthoJoint || '-'} | الدرجة: ${visit.orthoGrade || '-'}<br>${visit.orthoNotes || ''}</div>`;
    }
    if (visit.neuroGcs || visit.neuroNerves) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#f3e8ff; border:1px solid #c084fc; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>الجملة العصبية:</strong> GCS: ${visit.neuroGcs || '-'} | الأعصاب القحفية: ${visit.neuroNerves || '-'}<br>${visit.neuroNotes || ''}</div>`;
    }
    if (visit.pedsGrowthAge || visit.pedsVaccine) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#e0f2fe; border:1px solid #38bdf8; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>الأطفال والنمو:</strong> العمر: ${visit.pedsGrowthAge || '-'} شهر | اللقاحات: ${visit.pedsVaccine || '-'} | التغذية: ${visit.pedsFeeding || '-'}<br>${visit.pedsNotes || ''}</div>`;
    }
    if (visit.dermType || visit.dermSite) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#ffedd5; border:1px solid #fb923c; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>الجلدية:</strong> النوع: ${visit.dermType || '-'} | المكان: ${visit.dermSite || '-'}<br>${visit.dermNotes || ''}</div>`;
    }
    if (visit.entEar || visit.entThroat) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#ecfdf5; border:1px solid #34d399; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>الأذن والأنف والحنجرة:</strong> الأذن: ${visit.entEar || '-'} | الحلق: ${visit.entThroat || '-'}<br>${visit.entNotes || ''}</div>`;
    }
    if (visit.ophthalVa || visit.ophthalIop) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#e0e7ff; border:1px solid #818cf8; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>العيون:</strong> حدة البصر: ${visit.ophthalVa || '-'} | ضغط العين: ${visit.ophthalIop || '-'}<br>${visit.ophthalNotes || ''}</div>`;
    }
    if (visit.cardioEcg || visit.cardioSounds) {
        specialtyHtml += `<div style="margin-bottom:8px; background:#fee2e2; border:1px solid #f87171; padding:8px; border-radius:8px; font-size:0.8rem;"><strong>القلب والشرايين:</strong> تخطيط القلب: ${visit.cardioEcg || '-'} | أصوات القلب: ${visit.cardioSounds || '-'}<br>${visit.cardioNotes || ''}</div>`;
    }

    exportContainer.innerHTML = `
        <div style="padding: 20px; font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; background: #ffffff; color: #0f172a; width: 210mm; box-sizing: border-box;">
            <div style="border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 1.3rem; color: #0f172a; font-weight: 850;">تقرير زيارة المراجعة الطبية</h2>
                    <p style="margin: 3px 0 0 0; font-size: 0.75rem; color: #64748b;">نظام عيادة ماستر المتقدم - Single Visit Medical Report</p>
                </div>
                <div style="text-align: left; font-size: 0.7rem; color: #64748b;">
                    تاريخ الإصدار: ${new Date().toLocaleString()}
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                <div><strong>اسم المريض:</strong> ${patient.name + (patient.subName ? ` (${patient.subName})` : '')}</div>
                <div><strong>العمر:</strong> ${patient.age} سنة</div>
                <div><strong>الجنس:</strong> ${patient.gender || 'غير محدد'}</div>
                <div><strong>الحالة الزوجية:</strong> ${patient.marital || 'غير محدد'}</div>
                <div><strong>رقم الهاتف:</strong> ${patient.phone || 'غير محدد'}</div>
                <div><strong>تاريخ الزيارة:</strong> <span style="color:#0d9488; font-weight:700;">${visit.date || 'غير محدد'}</span></div>
            </div>

            ${mhFullText}
            ${vitalsSummary}
            ${specialtyHtml}

            ${visit.labs ? `<div style="margin-bottom:10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px; font-size:0.8rem;"><strong>التحاليل المختبرية (لهذه الزيارة):</strong><br>${visit.labs.replace(/\n/g, '<br>')}</div>` : ''}
            ${visit.scans ? `<div style="margin-bottom:10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px; font-size:0.8rem;"><strong>الأشعة والفحوصات (لهذه الزيارة):</strong><br>${visit.scans.replace(/\n/g, '<br>')}</div>` : ''}
            ${visit.notes ? `<div style="margin-bottom:10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px; font-size:0.8rem;"><strong>التشخيص والملاحظات (لهذه الزيارة):</strong><br>${visit.notes.replace(/\n/g, '<br>')}</div>` : ''}
            ${visit.drugs ? `<div style="margin-bottom:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; font-size:0.8rem;"><strong>الأدوية والعلاجات الموصوفة (RX لهذه الزيارة):</strong><br>${visit.drugs.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
    `;

    exportContainer.style.visibility = 'visible';

    html2canvas(exportContainer, { scale: 2, useCORS: true, logging: false }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageHeight = 295;

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        exportContainer.style.visibility = 'hidden';

        showPdfDownloadModal(blobUrl, `Visit_Report_${patient.name.replace(/\s+/g, '_')}_${visit.date || 'date'}.pdf`);
    }).catch(err => {
        alert('حدث خطأ أثناء تحميل تقرير الزيارة: ' + err.message);
        exportContainer.style.visibility = 'hidden';
    });
}

function openBmiCalculator(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    document.getElementById('bmiWeight').value = visit.bmiWeight || '';
    document.getElementById('bmiHeight').value = visit.bmiHeight || '';
    calculateBmiLive();
    document.getElementById('bmiCalculatorModal').style.display = 'flex';
}

function closeBmiModal() {
    if (!isSubscriptionExpired && currentVisitIdForModal && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) {
            const visit = patient.visits.find(v => Number(v.visitId) === Number(currentVisitIdForModal));
            if (visit) {
                const w = document.getElementById('bmiWeight').value;
                const h = document.getElementById('bmiHeight').value;
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
    document.getElementById('bmiCalculatorModal').style.display = 'none';
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

    badgeContainer.innerHTML = `<span class="bmi-badge" style="${badgeStyle}">${badgeText}</span>`;
}

function autoResizeTextarea(textarea) {
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
            document.getElementById(`line-text-${category}-${visitId}`).innerText = currentLine;
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
        saveSettingsToCloudAndLocal();
        const btn = document.getElementById(`btn-save-${category}-${visitId}`);
        if (btn) {
            btn.innerText = 'Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.innerText = 'Save';
                btn.classList.remove('saved');
                document.getElementById(`save-bar-${category}-${visitId}`).style.display = 'none';
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
            document.getElementById(`line-text-${inputKey}`).innerText = currentLine;
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

    document.getElementById(`suggestions-${inputKey}`).style.display = 'none';
    document.getElementById(`save-bar-${inputKey}`).style.display = 'none';
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
                document.getElementById(`save-bar-${inputKey}`).style.display = 'none';
            }, 1000);
        }
    }
}

function toggleOtherInput() {
    const isChecked = document.getElementById('mh-other-check').checked;
    document.getElementById('mh-other-box').style.display = isChecked ? 'block' : 'none';
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

    const sys = document.getElementById(`vBpSys-${visitId}`).value.trim();
    const dias = document.getElementById(`vBpDias-${visitId}`).value.trim();

    if (sys || dias) {
        visit.bp = `${sys || '___'}/${dias || '___'} mmHg`;
    } else {
        visit.bp = '';
    }
    savePatientToCloudAndLocal(patient);
}

function handleFileUpload(input, visitId) {
    if (isSubscriptionExpired) return;
    if (input.files && input.files[0]) {
        const file = input.files[0];
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
                visit.attachments.push({ name: file.name, dataUrl: compressedDataUrl });
                savePatientToCloudAndLocal(patient);
                renderVisits(patient.visits, false);
            };
        };
        reader.readAsDataURL(file);
    }
}

function handleScannerScan(visitId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = e => handleFileUpload(e.target, visitId);
    input.click();
}

function previewAttachmentImage(imgSrc) {
    document.getElementById('previewModalImg').src = imgSrc;
    document.getElementById('imagePreviewModal').style.display = 'flex';
}

function closeImagePreview() {
    document.getElementById('imagePreviewModal').style.display = 'none';
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
    const name = document.getElementById('editPName').value.trim();
    const subName = document.getElementById('editPSubName').value.trim();
    const age = Number(document.getElementById('editPAge').value);
    if (!name || !age) return;

    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;

    patient.name = name;
    patient.subName = subName;
    patient.age = age;
    patient.gender = document.getElementById('editPGender').value || 'Unspecified';
    patient.marital = document.getElementById('editPMarital').value || 'Single';
    patient.job = document.getElementById('editPJob').value || 'Unspecified';
    patient.phone = document.getElementById('editPPhone').value || 'N/A';

    savePatientToCloudAndLocal(patient);
    closeEditPatientModal();
    document.getElementById('recPatientName').innerText = patient.name + (patient.subName ? ` (${patient.subName})` : '');
    document.getElementById('recPatientMeta').innerHTML = `Age: ${patient.age} | Gender: ${patient.gender} | Marital: ${patient.marital} | Job: ${patient.job} | Phone: ${patient.phone}`;
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

    document.getElementById('mh-other-check').checked = !!mh.otherCondition;
    document.getElementById('mh-cd-other').value = mh.otherCondition || '';
    document.getElementById('mh-other-box').style.display = mh.otherCondition ? 'block' : 'none';

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
    if (!isSubscriptionExpired && currentVisitIdForModal && currentPatientId) {
        const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
        if (patient) {
            const visit = patient.visits.find(v => Number(v.visitId) === Number(currentVisitIdForModal));
            if (visit) {
                const conditions = [];
                document.querySelectorAll('.mh-cd:checked').forEach(cb => conditions.push(cb.value));

                visit.medHistory = {
                    conditions: conditions,
                    otherCondition: document.getElementById('mh-other-check').checked ? document.getElementById('mh-cd-other').value : '',
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
}

function openRxModal(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    document.getElementById('rxDragPatientDetailsText').innerText = `Name: ${patient.name + (patient.subName ? ` (${patient.subName})` : '')} | Age: ${patient.age} | ${patient.gender || ''}`;
    document.getElementById('rxDragDateText').innerText = visit.date || getTodayFormatted();
    
    const bpVal = visit.bp ? `BP: ${visit.bp}` : 'BP: _____ / _____ mmHg';
    const hrVal = visit.hr ? `HR: ${visit.hr} bpm` : 'HR: _____ bpm';
    const tempVal = visit.temp ? `Temp: ${visit.temp} °C` : 'Temp: _____ °C';
    const bmiVal = visit.bmiScore ? `BMI: ${visit.bmiScore}` : 'BMI: _____';

    document.getElementById('rxDragVitalsText').innerText = `${bpVal} | ${hrVal} | ${tempVal} | ${bmiVal}`;
    document.getElementById('rxDragTreatmentText').innerText = visit.drugs || 'No medications prescribed.';

    const container = document.getElementById('rxCanvasContainer');
    const oldImg = container.querySelector('.rx-bg-img');
    if (oldImg) oldImg.remove();

    if (currentDoctorRxImage) {
        const img = document.createElement('img');
        img.src = currentDoctorRxImage;
        img.className = 'rx-bg-img';
        container.insertBefore(img, container.firstChild);
    }

    loadSavedRxLayout();
    document.getElementById('rxModal').style.display = 'flex';
}

function closeRxModal() {
    document.getElementById('rxModal').style.display = 'none';
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
        hint.innerText = 'Config mode active';
        saveBtn.style.display = 'block';
    } else {
        hint.innerText = 'RX ready';
        saveBtn.style.display = 'none';
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
    const container = document.getElementById('rxModal').querySelector('.modal-body');
    html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        showPdfDownloadModal(blobUrl, `Prescription_${Date.now()}.pdf`);
    }).catch(err => {
        alert('حدث خطأ: ' + err.message);
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
    navigateTo('mainScreen');
}

function openPatientsArchive() {
    navigateTo('archiveScreen', translations[currentLang].archive, 'Search & records');
    renderPatientsList(patients);
}

function openDictionaryManager() {
    navigateTo('dictScreen', 'Dictionary Manager', 'Manage terms');
    renderDictTerms();
}

function renderDictTerms() {
    const cat = document.getElementById('dictCategorySelect').value;
    const terms = medicalDict[cat] || [];
    const container = document.getElementById('dictItemsList');

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
    const rawName = document.getElementById('pName').value.trim();
    const rawSubName = document.getElementById('pSubName').value.trim();

    const nameExists = patients.some(p => p.name.toLowerCase() === rawName.toLowerCase());
    if (nameExists && !rawSubName) {
        alert('⚠️ تنبيه: يوجد مريض بنفس الاسم مسجل مسبقاً! يرجى إدخال اسم الجد الرابع أو العشيرة أو ملاحظة تمييز في حقل "اسم الجد الرابع/العشيرة" للمتابعة.');
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
    const query = document.getElementById('searchInput').value.toLowerCase();
    const gender = document.getElementById('filterGender').value;
    const ageGroup = document.getElementById('filterAgeGroup').value;

    const filtered = patients.filter(p => {
        const fullNameFull = (p.name + " " + (p.subName || "")).toLowerCase();
        const matchQuery = fullNameFull.includes(query) || (p.phone && p.phone.includes(query));
        const matchGender = !gender || p.gender === gender;
        let matchAge = true;
        if (ageGroup === 'child') matchAge = p.age < 18;
        else if (ageGroup === 'adult') matchAge = p.age >= 18 && p.age <= 50;
        else if (ageGroup === 'senior') matchAge = p.age > 50;

        return matchQuery && matchGender && matchAge;
    });
    renderPatientsList(filtered);
}

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

function renderVisits(visits, forceFullRender = true) {
    const container = document.getElementById('visitsContainer');
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
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" onclick="exportSingleVisitPDF(${v.visitId})" style="background:#ffffff; color:#0369a1; border:none; border-radius:6px; padding:4px 10px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                        <i class="fa-solid fa-file-pdf"></i> PDF الزيارة
                    </button>
                    ${visits.length > 1 ? `<button onclick="confirmDeleteVisit(${v.visitId})" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.75rem; cursor:pointer;"><i class="fa-solid fa-trash"></i> Delete</button>` : ''}
                </div>
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
                <span style="font-weight:800; font-size:0.88rem; color:#0369a1; display:block; margin-bottom:10px;"><i class="fa-solid fa-child-reaching"></i> فحص الأطفال ومنحنيات النمو (WHO Pediatrics & Growth Percentiles)</span>
                
                <div style="background:#ffffff; border:1px solid #bae6fd; border-radius:10px; padding:10px; margin-bottom:10px;">
                    <span style="font-weight:700; font-size:0.78rem; color:#0284c7; display:block; margin-bottom:6px;"><i class="fa-solid fa-calculator"></i> حاسبة نمو الطفل السريعة (WHO Standards)</span>
                    <div style="display:flex; gap:6px; margin-bottom:6px;">
                        <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.7rem;">عمر الطفل (بالأشهر)</span><div class="input-wrapper"><input type="number" id="growthAgeM-${v.visitId}" value="${v.pedsGrowthAge || ''}" placeholder="مثال: 12" style="font-size:0.8rem;"></div></div>
                        <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.7rem;">الوزن الحالي (كغ)</span><div class="input-wrapper"><input type="number" step="0.1" id="growthW-${v.visitId}" value="${v.pedsGrowthW || ''}" placeholder="10.5" style="font-size:0.8rem;"></div></div>
                        <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.7rem;">الطول الحالي (سم)</span><div class="input-wrapper"><input type="number" step="0.1" id="growthH-${v.visitId}" value="${v.pedsGrowthH || ''}" placeholder="75.0" style="font-size:0.8rem;"></div></div>
                    </div>
                    <button type="button" class="btn-main" onclick="calculateVisitGrowthPercentiles(${v.visitId})" style="background:#0284c7; padding:6px; font-size:0.75rem; margin-top:4px;">حساب تقييم النمو الفوري</button>
                    
                    <div id="growthRes-${v.visitId}" style="display:${v.pedsGrowthAge ? 'block' : 'none'}; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:8px; margin-top:8px; font-size:0.75rem; color:#14532d; line-height:1.5;">
                        ${v.pedsGrowthAge ? `• تم حساب التقييم البيومتري للزيارة بنجاح.` : ''}
                    </div>
                </div>

                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">حالة اللقاحات والمطعوم</span><div class="input-wrapper"><input type="text" value="${v.pedsVaccine || ''}" placeholder="مثال: مكتملة حسب العمر" oninput="updateVisitFieldData(${v.visitId}, 'pedsVaccine', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">نوع التغذية</span><div class="input-wrapper"><input type="text" value="${v.pedsFeeding || ''}" placeholder="مثال: رضاعة طبيعية / صناعية" oninput="updateVisitFieldData(${v.visitId}, 'pedsFeeding', this.value)" style="font-size:0.85rem;"></div></div>
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
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">فحص الأذن (TM)</span><div class="input-wrapper"><input type="text" value="${v.entEar || ''}" placeholder="مثال: غشاء الطبل طبيعي / احمرار" oninput="updateVisitFieldData(${v.visitId}, 'entEar', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الحلق واللوزتين</span><div class="input-wrapper"><input type="text" value="${v.entThroat || ''}" placeholder="مثال: احمرار اللوزتين Acute Tonsillitis" oninput="updateVisitFieldData(${v.visitId}, 'entThroat', this.value)" style="font-size:0.85rem;"></div></div>
                </div>
                <div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">فحص الأنف والجيوب وملاحظات ENT</span><div class="input-wrapper"><textarea rows="2" placeholder="اكتب تفاصيل فحص الأذن والأنف والحنجرة..." oninput="updateVisitFieldData(${v.visitId}, 'entNotes', this.value)" style="font-size:0.85rem;">${v.entNotes || ''}</textarea></div></div>
            </div>
            ` : ''}

            ${cfg.ophthal ? `
            <div class="group-card" style="background:#e0e7ff; border-color:#818cf8; margin-bottom:12px; padding:12px;">
                <span style="font-weight:800; font-size:0.85rem; color:#4338ca; display:block; margin-bottom:10px;"><i class="fa-solid fa-eye"></i> فحص العيون (Ophthalmology)</span>
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">حدة البصر (Visual Acuity)</span><div class="input-wrapper"><input type="text" value="${v.ophthalVa || ''}" placeholder="RE: 6/6, LE: 6/9" oninput="updateVisitFieldData(${v.visitId}, 'ophthalVa', this.value)" style="font-size:0.85rem;"></div></div>
                    <div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ضغط العين (IOP)</span><div class="input-wrapper"><input type="text" value="${v.ophthalIop || ''}" placeholder="مثال: 15 mmHg" oninput="updateVisitFieldData(${v.visitId}, 'ophthalIop', this.value)" style="font-size:0.85rem;"></div></div>
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
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Image / File
                        <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(this, ${v.visitId})">
                    </label>
                    <button type="button" onclick="handleScannerScan(${v.visitId})" style="flex:1; background:#f0fdfa; border:1px dashed #0d9488; border-radius:10px; padding:10px; font-size:0.8rem; font-weight:700; color:#0d9488; cursor:pointer;">
                        <i class="fa-solid fa-camera"></i> Camera Scanner
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
