/**
 * src/i18n/translations.ts
 *
 * Central dictionary for all UI strings in the THF partner app.
 * Supported languages: 'en' (English), 'hi' (Hindi)
 */

export type Language = 'en' | 'hi';

const translations = {
  // ── Welcome / Language Select ──────────────────────────────────────────
  selectLanguageTitle: { en: 'Select a language to continue', hi: 'जारी रखने के लिए भाषा चुनें' },
  welcomeTitle: { en: 'Welcome to THF Partner', hi: 'THF पार्टनर में आपका स्वागत है' },
  welcomeSubtitle: { en: 'Your one-stop solution for all your home service needs.', hi: 'आपकी सभी घरेलू सेवा आवश्यकताओं के लिए आपका वन-स्टॉप समाधान।' },
  welcomeDescription: { en: 'Join our network of trusted professionals and grow your business.', hi: 'विश्वसनीय पेशेवरों के हमारे नेटवर्क में शामिल हों और अपना व्यवसाय बढ़ाएं।' },
  getStarted: { en: 'Get Started', hi: 'शुरू करें' },
  signUp: { en: 'Sign up', hi: 'साइन अप करें' },
  login: { en: 'Login', hi: 'लॉगिन करें' },

  // ── Change Language ────────────────────────────────────────────────────
  changeLanguage: { en: 'Change Language', hi: 'भाषा बदलें' },
  saveUpdate: { en: 'Save & Update', hi: 'सहेजें और अपडेट करें' },
  savedTitle: { en: 'Saved', hi: 'सहेजा गया' },
  savedMsg: { en: 'Your preferred language has been updated.', hi: 'आपकी पसंदीदा भाषा अपडेट कर दी गई है।' },
  notLoggedIn: { en: 'Not logged in. Please restart the app.', hi: 'लॉग इन नहीं है। कृपया ऐप को पुनः प्रारंभ करें।' },
  failedUpdateLang: { en: 'Failed to update language.', hi: 'भाषा अपडेट करने में विफल।' },

  // ── Dashboard ─────────────────────────────────────────────────────────
  welcome: { en: 'Welcome!', hi: 'स्वागत है!' },
  partner: { en: 'Partner', hi: 'पार्टनर' },
  verified: { en: '✓ verified', hi: '✓ सत्यापित' },
  todaySummary: { en: "Today's Summary", hi: 'आज का सारांश' },
  todayBookings: { en: "Today's Bookings", hi: 'आज की बुकिंग' },
  bookings: { en: 'Bookings', hi: 'बुकिंग' },
  earned: { en: 'Earned', hi: 'कमाई' },
  ratings: { en: 'Ratings', hi: 'रेटिंग' },
  viewDetail: { en: 'View detail', hi: 'विवरण देखें' },
  location: { en: 'Location', hi: 'स्थान' },
  callClient: { en: 'Call Client', hi: 'ग्राहक को कॉल करें' },
  newBookingAvailable: { en: 'NEW BOOKING AVAILABLE!', hi: 'नई बुकिंग उपलब्ध!' },
  acceptBooking: { en: 'Accept Booking', hi: 'बुकिंग स्वीकार करें' },
  ignore: { en: 'Ignore', hi: 'अनदेखा करें' },
  amount: { en: 'Amount', hi: 'राशि' },
  noBookingKyc: { en: 'You have not assigned any booking', hi: 'आपको कोई बुकिंग नहीं मिली है' },
  kycRequired: { en: 'As per our company policy you need to upload your govt. approved documents with to verify your identity.', hi: 'हमारी कंपनी नीति के अनुसार आपको अपनी पहचान सत्यापित करने के लिए सरकारी दस्तावेज़ अपलोड करने होंगे।' },
  uploadDocument: { en: 'Upload Document', hi: 'दस्तावेज़ अपलोड करें' },
  pendingVerification: { en: 'Your verification is in review', hi: 'आपका सत्यापन समीक्षाधीन है' },
  pendingVerifMsg: { en: 'Please wait while our team verifies your documents. This usually takes 24-48 hours.', hi: 'कृपया प्रतीक्षा करें, हमारी टीम आपके दस्तावेज़ सत्यापित कर रही है। इसमें आमतौर पर 24-48 घंटे लगते हैं।' },
  kycTitle: { en: 'KYC Verification', hi: 'केवाईसी सत्यापन' },
  kycSubtitle: { en: 'Please complete your KYC verification to start accepting bookings.', hi: 'बुकिंग स्वीकार करना शुरू करने के लिए कृपया अपना केवाईसी सत्यापन पूरा करें।' },
  kycDescription: { en: 'As per our company policy, you need to upload your government-approved documents to verify your identity.', hi: 'हमारी कंपनी नीति के अनुसार, आपको अपनी पहचान सत्यापित करने के लिए सरकारी-अनुमोदित दस्तावेज़ अपलोड करने होंगे।' },
  uploadDocuments: { en: 'Upload Documents', hi: 'दस्तावेज़ अपलोड करें' },
  verificationPending: { en: 'Verification Pending', hi: 'सत्यापन लंबित' },
  verificationPendingMsg: { en: 'Your verification is in review. Please wait while our team verifies your documents. This usually takes 24-48 hours.', hi: 'आपका सत्यापन समीक्षाधीन है। कृपया प्रतीक्षा करें जब तक हमारी टीम आपके दस्तावेज़ों को सत्यापित करती है। इसमें आमतौर पर 24-48 घंटे लगते हैं।' },
  verificationFailed: { en: 'Verification Failed', hi: 'सत्यापन विफल' },
  verificationFailedMsg: { en: 'Your KYC verification failed. Please re-upload your documents or contact support.', hi: 'आपका केवाईसी सत्यापन विफल हो गया। कृपया अपने दस्तावेज़ फिर से अपलोड करें या सहायता से संपर्क करें।' },
  reUploadDocuments: { en: 'Re-upload Documents', hi: 'दस्तावेज़ पुनः अपलोड करें' },
  noBookingsToday: { en: 'No bookings for today', hi: 'आज की कोई बुकिंग नहीं है' },
  getDirection: { en: 'Get Direction', hi: 'दिशा प्राप्त करें' },
  navigate: { en: 'Navigate', hi: 'नेविगेट करें' },
  mapPreview: { en: 'Map Preview', hi: 'मानचित्र पूर्वावलोकन' },
  nextUp: { en: 'Next up', hi: 'अगली बुकिंग' },
  upcoming: { en: 'Upcoming', hi: 'आगामी' },
  guests: { en: 'guests', hi: 'अतिथि' },
  unavailable: { en: 'Unavailable', hi: 'अनुपलब्ध' },
  phoneNotProvided: { en: 'Phone number not provided for this booking', hi: 'इस बुकिंग में फ़ोन नंबर प्रदान नहीं किया गया' },
  phoneNotProvided2: { en: 'Phone number not provided', hi: 'फ़ोन नंबर उपलब्ध नहीं है' },

  // ── KYC Details ────────────────────────────────────────────────────────
  kycDetailsHeading: { en: 'Personal Details', hi: 'व्यक्तिगत विवरण' },
  kycDetailsSub: { en: 'Enter your details below', hi: 'नीचे अपना विवरण दर्ज करें' },
  enterName: { en: 'Enter Name', hi: 'नाम दर्ज करें' },
  enterEmail: { en: 'Enter Email', hi: 'ईमेल दर्ज करें' },
  emergencyContact: { en: 'Emergency Contact', hi: 'आपातकालीन संपर्क' },
  selectGender: { en: 'Select Gender', hi: 'लिंग चुनें' },
  selectCity: { en: 'Select City', hi: 'शहर चुनें' },
  selectZone: { en: 'Select Zone', hi: 'ज़ोन चुनें' },
  addressLabel: { en: 'Address', hi: 'पता' },
  pinCodeLabel: { en: 'Pin Code', hi: 'पिन कोड' },
  register: { en: 'Register', hi: 'रजिस्टर करें' },

  // ── Profile ───────────────────────────────────────────────────────────
  myProfile: { en: 'My profile', hi: 'मेरी प्रोफाइल' },
  cityNotSet: { en: 'City not set', hi: 'शहर निर्धारित नहीं' },
  earnings: { en: 'Earnings', hi: 'कमाई' },
  expTags: { en: 'Exp. Tags', hi: 'अनुभव' },
  accountDetail: { en: 'Account detail', hi: 'खाता विवरण' },
  bankDetails: { en: 'Bank details', hi: 'बैंक विवरण' },
  referFriend: { en: 'Refer a friend & Earn', hi: 'मित्र को रेफर करें और कमाएं' },
  referBadge: { en: 'Earn upto ₹5000', hi: '₹5000 तक कमाएं' },
  logout: { en: 'Logout', hi: 'लॉगआउट' },
  logoutTitle: { en: 'Logout', hi: 'लॉगआउट' },
  logoutConfirm: { en: 'Are you sure you want to logout?', hi: 'क्या आप वाकई लॉगआउट करना चाहते हैं?' },
  cancel: { en: 'Cancel', hi: 'रद्द करें' },
  ok: { en: 'OK', hi: 'ठीक है' },
  error: { en: 'Error', hi: 'त्रुटि' },
  failedLogout: { en: 'Failed to logout. Please try again.', hi: 'लॉगआउट विफल हुआ। कृपया पुनः प्रयास करें।' },
  jobPreference: { en: 'Job Preference', hi: 'कार्य प्राथमिकता' },
  workExperience: { en: 'Work Experience', hi: 'कार्य अनुभव' },
  cuisineType: { en: 'Cuisine Type', hi: 'व्यंजन प्रकार' },
  

  // ── My Bookings ───────────────────────────────────────────────────────
  myBookings: { en: 'My Bookings', hi: 'मेरी बुकिंग' },
  filterAll: { en: 'All', hi: 'सभी' },
  filterToday: { en: 'Today', hi: 'आज' },
  filterUpcoming: { en: 'Upcoming', hi: 'आगामी' },
  filterCompleted: { en: 'Completed', hi: 'पूर्ण' },
  filterActive: { en: 'Active', hi: 'सक्रिय' },
  nextUpToday: { en: 'Next up today', hi: 'आज की अगली बुकिंग' },
  activeBooking: { en: 'Active booking', hi: 'सक्रिय बुकिंग' },
  reachedLocation: { en: 'Reached to Location', hi: 'स्थान पर पहुंच गए' },
  navigateLocation: { en: 'Navigate location', hi: 'स्थान पर नेविगेट करें' },
  noBookingsFound: { en: 'No bookings found', hi: 'कोई बुकिंग नहीं मिली' },
  hours: { en: 'HOURS', hi: 'घंटे' },
  minutes: { en: 'MINUTES', hi: 'मिनट' },
  seconds: { en: 'SECONDS', hi: 'सेकंड' },
  pause: { en: 'Pause', hi: 'रोकें' },
  resume: { en: 'Resume', hi: 'जारी रखें' },
  otpModalTitle: { en: 'Verify Arrival', hi: 'आगमन सत्यापित करें' },
  enterOtp: { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  verifyOtp: { en: 'Verify OTP', hi: 'OTP सत्यापित करें' },
  invalidOtp: { en: 'Invalid OTP', hi: 'अमान्य OTP' },
  invalidOtpMsg: { en: 'Please enter the 4-digit code sent to the client.', hi: 'कृपया ग्राहक को भेजा गया 4-अंकीय कोड दर्ज करें।' },
  time: { en: 'Time', hi: 'समय' },
  locationLabel: { en: 'Location', hi: 'स्थान' },

  // ── Earnings ──────────────────────────────────────────────────────────
  myEarnings: { en: 'My Earnings', hi: 'मेरी कमाई' },
  totalEarned: { en: 'Total earned', hi: 'कुल कमाई' },
  transactionsThisMonth: { en: 'transactions this month', hi: 'इस महीने के लेनदेन' },
  transactions: { en: 'Transactions', hi: 'लेनदेन' },
  totalEarnedLabel: { en: 'Total Earned', hi: 'कुल कमाई' },
  recentTransactions: { en: 'Recent transactions', hi: 'हाल के लेनदेन' },
  noTransactions: { en: 'No transactions yet', hi: 'अभी तक कोई लेनदेन नहीं' },

  // ── Mobile Login / Welcome ────────────────────────────────────────────
  loginWithMobile: { en: 'Login with mobile and password', hi: 'मोबाइल और पासवर्ड से लॉगिन करें' },
  signUpWithMobile: { en: 'Sign up with mobile number', hi: 'मोबाइल नंबर से साइन अप करें' },
  enterMobileNumber: { en: 'Enter your mobile number', hi: 'अपना मोबाइल नंबर दर्ज करें' },
  enterPassword: { en: 'Enter your password', hi: 'अपना पासवर्ड दर्ज करें' },
  getStarted2: { en: 'Get Started', hi: 'शुरू करें' },
  alreadyHaveAccount: { en: 'Already have an account? Login', hi: 'पहले से खाता है? लॉगिन करें' },
  dontHaveAccount: { en: "Don't have an account? Sign up", hi: 'खाता नहीं है? साइन अप करें' },
  alreadyRegistered: { en: 'Already Registered', hi: 'पहले से पंजीकृत' },
  alreadyRegisteredMsg: { en: 'This mobile number is already registered. Please login instead.', hi: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।' },

  // ── OTP Screen ────────────────────────────────────────────────────────
  otpSentTo: { en: 'We sent an OTP to', hi: 'हमने OTP भेजा है' },
  resendOtp: { en: 'Resend OTP', hi: 'OTP पुनः भेजें' },
  resendIn: { en: 'Resend in', hi: 'पुनः भेजें' },
  verifying: { en: 'Verifying...', hi: 'सत्यापित हो रहा है...' },
  verify: { en: 'Verify', hi: 'सत्यापित करें' },

  // ── Password Screen ───────────────────────────────────────────────────
  createPasswordTitle: { en: 'Create a Password', hi: 'पासवर्ड बनाएं' },
  resetPasswordTitle: { en: 'Create new password', hi: 'नया पासवर्ड बनाएं' },
  createPasswordSub: { en: 'Set a strong password to secure your account', hi: 'अपना खाता सुरक्षित करने के लिए मजबूत पासवर्ड बनाएं' },
  newPassword: { en: 'New Password', hi: 'नया पासवर्ड' },
  confirmPassword: { en: 'Confirm Password', hi: 'पासवर्ड की पुष्टि करें' },
  passwordMismatch: { en: "Passwords don't match", hi: 'पासवर्ड मेल नहीं खाते' },
  passwordTooShort: { en: 'Password must be at least 8 characters', hi: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए' },
  savePassword: { en: 'Save Password', hi: 'पासवर्ड सहेजें' },
  passwordSavedTitle: { en: 'Password Saved', hi: 'पासवर्ड सहेजा गया' },
  passwordSavedMsg: { en: 'Your password has been set successfully.', hi: 'आपका पासवर्ड सफलतापूर्वक सेट हो गया है।' },
  failedPassword: { en: 'Failed to save password. Please try again.', hi: 'पासवर्ड सहेजने में विफल। कृपया पुनः प्रयास करें।' },

  // ── Forgot Password ──────────────────────────────────────────────────
  forgotPassword: { en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?' },
  forgotPasswordTitle: { en: 'Reset Password', hi: 'पासवर्ड रीसेट करें' },
  forgotPasswordSub: { en: 'Enter your registered mobile number to receive an OTP', hi: 'OTP प्राप्त करने के लिए अपना पंजीकृत मोबाइल नंबर दर्ज करें' },
  sendOtp: { en: 'Send OTP', hi: 'OTP भेजें' },
  notRegistered: { en: 'Not Registered', hi: 'पंजीकृत नहीं' },
  notRegisteredMsg: { en: 'This mobile number is not registered. Please sign up first.', hi: 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले साइन अप करें।' },
  backToLogin: { en: 'Back to Login', hi: 'लॉगिन पर वापस जाएं' },



  // ── KYC – Aadhar ──────────────────────────────────────────────────────
  aadharHeading: { en: 'Enter your Aadhar details', hi: 'अपना आधार विवरण दर्ज करें' },
  uploadDocSub: { en: 'Upload your own documents for a faster process!', hi: 'तेज़ प्रक्रिया के लिए अपने दस्तावेज़ अपलोड करें!' },
  enterAadhar: { en: 'Enter Aadhar number', hi: 'आधार नंबर दर्ज करें' },
  aadharAuthNote: { en: "By clicking 'Continue' you give authorization to verify your Aadhar card.", hi: "'जारी रखें' दबाने से आप अपने आधार कार्ड की जाँच की अनुमति देते हैं।" },
  uploadFront: { en: 'Upload Front', hi: 'सामने अपलोड करें' },
  uploadingFront: { en: 'Uploading Front...', hi: 'अपलोड हो रहा है...' },
  uploadBack: { en: 'Upload Back', hi: 'पीछे अपलोड करें' },
  uploadingBack: { en: 'Uploading Back...', hi: 'अपलोड हो रहा है...' },
  skipLater: { en: "Skip, I'll do it later", hi: 'छोड़ें, बाद में करूँगा' },
  uploadAadharFront: { en: 'Upload Aadhar Front', hi: 'आधार सामने अपलोड करें' },
  uploadAadharBack: { en: 'Upload Aadhar Back', hi: 'आधार पीछे अपलोड करें' },
  chooseOption: { en: 'Choose an option', hi: 'एक विकल्प चुनें' },
  takePhoto: { en: 'Take Photo', hi: 'फ़ोटो लें' },
  chooseGallery: { en: 'Choose from Gallery', hi: 'गैलरी से चुनें' },
  permRequired: { en: 'Permission Required', hi: 'अनुमति आवश्यक' },
  cameraPermDoc: { en: 'Please allow camera access to upload a document.', hi: 'दस्तावेज़ अपलोड करने के लिए कैमरा एक्सेस की अनुमति दें।' },
  galleryPermDoc: { en: 'Please allow gallery access to choose a document.', hi: 'दस्तावेज़ चुनने के लिए गैलरी एक्सेस की अनुमति दें।' },
  uploadFailed: { en: 'Upload failed', hi: 'अपलोड विफल' },

  // ── KYC – PAN ─────────────────────────────────────────────────────────
  panHeading: { en: 'Enter your Pan details (Optional)', hi: 'अपना PAN विवरण दर्ज करें (वैकल्पिक)' },
  enterPan: { en: 'Enter PAN number', hi: 'PAN नंबर दर्ज करें' },
  panAuthNote: { en: "By clicking 'Continue' you give authorization to verify your PAN card.", hi: "'जारी रखें' दबाने से आप अपने PAN कार्ड की जाँच की अनुमति देते हैं।" },
  uploading: { en: 'Uploading...', hi: 'अपलोड हो रहा है...' },
  noImageSelected: { en: 'No image selected', hi: 'कोई छवि नहीं चुनी गई' },

  // ── KYC – Selfie ──────────────────────────────────────────────────────
  selfieHeading: { en: "Let's click a selfie", hi: 'चलिए एक सेल्फी लेते हैं' },
  selfieSub: { en: 'Please remove spectacles, hat and mask. A clearly visible face will get approved faster.', hi: 'कृपया चश्मा, टोपी और मास्क हटाएं। साफ़ दिखने वाला चेहरा जल्दी स्वीकृत होगा।' },
  proceedCapture: { en: 'Proceed to Capture', hi: 'तस्वीर लेने के लिए आगे बढ़ें' },
  uploadPhoto: { en: 'Upload Photo', hi: 'फ़ोटो अपलोड करें' },
  camPermSelfie: { en: 'Please allow camera access to take a selfie.', hi: 'सेल्फी लेने के लिए कैमरा एक्सेस की अनुमति दें।' },
  galPermSelfie: { en: 'Please allow gallery access to choose a photo.', hi: 'फ़ोटो चुनने के लिए गैलरी एक्सेस की अनुमति दें।' },

  // ── KYC – Experience & Cuisines ──────────────────────────────────────────────────
  expHeading: { en: 'Please share your experience', hi: 'कृपया अपना अनुभव साझा करें' },
  expSub: { en: 'This will help us to understand the area of expertise so that we could allocate the bookings accordingly', hi: 'यह हमें आपकी विशेषज्ञता के क्षेत्र को समझने में मदद करेगा ताकि हम बुकिंग आवंटित कर सकें।' },
  cuisinesHeading: { en: 'Please choose the cuisines you can cook', hi: 'कृपया वे व्यंजन चुनें जिन्हें आप पका सकते हैं' },
  cuisinesSub: { en: 'This will help us to understand the area of expertise so that we could allocate the bookings accordingly', hi: 'यह हमें आपकी विशेषज्ञता के क्षेत्र को समझने में मदद करेगा ताकि हम बुकिंग आवंटित कर सकें।' },
  continueBtn: { en: 'Continue', hi: 'जारी रखें' },
  saveBtn: { en: 'Save', hi: 'सहेजें' },

  // ── KYC – Upload Documents ────────────────────────────────────────────
  uploadDocsHeading: { en: 'Upload documents', hi: 'दस्तावेज़ अपलोड करें' },
  uploadDocsSub: { en: 'Please submit the below documents for verification & upload originals to avoid rejection', hi: 'कृपया नीचे दिए गए दस्तावेज़ सत्यापन के लिए जमा करें और मूल दस्तावेज़ अपलोड करें।' },
  docSelfie: { en: 'Upload profile picture (Selfie)', hi: 'प्रोफाइल फ़ोटो अपलोड करें (सेल्फी)' },
  docAadhar: { en: 'Upload Aadhar card front & back', hi: 'आधार कार्ड सामने और पीछे अपलोड करें' },
  docPan: { en: 'Upload PAN number (Optional)', hi: 'PAN नंबर अपलोड करें (वैकल्पिक)' },

  // ── Edit Details ────────────────────────────────────────────────────────
  editDetails: { en: 'Edit details', hi: 'विवरण संपादित करें' },
  enterNameLabel: { en: 'Enter Name', hi: 'नाम दर्ज करें' },
  enterEmailLabel: { en: 'Enter Email', hi: 'ईमेल दर्ज करें' },
  enterMobileLabel: { en: 'Enter mobile number', hi: 'मोबाइल नंबर दर्ज करें' },
  emergencyContactLabel: { en: 'Emergency contact number', hi: 'आपातकालीन संपर्क नंबर' },
  selectGenderLabel: { en: 'Select Gender', hi: 'लिंग चुनें' },
  selectCityLabel: { en: 'Select City', hi: 'शहर चुनें' },
  addressLabel2: { en: 'Address', hi: 'पता' },
  saveAndUpdate: { en: 'Save and Update', hi: 'सहेजें और अपडेट करें' },
  saved: { en: 'Saved', hi: 'सहेजा गया' },
  savedDetails: { en: 'Your details have been updated.', hi: 'आपकी जानकारी अपडेट कर दी गई है।' },
  failedSave: { en: 'Failed to save. Please try again.', hi: 'सहेजने में विफल। कृपया पुनः प्रयास करें।' },

  // ── Refer a Friend ─────────────────────────────────────────────────────
  referAFriend: { en: 'Refer a friend', hi: 'मित्र को रेफर करें' },
  friendName: { en: 'Friend name', hi: 'मित्र का नाम' },
  contactNumber: { en: 'Contact number', hi: 'संपर्क नंबर' },
  emailOptional: { en: 'Email id (optional)', hi: 'ईमेल (वैकल्पिक)' },
  generateReferral: { en: 'Generate Referral Link', hi: 'रेफरल लिंक बनाएं' },
  alreadyReferred: { en: 'Already Referred', hi: 'पहले से रेफर किया गया' },
  alreadyReferredMsg: { en: 'has already been referred.', hi: 'पहले से रेफर किया जा चुका है।' },
  referralSent: { en: 'Referral Sent! 🎉', hi: 'रेफरल भेजा गया! 🎉' },
  referralSentMsg: { en: 'Your referral link has been created.', hi: 'आपका रेफरल लिंक बनाया गया है।' },
  failedReferral: { en: 'Failed to create referral.', hi: 'रेफरल बनाने में विफल।' },

  // ── Account Details ─────────────────────────────────────────────────────
  accountDetailsTitle: { en: 'Account details', hi: 'खाता विवरण' },
  bankAccountNumber: { en: 'Bank account number', hi: 'बैंक खाता नंबर' },
  ifscCode: { en: 'IFSC / MICR Code', hi: 'IFSC / MICR कोड' },
  bankNameLabel: { en: 'Bank name', hi: 'बैंक का नाम' },
  upiDetail: { en: 'UPI detail', hi: 'UPI विवरण' },
  upiIdLabel: { en: 'UPI id', hi: 'UPI आईडी' },
  upiHint: { en: 'The UPI ID is in the format of name/phone number @bank number.', hi: 'UPI ID का प्रारूप नाम/फ़ोन नंबर @बैंक नंबर है।' },
  savedAccountDetails: { en: 'Your account details have been updated.', hi: 'आपके खाता विवरण अपडेट कर दिए गए हैं।' },
  failedAccountUpdate: { en: 'Failed to update account details.', hi: 'खाता विवरण अपडेट करने में विफल।' },

  // ── Job Timer ───────────────────────────────────────────────────────────
  currentJob: { en: 'Current job', hi: 'वर्तमान कार्य' },
  timePrefix: { en: 'Time:', hi: 'समय:' },
  locationPrefix: { en: 'Location:', hi: 'स्थान:' },
  guestsLabel: { en: 'guests', hi: 'अतिथि' },
  live: { en: 'LIVE', hi: 'लाइव' },
  startJobTimer: { en: 'Start Job Timer', hi: 'जॉब टाइमर शुरू करें' },
  stopBtn: { en: 'Stop', hi: 'बंद करें' },
  pauseLabel: { en: 'Pause', hi: 'रोकें' },
  resumeLabel: { en: 'Resume', hi: 'जारी रखें' },
  quitConfirmTitle: { en: 'Verification', hi: 'सत्यापन' },
  quitConfirmMsg: { en: 'Are you sure to quit?', hi: 'क्या आप वाकई छोड़ना चाहते हैं?' },
  yes: { en: 'Yes', hi: 'हाँ' },

  // ── Shared Alert / Error Messages ───────────────────────────────────────
  notLoggedInRestart: { en: 'Not logged in. Please restart the app.', hi: 'लॉग इन नहीं है। कृपया ऐप पुनः शुरू करें।' },
  phoneMissing: { en: 'Phone number is missing. Please retry signup.', hi: 'फ़ोन नंबर गुम है। कृपया पुनः साइन अप करें।' },
  sessionExpired: { en: 'Session expired. Please signup again.', hi: 'सत्र समाप्त हो गया। कृपया फिर से साइन अप करें।' },
  couldNotSavePassword: { en: 'Could not save password. Please try again.', hi: 'पासवर्ड सहेजने में विफल। कृपया पुनः प्रयास करें।' },
  passwordNote: { en: '* Password must be at least 6 characters long', hi: '* पासवर्ड कम से कम 6 अक्षर का होना चाहिए' },
  footerLegal: { en: 'By Clicking "Sign up", you agree with the', hi: '"साइन अप" पर क्लिक करके, आप सहमत हैं' },
  termsConditions: { en: 'Terms & conditions', hi: 'नियम और शर्तें' },
  privacyPolicy: { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  failedResendOtp: { en: 'Failed to resend OTP. Please try again.', hi: 'OTP पुनः भेजने में विफल। कृपया पुनः प्रयास करें।' },
  verificationExpired: { en: 'Verification session expired. Please go back and try again.', hi: 'सत्यापन सत्र समाप्त हो गया। कृपया वापस जाएं और पुनः प्रयास करें।' },
  verificationFailedTitle: { en: 'Verification Failed', hi: 'सत्यापन विफल' },
  invalidOtpGeneric: { en: 'Invalid OTP. Please try again.', hi: 'अवैध OTP। कृपया पुनः प्रयास करें।' },
  otpIncorrect: { en: 'The OTP you entered is incorrect. Please check and try again.', hi: 'आपने गलत OTP दर्ज किया है। कृपया जाँचें और पुनः प्रयास करें।' },
  otpExpired: { en: 'The OTP has expired. Please resend and try again.', hi: 'OTP की अवधि समाप्त हो गई। कृपया पुनः भेजें और प्रयास करें।' },
  sessionExpiredOtp: { en: 'Your session has expired. Please go back and request a new OTP.', hi: 'सत्र समाप्त हो गया। कृपया वापस जाएं और नया OTP अनुरोध करें।' },
  whatsappUpdates: { en: 'Get updates on Whatsapp', hi: 'Whatsapp पर अपडेट प्राप्त करें' },
  failedCaptureImage: { en: 'Failed to capture image', hi: 'छवि कैप्चर करने में विफल' },
  failedSelectImage: { en: 'Failed to select image', hi: 'छवि चुनने में विफल' },
  failedLinkDocs: { en: 'Failed to link documents. Please try again.', hi: 'दस्तावेज़ लिंक करने में विफल। कृपया पुनः प्रयास करें।' },
  failedSaveRetry: { en: 'Failed to save. Please try again.', hi: 'सहेजने में विफल। कृपया पुनः प्रयास करें।' },
  uploadFailedAadharFront: { en: 'Unable to upload Aadhar front. Please try again.', hi: 'आधार सामने अपलोड करने में असमर्थ। कृपया पुनः प्रयास करें।' },
  uploadFailedAadharBack: { en: 'Unable to upload Aadhar back. Please try again.', hi: 'आधार पीछे अपलोड करने में असमर्थ। कृपया पुनः प्रयास करें।' },
  uploadFailedPan: { en: 'Unable to upload PAN document. Please try again.', hi: 'PAN दस्तावेज़ अपलोड करने में असमर्थ। कृपया पुनः प्रयास करें।' },
  uploadFailedSelfie: { en: 'Unable to upload selfie. Please try again.', hi: 'सेल्फी अपलोड करने में असमर्थ। कृपया पुनः प्रयास करें।' },

  // ── OTP Arrival Verification (new keys only) ──────────────────────────
  otpWillBeSentTo: { en: "An OTP will be sent to the client's phone number", hi: 'ग्राहक के फ़ोन नंबर पर OTP भेजा जाएगा' },
  otpSentTitle: { en: 'OTP Sent', hi: 'OTP भेजा गया' },
  otpSendFailed: { en: 'Failed to send OTP. Please try again.', hi: 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।' },
} as const;

export type TranslationKey = keyof typeof translations;

export function getTranslation(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  if (!entry) return key; // Fallback to key itself if missing
  return entry[lang] ?? entry['en'];
}

export default translations;
