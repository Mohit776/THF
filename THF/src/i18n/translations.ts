/**
 * src/i18n/translations.ts
 *
 * Central dictionary for all UI strings in the THF partner app.
 * Supported languages: 'en' (English), 'hi' (Hindi)
 */

export type Language = 'en' | 'hi';

const translations = {
  // ── Welcome / Language Select ──────────────────────────────────────────
  selectLanguageTitle:  { en: 'Select a language to continue', hi: 'जारी रखने के लिए भाषा चुनें' },
  signUp:               { en: 'Sign up',     hi: 'साइन अप करें' },
  login:                { en: 'Login',       hi: 'लॉगिन करें'  },

  // ── Change Language ────────────────────────────────────────────────────
  changeLanguage:       { en: 'Change Language',  hi: 'भाषा बदलें'   },
  saveUpdate:           { en: 'Save & Update',    hi: 'सहेजें और अपडेट करें' },
  savedTitle:           { en: 'Saved',            hi: 'सहेजा गया'    },
  savedMsg:             { en: 'Your preferred language has been updated.', hi: 'आपकी पसंदीदा भाषा अपडेट कर दी गई है।' },
  notLoggedIn:          { en: 'Not logged in. Please restart the app.', hi: 'लॉग इन नहीं है। कृपया ऐप को पुनः प्रारंभ करें।' },
  failedUpdateLang:     { en: 'Failed to update language.', hi: 'भाषा अपडेट करने में विफल।' },

  // ── Dashboard ─────────────────────────────────────────────────────────
  welcome:              { en: 'Welcome!',          hi: 'स्वागत है!'           },
  partner:              { en: 'Partner',           hi: 'पार्टनर'              },
  verified:             { en: '✓ verified',        hi: '✓ सत्यापित'           },
  todaySummary:         { en: "Today's Summary",   hi: 'आज का सारांश'        },
  todayBookings:        { en: "Today's Bookings",  hi: 'आज की बुकिंग'        },
  bookings:             { en: 'Bookings',          hi: 'बुकिंग'               },
  earned:               { en: 'Earned',            hi: 'कमाई'                 },
  ratings:              { en: 'Ratings',           hi: 'रेटिंग'               },
  viewDetail:           { en: 'View detail',       hi: 'विवरण देखें'          },
  location:             { en: 'Location',          hi: 'स्थान'                },
  callClient:           { en: 'Call Client',       hi: 'ग्राहक को कॉल करें'  },
  newBookingAvailable:  { en: 'NEW BOOKING AVAILABLE!', hi: 'नई बुकिंग उपलब्ध!' },
  acceptBooking:        { en: 'Accept Booking',    hi: 'बुकिंग स्वीकार करें'  },
  ignore:               { en: 'Ignore',            hi: 'अनदेखा करें'          },
  amount:               { en: 'Amount',            hi: 'राशि'                 },
  noBookingKyc:         { en: 'You have not assigned any booking', hi: 'आपको कोई बुकिंग नहीं मिली है' },
  kycRequired:          { en: 'As per our company policy you need to upload your govt. approved documents with to verify your identity.', hi: 'हमारी कंपनी नीति के अनुसार आपको अपनी पहचान सत्यापित करने के लिए सरकारी दस्तावेज़ अपलोड करने होंगे।' },
  uploadDocument:       { en: 'Upload Document',   hi: 'दस्तावेज़ अपलोड करें' },
  pendingVerification:  { en: 'Your verification is in review', hi: 'आपका सत्यापन समीक्षाधीन है' },
  pendingVerifMsg:      { en: 'Please wait while our team verifies your documents. This usually takes 24-48 hours.', hi: 'कृपया प्रतीक्षा करें, हमारी टीम आपके दस्तावेज़ सत्यापित कर रही है। इसमें आमतौर पर 24-48 घंटे लगते हैं।' },
  noBookingsToday:      { en: 'No bookings for today', hi: 'आज की कोई बुकिंग नहीं है' },
  getDirection:         { en: 'Get Direction',     hi: 'दिशा प्राप्त करें'    },
  mapPreview:           { en: 'Map Preview',       hi: 'मानचित्र पूर्वावलोकन' },
  nextUp:               { en: 'Next up',           hi: 'अगली बुकिंग'         },
  upcoming:             { en: 'Upcoming',          hi: 'आगामी'                },
  guests:               { en: 'guests',            hi: 'अतिथि'                },
  unavailable:          { en: 'Unavailable',       hi: 'अनुपलब्ध'             },
  phoneNotProvided:     { en: 'Phone number not provided for this booking', hi: 'इस बुकिंग में फ़ोन नंबर प्रदान नहीं किया गया' },
  phoneNotProvided2:    { en: 'Phone number not provided', hi: 'फ़ोन नंबर उपलब्ध नहीं है' },

  // ── Profile ───────────────────────────────────────────────────────────
  myProfile:            { en: 'My profile',           hi: 'मेरी प्रोफाइल'       },
  cityNotSet:           { en: 'City not set',          hi: 'शहर निर्धारित नहीं'  },
  earnings:             { en: 'Earnings',              hi: 'कमाई'                },
  expTags:              { en: 'Exp. Tags',             hi: 'अनुभव'               },
  accountDetail:        { en: 'Account detail',        hi: 'खाता विवरण'          },
  bankDetails:          { en: 'Bank details',          hi: 'बैंक विवरण'          },
  referFriend:          { en: 'Refer a friend & Earn', hi: 'मित्र को रेफर करें और कमाएं' },
  referBadge:           { en: 'Earn upto ₹5000',       hi: '₹5000 तक कमाएं'     },
  logout:               { en: 'Logout',                hi: 'लॉगआउट'             },
  logoutTitle:          { en: 'Logout',                hi: 'लॉगआउट'             },
  logoutConfirm:        { en: 'Are you sure you want to logout?', hi: 'क्या आप वाकई लॉगआउट करना चाहते हैं?' },
  cancel:               { en: 'Cancel',               hi: 'रद्द करें'            },
  ok:                   { en: 'OK',                   hi: 'ठीक है'               },
  error:                { en: 'Error',                hi: 'त्रुटि'               },
  failedLogout:         { en: 'Failed to logout. Please try again.', hi: 'लॉगआउट विफल हुआ। कृपया पुनः प्रयास करें।' },

  // ── My Bookings ───────────────────────────────────────────────────────
  myBookings:           { en: 'My Bookings',             hi: 'मेरी बुकिंग'          },
  filterAll:            { en: 'All',                     hi: 'सभी'                  },
  filterToday:          { en: 'Today',                   hi: 'आज'                   },
  filterUpcoming:       { en: 'Upcoming',                hi: 'आगामी'                },
  filterCompleted:      { en: 'Completed',               hi: 'पूर्ण'                 },
  filterActive:         { en: 'Active',                  hi: 'सक्रिय'               },
  nextUpToday:          { en: 'Next up today',           hi: 'आज की अगली बुकिंग'   },
  activeBooking:        { en: 'Active booking',          hi: 'सक्रिय बुकिंग'        },
  reachedLocation:      { en: 'Reached to Location',     hi: 'स्थान पर पहुंच गए'   },
  navigateLocation:     { en: 'Navigate location',       hi: 'स्थान पर नेविगेट करें' },
  noBookingsFound:      { en: 'No bookings found',       hi: 'कोई बुकिंग नहीं मिली' },
  hours:                { en: 'HOURS',                   hi: 'घंटे'                 },
  minutes:              { en: 'MINUTES',                 hi: 'मिनट'                 },
  seconds:              { en: 'SECONDS',                 hi: 'सेकंड'                },
  pause:                { en: 'Pause',                   hi: 'रोकें'                },
  resume:               { en: 'Resume',                  hi: 'जारी रखें'            },
  otpModalTitle:        { en: 'Share the confirmation OTP to the client', hi: 'ग्राहक को पुष्टि OTP साझा करें' },
  enterOtp:             { en: 'Enter OTP',               hi: 'OTP दर्ज करें'        },
  verifyOtp:            { en: 'Verify OTP',              hi: 'OTP सत्यापित करें'    },
  invalidOtp:           { en: 'Invalid OTP',             hi: 'अवैध OTP'             },
  invalidOtpMsg:        { en: 'Please enter a valid OTP provided by the client.', hi: 'कृपया ग्राहक द्वारा प्रदान किया गया मान्य OTP दर्ज करें।' },
  time:                 { en: 'Time',                    hi: 'समय'                  },
  locationLabel:        { en: 'Location',                hi: 'स्थान'                },

  // ── Earnings ──────────────────────────────────────────────────────────
  myEarnings:           { en: 'My Earnings',             hi: 'मेरी कमाई'            },
  totalEarned:          { en: 'Total earned',            hi: 'कुल कमाई'             },
  transactionsThisMonth:{ en: 'transactions this month', hi: 'इस महीने के लेनदेन'   },
  transactions:         { en: 'Transactions',            hi: 'लेनदेन'               },
  totalEarnedLabel:     { en: 'Total Earned',            hi: 'कुल कमाई'             },
  recentTransactions:   { en: 'Recent transactions',     hi: 'हाल के लेनदेन'        },
  noTransactions:       { en: 'No transactions yet',     hi: 'अभी तक कोई लेनदेन नहीं' },
} as const;

export type TranslationKey = keyof typeof translations;

export function getTranslation(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  return entry[lang] ?? entry['en'];
}

export default translations;
