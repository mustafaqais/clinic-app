// ==========================================
// Clinic Master System - Cloud Ultimate Edition (RX Preview Fixed & Attachments Preview Fixed)
// ==========================================

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
    const bar = document.getElementById('networkStatusBar');
    if (!bar) return;
    if (!navigator.onLine) {
        bar.classList.add('offline');
        bar.innerText = "⚠️ Offline Mode - Changes saved locally, will sync when online";
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
        document.getElementById('keyTypeHint').innerText = "Generated (" + type + ") valid for " + days + " days.";
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

    if (screenId === 'addPatientScreen') {
        const fieldsToReset = ['pName', 'pAge', 'pGender', 'pCity', 'pMarital', 'pJob', 'pPhone'];
        fieldsToReset.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'SELECT') {
                    el.selectedIndex = 0;
                } else {
                    el.value = '';
                }
            }
        });
    }

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

    const topNavButtons = document.getElementById('topNavButtons');
    const backBtn = document.getElementById('backBtn');
    const mainMenuBtn = document.getElementById('mainMenuBtn');

    if (screenId === 'mainScreen') {
        if (topNavButtons) topNavButtons.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        if (mainMenuBtn) mainMenuBtn.style.display = 'none';
        screenHistory = ['mainScreen'];
    } else {
        if (topNavButtons) {
            topNavButtons.style.display = 'flex';
            topNavButtons.style.flexDirection = 'column';
            topNavButtons.style.gap = '6px';
            topNavButtons.style.position = 'absolute';
            topNavButtons.style.top = '15px';
            topNavButtons.style.left = '15px';
            topNavButtons.style.zIndex = '100';
        }
        if (backBtn) backBtn.style.display = 'flex';
        if (mainMenuBtn) mainMenuBtn.style.display = 'flex';

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
        const topNavButtons = document.getElementById('topNavButtons');
        const backBtn = document.getElementById('backBtn');
        const mainMenuBtn = document.getElementById('mainMenuBtn');

        if (prevScreen === 'mainScreen') {
            if (topNavButtons) topNavButtons.style.display = 'none';
            if (backBtn) backBtn.style.display = 'none';
            if (mainMenuBtn) mainMenuBtn.style.display = 'none';

            document.getElementById('headerTitle').innerText = customBrandName;
            document.getElementById('headerSub').innerText = translations[currentLang].headerSub;
            sessionStorage.setItem('header_title', customBrandName);
            sessionStorage.setItem('header_sub', translations[currentLang].headerSub);
            sessionStorage.removeItem('current_patient_id');
            currentPatientId = null;
        } else {
            if (topNavButtons) topNavButtons.style.display = 'flex';
            if (backBtn) backBtn.style.display = 'flex';
            if (mainMenuBtn) mainMenuBtn.style.display = 'flex';

            if (prevScreen === 'archiveScreen') {
                document.getElementById('headerTitle').innerText = translations[currentLang].archive;
                document.getElementById('headerSub').innerText = 'Advanced search, filters & records';
                sessionStorage.removeItem('current_patient_id');
                currentPatientId = null;
            }
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
    if (document.getElementById('rxModal').style.display === 'flex') {
        closeRxModal();
        return;
    }
    if (document.getElementById('medicalReportModal') && document.getElementById('medicalReportModal').style.display === 'flex') {
        closeMedicalReportModal();
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
    if (document.getElementById('bulkAddDictModal') && document.getElementById('bulkAddDictModal').style.display === 'flex') {
        closeBulkAddModal();
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
    const screens = ['mainScreen', 'addPatientScreen', 'rxTemplateScreen', 'specialtiesDashboardScreen', 'archiveScreen', 'trashScreen', 'medicalRecordScreen', 'dictScreen', 'networkScreen', 'analyticsScreen', 'settingsScreen', 'backupScreen', 'permissionsScreen'];
    screens.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = 'none';
    });
}

function applyLanguage() {
    localStorage.setItem('clinic_lang', currentLang);
}

function applyDarkModeState() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    applyLanguage();
    location.reload();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('clinic_dark_mode', isDarkMode);
    applyDarkModeState();
}

window.addEventListener("DOMContentLoaded", () => {
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
        const activScreen = document.getElementById('activationScreen');
        const appCont = document.getElementById('appContainer');
        const authScreen = document.getElementById('authScreen');

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

            patients = JSON.parse(localStorage.getItem('clinic_patients_' + dataOwnerUid)) || patients;
            trashBin = JSON.parse(localStorage.getItem('clinic_trash_' + dataOwnerUid)) || trashBin;

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
                            if (!medicalDict.chief_complaint) medicalDict.chief_complaint = ["Cough and fever", "Severe headache", "Chest pain"];
                            if (!medicalDict.history_present) medicalDict.history_present = ["Started 3 days ago, progressive"];
                            if (!medicalDict.review_systems) medicalDict.review_systems = ["No fever, no shortness of breath"];
                            localStorage.setItem('clinic_dict', JSON.stringify(medicalDict));
                        }
                        if (data.trashBin) {
                            trashBin = data.trashBin;
                            localStorage.setItem('clinic_trash_' + dataOwnerUid, JSON.stringify(trashBin));
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
                        localStorage.setItem('clinic_patients_' + dataOwnerUid, JSON.stringify(patients));
                        localStorage.setItem('clinic_patients', JSON.stringify(patients));

                        const archiveScreen = document.getElementById('archiveScreen');
                        const medScreen = document.getElementById('medicalRecordScreen');

                        if (archiveScreen && archiveScreen.style.display === 'block') {
                            filterPatients();
                        } else if (medScreen && medScreen.style.display === 'block' && currentPatientId) {
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

            const founderMail = (typeof FOUNDER_EMAIL !== 'undefined') ? FOUNDER_EMAIL.toLowerCase() : "admin@clinic.com";
            if (user.email.toLowerCase() === founderMail) {
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
            if (activScreen) activScreen.style.display = 'none';
            if (appCont) appCont.style.display = 'none';
            if (authScreen) authScreen.style.display = 'flex';
        }
    });

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
    let expiryDateStr = localStorage.getItem('sub_expiry_' + uid);

    if (navigator.onLine) {
        try {
            const docRef = await db.collection('network_hierarchy').doc(uid).get();
            if (docRef.exists) {
                const data = docRef.data();
                if (data.expiryDate) {
                    expiryDateStr = data.expiryDate;
                    localStorage.setItem('sub_expiry_' + uid, expiryDateStr);
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
        alert('⚠️ انتهت صلاحية الاشتراك. التطبيق يعمل في وضع القراءة فقط.');
        openSupportModal();
    };

    const banner = document.getElementById('subStatusBanner');
    const titleEl = document.getElementById('subBannerTitle');
    const textEl = document.getElementById('subBannerText');
    banner.style.display = 'flex';
    banner.className = 'sub-status-banner expired';
    titleEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> انتهت صلاحية الاشتراك - وضع القراءة فقط';
    textEl.innerText = 'انتهى اشتراكك. يمكنك تصفح الأرشيف وقراءة الملفات والتقارير بحرية تامة أو تجديد الكود.';

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
        titleEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Active Subscription';
        textEl.innerText = 'You have ' + diffDays + ' day(s) remaining.';
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
            localStorage.setItem('sub_expiry_' + user.uid, expiryDateIso);
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
    localStorage.setItem('clinic_patients_' + ownerUid, JSON.stringify(patients));
    localStorage.setItem('clinic_patients', JSON.stringify(patients));

    if (navigator.onLine) {
        db.collection('users_data').doc(ownerUid).collection('patients').doc(String(patientObj.id)).set(patientObj)
            .catch(err => console.log("Cloud save error:", err));
    }
}

function saveTrashToCloudAndLocal() {
    if (!currentUserId || isSubscriptionExpired) return;
    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;

    localStorage.setItem('clinic_trash_' + ownerUid, JSON.stringify(trashBin));
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

    const container = document.getElementById('rxCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

    const rxLayoutData = {};
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        const widthPct = (box.offsetWidth / cWidth) * 100;

        rxLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%',
            width: widthPct + '%',
            fontSize: box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text') ? window.getComputedStyle(box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text')).fontSize : '1rem'
        };
    });
    
    const rxStorageKey = getRxDeviceStorageKey();
    localStorage.setItem(rxStorageKey, JSON.stringify(rxLayoutData));
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
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const regBox = document.getElementById('registerPhoneBox');
    if (regBox) regBox.style.display = isRegisterMode ? 'block' : 'none';
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('authPassword');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    if (!passInput || !toggleBtn) return;
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

async function handleAuthSubmit() {
    const identifier = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPassword').value;
    const founderMail = (typeof FOUNDER_EMAIL !== 'undefined') ? FOUNDER_EMAIL.toLowerCase() : "admin@clinic.com";

    if (!identifier || !pass) {
        alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
        return;
    }

    if (isRegisterMode) {
        const phone = document.getElementById('regPhoneInput') ? document.getElementById('regPhoneInput').value.trim() : '';
        auth.createUserWithEmailAndPassword(identifier, pass)
            .then(async res => {
                pendingUserPass = pass;
                currentUserId = res.user.uid;
                
                try {
                    await db.collection('network_hierarchy').doc(currentUserId).set({
                        email: identifier.toLowerCase(),
                        phone: phone || '',
                        password: pass,
                        role: identifier.toLowerCase() === founderMail ? 'Founder' : 'Client Node',
                        isActivated: identifier.toLowerCase() === founderMail,
                        doctorName: "نظام عيادة ماستر",
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                } catch (err) {
                    console.log("Error:", err);
                }

                if (identifier.toLowerCase() === founderMail) {
                    const expiryDate = new Date();
                    expiryDate.setFullYear(expiryDate.getFullYear() + 10);
                    localStorage.setItem('sub_expiry_' + res.user.uid, expiryDate.toISOString());
                    setupFounderInterfaceAfterAuth();
                } else {
                    document.getElementById('authScreen').style.display = 'none';
                    document.getElementById('activationScreen').style.display = 'flex';
                }
            })
            .catch(err => alert('خطأ في التسجيل: ' + err.message));
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
                    console.log("Auth Hierarchy check warning:", e);
                }

                await loadDoctorBranding(dataOwnerUid);

                document.getElementById('authScreen').style.display = 'none';
                document.getElementById('activationScreen').style.display = 'none';
                document.getElementById('appContainer').style.display = 'flex';

                if (isSec) {
                    const cp = document.getElementById('cardPermissions');
                    const sb = document.getElementById('subStatusBanner');
                    if (cp) cp.style.display = 'none';
                    if (sb) sb.style.display = 'none';
                    isUserSecretary = true;
                    applySecretaryUIVisibility();
                    restorePreviousScreenState();
                } else if (loginEmail.toLowerCase() === founderMail) {
                    setupFounderInterfaceAfterAuth();
                } else {
                    checkUserSubscriptionStatus(res.user.uid, false);
                }
            })
            .catch(err => {
                console.error("Login error details:", err);
                alert('خطأ في تسجيل الدخول: تأكد من صحة البريد الإلكتروني وكلمة المرور أو اتصال الإنترنت.');
            });
    }
}
window.handleAuthSubmit = handleAuthSubmit;

