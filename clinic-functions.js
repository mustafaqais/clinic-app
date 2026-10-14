<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Clinic Master System - Cloud Ultimate Edition v17.30</title>
    
    <link rel="manifest" href="manifest.json">
    <link rel="icon" type="image/png" href="https://i.ibb.co/68n8910/1000111840.png">
    <link rel="apple-touch-icon" href="https://i.ibb.co/68n8910/1000111840.png">
    <link rel="apple-touch-icon-precomposed" href="https://i.ibb.co/68n8910/1000111840.png">
    <meta name="theme-color" content="#0f172a">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"></script>

    <link rel="stylesheet" href="style.css">

    <style>
        @import url('https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700;800;900&display=swap');
        
        @font-face {
            font-family: 'GizaFont';
            src: local('Giza'), local('Giza-Regular'), url('https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HMRslTJxMfcXg.woff2') format('woff2'); 
        }

        body, input, select, textarea, button, h1, h2, h3, h4, h5, h6, span, p, a, label, div, .menu-card, .auth-form {
            font-family: 'El Messiri', sans-serif !important;
        }
        .fa, .fas, .far, .fab, .fa-solid, .fa-regular, .fa-brands, [class*="fa-"] {
            font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", sans-serif !important;
        }
        body { background-color: #0f172a; }
        #headerTitle {
            font-family: 'El Messiri', sans-serif !important;
            font-size: 1.35rem !important;
            font-weight: 900 !important;
            letter-spacing: 0.5px !important;
            background: linear-gradient(135deg, #ffffff 0%, #99f6e4 100%) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            display: inline-block !important;
            margin: 4px 0 !important;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
        }
        .rx-canvas-container {
            position: relative !important;
            width: 540px !important;
            height: 765px !important;
            min-height: 765px !important;
            background: #ffffff !important;
            margin: 0 auto !important;
            overflow: hidden !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-radius: 12px;
        }
        .rx-bg-img {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            pointer-events: none !important;
        }
        
        .draggable-box {
            touch-action: none !important;
            cursor: move !important;
            position: absolute !important;
            background: transparent !important;
            border: none !important;
            padding: 4px;
            box-shadow: none !important;
            font-family: 'GizaFont', sans-serif !important;
            direction: rtl;
            text-align: right;
        }
        .config-mode.draggable-box {
            background: rgba(255, 255, 255, 0.9) !important;
            border: 1px dashed #0d9488 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
            padding: 8px !important;
            border-radius: 6px;
        }
        
        .box-font-controls {
            display: none;
            gap: 4px;
            margin-bottom: 4px;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 6px;
            align-items: center;
            justify-content: space-between;
            font-size: 0.7rem;
            color: #0f172a;
        }
        .config-mode .box-font-controls {
            display: flex;
        }
        .box-font-controls button {
            background: #0d9488;
            color: white;
            border: none;
            border-radius: 4px;
            width: 20px;
            height: 20px;
            font-weight: bold;
            cursor: pointer;
            font-size: 0.75rem;
        }

        @media screen and (max-width: 600px) {
            .rx-canvas-container {
                transform: scale(0.68) !important;
                transform-origin: top center !important;
                margin-bottom: -220px !important;
            }
        }
        .modal-body {
            overflow-x: auto !important;
            overflow-y: auto !important;
            max-width: 100% !important;
            max-height: 88vh !important;
            padding: 10px !important;
            text-align: center;
        }
        @media print {
            @page { size: auto; margin: 0mm; }
            body.is-printing-rx * { visibility: hidden !important; }
            body.is-printing-rx #rxCanvasContainer, body.is-printing-rx #rxCanvasContainer *, body.is-printing-rx #reportCanvasContainer, body.is-printing-rx #reportCanvasContainer * { visibility: visible !important; }
            body.is-printing-rx #rxModal, body.is-printing-rx #customReportPreviewModal { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; background: white !important; display: block !important; z-index: 999999 !important; overflow: hidden !important; }
            body.is-printing-rx #rxCanvasContainer, body.is-printing-rx #reportCanvasContainer { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; border: none !important; box-shadow: none !important; margin: 0 !important; transform: none !important; border-radius: 0 !important; }
            .box-font-controls { display: none !important; }
            .draggable-box { border: none !important; background: transparent !important; box-shadow: none !important; }
        }
    </style>
</head>
<body>

<div class="mobile-container">
    <div id="networkStatusBar" class="network-status-bar">⚠️ Offline Mode - Changes saved locally, will sync when online</div>

    <div id="authScreen" class="auth-screen">
        <div style="position: absolute; top: 15px; right: 15px;">
            <button onclick="toggleLanguage()" id="authLangBtn" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; font-weight: 700; cursor: pointer; color: #0f172a;">عربي / EN</button>
        </div>
        <div class="activ-icon"><i class="fa-solid fa-user-doctor"></i></div>
        <div class="activ-title" id="authTitle">User Login</div>
        <div class="activ-sub" id="authSubText">تسجيل الدخول إلى نظام العيادة السحابي</div>

        <form id="authForm" class="auth-form" onsubmit="handleAuthSubmit(event)">
            <div class="field-box" style="text-align: left; margin-bottom: 8px;">
                <span class="field-label" id="lblEmail">البريد الإلكتروني / رقم الموبايل</span>
                <div class="input-wrapper"><input type="text" id="authEmail" placeholder="user@clinic.com أو 07700000000" required></div>
            </div>

            <div class="field-box" id="registerPhoneBox" style="text-align: left; margin-bottom: 8px; display: none;">
                <span class="field-label" id="lblRegPhone">رقم الموبايل (اختياري)</span>
                <div class="input-wrapper"><input type="tel" id="regPhoneInput" placeholder="07XXXXXXXXX"></div>
            </div>

            <div class="field-box" style="text-align: left; margin-bottom: 4px;">
                <span class="field-label" id="lblPass">كلمة المرور</span>
                <div class="input-wrapper password-wrapper">
                    <input type="password" id="authPassword" placeholder="••••••••" required>
                    <i class="fa-solid fa-eye toggle-password" id="togglePasswordBtn" onclick="togglePasswordVisibility()"></i>
                </div>
            </div>

            <div class="forgot-pass" id="forgotPassBtn" onclick="resetPassword()">هل نسيت كلمة المرور؟</div>
            <button type="submit" class="btn-main" id="authSubmitBtn" style="margin-top: 6px;">تسجيل الدخول</button>
        </form>

        <div class="auth-switch" id="authSwitchText">
            ليس لديك حساب؟ <span onclick="toggleAuthMode()">سجل الآن</span>
        </div>
    </div>

    <div id="activationScreen" class="auth-screen" style="display: none;">
        <div class="activ-icon"><i class="fa-solid fa-shield-halved"></i></div>
        <div class="activ-title" id="activTitle">Account Activation Required</div>
        <div class="activ-sub" id="activSub">Please enter your 14-Day Trial, 7-Day Extension, or Annual Subscription code.</div>
        <div class="field-box" style="width: 100%; max-width: 400px; text-align: left;">
            <span class="field-label" id="lblActivCode">Activation / Subscription Code</span>
            <div class="input-wrapper"><input type="text" id="activationInput" placeholder="Enter code..." style="text-align: center; letter-spacing: 2px; text-transform: uppercase;"></div>
        </div>
        <button class="btn-main" style="max-width: 400px;" onclick="verifyActivationCode()" id="btnActivate">Activate System</button>
        <button class="btn-main" style="max-width: 400px; background: #64748b; margin-top: 8px;" onclick="cancelRenewal()">رجوع</button>
    </div>

    <div id="appContainer" style="display: none; flex: 1; flex-direction: column; overflow: hidden;">
        <div class="header">
            <button id="backBtn" class="back-btn" onclick="goBackScreen()" style="display: none;">
                <i class="fa-solid fa-arrow-left"></i> <span id="txtBack">Back</span>
            </button>

            <div class="menu-dropdown-container">
                <button class="hamburger-btn" onclick="toggleDropdownMenu(event)" title="Menu">
                    <i class="fa-solid fa-bars"></i>
                </button>
                <div id="headerDropdownMenu" class="dropdown-menu">
                    <div class="dropdown-item" onclick="toggleLanguage()">
                        <i class="fa-solid fa-language" style="color: #d97706;"></i> <span id="dropLangText">عربي / EN</span>
                    </div>
                    <div class="dropdown-item" onclick="toggleDarkMode()">
                        <i class="fa-solid fa-moon" style="color: #6366f1;" id="darkModeIcon"></i> <span id="dropDarkModeText">وضع الظلام الطبي</span>
                    </div>
                    <div class="dropdown-item" onclick="openSupportModal()">
                        <i class="fa-solid fa-headset" style="color: #0284c7;"></i> <span id="dropSupportText">Technical Support</span>
                    </div>
                    <div class="dropdown-item danger" onclick="logoutUser()">
                        <i class="fa-solid fa-right-from-bracket"></i> <span id="dropLogoutText">Logout</span>
                    </div>
                </div>
            </div>

            <div class="header-icon"><i class="fa-solid fa-user-doctor"></i></div>
            <h1 id="headerTitle">نظام عيادة ماستر</h1>
            <p id="headerSub">لوحة التحكم السحابية الآمنة</p>
        </div>

        <div class="content">
            <div id="mainScreen" style="display: none;">
                <div class="sub-status-banner" id="subStatusBanner" style="display: none;">
                    <div class="sub-status-info">
                        <h4 id="subBannerTitle"><i class="fa-solid fa-clock"></i> Active Subscription</h4>
                        <p id="subBannerText">Loading remaining days...</p>
                    </div>
                    <button onclick="openActivationScreenForRenewal()" id="btnRenew" style="background:#0d9488; color:#fff; border:none; border-radius:8px; padding:6px 10px; font-size:0.75rem; font-weight:700; cursor:pointer; white-space:nowrap;">تجديد بالكود</button>
                </div>

                <div class="founder-panel" id="founderControlPanel" style="display: none;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #0d9488;" id="founderPanelTitle">🔑 Code Generator (Founder):</span>
                    <div style="display: flex; gap: 6px; margin: 6px 0;">
                        <button onclick="generateNewKey('TRIAL')" style="flex:1; background:#0d9488; color:#fff; border:none; border-radius:6px; padding:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">14d Trial</button>
                        <button onclick="generateNewKey('EXT')" style="flex:1; background:#d97706; color:#fff; border:none; border-radius:6px; padding:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">7d Extension</button>
                        <button onclick="generateNewKey('ANNUAL')" style="flex:1; background:#4f46e5; color:#fff; border:none; border-radius:6px; padding:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">1y Annual</button>
                    </div>
                    <div class="founder-code-display" id="dynamicFounderCode">Click buttons above to generate key</div>
                    <span style="font-size: 0.7rem; color: #64748b;" id="keyTypeHint">Select type to create valid code.</span>
                </div>

                <div class="section-group">
                    <div class="section-title" id="secGroup1"><i class="fa-solid fa-stethoscope"></i> Daily Operations</div>
                    <div class="menu-grid">
                        <div class="menu-card" id="cardNewPatient" onclick="navigateTo('addPatientScreen', translations[currentLang].newPatient, translations[currentLang].newPatientSub)">
                            <div class="menu-icon"><i class="fa-solid fa-user-plus"></i></div>
                            <div class="menu-info">
                                <h3 id="menuNewPatientTitle">New Patient</h3>
                                <p id="menuNewPatientSub">Register & save records</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardArchive" onclick="openPatientsArchive()">
                            <div class="menu-icon archive-icon"><i class="fa-solid fa-address-book"></i></div>
                            <div class="menu-info">
                                <h3 id="menuArchiveTitle">Patients Archive</h3>
                                <p id="menuArchiveSub">Search & visit history</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title" id="secGroup2"><i class="fa-solid fa-file-prescription"></i> RX & Medical Tools</div>
                    <div class="menu-grid">
                        <div class="menu-card" id="cardRxTemplate" onclick="openRxTemplateManager()">
                            <div class="menu-icon rx-icon"><i class="fa-solid fa-prescription-bottle-medical"></i></div>
                            <div class="menu-info">
                                <h3 id="menuRxTitle">RX Template</h3>
                                <p id="menuRxSub">Prescription header image</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardSpecialtiesDashboard" onclick="openSpecialtiesDashboard()">
                            <div class="menu-icon spec-icon"><i class="fa-solid fa-sliders"></i></div>
                            <div class="menu-info">
                                <h3 id="menuSpecTitle">لوحة تحكم الاختصاصات</h3>
                                <p id="menuSpecSub">تخصيص وتفعيل الحقول الطبية</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardDict" onclick="openDictionaryManager()">
                            <div class="menu-icon dict-icon"><i class="fa-solid fa-book-medical"></i></div>
                            <div class="menu-info">
                                <h3 id="menuDictTitle">Medical Dictionary</h3>
                                <p id="menuDictSub">Manage drugs & doses</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title" id="secGroup3"><i class="fa-solid fa-chart-pie"></i> Reports & Stats</div>
                    <div class="menu-grid">
                        <div class="menu-card" id="cardAnalytics" onclick="openAnalyticsDashboard()" style="grid-column: span 2; flex-direction: row; text-align: left; padding: 12px 16px;">
                            <div class="menu-icon analytics-icon"><i class="fa-solid fa-chart-column"></i></div>
                            <div class="menu-info" style="flex: 1;">
                                <h3 id="menuAnalyticsTitle">Clinic Analytics & Stats</h3>
                                <p id="menuAnalyticsSub">Performance metrics, patient ratios & top prescribed medications</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-group">
                    <div class="section-title" id="secGroup4"><i class="fa-solid fa-shield-halved"></i> System & Maintenance</div>
                    <div class="menu-grid">
                        <div class="menu-card" id="cardBackup" onclick="openBackupManager()">
                            <div class="menu-icon backup-icon"><i class="fa-solid fa-database"></i></div>
                            <div class="menu-info">
                                <h3 id="menuBackupTitle">Backup & Restore</h3>
                                <p id="menuBackupSub">Export or upload data file</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardTrash" onclick="openTrashBin()">
                            <div class="menu-icon trash-icon"><i class="fa-solid fa-trash-arrow-up"></i></div>
                            <div class="menu-info">
                                <h3 id="menuTrashTitle">Trash Bin</h3>
                                <p id="menuTrashSub">Recover deleted items</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardSettings" onclick="openAccountSettings()">
                            <div class="menu-icon settings-icon"><i class="fa-solid fa-user-gear"></i></div>
                            <div class="menu-info">
                                <h3 id="menuSettingsTitle">Account Settings</h3>
                                <p id="menuSettingsSub">Email & password options</p>
                            </div>
                        </div>

                        <div class="menu-card" id="cardPermissions" onclick="openPermissionsManager()" style="display: none;">
                            <div class="menu-icon permissions-icon"><i class="fa-solid fa-user-shield"></i></div>
                            <div class="menu-info">
                                <h3 id="menuPermTitle">Secretary Management</h3>
                                <p id="menuPermSub">Create account & permissions</p>
                            </div>
                        </div>

                        <div class="menu-card" id="networkMenuCard" onclick="openNetworkHierarchy()" style="display: none;">
                            <div class="menu-icon network-icon"><i class="fa-solid fa-network-wired"></i></div>
                            <div class="menu-info">
                                <h3 id="menuNetTitle">Network Database</h3>
                                <p id="menuNetSub">Users & credentials</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- شاشة ملف المريض -->
            <div id="medicalRecordScreen" style="display: none;">
                <div class="group-card" style="background: #f0fdfa; border-color: #99f6e4; position: relative;">
                    <div style="position: absolute; top: 14px; right: 14px; display: flex; gap: 6px; z-index: 5;" id="patientRecordHeaderActions">
                        <button type="button" id="editPatientBtnMain" onclick="openEditPatientModal()" style="background: #0d9488; color: white; border: none; border-radius: 8px; padding: 6px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-pen-to-square"></i> <span id="txtEdit">Edit</span>
                        </button>
                        <button type="button" onclick="confirmDeletePatientRecord()" id="btnDeletePatientMain" style="background: #ef4444; color: white; border: none; border-radius: 8px; padding: 6px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-trash"></i> <span id="txtDelete">Delete</span>
                        </button>
                    </div>
                    <div class="field-box" style="font-family:'El Messiri',serif; font-size:1.1rem; font-weight:700; color: #0f766e; margin-bottom:4px; padding-right: 125px;">
                        <i class="fa-solid fa-user-check"></i> <span id="recPatientName">—</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #334155; line-height: 1.5; margin-bottom: 10px;" id="recPatientMeta"></p>
                    
                    <!-- زر إخراج التقرير المستقل -->
                    <button type="button" class="btn-main" onclick="openCustomReportModal()" id="btnGenerateReportModal" style="background: #0284c7; padding: 12px; font-size: 0.9rem;">
                        <i class="fa-solid fa-file-lines"></i> إخراج تقرير طبي
                    </button>
                </div>

                <button type="button" id="btnAddVisitMain" class="btn-main btn-secondary" onclick="addNewVisit()">
                    <i class="fa-solid fa-calendar-plus"></i> + Add New Visit
                </button>

                <div id="visitsContainer"></div>
            </div>

            <!-- باقي الشاشات الوظيفية المساعدة -->
            <div id="specialtiesDashboardScreen" style="display: none;"></div>
            <div id="permissionsScreen" style="display: none;"></div>
            <div id="backupScreen" style="display: none;"></div>
            <div id="settingsScreen" style="display: none;"></div>
            <div id="analyticsScreen" style="display: none;"></div>
            <div id="addPatientScreen" style="display: none;"></div>
            <div id="rxTemplateScreen" style="display: none;"></div>
            <div id="archiveScreen" style="display: none;"></div>
            <div id="trashScreen" style="display: none;"></div>
            <div id="dictScreen" style="display: none;"></div>
            <div id="networkScreen" style="display: none;"></div>
        </div>

        <div class="footer" id="footerText">Clinic Master Network v17.30</div>
    </div>
</div>

<!-- نافذة إدخال بيانات إخراج التقرير الطبي المستقل -->
<div id="customReportModal" class="modal-overlay" style="display: none;">
    <div class="modal-body" style="max-width: 500px; text-align: right; direction: rtl;">
        <div class="modal-header" style="direction: rtl;">
            <h3 style="font-family: 'GizaFont', 'El Messiri', serif;"><i class="fa-solid fa-file-medical" style="color:#0284c7;"></i> إخراج تقرير طبي</h3>
            <button class="modal-close" onclick="closeCustomReportModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <div class="field-box">
            <span class="field-label">اسم المريض:</span>
            <div class="input-wrapper"><input type="text" id="repInputName" placeholder="اسم المريض..."></div>
        </div>
        <div style="display: flex; gap: 10px;">
            <div class="field-box" style="flex: 1;">
                <span class="field-label">العمر:</span>
                <div class="input-wrapper"><input type="text" id="repInputAge" placeholder="العمر..."></div>
            </div>
            <div class="field-box" style="flex: 1;">
                <span class="field-label">الجنس:</span>
                <div class="input-wrapper"><input type="text" id="repInputGender" placeholder="الجنس..."></div>
            </div>
        </div>
        <div class="field-box">
            <span class="field-label">عنوان التقرير:</span>
            <div class="input-wrapper"><input type="text" id="repInputTitle" placeholder="تقرير طبي / إجازة مرضية..."></div>
        </div>
        <div class="field-box">
            <span class="field-label">الجهة المراد توجيه التقرير إليها:</span>
            <div class="input-wrapper"><input type="text" id="repInputTarget" placeholder="إلى الجهة المستفيدة..."></div>
        </div>
        <div class="field-box">
            <span class="field-label">تفاصيل وشرح حالة المريض:</span>
            <div class="input-wrapper"><textarea id="repInputDesc" rows="4" placeholder="التفاصيل السريرية..."></textarea></div>
        </div>
        <button type="button" class="btn-main" onclick="generateReportOnRx()" style="background: #0284c7; margin-top: 10px;">
            <i class="fa-solid fa-check"></i> اظهار التقرير على الروشتة
        </button>
    </div>
</div>

<!-- نافذة معاينة وطباعة التقرير المستقل -->
<div id="customReportPreviewModal" class="modal-overlay" style="display: none;">
    <div class="modal-body" style="max-width: 540px; text-align: left; direction: ltr;">
        <div class="modal-header" style="direction: ltr;">
            <h3>معاينة وطباعة التقرير الطبي</h3>
            <button class="modal-close" onclick="closeCustomReportPreview()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="reportCanvasContainer" class="rx-canvas-container" style="position: relative;">
            <img class="rx-bg-img" src="" alt="RX BG">
            <div id="customReportPreviewLayer" class="draggable-box" style="top: 40px; left: 20px; width: 90%;">
                <div class="box-font-controls"><button onclick="adjustReportFontSize(-1)">-</button><button onclick="adjustReportFontSize(1)">+</button></div>
                <h4 id="prevRepNameDisplay" style="font-size:15px; font-weight:bold;"></h4>
                <p id="prevRepGenderDisplay" style="font-size:14px;"></p>
                <p id="prevRepAgeDisplay" style="font-size:14px;"></p>
                <h3 id="prevRepTypeDisplay" style="font-size:18px; color:#0d9488; margin: 10px 0;"></h3>
                <p id="prevRepTargetDisplay" style="font-size:15px; font-weight:bold;"></p>
                <div id="prevRepDescDisplay" style="font-size:15px; white-space:pre-wrap;"></div>
            </div>
        </div>
        <button class="btn-main" onclick="window.print()" style="margin-top: 10px; background:#16a34a;"><i class="fa-solid fa-print"></i> طباعة التقرير مباشرة</button>
    </div>
</div>

<!-- نافذة روشتة الأدوية العادية (Print RX Prescription) الأصلية والمنفصلة -->
<div id="rxModal" class="modal-overlay" style="display: none;">
    <div class="modal-body" style="max-width: 480px; text-align: left; direction: ltr;">
        <div class="modal-header" style="direction: ltr;">
            <h3 style="font-family: 'El Messiri', serif;"><i class="fa-solid fa-file-prescription" style="color:#0d9488;"></i> RX Prescription & Medications</h3>
            <button class="modal-close" onclick="closeRxModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.72rem; color: #64748b;" id="rxModeHint">RX ready</span>
            <button type="button" id="rxConfigToggleBtn" onclick="toggleRxConfigMode()" style="background: #f0fdfa; color: #0d9488; border: 1px solid #0d9488; border-radius: 8px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                <i class="fa-solid fa-sliders"></i> Config Mode
            </button>
        </div>

        <div id="rxCanvasContainer" class="rx-canvas-container">
            <div id="rxPatientDetailsBox" class="draggable-box" style="top: 40px; left: 30px;">
                <div class="box-font-controls">
                    <span>Patient Details Font:</span>
                    <div style="display:flex; gap:3px;">
                        <button type="button" onclick="changeBoxFontSize('patientDetails', -1)">-</button>
                        <button type="button" onclick="changeBoxFontSize('patientDetails', 1)">+</button>
                    </div>
                </div>
                <div id="rxDragPatientDetailsText" class="rx-patient-details-text" style="font-size: 1rem; font-weight: 700; color: #0f172a;"></div>
            </div>

            <div id="rxDateBox" class="draggable-box" style="top: 40px; left: 380px;">
                <div class="box-font-controls">
                    <span>Date Font:</span>
                    <div style="display:flex; gap:3px;">
                        <button type="button" onclick="changeBoxFontSize('date', -1)">-</button>
                        <button type="button" onclick="changeBoxFontSize('date', 1)">+</button>
                    </div>
                </div>
                <div id="rxDragDateText" class="rx-date-text" style="font-size: 0.95rem; font-weight: 600; color: #334155;"></div>
            </div>

            <div id="rxVitalsBox" class="draggable-box" style="top: 110px; left: 30px;">
                <div class="box-font-controls">
                    <span>Vitals Font:</span>
                    <div style="display:flex; gap:3px;">
                        <button type="button" onclick="changeBoxFontSize('vitals', -1)">-</button>
                        <button type="button" onclick="changeBoxFontSize('vitals', 1)">+</button>
                    </div>
                </div>
                <div id="rxDragVitalsText" class="rx-vitals-text" style="font-size: 0.9rem; font-weight: 600; color: #0f766e;"></div>
            </div>

            <div id="rxTreatmentBox" class="draggable-box" style="top: 180px; left: 30px; width: 450px;">
                <div class="box-font-controls">
                    <span>Treatment Font:</span>
                    <div style="display:flex; gap:3px;">
                        <button type="button" onclick="changeBoxFontSize('treatment', -1)">-</button>
                        <button type="button" onclick="changeBoxFontSize('treatment', 1)">+</button>
                    </div>
                </div>
                <div id="rxDragTreatmentText" class="rx-treatment-text" style="font-size: 1.1rem; font-weight: 600; color: #0f172a; white-space: pre-wrap; line-height: 1.8;"></div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
            <button id="rxSaveLayoutBtn" class="btn-main" onclick="saveRxLayoutPositions()" style="display: none; background: #0d9488;">
                <i class="fa-solid fa-floppy-disk"></i> Save RX Layout Positions
            </button>
            <button type="button" class="btn-main" onclick="printPrescriptionDirectly()" id="btnPrintRxDirect" style="font-family: 'El Messiri', sans-serif; background: #16a34a; width: 100%;">
                <i class="fa-solid fa-print"></i> Print RX Prescription
            </button>
            <button type="button" class="btn-main" onclick="openPrescriptionPDF()" id="btnSaveRxPDF" style="font-family: 'El Messiri', sans-serif; background: #0284c7; width: 100%;">
                <i class="fa-solid fa-file-pdf"></i> Save as PDF File
            </button>
        </div>
    </div>
</div>

<script src="config.js"></script>
<script src="clinic-functions.js?v=17.30"></script>
<script>
    function openCustomReportModal() {
        let patName = document.getElementById('recPatientName') ? document.getElementById('recPatientName').innerText : "";
        document.getElementById('repInputName').value = patName;
        document.getElementById('customReportModal').style.display = 'flex';
    }
    function closeCustomReportModal() {
        document.getElementById('customReportModal').style.display = 'none';
    }
    function generateReportOnRx() {
        document.getElementById('prevRepNameDisplay').innerText = document.getElementById('repInputName').value;
        document.getElementById('prevRepGenderDisplay').innerText = document.getElementById('repInputGender').value;
        document.getElementById('prevRepAgeDisplay').innerText = document.getElementById('repInputAge').value;
        document.getElementById('prevRepTargetDisplay').innerText = document.getElementById('repInputTarget').value;
        document.getElementById('prevRepTypeDisplay').innerText = document.getElementById('repInputTitle').value;
        document.getElementById('prevRepDescDisplay').innerText = document.getElementById('repInputDesc').value;

        document.getElementById('customReportModal').style.display = 'none';
        document.getElementById('customReportPreviewModal').style.display = 'flex';
        
        let savedRxImg = localStorage.getItem('clinic_rx_template_img') || localStorage.getItem('rx_header_image');
        if(savedRxImg) {
            document.querySelector('#reportCanvasContainer .rx-bg-img').src = savedRxImg;
            document.querySelector('#reportCanvasContainer .rx-bg-img').style.display = 'block';
        }
    }
    function closeCustomReportPreview() {
        document.getElementById('customReportPreviewModal').style.display = 'none';
    }
</script>
</body>
</html>
