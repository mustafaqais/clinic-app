// ==========================================
// Clinic Master System - Cloud Ultimate Edition v17.42
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCgS-TYiCiVIjUrPSkf_z4U837v8LoRUMY",
    authDomain: "mustafaqais-31e2c.firebaseapp.com",
    projectId: "mustafaqais-31e2c",
    storageBucket: "mustafaqais-31e2c.firebasestorage.app",
    messagingSenderId: "835445727081",
    appId: "1:835445727081:web:f5ba7a8d8a241fcbe627f8",
    measurementId: "G-DL042BQE94"
};

// التأكد من عدم تهيئة Firebase أكثر من مرة لمنع توقف التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

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
    chiefComplaint: true,
    historyPresentIllness: true,
    reviewSystems: true,
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

        footer: "نظام عيادة ماستر المتقدم v17.42",

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

        footer: "Clinic Master Network v17.42",

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

let patients = JSON.parse(localStorage.getItem('clinic_patients')) || [];
let trashBin = JSON.parse(localStorage.getItem('clinic_trash')) || [];
let medicalDict = JSON.parse(localStorage.getItem('clinic_dict')) || {
    labs: ["CBC", "RBS", "Lipid Profile", "HbA1c", "LFT", "KFT"],
    scans: ["Chest X-Ray", "Abdominal Ultrasound", "Brain MRI", "CT Scan"],
    drugs: ["Paracetamol 500mg 1x3", "Amoxicillin 500mg 1x3", "Metformin 500mg 1x2"],
    notes: ["Upper Respiratory Tract Infection", "Acute Gastroenteritis"],
    mh_history: ["Appendectomy", "Cholecystectomy", "Penicillin Allergy", "Cesarean Section"],
    chief_complaint: ["Cough and fever", "Severe headache", "Chest pain", "Abdominal pain", "Joint pain"],
    history_present: ["Started 3 days ago, progressive", "Acute onset, moderate severity", "Intermittent episodes"],
    review_systems: ["No fever, no shortness of breath", "Normal bowel habits, no vomiting"]
};

let secretaryAccount = JSON.parse(localStorage.getItem('clinic_sec_account')) || { email: "", password: "" };