function showAllCardsForDoctor() {
    ['cardNewPatient', 'cardArchive', 'cardRxTemplate', 'cardSpecialtiesDashboard', 'cardDict', 'cardAnalytics', 'cardBackup', 'cardTrash', 'cardSettings', 'cardPermissions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    });
}

function applySecretaryUIVisibility() {
    ['cardNewPatient', 'cardArchive'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'flex';
    });
    ['cardRxTemplate', 'cardSpecialtiesDashboard', 'cardDict', 'cardAnalytics', 'cardBackup', 'cardTrash', 'cardSettings', 'cardPermissions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function calculateVisitChildGrowth(visitId) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    const ageMonths = parseFloat(document.getElementById('pedsAgeMonths-' + visitId).value);
    const weight = parseFloat(document.getElementById('pedsWeight-' + visitId).value);
    const height = parseFloat(document.getElementById('pedsHeight-' + visitId).value);

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
            weightStatus = 'قصر قامة / تقزم محتمل (< P3)';
            weightColor = '#b91c1c';
        } else if (height > expectedHeight * 1.12) {
            weightStatus = 'طول أعلى من المعدل';
            weightColor = '#0284c7';
        }
    }

    visit.pedsGrowthResult = '• <b>تقييم الوزن:</b> <span style="color:' + weightColor + '; font-weight:700;">' + weightStatus + '</span><br>' +
                             '• <b>تقييم الطول:</b> <span style="color:' + heightColor + '; font-weight:700;">' + heightStatus + '</span>';

    savePatientToCloudAndLocal(patient);
    renderVisits(patient.visits, false);
}

function openSpecialtiesDashboard() {
    navigateTo('specialtiesDashboardScreen', 'لوحة تحكم الاختصاصات', 'تخصيص وتفعيل الحقول الطبية');
    
    document.getElementById('mod_medHistory').checked = !!specialtyConfig.medHistory;
    document.getElementById('mod_chiefComplaint').checked = !!specialtyConfig.chiefComplaint;
    document.getElementById('mod_historyPresentIllness').checked = !!specialtyConfig.historyPresentIllness;
    document.getElementById('mod_reviewSystems').checked = !!specialtyConfig.reviewSystems;
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
        chiefComplaint: document.getElementById('mod_chiefComplaint').checked,
        historyPresentIllness: document.getElementById('mod_historyPresentIllness').checked,
        reviewSystems: document.getElementById('mod_reviewSystems').checked,
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

function saveSecretaryPermissions() {
    alert('Permissions saved.');
    showMainMenu();
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
        version: "17.66",
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
    downloadAnchor.setAttribute("download", "Clinic_Master_Backup_" + getTodayFormatted() + ".json");
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

                if (confirm('Restore data with (' + parsed.patients.length + ') patients?')) {
                    patients = parsed.patients;
                    trashBin = parsed.trashBin || [];
                    medicalDict = parsed.medicalDict || medicalDict;
                    if (parsed.rxImage) currentDoctorRxImage = parsed.rxImage;
                    if (parsed.rxLayout) localStorage.setItem('doctor_rx_layout', JSON.stringify(parsed.rxLayout));
                    if (parsed.secretaryAccount) secretaryAccount = parsed.secretaryAccount;
                    if (parsed.specialtyConfig) specialtyConfig = parsed.specialtyConfig;

                    const ownerUid = sessionStorage.getItem('target_doctor_uid') || currentUserId;
                    if (ownerUid) {
                        localStorage.setItem('clinic_patients_' + ownerUid, JSON.stringify(patients));
                        localStorage.setItem('clinic_trash_' + ownerUid, JSON.stringify(trashBin));
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

// ==========================================
// الدوال المحدثة (الطباعة والسكانر ومعاينة الصور بدقة)
// ==========================================

async function printPrescriptionDirectly() {
    const rxModal = document.getElementById('rxModal');
    if (rxModal) rxModal.style.display = 'none';
    
    setTimeout(() => {
        window.print();
        if (rxModal) rxModal.style.display = 'flex';
    }, 300);
}

function printMedicalReportDirectly() {
    injectPrintStyle('report');
    if (repConfigModeActive) toggleRepConfigMode();
    
    const container = document.getElementById('repCanvasContainer');
    const controls = container ? container.querySelectorAll('.box-font-controls') : [];
    controls.forEach(c => c.style.display = 'none');

    document.body.classList.add('is-printing-report-only');
    const reportModal = document.getElementById('medicalReportModal');
    if (reportModal) reportModal.style.display = 'none';
    
    setTimeout(() => {
        window.print();
    }, 400);
    
    setTimeout(() => {
        document.body.classList.remove('is-printing-report-only');
        controls.forEach(c => c.style.display = '');
        if (reportModal) reportModal.style.display = 'flex';
    }, 1500);
}

// دالة فتح معاينة الروشتة فقط دون طباعة مباشرة ليتسنى لك التعديل والمعاينة
function printPrescriptionOnly(visitId) {
    openRxModal(visitId);
}

async function scanFromDesktopScanner(visitId) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) {
        alert("تنبيه: لم يتم تحديد ملف المريض!");
        return;
    }
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) {
        alert("تنبيه: لم يتم العثور على تفاصيل الزيارة!");
        return;
    }

    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    if (!visit.attachments) visit.attachments = [];
                    
                    visit.attachments.push({ 
                        name: file.name || ("Scan_" + Date.now() + ".jpg"), 
                        dataUrl: event.target.result 
                    });

                    savePatientToCloudAndLocal(patient);
                    renderVisits(patient.visits, false);
                    alert("تم سحب وإرفاق الصورة بنجاح إلى ملف المريض!");
                };
                reader.readAsDataURL(file);
            }
        };

        fileInput.click();
    } catch (err) {
        console.error("خطأ في السحب:", err);
        alert("تعذر إتمام عملية السحب.");
    }
}

// الدوال المحدثة لمعاينة الصور المرفقة بملف المريض بكل سلاسة
function previewAttachmentByIndex(visitId, index) {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit || !visit.attachments || !visit.attachments[index]) return;
    
    const att = visit.attachments[index];
    previewAttachmentImage(att.dataUrl);
}

function previewAttachmentImage(imgSrc) {
    const modalImg = document.getElementById('previewModalImg');
    const modalDiv = document.getElementById('imagePreviewModal');
    if (modalImg && modalDiv) {
        modalImg.src = imgSrc;
        modalDiv.style.display = 'flex';
    }
}

function closeImagePreview() {
    const modalDiv = document.getElementById('imagePreviewModal');
    if (modalDiv) {
        modalDiv.style.display = 'none';
    }
}

function openNetworkHierarchy() {
    navigateTo('networkScreen', 'قاعدة بيانات الشبكة', 'إدارة المستخدمين والأسماء البارزة');
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
            const currentDocName = data.doctorName || 'غير مسجل';
            const founderMail = (typeof FOUNDER_EMAIL !== 'undefined') ? FOUNDER_EMAIL.toLowerCase() : "admin@clinic.com";
            const isFounder = userEmail.toLowerCase() === founderMail;

            html += '<div class="node-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;">' +
                    '<div class="node-info">' +
                    '<h5 style="margin:0; font-size:0.85rem; color:#0f172a;"><i class="fa-solid fa-envelope" style="color:#0d9488;"></i> ' + userEmail + '</h5>' +
                    '<p style="margin:2px 0; font-size:0.75rem; color:#64748b;"><b>الاسم البارز:</b> <span style="color:#0d9488; font-weight:700;">' + currentDocName + '</span></p>' +
                    '<p style="margin:0; font-size:0.75rem; color:#64748b;"><b>Password:</b> ' + (data.password || 'N/A') + '</p>' +
                    '</div>' +
                    '<div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">' +
                    '<span class="node-badge" style="font-size:0.68rem; padding:2px 6px; background:#e0f2fe; color:#0369a1; border-radius:4px;">' + (data.role || 'Client') + '</span>' +
                    '<div style="display:flex; gap:4px;">' +
                    '<button onclick="promptFounderEditNameByElement(this)" data-uid="' + nodeUid + '" data-name="' + currentDocName + '" data-email="' + userEmail + '" style="background:#ccfbf1; color:#0f766e; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-pen"></i> اسم</button>' +
                    (!isFounder ? '<button onclick="promptFounderDeleteNodeByElement(this)" data-uid="' + nodeUid + '" data-email="' + userEmail + '" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.7rem; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>' : '') +
                    '</div></div></div>';
        });
        container.innerHTML = html;
    });
}

function promptFounderEditNameByElement(btn) {
    const nodeUid = btn.getAttribute('data-uid');
    const currentName = btn.getAttribute('data-name');
    const userEmail = btn.getAttribute('data-email');
    promptFounderEditName(nodeUid, currentName, userEmail);
}

function promptFounderDeleteNodeByElement(btn) {
    const nodeUid = btn.getAttribute('data-uid');
    const userEmail = btn.getAttribute('data-email');
    promptFounderDeleteNode(nodeUid, userEmail);
}

function promptFounderEditName(nodeUid, currentName, userEmail) {
    targetNodeUidForNameEdit = nodeUid;
    document.getElementById('editNameTargetEmail').innerText = userEmail;
    document.getElementById('founderInputDoctorName').value = currentName !== 'غير مسجل' ? currentName : '';
    document.getElementById('founderEditNameModal').style.display = 'flex';
}

function closeFounderEditNameModal() {
    document.getElementById('founderEditNameModal').style.display = 'none';
    targetNodeUidForNameEdit = null;
}

async function executeFounderUpdateDoctorName() {
    const newName = document.getElementById('founderInputDoctorName').value.trim();
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

    document.getElementById('ratioMaleBar').style.width = malePct + '%';
    document.getElementById('ratioFemaleBar').style.width = femalePct + '%';
    document.getElementById('ratioMaleText').innerText = 'Male: ' + malePct + '%';
    document.getElementById('ratioFemaleText').innerText = 'Female: ' + femalePct + '%';

    const sortedDrugs = Object.entries(drugFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDrugsContainer = document.getElementById('topDrugsList');

    topDrugsContainer.innerHTML = sortedDrugs.length === 0 
        ? '<p style="font-size:0.8rem; color:#64748b; text-align:center;">No data.</p>'
        : sortedDrugs.map(([drug, count], idx) => 
            '<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; border-radius:10px; font-size:0.85rem; font-weight:600;">' +
            '<span>' + (idx + 1) + '. ' + drug + '</span>' +
            '<span style="background:#ccfbf1; color:#0f766e; padding:2px 8px; border-radius:6px; font-size:0.75rem;">' + count + ' times</span>' +
            '</div>'
        ).join('');
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
        badgeText = 'نحافة (Underweight: ' + bmi + ')';
        badgeStyle = 'background:#fef3c7; color:#d97706;';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        badgeText = 'وزن طبيعي (Normal: ' + bmi + ')';
        badgeStyle = 'background:#dcfce7; color:#15803d;';
    } else if (bmi >= 25 && bmi <= 29.9) {
        badgeText = 'زيادة وزن (Overweight: ' + bmi + ')';
        badgeStyle = 'background:#ffedd5; color:#c2410c;';
    } else {
        badgeText = 'سمنة (Obese: ' + bmi + ')';
        badgeStyle = 'background:#fee2e2; color:#b91c1c;';
    }

    badgeContainer.innerHTML = '<span class="bmi-badge" style="' + badgeStyle + '">' + badgeText + '</span>';
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
    const val = textarea.value;
    const box = document.getElementById('suggestions-' + category + '-' + visitId);
    const saveBar = document.getElementById('save-bar-' + category + '-' + visitId);
    
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
            const textSpan = document.getElementById('line-text-' + category + '-' + visitId);
            if (textSpan) textSpan.innerText = currentLine;
        }
        let dictKey = category;
        if (category === 'chiefComplaint') dictKey = 'chief_complaint';
        else if (category === 'historyPresentIllness') dictKey = 'history_present';
        else if (category === 'reviewSystems') dictKey = 'review_systems';

        const terms = medicalDict[dictKey] || medicalDict[category] || [];
        const matches = terms.filter(t => t.toLowerCase().startsWith(currentLine.toLowerCase()) && t.toLowerCase() !== currentLine.toLowerCase());

        if (matches.length > 0 && box) {
            box.innerHTML = matches.map(m => {
                const escapedTerm = m.replace(/'/g, "\\'");
                return '<div class="suggestion-item" onmousedown="event.preventDefault(); selectSuggestion(\'' + category + '\', ' + visitId + ', \'' + escapedTerm + '\')">' + m + '</div>';
            }).join('');
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
    const textarea = document.getElementById('v' + category.charAt(0).toUpperCase() + category.slice(1) + '-' + visitId);
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    lines[lines.length - 1] = term;
    textarea.value = lines.join('\n') + '\n';
    autoResizeTextarea(textarea);

    const box = document.getElementById('suggestions-' + category + '-' + visitId);
    const saveBar = document.getElementById('save-bar-' + category + '-' + visitId);
    if (box) box.style.display = 'none';
    if (saveBar) saveBar.style.display = 'none';

    updateVisitFieldData(visitId, category, textarea.value);
    textarea.focus();
}

function hideSuggestions(category, visitId) {
    setTimeout(() => {
        const box = document.getElementById('suggestions-' + category + '-' + visitId);
        const bar = document.getElementById('save-bar-' + category + '-' + visitId);
        if (box) box.style.display = 'none';
        if (bar) bar.style.display = 'none';
    }, 250);
}

function saveLineToDict(event, category, visitId) {
    event.preventDefault();
    const textSpan = document.getElementById('line-text-' + category + '-' + visitId);
    if (!textSpan) return;
    const lineText = textSpan.innerText.trim();
    
    let dictKey = category;
    if (category === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (category === 'historyPresentIllness') dictKey = 'history_present';
    else if (category === 'reviewSystems') dictKey = 'review_systems';

    if (lineText && medicalDict[dictKey] && !medicalDict[dictKey].includes(lineText)) {
        medicalDict[dictKey].push(lineText);
        saveSettingsToCloudAndLocal();
        const btn = document.getElementById('btn-save-' + category + '-' + visitId);
        if (btn) {
            btn.innerText = 'Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.innerText = 'Save';
                btn.classList.remove('saved');
                document.getElementById('save-bar-' + category + '-' + visitId).style.display = 'none';
            }, 1000);
        }
    }
}

function handleMhLiveInput(inputEl, inputKey) {
    autoResizeTextarea(inputEl);
    const val = inputEl.value.trim();
    const box = document.getElementById('suggestions-' + inputKey);
    const saveBar = document.getElementById('save-bar-' + inputKey);

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
            const textSpan = document.getElementById('line-text-' + inputKey);
            if (textSpan) textSpan.innerText = currentLine;
        }
        const terms = medicalDict.mh_history || [];
        const matches = terms.filter(t => t.toLowerCase().startsWith(currentLine.toLowerCase()) && t.toLowerCase() !== currentLine.toLowerCase());

        if (matches.length > 0 && box) {
            box.innerHTML = matches.map(m => {
                const escapedTerm = m.replace(/'/g, "\\'");
                return '<div class="suggestion-item" onmousedown="event.preventDefault(); selectMhSuggestion(\'' + inputKey + '\', \'' + escapedTerm + '\')">' + m + '</div>';
            }).join('');
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
    const el = inputKey === 'mh_other' ? document.getElementById('mh-cd-other') : document.getElementById('mh-' + inputKey.replace('mh_', ''));
    if (!el) return;

    const lines = el.value.split('\n');
    lines[lines.length - 1] = term;
    el.value = lines.join('\n') + '\n';
    autoResizeTextarea(el);

    document.getElementById('suggestions-' + inputKey).style.display = 'none';
    document.getElementById('save-bar-' + inputKey).style.display = 'none';
    el.focus();
}

function hideMhSuggestions(inputKey) {
    setTimeout(() => {
        const box = document.getElementById('suggestions-' + inputKey);
        const bar = document.getElementById('save-bar-' + inputKey);
        if (box) box.style.display = 'none';
        if (bar) bar.style.display = 'none';
    }, 250);
}

function saveMhLineToDict(event, inputKey) {
    event.preventDefault();
    const textSpan = document.getElementById('line-text-' + inputKey);
    if (!textSpan) return;
    const lineText = textSpan.innerText.trim();
    if (lineText && !medicalDict.mh_history.includes(lineText)) {
        medicalDict.mh_history.push(lineText);
        saveSettingsToCloudAndLocal();
        const btn = document.getElementById('btn-save-' + inputKey);
        if (btn) {
            btn.innerText = 'Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.innerText = 'Save';
                btn.classList.remove('saved');
                document.getElementById('save-bar-' + inputKey).style.display = 'none';
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
            let eddStr = year + '-' + month + '-' + day;
            
            const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
            if (patient) {
                const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
                if (visit) {
                    visit.obsEdd = eddStr;
                    savePatientToCloudAndLocal(patient);
                    const eddInput = document.getElementById('obsEdd-' + visitId);
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

    const sys = document.getElementById('vBpSys-' + visitId).value.trim();
    const dias = document.getElementById('vBpDias-' + visitId).value.trim();

    if (sys || dias) {
        visit.bp = (sys || '___') + '/' + (dias || '___') + ' mmHg';
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

function openEditPatientModal() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    document.getElementById('editPName').value = patient.name || '';
    document.getElementById('editPAge').value = patient.age || '';
    document.getElementById('editPGender').value = patient.gender || '';
    document.getElementById('editPCity').value = patient.city || '';
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
    const age = Number(document.getElementById('editPAge').value);
    if (!name || !age) return;

    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;

    patient.name = name;
    patient.age = age;
    patient.gender = document.getElementById('editPGender').value || 'Unspecified';
    patient.city = document.getElementById('editPCity').value || '';
    patient.marital = document.getElementById('editPMarital').value || 'Single';
    patient.job = document.getElementById('editPJob').value || 'Unspecified';
    patient.phone = document.getElementById('editPPhone').value || 'N/A';

    savePatientToCloudAndLocal(patient);
    closeEditPatientModal();
    document.getElementById('recPatientName').innerText = patient.name;
    document.getElementById('recPatientMeta').innerHTML = 'Age: ' + patient.age + ' | Gender: ' + patient.gender + (patient.city ? ' | المحافظة: ' + patient.city : '') + ' | Marital: ' + patient.marital + ' | Job: ' + patient.job + ' | Phone: ' + patient.phone;
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
        : trashBin.map((item, index) => 
            '<div class="trash-card">' +
            '<div><h4>' + (item.data.name || item.patientName) + '</h4></div>' +
            '<button class="btn-restore" onclick="restoreTrashItem(' + index + ')">Restore</button>' +
            '</div>'
        ).join('');
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

    if (!visit.medHistory) {
        visit.medHistory = { conditions: [], otherCondition: '', admission: '', surgery: '', family: '', allergy: '', chronicDrugs: '', smoking: 'Non-smoker', alcohol: 'Non-drinker', notes: '' };
    }

    const mh = visit.medHistory;
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
    const modal = document.getElementById('medHistoryModal');
    if (modal) modal.style.display = 'none';
}

function formatTreatmentForPrintOrView(rawText) {
    if (!rawText) return 'No medications prescribed.';
    
    let lines = rawText.split('\n').filter(line => line.trim() !== '');
    
    let htmlOutput = '<div class="rx-rx-title" style="color: #b91c1c; font-family: \'Playfair Display\', serif; font-weight: 900; font-size: 1.4rem; margin-bottom: 6px; text-align: left; direction: ltr;">Rx</div>';
    htmlOutput += '<div class="rx-treatment-list" style="text-align: left; direction: ltr;">';
    
    let counter = 1;
    lines.forEach(line => {
        let cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '').trim();
        if (cleanLine) {
            htmlOutput += '<div style="margin-bottom: 4px; font-weight: 700; color: #000000; font-size: 1.05rem;">' + counter + '. ' + cleanLine + '</div>';
            counter++;
        }
    });
    
    htmlOutput += '</div>';
    return htmlOutput;
}

function openRxModal(visitId) {
    currentVisitIdForModal = visitId;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    document.getElementById('rxDragPatientDetailsText').innerText = 'Name: ' + patient.name + ' | Age: ' + patient.age + ' | ' + (patient.gender || '');
    document.getElementById('rxDragDateText').innerText = visit.date || getTodayFormatted();
    
    const bpVal = visit.bp ? 'BP: ' + visit.bp : 'BP: _____ / _____ mmHg';
    const hrVal = visit.hr ? 'HR: ' + visit.hr + ' bpm' : 'HR: _____ bpm';
    const tempVal = visit.temp ? 'Temp: ' + visit.temp + ' °C' : 'Temp: _____ °C';
    const bmiVal = visit.bmiScore ? 'BMI: ' + visit.bmiScore : 'BMI: _____';

    document.getElementById('rxDragVitalsText').innerText = bpVal + ' | ' + hrVal + ' | ' + tempVal + ' | ' + bmiVal;
    
    const treatmentEl = document.getElementById('rxDragTreatmentText');
    if (treatmentEl) {
        treatmentEl.innerHTML = formatTreatmentForPrintOrView(visit.drugs);
    }

    const container = document.getElementById('rxCanvasContainer');
    const oldImg = container.querySelector('.rx-bg-img');
    if (oldImg) oldImg.remove();

    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    if (savedRxImg) {
        const img = document.createElement('img');
        img.src = savedRxImg;
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
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
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
        if (hint) hint.innerText = '';
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
    el.style.fontSize = (currentSize + delta) + 'px';
}

function setRxPaperSize(size) {
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;
    container.classList.remove('size-a4', 'size-a5');
    container.classList.add('size-' + size);
    localStorage.setItem('clinic_rx_paper_size', size);
}

function getRxDeviceStorageKey() {
    const width = window.innerWidth;
    if (width <= 768) {
        return 'doctor_rx_layout_mobile';
    } else if (width > 768 && width <= 1024) {
        return 'doctor_rx_layout_tablet';
    } else {
        return 'doctor_rx_layout_desktop';
    }
}

function saveRxLayoutPositions() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

    const rxLayoutData = {};
    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        const leftPct = (box.offsetLeft / cWidth) * 100;
        const topPct = (box.offsetTop / cHeight) * 100;
        const widthPct = (box.offsetWidth / cWidth) * 100;

        rxLayoutData[box.id] = {
            top: topPct + '%',
            left: leftPct + '%',
            width: widthPct + '%',
            fontSize: box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text') ? window.getComputedStyle(box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text')).fontSize : '1rem'
        };
    });

    const storageKey = getRxDeviceStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(rxLayoutData));
    localStorage.setItem('doctor_rx_layout', JSON.stringify(rxLayoutData));

    if (typeof saveSettingsToCloudAndLocal === 'function') {
        saveSettingsToCloudAndLocal();
    }

    alert('تم حفظ أماكن وأحجام الروشتة الخاصة بهذا الجهاز فقط وبشكل مستقل بنجاح!');
}

function loadSavedRxLayout() {
    const storageKey = getRxDeviceStorageKey();
    let savedJson = localStorage.getItem(storageKey);
    
    if (!savedJson) {
        savedJson = localStorage.getItem('doctor_rx_layout');
    }

    const savedLayout = JSON.parse(savedJson || '{}');
    for (const [boxId, data] of Object.entries(savedLayout)) {
        const box = document.getElementById(boxId);
        if (box && data) {
            if (data.top) box.style.top = data.top;
            if (data.left) box.style.left = data.left;
            if (data.width) box.style.width = data.width;
            if (data.fontSize) {
                const textEl = box.querySelector('.rx-patient-details-text, .rx-date-text, .rx-vitals-text, .rx-treatment-text');
                if (textEl) textEl.style.fontSize = data.fontSize;
            }
        }
    }
    const savedSize = localStorage.getItem('clinic_rx_paper_size') || 'a4';
    setRxPaperSize(savedSize);
}

function injectPrintStyle(type = 'rx') {
    const width = window.innerWidth;
    let deviceType = 'desktop';
    
    if (width <= 768) {
        deviceType = 'mobile';
    } else if (width > 768 && width <= 1024) {
        deviceType = 'tablet';
    }

    const styleFileName = 'print-' + type + '-' + deviceType + '.css';

    let oldLink = document.getElementById('activePrintStyle');
    if (oldLink) oldLink.remove();

    const link = document.createElement('link');
    link.id = 'activePrintStyle';
    link.rel = 'stylesheet';
    link.href = styleFileName;
    document.head.appendChild(link);
}

function openPrescriptionPDF() {
    isConfigMode = false;
    document.querySelectorAll('#rxModal .draggable-box').forEach(b => b.classList.remove('config-mode'));
    updateConfigModeUI();

    const container = document.getElementById('rxCanvasContainer');
    const controls = container.querySelectorAll('.box-font-controls');
    controls.forEach(c => c.style.display = 'none');

    html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('Prescription_' + Date.now() + '.pdf');
        controls.forEach(c => c.style.display = '');
    });
}

function initDraggableElements() {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('rxCanvasContainer');
    if (!container) return;

    document.querySelectorAll('#rxModal .draggable-box').forEach(box => {
        box.style.touchAction = 'none';

        box.addEventListener('pointerdown', e => {
            if (!isConfigMode || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;
            
            initialLeftPct = (box.offsetLeft / cWidth) * 100;
            initialTopPct = (box.offsetTop / cHeight) * 100;
            
            box.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        box.addEventListener('pointermove', e => {
            if (!activeBox || activeBox !== box) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;

            let newLeftPct = initialLeftPct + (dx / cWidth) * 100;
            let newTopPct = initialTopPct + (dy / cHeight) * 100;

            box.style.left = newLeftPct + '%';
            box.style.top = newTopPct + '%';
        });

        box.addEventListener('pointerup', e => {
            if (activeBox === box) {
                activeBox = null;
                if (box.hasPointerCapture(e.pointerId)) {
                    box.releasePointerCapture(e.pointerId);
                }
            }
        });
    });
}

let repConfigModeActive = false;
let repFontSizes = { patient: 14, title: 16, to: 15, details: 15 };

function getReportDeviceStorageKey() {
    const width = window.innerWidth;
    if (width <= 768) {
        return 'clinic_rep_layout_mobile';
    } else if (width > 768 && width <= 1024) {
        return 'clinic_rep_layout_tablet';
    } else {
        return 'clinic_rep_layout_desktop';
    }
}

function toggleMedicalReportInputs(visitId) {
    const container = document.getElementById('repContainer_' + visitId);
    const chevron = document.getElementById('repChevron_' + visitId);
    if (container) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            if (chevron) chevron.className = 'fa-solid fa-chevron-up';
        } else {
            container.style.display = 'none';
            if (chevron) chevron.className = 'fa-solid fa-chevron-down';
        }
    }
}

function updateReportFieldData(visitId, fieldName, value) {
    if (isSubscriptionExpired) return;
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    const visit = patient.visits.find(v => Number(v.visitId) === Number(visitId));
    if (!visit) return;

    if (!visit.medicalReport) {
        visit.medicalReport = { title: "تقرير طبي", to: "", details: "" };
    }
    visit.medicalReport[fieldName] = value;
    savePatientToCloudAndLocal(patient);
}

function openMedicalReportModal(visitId) {
    currentVisitIdForModal = visitId;
    const modal = document.getElementById('medicalReportModal');
    if (!modal) return;
    modal.style.display = 'flex';

    initReportDraggables();

    let savedRxImg = currentDoctorRxImage || localStorage.getItem('doctor_rx_template') || localStorage.getItem('clinic_rx_image') || '';
    const container = document.getElementById('repCanvasContainer');
    if (container) {
        let bgImg = container.querySelector('.rep-bg-img');
        if (!bgImg) {
            bgImg = document.createElement('img');
            bgImg.className = 'rep-bg-img';
            bgImg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; pointer-events: none; opacity: 1;';
            container.insertBefore(bgImg, container.firstChild);
        }
        if (savedRxImg) {
            bgImg.src = savedRxImg;
            bgImg.style.display = 'block';
        } else {
            bgImg.style.display = 'none';
        }
    }

    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    const visit = patient ? patient.visits.find(v => Number(v.visitId) === Number(visitId)) : null;

    let pName = patient ? patient.name : 'مريض';
    let pAge = patient ? patient.age : '';
    let pGender = patient ? (patient.gender || '') : '';
    let pCity = patient && patient.city ? ' | المحافظة: ' + patient.city : '';
    let visitDate = visit ? (visit.date || getTodayFormatted()) : getTodayFormatted();

    let patDetailsStr = 'الاسم: ' + pName + ' | العمر: ' + pAge + ' | الجنس: ' + pGender + pCity + ' | التاريخ: ' + visitDate;
    const repPatText = document.getElementById('repPatientText');
    if (repPatText) repPatText.textContent = patDetailsStr;

    const repData = (visit && visit.medicalReport) ? visit.medicalReport : {};
    
    let titleVal = repData.title || (document.getElementById('rep_title_' + visitId) ? document.getElementById('rep_title_' + visitId).value : "تقرير طبي");
    let toVal = repData.to || (document.getElementById('rep_to_' + visitId) ? document.getElementById('rep_to_' + visitId).value : "");
    let detailsVal = repData.details || (document.getElementById('rep_details_' + visitId) ? document.getElementById('rep_details_' + visitId).value : "");

    if (document.getElementById('rep_title_' + visitId)) document.getElementById('rep_title_' + visitId).value = titleVal;
    if (document.getElementById('rep_to_' + visitId)) document.getElementById('rep_to_' + visitId).value = toVal;
    if (document.getElementById('rep_details_' + visitId)) document.getElementById('rep_details_' + visitId).value = detailsVal;

    const repTitleText = document.getElementById('repTitleText');
    const repToText = document.getElementById('repToText');
    const repDetailsText = document.getElementById('repDetailsText');

    if (repTitleText) repTitleText.textContent = titleVal || "تقرير طبي";
    
    if (repToText) {
        repToText.textContent = toVal ? 'إلى: ' + toVal : "";
    }
    
    if (repDetailsText) {
        repDetailsText.textContent = detailsVal;
        repDetailsText.style.whiteSpace = 'pre-wrap';
        repDetailsText.style.wordBreak = 'break-word';
        repDetailsText.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
        repDetailsText.style.lineHeight = '1.6';
    }

    loadRepLayoutPositions();
}

function closeMedicalReportModal() {
    const modal = document.getElementById('medicalReportModal');
    if (modal) modal.style.display = 'none';
}

function toggleRepConfigMode() {
    repConfigModeActive = !repConfigModeActive;
    const boxes = document.querySelectorAll('#medicalReportModal .draggable-box');
    
    boxes.forEach(box => {
        if (repConfigModeActive) {
            box.classList.add('config-mode');
        } else {
            box.classList.remove('config-mode');
        }
    });

    const saveBtn = document.getElementById('repSaveLayoutBtn');
    if (saveBtn) {
        saveBtn.style.display = repConfigModeActive ? 'block' : 'none';
    }

    const toggleBtn = document.getElementById('repConfigToggleBtn');
    if (toggleBtn) {
        toggleBtn.style.background = repConfigModeActive ? '#0d9488' : '#f0fdfa';
        toggleBtn.style.color = repConfigModeActive ? '#ffffff' : '#0d9488';
    }
}

function changeRepBoxFontSize(boxKey, delta) {
    repFontSizes[boxKey] = Math.max(10, Math.min(30, (repFontSizes[boxKey] || 14) + delta));
    let targetId = '';
    if (boxKey === 'patient') targetId = 'repPatientText';
    else if (boxKey === 'title') targetId = 'repTitleText';
    else if (boxKey === 'to') targetId = 'repToText';
    else if (boxKey === 'details') targetId = 'repDetailsText';

    const el = document.getElementById(targetId);
    if (el) {
        el.style.fontSize = repFontSizes[boxKey] + 'px';
        if (boxKey === 'details') {
            el.style.whiteSpace = 'pre-wrap';
            el.style.wordBreak = 'break-word';
            el.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
        }
    }
}

function saveRepLayoutPositions() {
    let positions = {};
    const container = document.getElementById('repCanvasContainer');
    const cWidth = container ? container.clientWidth : 1;
    const cHeight = container ? container.clientHeight : 1;

    const boxes = ['repDragBoxPatient', 'repDragBoxTitle', 'repDragBoxTo', 'repDragBoxDetails'];
    boxes.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            const leftPx = el.offsetLeft;
            const topPx = el.offsetTop;
            const widthPx = el.offsetWidth;

            positions[id] = {
                top: ((topPx / cHeight) * 100) + '%',
                left: ((leftPx / cWidth) * 100) + '%',
                width: ((widthPx / cWidth) * 100) + '%'
            };
        }
    });
    positions.fontSizes = repFontSizes;
    
    const storageKey = getReportDeviceStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(positions));
    
    loadRepLayoutPositions();
    alert('تم حفظ أماكن التقرير الطبي الخاصة بهذا الجهاز فقط بنجاح!');
    
    if (repConfigModeActive) {
        toggleRepConfigMode();
    }
}

function loadRepLayoutPositions() {
    const storageKey = getReportDeviceStorageKey();
    let saved = localStorage.getItem(storageKey);
    
    if (!saved) {
        saved = localStorage.getItem('clinic_rep_layout_v1');
    }

    if (saved) {
        try {
            let data = JSON.parse(saved);
            const boxes = ['repDragBoxPatient', 'repDragBoxTitle', 'repDragBoxTo', 'repDragBoxDetails'];
            boxes.forEach(id => {
                const el = document.getElementById(id);
                if (el && data[id]) {
                    if (data[id].top) el.style.top = data[id].top;
                    if (data[id].left) el.style.left = data[id].left;
                    if (data[id].width) {
                        el.style.width = data[id].width;
                        el.style.maxWidth = '100%';
                    }
                }
            });
            if (data.fontSizes) {
                repFontSizes = data.fontSizes;
            }
            
            if (document.getElementById('repPatientText')) document.getElementById('repPatientText').style.fontSize = (repFontSizes.patient || 14) + 'px';
            if (document.getElementById('repTitleText')) document.getElementById('repTitleText').style.fontSize = (repFontSizes.title || 16) + 'px';
            if (document.getElementById('repToText')) document.getElementById('repToText').style.fontSize = (repFontSizes.to || 15) + 'px';
            
            const detailsEl = document.getElementById('repDetailsText');
            if (detailsEl) {
                detailsEl.style.fontSize = (repFontSizes.details || 15) + 'px';
                detailsEl.style.whiteSpace = 'pre-wrap';
                detailsEl.style.wordBreak = 'break-word';
                detailsEl.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
                detailsEl.style.lineHeight = '1.6';
            }
        } catch(e) {
            console.log("Error loading rep layout:", e);
        }
    }
}

function printMedicalReportOnly(visitId) {
    openMedicalReportModal(visitId);
    setTimeout(() => {
        printMedicalReportDirectly();
    }, 400);
}

function initReportDraggables() {
    let activeBox = null;
    let startX = 0, startY = 0, initialLeftPct = 0, initialTopPct = 0;
    const container = document.getElementById('repCanvasContainer');
    if (!container) return;

    document.querySelectorAll('#medicalReportModal .draggable-box').forEach(box => {
        box.style.touchAction = 'none';

        box.addEventListener('pointerdown', e => {
            if (!repConfigModeActive || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            activeBox = box;
            startX = e.clientX;
            startY = e.clientY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;
            
            initialLeftPct = (box.offsetLeft / cWidth) * 100;
            initialTopPct = (box.offsetTop / cHeight) * 100;
            
            box.setPointerCapture(e.pointerId);
            e.stopPropagation();
        });

        box.addEventListener('pointermove', e => {
            if (!activeBox || activeBox !== box) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            const cWidth = container.clientWidth;
            const cHeight = container.clientHeight;

            let newLeftPct = initialLeftPct + (dx / cWidth) * 100;
            let newTopPct = initialTopPct + (dy / cHeight) * 100;

            box.style.left = newLeftPct + '%';
            box.style.top = newTopPct + '%';
        });

        box.addEventListener('pointerup', e => {
            if (activeBox === box) {
                activeBox = null;
                if (box.hasPointerCapture(e.pointerId)) {
                    box.releasePointerCapture(e.pointerId);
                }
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
    
    const savedSort = localStorage.getItem('clinic_archive_sort');
    const sortEl = document.getElementById('filterSort');
    if (sortEl && savedSort) {
        sortEl.value = savedSort;
    }

    filterPatients();
}

function openDictionaryManager() {
    navigateTo('dictScreen', 'Dictionary Manager', 'Manage terms');
    renderDictTerms();
}

function renderDictTerms() {
    const catSelect = document.getElementById('dictCategorySelect');
    const cat = catSelect ? catSelect.value : 'drugs';
    
    let dictKey = cat;
    if (cat === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (cat === 'historyPresentIllness') dictKey = 'history_present';
    else if (cat === 'reviewSystems') dictKey = 'review_systems';

    if (!medicalDict[dictKey]) {
        medicalDict[dictKey] = [];
    }

    const terms = medicalDict[dictKey];
    const container = document.getElementById('dictItemsList');
    if (!container) return;

    container.innerHTML = terms.length === 0 
        ? '<p style="text-align:center; color:#64748b;">No terms in this category.</p>'
        : terms.map((term, index) => 
            '<div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; padding:8px 12px; border-radius:8px; margin-bottom:6px;">' +
            '<span style="font-size:0.85rem; font-weight:600; color:#0f172a;">' + term + '</span>' +
            '<div style="display:flex; gap:4px;">' +
            '<button onclick="editDictTerm(\'' + cat + '\', ' + index + ')" style="background:#e0f2fe; color:#0369a1; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-pen"></i> تعديل</button>' +
            '<button onclick="removeDictTerm(\'' + cat + '\', ' + index + ')" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer; font-weight:700;"><i class="fa-solid fa-trash"></i> حذف</button>' +
            '</div></div>'
        ).join('') + 
        '<div style="display:flex; gap:8px; margin-top:12px;">' +
        '<div class="input-wrapper" style="flex:1;"><input type="text" id="newDictTermInput" placeholder="Add new term..."></div>' +
        '<button class="btn-main" onclick="addNewDictTerm(\'' + cat + '\')" style="width:auto; padding:0 16px;">Add</button>' +
        '</div>';
}

function editDictTerm(category, index) {
    let dictKey = category;
    if (category === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (category === 'historyPresentIllness') dictKey = 'history_present';
    else if (category === 'reviewSystems') dictKey = 'review_systems';

    const terms = medicalDict[dictKey] || [];
    const currentTerm = terms[index] || '';
    const newTerm = prompt('تعديل المصطلح الطبي:', currentTerm);
    if (newTerm !== null && newTerm.trim() !== '') {
        terms[index] = newTerm.trim();
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}

function addNewDictTerm(cat) {
    const input = document.getElementById('newDictTermInput');
    if (!input) return;
    const val = input.value.trim();
    let dictKey = cat;
    if (cat === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (cat === 'historyPresentIllness') dictKey = 'history_present';
    else if (cat === 'reviewSystems') dictKey = 'review_systems';

    if (!medicalDict[dictKey]) {
        medicalDict[dictKey] = [];
    }

    if (val && !medicalDict[dictKey].includes(val)) {
        medicalDict[dictKey].push(val);
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}

function removeDictTerm(category, index) {
    let dictKey = category;
    if (category === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (category === 'historyPresentIllness') dictKey = 'history_present';
    else if (category === 'reviewSystems') dictKey = 'review_systems';

    if (medicalDict[dictKey]) {
        medicalDict[dictKey].splice(index, 1);
        saveSettingsToCloudAndLocal();
        renderDictTerms();
    }
}

function openBulkAddModal() {
    let modal = document.getElementById('bulkAddDictModal');
    if (!modal) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'bulkAddDictModal';
        modalDiv.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;';
        modalDiv.innerHTML = '<div style="background:#fff; padding:20px; border-radius:12px; width:90%; max-width:500px; box-shadow:0 4px 20px rgba(0,0,0,0.2);">' +
            '<h3 style="margin-top:0; color:#0f172a; font-size:1.1rem; margin-bottom:10px;"><i class="fa-solid fa-list-check"></i> إضافة مجموعة مصطلحات دفعة واحدة</h3>' +
            '<p style="font-size:0.8rem; color:#64748b; margin-bottom:10px;">قم لصق القائمة هنا (كل سطر علاج أو مصطلح في سطر مستقل):</p>' +
            '<div class="input-wrapper" style="margin-bottom:15px;">' +
            '<textarea id="bulkDictInput" rows="6" placeholder="علاج 1&#10;علاج 2&#10;علاج 3" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.9rem; outline:none;"></textarea>' +
            '</div>' +
            '<div style="display:flex; justify-content:flex-end; gap:8px;">' +
            '<button type="button" onclick="closeBulkAddModal()" style="background:#e2e8f0; color:#334155; border:none; border-radius:8px; padding:8px 16px; font-weight:700; cursor:pointer;">إلغاء</button>' +
            '<button type="button" onclick="processAndSaveBulkDict()" style="background:#0d9488; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-weight:700; cursor:pointer;">حفظ الكل</button>' +
            '</div></div>';
        document.body.appendChild(modalDiv);
    }
    
    const inputEl = document.getElementById('bulkDictInput');
    if (inputEl) inputEl.value = '';
    document.getElementById('bulkAddDictModal').style.display = 'flex';
}

function closeBulkAddModal() {
    const modal = document.getElementById('bulkAddDictModal');
    if (modal) modal.style.display = 'none';
}

function processAndSaveBulkDict() {
    const textElement = document.getElementById('bulkDictInput');
    if (!textElement) {
        alert('خطأ: حقل الإدخال غير موجود.');
        return;
    }
    
    const text = textElement.value;
    if (!text.trim()) {
        alert('الرجاء إدخال أو لصق القائمة أولاً.');
        return;
    }

    const catSelect = document.getElementById('dictCategorySelect');
    const cat = catSelect ? catSelect.value : 'drugs';
    
    let dictKey = cat;
    if (cat === 'chiefComplaint') dictKey = 'chief_complaint';
    else if (cat === 'historyPresentIllness') dictKey = 'history_present';
    else if (cat === 'reviewSystems') dictKey = 'review_systems';

    if (!medicalDict[dictKey]) {
        medicalDict[dictKey] = [];
    }

    let items = [];
    if (text.includes('\n')) {
        items = text.split('\n');
    } else if (text.includes(',')) {
        items = text.split(',');
    } else {
        items = [text];
    }

    let addedCount = 0;

    items.forEach(item => {
        const cleanItem = item.replace(/^\d+[\.\-\)]\s*/, '').trim();
        if (cleanItem && !medicalDict[dictKey].includes(cleanItem)) {
            medicalDict[dictKey].push(cleanItem);
            addedCount++;
        }
    });

    saveSettingsToCloudAndLocal();
    closeBulkAddModal();
    if (typeof renderDictTerms === 'function') {
        renderDictTerms();
    }
    alert('تمت إضافة (' + addedCount + ') عنصر جديد إلى القاموس بنجاح!');
}

function saveNewPatient(e) {
    e.preventDefault();
    const rawName = document.getElementById('pName').value.trim();
    const rawCity = document.getElementById('pCity') ? document.getElementById('pCity').value.trim() : '';

    const nameExists = patients.some(p => p.name.toLowerCase() === rawName.toLowerCase());
    if (nameExists) {
        alert('⚠️ تنبيه: هذا الاسم مكرر تماماً! يرجى إضافة اسم الجد الرابع داخل نفس حقل الاسم (مثال: سيف قيس قاسم محمد) لكي يقبل النظام تخزين ملف المريض بنجاح.');
        document.getElementById('pName').focus();
        return;
    }

    const newPatient = {
        id: Date.now(),
        name: rawName,
        city: rawCity,
        age: Number(document.getElementById('pAge').value),
        gender: document.getElementById('pGender').value || 'Unspecified',
        marital: document.getElementById('pMarital').value || 'Single',
        job: document.getElementById('pJob').value || 'Unspecified',
        phone: document.getElementById('pPhone').value || 'N/A',
        visits: [{ visitId: Date.now(), date: getTodayFormatted(), medHistory: {}, chiefComplaint: '', historyPresentIllness: '', reviewSystems: '', notes: '', attachments: [] }]
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
        : list.map(p => 
            '<div class="patient-card" onclick="openMedicalRecord(' + p.id + ')" style="padding: 6px 10px !important; margin-bottom: 3px !important; min-height: 40px; display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">' +
            '<div class="patient-info" style="display: flex; align-items: center; gap: 8px; overflow: hidden;">' +
            '<h4 style="margin: 0; font-size: 0.82rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">' + p.name + '</h4>' +
            '<p style="margin: 0; font-size: 0.68rem; color: #64748b; white-space: nowrap;">' + (p.city ? '(' + p.city + ') ' : '') + '<i class="fa-solid fa-phone" style="font-size:0.6rem;"></i> ' + p.phone + ' | Age: ' + p.age + '</p>' +
            '</div>' +
            '<span class="badge-gender ' + (p.gender === 'Female' ? 'gender-female' : 'gender-male') + '" style="font-size: 0.62rem; padding: 1px 6px; border-radius: 4px; white-space: nowrap;">' + (p.gender || 'N/A') + '</span>' +
            '</div>'
        ).join('');
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
        
        let sortOrder = sortEl ? sortEl.value : null;
        if (!sortOrder) {
            sortOrder = localStorage.getItem('clinic_archive_sort') || 'newest';
            if (sortEl) sortEl.value = sortOrder;
        } else {
            localStorage.setItem('clinic_archive_sort', sortOrder);
        }

        let filtered = patients.filter(p => {
            if (!p) return false;
            const fullNameFull = ((p.name || '') + " " + (p.city || "")).toLowerCase();
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

function openMedicalRecord(id, saveState = true) {
    currentPatientId = id;
    navigateTo('medicalRecordScreen', 'Patient Medical Record', 'View details', saveState);
    const patient = patients.find(p => Number(p.id) === Number(id));
    if (patient) {
        document.getElementById('recPatientName').innerText = patient.name;
        document.getElementById('recPatientMeta').innerHTML = 'Age: ' + patient.age + ' | Gender: ' + (patient.gender || 'N/A') + (patient.city ? ' | المحافظة: ' + patient.city : '') + ' | Marital: ' + (patient.marital || 'N/A') + ' | Job: ' + (patient.job || 'N/A') + ' | Phone: ' + (patient.phone || 'N/A');
        renderVisits(patient.visits || [], true);
    }
}

function addNewVisit() {
    const patient = patients.find(p => Number(p.id) === Number(currentPatientId));
    if (!patient) return;
    patient.visits.unshift({ visitId: Date.now(), date: getTodayFormatted(), medHistory: {}, chiefComplaint: '', historyPresentIllness: '', reviewSystems: '', notes: '', attachments: [] });
    savePatientToCloudAndLocal(patient);
    renderVisits(patient.visits, true);
}

function renderVisits(visits, forceFullRender = true) {
    const container = document.getElementById('visitsContainer');
    if (!container) return;
    container.innerHTML = visits.map((v, index) => {
        const mh = v.medHistory || {};
        let mhSummaryParts = [];
        
        if (mh.conditions && mh.conditions.length > 0) {
            mhSummaryParts.push('<b>الأمراض المزمنة:</b> ' + mh.conditions.join(', '));
        }
        if (mh.otherCondition) mhSummaryParts.push('<b>أخرى:</b> ' + mh.otherCondition);
        if (mh.admission) mhSummaryParts.push('<b>دخول المستشفى:</b> ' + mh.admission);
        if (mh.surgery) mhSummaryParts.push('<b>العمليات:</b> ' + mh.surgery);
        if (mh.family) mhSummaryParts.push('<b>التاريخ العائلي:</b> ' + mh.family);
        if (mh.allergy) mhSummaryParts.push('<b>حساسية الأدوية:</b> ' + mh.allergy);
        if (mh.chronicDrugs) mhSummaryParts.push('<b>أدوية مزمنة:</b> ' + mh.chronicDrugs);
        if (mh.smoking) mhSummaryParts.push('<b>التدخين:</b> ' + mh.smoking);
        if (mh.alcohol) mhSummaryParts.push('<b>الكحول:</b> ' + mh.alcohol);
        if (mh.notes) mhSummaryParts.push('<b>ملاحظات:</b> ' + mh.notes);

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
        const repData = v.medicalReport || {};

        return '<div class="visit-card" data-visit-id="' + v.visitId + '">' +
            '<div class="visit-header">' +
            '<div style="display: flex; align-items: center; gap: 8px;">' +
            '<span>Visit Date:</span>' +
            '<input type="date" value="' + (v.date || getTodayFormatted()) + '" onchange="updateVisitDate(' + v.visitId + ', this.value)" style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 2px 6px; font-size: 0.8rem; font-weight: 700; outline: none; cursor: pointer;">' +
            '</div>' +
            (visits.length > 1 ? '<button onclick="confirmDeleteVisit(' + v.visitId + ')" style="background:#fee2e2; color:#ef4444; border:none; border-radius:6px; padding:2px 8px; font-size:0.7rem; cursor:pointer;"><i class="fa-solid fa-trash"></i> Delete Visit</button>' : '') +
            '</div>' +

            (cfg.medHistory ? 
            '<button type="button" class="btn-med-history" onclick="openMedHistoryModal(' + v.visitId + ')">' +
            '<span><i class="fa-solid fa-notes-medical" style="color:#0d9488;"></i> Medical History & Chronic Diseases</span>' +
            '<i class="fa-solid fa-chevron-right"></i>' +
            '</button>' +
            '<div class="medical-history-preview-card">' + mhSummaryText + '</div>' : '') +

            (cfg.chiefComplaint ? 
            '<div class="field-box">' +
            '<span class="field-label">Chief Complaint (الشكوى الرئيسية)</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vChiefComplaint-' + v.visitId + '" rows="1" placeholder="Write chief complaint..." oninput="handleLiveInput(this, \'chiefComplaint\', ' + v.visitId + ')" onblur="hideSuggestions(\'chiefComplaint\', ' + v.visitId + ')">' + (v.chiefComplaint || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-chiefComplaint-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-chiefComplaint-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-chiefComplaint-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-chiefComplaint-' + v.visitId + '" onmousedown="saveLineToDict(event, \'chiefComplaint\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.historyPresentIllness ? 
            '<div class="field-box">' +
            '<span class="field-label">History of Present Illness - HPI (تاريخ المرض الحالي)</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vHistoryPresentIllness-' + v.visitId + '" rows="2" placeholder="Write HPI details..." oninput="handleLiveInput(this, \'historyPresentIllness\', ' + v.visitId + ')" onblur="hideSuggestions(\'historyPresentIllness\', ' + v.visitId + ')">' + (v.historyPresentIllness || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-historyPresentIllness-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-historyPresentIllness-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-historyPresentIllness-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-historyPresentIllness-' + v.visitId + '" onmousedown="saveLineToDict(event, \'historyPresentIllness\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.reviewSystems ? 
            '<div class="field-box">' +
            '<span class="field-label">Review of Other Systems - ROS (مراجعة الأجهزة والأنظمة)</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vReviewSystems-' + v.visitId + '" rows="2" placeholder="Write ROS details..." oninput="handleLiveInput(this, \'reviewSystems\', ' + v.visitId + ')" onblur="hideSuggestions(\'reviewSystems\', ' + v.visitId + ')">' + (v.reviewSystems || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-reviewSystems-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-reviewSystems-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-reviewSystems-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-reviewSystems-' + v.visitId + '" onmousedown="saveLineToDict(event, \'reviewSystems\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.vitals ? 
            '<button type="button" class="btn-bmi-trigger" onclick="openBmiCalculator(' + v.visitId + ')">' +
            '<span><i class="fa-solid fa-calculator" style="color:#0284c7;"></i> Vital Signs & BMI Calculator</span>' +
            '<span style="font-size:0.75rem; background:#e0f2fe; padding:2px 8px; border-radius:6px;">Score: ' + (v.bmiScore || '—') + '</span>' +
            '</button>' +
            '<div class="vital-box" style="margin-bottom: 12px;">' +
            '<div class="vital-row">' +
            '<div class="vital-item"><span class="vital-label"><i class="fa-solid fa-arrow-trend-up"></i> Systolic BP (الضغط العالي)</span>' +
            '<div class="vital-inputs"><input type="number" id="vBpSys-' + v.visitId + '" value="' + bpSys + '" placeholder="120" oninput="updateBpFields(' + v.visitId + ')"><span>mmHg</span></div></div>' +
            '<div class="vital-item"><span class="vital-label"><i class="fa-solid fa-arrow-trend-down"></i> Diastolic BP (الضغط الواطي)</span>' +
            '<div class="vital-inputs"><input type="number" id="vBpDias-' + v.visitId + '" value="' + bpDias + '" placeholder="80" oninput="updateBpFields(' + v.visitId + ')"><span>mmHg</span></div></div>' +
            '</div>' +
            '<div class="vital-row">' +
            '<div class="vital-item"><span class="vital-label"><i class="fa-solid fa-heart"></i> Heart Rate (HR)</span>' +
            '<div class="vital-inputs"><input type="number" value="' + (v.hr || '') + '" placeholder="75" oninput="updateVisitFieldData(' + v.visitId + ', \'hr\', this.value)"><span>bpm</span></div></div>' +
            '<div class="vital-item"><span class="vital-label"><i class="fa-solid fa-temperature-high"></i> Temperature</span>' +
            '<div class="vital-inputs"><input type="number" step="0.1" value="' + (v.temp || '') + '" placeholder="37.0" oninput="updateVisitFieldData(' + v.visitId + ', \'temp\', this.value)"><span>°C</span></div></div>' +
            '</div>' +
            '<div class="vital-row">' +
            '<div class="vital-item" style="grid-column: span 2;"><span class="vital-label"><i class="fa-solid fa-weight-scale"></i> Weight</span>' +
            '<div class="vital-inputs"><input type="number" value="' + (v.bmiWeight || '') + '" placeholder="70" oninput="updateVisitFieldData(' + v.visitId + ', \'bmiWeight\', this.value)"><span>kg</span></div></div>' +
            '</div></div>' : '') +

            (cfg.obsGyn ? 
            '<div class="group-card" style="background:#fce7f3; border-color:#f472b6; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#be185d; display:block; margin-bottom:10px;"><i class="fa-solid fa-person-pregnant"></i> تفاصيل النسائية والتوليد (Obstetrics & Gynecology)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">LMP (آخر دورة)</span><div class="input-wrapper"><input type="date" id="obsLmp-' + v.visitId + '" value="' + (v.obsLmp || '') + '" oninput="handleLmpInput(' + v.visitId + ', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">EDD (موعد الولادة)</span><div class="input-wrapper"><input type="date" id="obsEdd-' + v.visitId + '" value="' + (v.obsEdd || '') + '" oninput="updateVisitFieldData(' + v.visitId + ', \'obsEdd\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Gravidity (G)</span><div class="input-wrapper"><input type="text" value="' + (v.obsG || '') + '" placeholder="G3" oninput="updateVisitFieldData(' + v.visitId + ', \'obsG\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Parity (P)</span><div class="input-wrapper"><input type="text" value="' + (v.obsP || '') + '" placeholder="P2" oninput="updateVisitFieldData(' + v.visitId + ', \'obsP\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Abortions (A)</span><div class="input-wrapper"><input type="text" value="' + (v.obsA || '') + '" placeholder="A1" oninput="updateVisitFieldData(' + v.visitId + ', \'obsA\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات السونار والفحص</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'obsNotes\', this.value)" style="font-size:0.85rem;">' + (v.obsNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.ortho ? 
            '<div class="group-card" style="background:#fef3c7; border-color:#f59e0b; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#b45309; display:block; margin-bottom:10px;"><i class="fa-solid fa-bone"></i> العظام والمفاصل (Orthopedics)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">المفصل / الإصابة</span><div class="input-wrapper"><input type="text" value="' + (v.orthoJoint || '') + '" placeholder="الركبة اليمنى" oninput="updateVisitFieldData(' + v.visitId + ', \'orthoJoint\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">درجة الخشونة</span><div class="input-wrapper"><input type="text" value="' + (v.orthoGrade || '') + '" placeholder="Grade II" oninput="updateVisitFieldData(' + v.visitId + ', \'orthoGrade\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">مدى الحركة</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات الحركة..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'orthoNotes\', this.value)" style="font-size:0.85rem;">' + (v.orthoNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.neuro ? 
            '<div class="group-card" style="background:#f3e8ff; border-color:#c084fc; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#7e22ce; display:block; margin-bottom:10px;"><i class="fa-solid fa-brain"></i> الجملة العصبية (Neurology)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">GCS</span><div class="input-wrapper"><input type="text" value="' + (v.neuroGcs || '') + '" placeholder="15/15" oninput="updateVisitFieldData(' + v.visitId + ', \'neuroGcs\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">Cranial Nerves</span><div class="input-wrapper"><input type="text" value="' + (v.neuroNerves || '') + '" placeholder="Intact" oninput="updateVisitFieldData(' + v.visitId + ', \'neuroNerves\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات الأعصاب</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'neuroNotes\', this.value)" style="font-size:0.85rem;">' + (v.neuroNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.peds ? 
            '<div class="group-card" style="background:#e0f2fe; border-color:#38bdf8; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#0369a1; display:block; margin-bottom:10px;"><i class="fa-solid fa-child"></i> فحص الأطفال والنمو (WHO Pediatrics)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">العمر (أشهر)</span><div class="input-wrapper"><input type="number" id="pedsAgeMonths-' + v.visitId + '" value="' + (v.pedsAgeMonths || '') + '" placeholder="12" oninput="updateVisitFieldData(' + v.visitId + ', \'pedsAgeMonths\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الوزن (كغ)</span><div class="input-wrapper"><input type="number" step="0.1" id="pedsWeight-' + v.visitId + '" value="' + (v.pedsWeight || '') + '" placeholder="9.5" oninput="updateVisitFieldData(' + v.visitId + ', \'pedsWeight\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الطول (سم)</span><div class="input-wrapper"><input type="number" step="0.1" id="pedsHeight-' + v.visitId + '" value="' + (v.pedsHeight || '') + '" placeholder="75" oninput="updateVisitFieldData(' + v.visitId + ', \'pedsHeight\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div>' +
            '<button type="button" class="btn-main" onclick="calculateVisitChildGrowth(' + v.visitId + ')" style="background:#0284c7; padding:6px 12px; font-size:0.78rem; margin-top:4px; margin-bottom:8px;"><i class="fa-solid fa-calculator"></i> حساب وتقييم نمو الطفل (WHO)</button>' +
            '<div id="pedsGrowthResult-' + v.visitId + '" style="display:' + (v.pedsGrowthResult ? 'block' : 'none') + '; background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:8px; font-size:0.78rem; color:#14532d; margin-bottom:8px;">' + (v.pedsGrowthResult || '') + '</div>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">اللقاحات</span><div class="input-wrapper"><input type="text" value="' + (v.pedsVaccine || '') + '" placeholder="مكتملة" oninput="updateVisitFieldData(' + v.visitId + ', \'pedsVaccine\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">التغذية</span><div class="input-wrapper"><input type="text" value="' + (v.pedsFeeding || '') + '" placeholder="طبيعية" oninput="updateVisitFieldData(' + v.visitId + ', \'pedsFeeding\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات الأطفال</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'pedsNotes\', this.value)" style="font-size:0.85rem;">' + (v.pedsNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.derm ? 
            '<div class="group-card" style="background:#ffedd5; border-color:#fb923c; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#c2410c; display:block; margin-bottom:10px;"><i class="fa-solid fa-hand-dots"></i> الجلدية والتناسلية (Dermatology)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">نوع الآفة</span><div class="input-wrapper"><input type="text" value="' + (v.dermType || '') + '" placeholder="Plaque" oninput="updateVisitFieldData(' + v.visitId + ', \'dermType\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">المكان</span><div class="input-wrapper"><input type="text" value="' + (v.dermSite || '') + '" placeholder="الوجه" oninput="updateVisitFieldData(' + v.visitId + ', \'dermSite\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات الجلدية</span><div class="input-wrapper"><textarea rows="2" placeholder="وصف الطفح..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'dermNotes\', this.value)" style="font-size:0.85rem;">' + (v.dermNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.ent ? 
            '<div class="group-card" style="background:#ecfdf5; border-color:#34d399; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#047857; display:block; margin-bottom:10px;"><i class="fa-solid fa-ear-deaf"></i> الأذن والأنف والحنجرة (ENT)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الأذن</span><div class="input-wrapper"><input type="text" value="' + (v.entEar || '') + '" placeholder="طبيعي" oninput="updateVisitFieldData(' + v.visitId + ', \'entEar\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">الحلق واللوزتين</span><div class="input-wrapper"><input type="text" value="' + (v.entThroat || '') + '" placeholder="احمرار" oninput="updateVisitFieldData(' + v.visitId + ', \'entThroat\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات ENT</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'entNotes\', this.value)" style="font-size:0.85rem;">' + (v.entNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.ophthal ? 
            '<div class="group-card" style="background:#e0e7ff; border-color:#818cf8; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#4338ca; display:block; margin-bottom:10px;"><i class="fa-solid fa-eye"></i> العيون (Ophthalmology)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">حدة البصر (VA)</span><div class="input-wrapper"><input type="text" value="' + (v.ophthalVa || '') + '" placeholder="6/6" oninput="updateVisitFieldData(' + v.visitId + ', \'ophthalVa\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ضغط العين (IOP)</span><div class="input-wrapper"><input type="text" value="' + (v.ophthalIop || '') + '" placeholder="15 mmHg" oninput="updateVisitFieldData(' + v.visitId + ', \'ophthalIop\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات العيون</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'ophthalNotes\', this.value)" style="font-size:0.85rem;">' + (v.ophthalNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.cardio ? 
            '<div class="group-card" style="background:#fee2e2; border-color:#f87171; margin-bottom:12px; padding:12px;">' +
            '<span style="font-weight:800; font-size:0.85rem; color:#b91c1c; display:block; margin-bottom:10px;"><i class="fa-solid fa-heart-pulse"></i> القلب والشرايين (Cardiology)</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">تخطيط القلب (ECG)</span><div class="input-wrapper"><input type="text" value="' + (v.cardioEcg || '') + '" placeholder="Normal" oninput="updateVisitFieldData(' + v.visitId + ', \'cardioEcg\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '<div class="field-box" style="flex:1; margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">أصوات القلب</span><div class="input-wrapper"><input type="text" value="' + (v.cardioSounds || '') + '" placeholder="S1 S2 normal" oninput="updateVisitFieldData(' + v.visitId + ', \'cardioSounds\', this.value)" style="font-size:0.85rem;"></div></div>' +
            '</div><div class="field-box" style="margin-bottom:0;"><span class="field-label" style="font-size:0.75rem;">ملاحظات القلب</span><div class="input-wrapper"><textarea rows="2" placeholder="ملاحظات..." oninput="autoResizeTextarea(this); updateVisitFieldData(' + v.visitId + ', \'cardioNotes\', this.value)" style="font-size:0.85rem;">' + (v.cardioNotes || '') + '</textarea></div></div></div>' : '') +

            (cfg.labs ? 
            '<div class="field-box">' +
            '<span class="field-label">Lab Tests</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vLabs-' + v.visitId + '" rows="1" placeholder="Request lab tests..." oninput="handleLiveInput(this, \'labs\', ' + v.visitId + ')" onblur="hideSuggestions(\'labs\', ' + v.visitId + ')">' + (v.labs || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-labs-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-labs-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-labs-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-labs-' + v.visitId + '" onmousedown="saveLineToDict(event, \'labs\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.scans ? 
            '<div class="field-box">' +
            '<span class="field-label">Radiology & Scans</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vScans-' + v.visitId + '" rows="1" placeholder="Request radiology..." oninput="handleLiveInput(this, \'scans\', ' + v.visitId + ')" onblur="hideSuggestions(\'scans\', ' + v.visitId + ')">' + (v.scans || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-scans-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-scans-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-scans-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-scans-' + v.visitId + '" onmousedown="saveLineToDict(event, \'scans\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.notes ? 
            '<div class="field-box">' +
            '<span class="field-label">Diagnosis & Notes</span>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vNotes-' + v.visitId + '" rows="2" placeholder="Clinical notes & diagnosis..." oninput="handleLiveInput(this, \'notes\', ' + v.visitId + ')" onblur="hideSuggestions(\'notes\', ' + v.visitId + ')">' + (v.notes || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-notes-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-notes-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-notes-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-notes-' + v.visitId + '" onmousedown="saveLineToDict(event, \'notes\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.rx ? 
            '<div class="field-box">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; flex-wrap:wrap; gap:6px;">' +
            '<span class="field-label" style="margin-bottom:0;">Prescribed Medications (RX)</span>' +
            '<button type="button" onclick="printPrescriptionOnly(' + v.visitId + ')" style="background:#fae8ff; color:#c084fc; border:none; border-radius:8px; padding:6px 14px; font-size:0.8rem; font-weight:700; cursor:pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><i class="fa-solid fa-file-prescription"></i> Print RX Prescription</button>' +
            '</div>' +
            '<div class="input-wrapper" style="position: relative;">' +
            '<textarea id="vDrugs-' + v.visitId + '" rows="3" placeholder="Write prescription drugs here..." oninput="handleDrugsInput(this, ' + v.visitId + ')" onkeydown="handleDrugsKeyDown(event, this, ' + v.visitId + ')" onblur="hideSuggestions(\'drugs\', ' + v.visitId + ')">' + (v.drugs || '') + '</textarea>' +
            '<div class="suggestions-box" id="suggestions-drugs-' + v.visitId + '"></div>' +
            '<div class="live-save-bar" id="save-bar-drugs-' + v.visitId + '">' +
            '<span>Save: "<strong id="line-text-drugs-' + v.visitId + '"></strong>"</span>' +
            '<button type="button" class="btn-live-save" id="btn-save-drugs-' + v.visitId + '" onmousedown="saveLineToDict(event, \'drugs\', ' + v.visitId + ')">Save</button>' +
            '</div></div></div>' : '') +

            (cfg.attachments ? 
            '<div class="field-box">' +
            '<span class="field-label">Attachments & Medical Reports</span>' +
            '<div style="display:flex; gap:8px; margin-bottom:8px;">' +
            '<label style="flex:1; background:#f1f5f9; border:1px dashed #cbd5e1; border-radius:10px; padding:10px; text-align:center; font-size:0.8rem; font-weight:700; color:#475569; cursor:pointer;">' +
            '<i class="fa-solid fa-cloud-arrow-up"></i> رفع صور متعددة / ملف' +
            '<input type="file" accept="image/*,.pdf" multiple style="display:none;" onchange="handleFileUpload(this, ' + v.visitId + ')">' +
            '</label>' +
            '<button type="button" onclick="scanFromDesktopScanner(' + v.visitId + ')" style="flex:1; background:#f0fdfa; border:1px dashed #0d9488; border-radius:10px; padding:10px; font-size:0.8rem; font-weight:700; color:#0d9488; cursor:pointer;">' +
            '<i class="fa-solid fa-print"></i> سحب من السكانر' +
            '</button>' +
            '</div>' +
            
            '<div style="margin-top: 10px; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px; background: #ffffff;">' +
            '<div onclick="toggleMedicalReportInputs(' + v.visitId + ')" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; color: #0d9488; font-size: 0.9rem;">' +
            '<span><i class="fa-solid fa-file-medical"></i> تقرير طبي (محفوظ تلقائياً)</span>' +
            '<i class="fa-solid fa-chevron-down" id="repChevron_' + v.visitId + '"></i>' +
            '</div>' +
            '<div id="repContainer_' + v.visitId + '" style="display: none; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">' +
            '<div class="field-box" style="margin-bottom: 8px;">' +
            '<span class="field-label">عنوان التقرير</span>' +
            '<div class="input-wrapper"><input type="text" id="rep_title_' + v.visitId + '" value="' + (repData.title || 'تقرير طبي') + '" oninput="updateReportFieldData(' + v.visitId + ', \'title\', this.value)"></div>' +
            '</div>' +
            '<div class="field-box" style="margin-bottom: 8px;">' +
            '<span class="field-label">الجهة الموجه لها التقرير</span>' +
            '<div class="input-wrapper"><input type="text" id="rep_to_' + v.visitId + '" value="' + (repData.to || '') + '" placeholder="مثال: مستشفى الحكيم التعليمي..." oninput="updateReportFieldData(' + v.visitId + ', \'to\', this.value)"></div>' +
            '</div>' +
            '<div class="field-box" style="margin-bottom: 10px;">' +
            '<span class="field-label">تفاصيل التقرير والحالة السريرية</span>' +
            '<div class="input-wrapper"><textarea id="rep_details_' + v.visitId + '" rows="3" placeholder="اكتب تفاصيل التقرير هنا..." oninput="updateReportFieldData(' + v.visitId + ', \'details\', this.value)">' + (repData.details || '') + '</textarea></div>' +
            '</div>' +
            '<button type="button" class="btn-main" onclick="openMedicalReportModal(' + v.visitId + ')" style="background: #0284c7; padding: 8px; font-size: 0.85rem;">' +
            '<i class="fa-solid fa-print"></i> معاينة وطباعة التقرير الطبي (بروية الترويسة)' +
            '</button>' +
            '</div></div>' +

            '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;" id="attachments-container-' + v.visitId + '">' +
            (v.attachments || []).map((att, aIdx) => {
                if (!att || !att.dataUrl || att.dataUrl.length < 50) {
                    return '<div style="padding:6px 10px; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; font-size:0.7rem; color:#b91c1c;">⚠️ صورة تالفة</div>';
                }
                return '<div style="position:relative; width:65px; height:65px; border-radius:10px; overflow:hidden; border:1px solid #cbd5e1; cursor:pointer;" onclick="previewAttachmentByIndex(' + v.visitId + ', ' + aIdx + ')">' +
                    '<img src="' + att.dataUrl + '" style="width:100%; height:100%; object-fit:cover;">' +
                    '</div>';
            }).join('') +
            '</div></div>' : '') +
            '</div>';
    }).join('');

    visits.forEach(v => {
        ['notes', 'drugs', 'labs', 'scans', 'chiefComplaint', 'historyPresentIllness', 'reviewSystems'].forEach(field => {
            const el = document.getElementById('v' + field.charAt(0).toUpperCase() + field.slice(1) + '-' + v.visitId);
            if (el) autoResizeTextarea(el);
        });
    });
}
