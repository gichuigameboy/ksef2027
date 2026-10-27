/**
 * Dawamu OS - System State Store
 *
 * Implements:
 * - Scoped student data isolation per Admission Number (prevents data leakage).
 * - Salted hash verification for Admin/Parental control PIN (no plaintext PIN in storage).
 * - Live network event synchronization (reflects real online/offline status).
 * - Isolated persistent storage for student assignments, documents, and study metrics.
 */

const GLOBAL_POLICY_KEY = 'dawamu_os_policy_v2';
const STUDENT_STORAGE_PREFIX = 'dawamu_student_state_';
const STUDENT_PERSONALIZATION_PREFIX = 'dawamu_personalization_';

export const WALLPAPER_PRESETS = [
  {
    id: 'emerald',
    name: 'macOS Tahoe Liquid Emerald',
    color: '#10b981',
    bgCss: 'radial-gradient(ellipse 85% 65% at 22% 18%, rgba(16, 185, 129, 0.42) 0%, transparent 62%), radial-gradient(ellipse 75% 60% at 82% 28%, rgba(14, 165, 233, 0.36) 0%, transparent 60%), radial-gradient(ellipse 80% 65% at 65% 88%, rgba(99, 102, 241, 0.34) 0%, transparent 64%), radial-gradient(ellipse 60% 50% at 18% 82%, rgba(20, 184, 166, 0.28) 0%, transparent 58%), linear-gradient(135deg, #030914 0%, #06182c 48%, #04101f 100%)'
  },
  {
    id: 'deep_blue',
    name: 'macOS Sequoia Liquid Sapphire',
    color: '#3b82f6',
    bgCss: 'radial-gradient(ellipse 85% 65% at 25% 15%, rgba(59, 130, 246, 0.46) 0%, transparent 62%), radial-gradient(ellipse 75% 60% at 82% 72%, rgba(139, 92, 246, 0.38) 0%, transparent 62%), radial-gradient(ellipse 65% 55% at 75% 18%, rgba(6, 182, 212, 0.32) 0%, transparent 58%), linear-gradient(135deg, #020617 0%, #0a1936 50%, #050b1c 100%)'
  },
  {
    id: 'midnight',
    name: 'macOS Sonoma Liquid Amethyst',
    color: '#8b5cf6',
    bgCss: 'radial-gradient(ellipse 85% 65% at 30% 15%, rgba(139, 92, 246, 0.42) 0%, transparent 62%), radial-gradient(ellipse 70% 60% at 80% 75%, rgba(236, 72, 153, 0.30) 0%, transparent 60%), radial-gradient(ellipse 65% 55% at 18% 80%, rgba(59, 130, 246, 0.28) 0%, transparent 60%), linear-gradient(135deg, #060412 0%, #130b29 52%, #070510 100%)'
  },
  {
    id: 'sunset',
    name: 'Savannah Liquid Horizon',
    color: '#f59e0b',
    bgCss: 'radial-gradient(ellipse 85% 60% at 35% 15%, rgba(245, 158, 11, 0.42) 0%, transparent 62%), radial-gradient(ellipse 75% 60% at 82% 68%, rgba(244, 63, 94, 0.35) 0%, transparent 62%), radial-gradient(ellipse 65% 55% at 15% 82%, rgba(139, 92, 246, 0.28) 0%, transparent 58%), linear-gradient(135deg, #140509 0%, #1f0c18 50%, #0b0612 100%)'
  },
  {
    id: 'slate',
    name: 'macOS Pro Space Titanium',
    color: '#64748b',
    bgCss: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(148, 163, 184, 0.25) 0%, transparent 65%), radial-gradient(ellipse 70% 55% at 85% 80%, rgba(56, 189, 248, 0.18) 0%, transparent 60%), linear-gradient(135deg, #090d16 0%, #162032 50%, #0b111e 100%)'
  }
];

export const DEFAULT_PERSONALIZATION = {
  wallpaperId: 'emerald',
  customWallpaperDataUrl: null,
  customWallpaperName: null,
  wallpaperFit: 'cover', // 'cover' | 'contain' | 'center'
  wallpaperDim: 20,      // 0 to 70 (%)
  accentHex: '#10b981',
  themeMode: 'dark'
};

// Simple synchronous salted hash for local parental demo PIN (avoids plaintext localStorage exposure)
function hashAdminPin(pin) {
  if (!pin) return '';
  const salted = 'dawamu_ksef2027_sec_' + String(pin);
  let hash = 0x811c9dc5;
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return ('0000000' + (hash >>> 0).toString(16)).slice(-8);
}

const DEFAULT_GLOBAL_RESTRICTIONS = {
  // Salted hash of demo PIN '1234'
  adminPinHash: hashAdminPin('1234'),
  restrictions: {
    browserEnabled: true,
    safeSearch: true,
    focusMode: false,
    appInstallLock: true,
    curfewEnabled: false, // Default to false to avoid unexpected lockout during school hours
    curfewStart: '21:00', // 9:00 PM
    curfewEnd: '07:00',   // 7:00 AM
    blockedDomains: [
      'facebook.com',
      'instagram.com',
      'tiktok.com',
      'roblox.com',
      'fortnite.com',
      'discord.com',
      'twitch.tv',
      'twitter.com',
      'x.com',
      'reddit.com',
      'poki.com',
      'coolmathgames.com'
    ],
    whitelistedDomains: [
      'wikipedia.org',
      'khanacademy.org',
      'nasa.gov',
      'nationalgeographic.com',
      'mathsisfun.com',
      'duolingo.com',
      'scratch.mit.edu',
      'gutenberg.org',
      'quizlet.com'
    ],
    blockedKeywords: ['games', 'free games', 'play games', 'unblocked', 'social media', 'cheat', 'gambling']
  },
  systemSettings: {
    wifiConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    bluetoothConnected: false,
    nightLight: false,
    volume: 80,
    brightness: 90,
    theme: 'emerald'
  }
};

function getDefaultVFS(admNo = '1001', name = 'Student') {
  return {
    folderMeta: {
      desktop:    { key: 'desktop',    name: 'Desktop',                    icon: 'fas fa-desktop text-blue-400',       parent: 'c_drive' },
      downloads:  { key: 'downloads',  name: 'Downloads',                  icon: 'fas fa-arrow-down text-emerald-400', parent: 'c_drive' },
      documents:  { key: 'documents',  name: 'Documents',                  icon: 'fas fa-folder text-amber-400',       parent: 'c_drive' },
      books844:   { key: 'books844',   name: '8-4-4 Coursebooks (F3 & F4)',icon: 'fas fa-book-open text-emerald-400',  parent: 'documents' },
      schoolwork: { key: 'schoolwork', name: 'School Work',                icon: 'fas fa-graduation-cap text-sky-400', parent: 'documents' },
      pictures:   { key: 'pictures',   name: 'Pictures',                   icon: 'fas fa-images text-purple-400',      parent: 'c_drive' },
      c_drive:    { key: 'c_drive',    name: 'Local Disk (C:)',            icon: 'fas fa-hdd text-slate-300',          parent: 'c_drive' },
      cloud:      { key: 'cloud',      name: 'Dawamu Cloud Storage (D:)',  icon: 'fas fa-cloud text-emerald-400',      parent: 'c_drive' }
    },
    folders: {
      books844: [
        { name: 'KLB Secondary Mathematics Form 3.docx', size: '42 KB', date: 'Official KICD', icon: 'fas fa-file-word text-blue-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/mathematics' },
        { name: 'KLB Secondary Biology Form 3.docx', size: '38 KB', date: 'Official KICD', icon: 'fas fa-file-word text-emerald-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/biology' },
        { name: 'KLB Secondary Chemistry Form 3.docx', size: '45 KB', date: 'Official KICD', icon: 'fas fa-file-word text-amber-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/chemistry' },
        { name: 'KLB Secondary Physics Form 3.docx', size: '40 KB', date: 'Official KICD', icon: 'fas fa-file-word text-purple-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/physics' },
        { name: 'KLB History & Government Form 3.docx', size: '35 KB', date: 'Official KICD', icon: 'fas fa-file-word text-rose-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/history' },
        { name: 'KLB Geography Form 3.docx', size: '36 KB', date: 'Official KICD', icon: 'fas fa-file-word text-teal-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/geography' },
        { name: 'KLB Business Studies Form 3.docx', size: '34 KB', date: 'Official KICD', icon: 'fas fa-file-word text-cyan-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form3/business' },
        { name: 'KLB Secondary Mathematics Form 4.docx', size: '48 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-blue-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/mathematics' },
        { name: 'KLB Secondary Biology Form 4.docx', size: '41 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-emerald-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/biology' },
        { name: 'KLB Secondary Chemistry Form 4.docx', size: '46 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-amber-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/chemistry' },
        { name: 'KLB Secondary Physics Form 4.docx', size: '44 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-purple-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/physics' },
        { name: 'KLB History & Government Form 4.docx', size: '39 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-rose-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/history' },
        { name: 'KLB Geography Form 4.docx', size: '37 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-teal-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/geography' },
        { name: 'KLB Business Studies Form 4.docx', size: '35 KB', date: 'KCSE Candidate', icon: 'fas fa-file-word text-cyan-500', type: 'doc', targetUrl: 'https://curriculum.dawamu.school/844/form4/business' },
        { name: 'Fathers of Nations (Paul B. Vitta).docx', size: '52 KB', date: 'Compulsory Novel', icon: 'fas fa-book text-purple-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/fathers-of-nations' },
        { name: 'The Samaritan (John Lara).docx', size: '49 KB', date: 'Compulsory Play', icon: 'fas fa-theater-masks text-fuchsia-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/the-samaritan' },
        { name: 'Bembea ya Maisha (Timothy Arege).docx', size: '43 KB', date: 'Tamthilia Teule', icon: 'fas fa-feather-alt text-rose-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/bembea-ya-maisha' },
        { name: 'Chozi la Heri (Assumpta K. Matei).docx', size: '47 KB', date: 'Riwaya Teule', icon: 'fas fa-book-reader text-teal-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/chozi-la-heri' },
        { name: 'Mapambazuko ya Machweo Hadithi Nyingine.docx', size: '40 KB', date: 'Hadithi Fupi', icon: 'fas fa-scroll text-orange-400', type: 'doc', targetUrl: 'https://library.dawamu.school/setbooks/mapambazuko-ya-machweo' }
      ],
      documents: [
        {
          id: 'file-bio-notes',
          name: 'Biology Photosynthesis Notes.docx',
          size: '24 KB',
          date: 'Today, 10:14 AM',
          icon: 'fas fa-file-word text-blue-500',
          type: 'doc',
          content: `<h1 style="color:#185abd;font-size:22px;font-weight:800;">Biology Study Notes: Photosynthesis</h1><p><b>Student:</b> ${name} (${admNo})</p><hr><p>Photosynthesis is the biochemical process by which green plants synthesize organic compounds (glucose) from carbon dioxide and water in the presence of sunlight and chlorophyll.</p><h2>1. Light-Dependent Stage</h2><p>Occurs in the <b>grana (thylakoid membranes)</b> of chloroplasts. Photolysis splits water molecules into hydrogen ions and oxygen gas using trapped light energy.</p><h2>2. Carbon Fixation (Dark Stage)</h2><p>Takes place in the <b>stroma</b> where carbon dioxide combines with hydrogen atoms using ATP energy to form simple sugars.</p>`
        },
        {
          id: 'file-math-pdf',
          name: 'Mathematics Homework - Quadratics.pdf',
          size: '142 KB',
          date: 'Yesterday',
          icon: 'fas fa-file-pdf text-red-500',
          type: 'pdf'
        },
        {
          id: 'file-history-essay',
          name: 'History of Kenya Essay.docx',
          size: '36 KB',
          date: 'Sep 24, 2026',
          icon: 'fas fa-file-word text-blue-500',
          type: 'doc',
          content: `<h1 style="color:#185abd;font-size:22px;font-weight:800;">The Constitutional Evolution of Kenya (1963 – 2010)</h1><p><b>Author:</b> ${name} (${admNo})</p><hr><p>Kenya's constitutional journey reflects the nation's struggle for self-determination, accountability, and devolved governance culminating in the 2010 Constitution.</p>`
        },
        {
          id: 'file-physics-lab',
          name: 'Physics Newton Laws Lab.xlsx',
          size: '18 KB',
          date: 'Sep 22, 2026',
          icon: 'fas fa-file-excel text-emerald-500',
          type: 'excel',
          content: `Trial,Mass (kg),Force (N),Acceleration (m/s2)\n1,0.5,2.0,4.0\n2,1.0,4.0,4.0\n3,1.5,6.0,4.0\n4,2.0,8.0,4.0\nAverage,=AVERAGE(B2:B5),=AVERAGE(C2:C5),=AVERAGE(D2:D5)`
        },
        {
          id: 'file-geo-map',
          name: 'Geography Map of Africa.png',
          size: '1.2 MB',
          date: 'Sep 20, 2026',
          icon: 'fas fa-file-image text-purple-400',
          type: 'image'
        }
      ],
      schoolwork: [
        { name: 'Form 1 Term 3 Timetable.pdf', size: '88 KB', date: 'Sep 18, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' },
        {
          id: 'file-chem-notes',
          name: 'Chemistry Periodic Table Notes.docx',
          size: '31 KB',
          date: 'Sep 16, 2026',
          icon: 'fas fa-file-word text-blue-500',
          type: 'doc',
          content: `<h1 style="color:#185abd;font-size:22px;font-weight:800;">Chemistry Revision: Periodic Table Trends</h1><p>Group I (Alkali Metals), Group II (Alkaline Earth Metals), Group VII (Halogens), and Group VIII/0 (Noble Gases).</p>`
        },
        { name: 'English Literature Study Guide.pdf', size: '310 KB', date: 'Sep 14, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' }
      ],
      downloads: [
        { name: 'Dawamu_Curriculum_Guide_2026.pdf', size: '2.4 MB', date: 'Today, 8:30 AM', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' },
        { name: 'Mars_Perseverance_Diagram.jpg', size: '850 KB', date: 'Sep 23, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' }
      ],
      pictures: [
        { name: 'Dawamu_School_Campus.jpg', size: '3.1 MB', date: 'Aug 12, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' },
        { name: 'Science_Lab_Project.jpg', size: '2.8 MB', date: 'Aug 20, 2026', icon: 'fas fa-file-image text-purple-400', type: 'image' }
      ],
      desktop: [
        { name: 'Homework Notes', size: 'Folder', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'schoolwork' },
        { name: 'Student Schedule.pdf', size: '95 KB', date: 'Sep 28, 2026', icon: 'fas fa-file-pdf text-red-500', type: 'pdf' }
      ],
      c_drive: [
        { name: 'Documents', size: 'Folder', icon: 'fas fa-folder text-amber-400', type: 'folder', target: 'documents' },
        { name: 'Downloads', size: 'Folder', icon: 'fas fa-arrow-down text-emerald-400', type: 'folder', target: 'downloads' },
        { name: 'Desktop', size: 'Folder', icon: 'fas fa-desktop text-blue-400', type: 'folder', target: 'desktop' },
        { name: 'School Work', size: 'Folder', icon: 'fas fa-graduation-cap text-sky-400', type: 'folder', target: 'schoolwork' },
        { name: 'Pictures', size: 'Folder', icon: 'fas fa-images text-purple-400', type: 'folder', target: 'pictures' },
        { name: '8-4-4 Coursebooks', size: 'Folder', icon: 'fas fa-book-open text-emerald-400', type: 'folder', target: 'books844' }
      ],
      cloud: [
        { name: 'Student Shared Drive', size: 'Folder', icon: 'fas fa-folder text-emerald-400', type: 'folder', target: 'schoolwork' },
        { name: 'Teacher Assignments Drop', size: 'Folder', icon: 'fas fa-folder text-emerald-400', type: 'folder', target: 'schoolwork' }
      ]
    }
  };
}

export function inferVFSFileIconAndType(fileName = '', explicitType = '') {
  const lower = String(fileName).toLowerCase();
  if (explicitType === 'folder') {
    return { type: 'folder', icon: 'fas fa-folder text-amber-400' };
  }
  if (explicitType === 'db' || lower.endsWith('.db') || lower.endsWith('.db.json') || lower.endsWith('.sql')) {
    return { type: 'db', icon: 'fas fa-database text-sky-400' };
  }
  if (explicitType === 'excel' || lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    return { type: 'excel', icon: 'fas fa-file-excel text-emerald-500' };
  }
  if (explicitType === 'doc' || lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.html')) {
    return { type: 'doc', icon: 'fas fa-file-word text-blue-500' };
  }
  if (explicitType === 'pdf' || lower.endsWith('.pdf')) {
    return { type: 'pdf', icon: 'fas fa-file-pdf text-red-500' };
  }
  if (explicitType === 'image' || /\.(png|jpe?g|gif|svg|webp)$/.test(lower)) {
    return { type: 'image', icon: 'fas fa-file-image text-purple-400' };
  }
  if (explicitType === 'txt' || lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.py')) {
    return { type: 'txt', icon: 'fas fa-file-alt text-amber-300' };
  }
  return { type: explicitType || 'doc', icon: 'fas fa-file-word text-blue-500' };
}

export function formatFileSize(bytes = 0) {
  if (!bytes || isNaN(bytes)) return '1 KB';
  if (bytes > 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  return Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

export function readDroppedFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }
    const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i.test(file.name);
    const isText = file.type?.startsWith('text/') || /\.(txt|md|csv|tsv|json|html|htm|xml|js|py|css|sql|sh|bat|log|env|yaml|yml)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result || '');
    };
    reader.onerror = () => {
      resolve('');
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else if (isText) {
      reader.readAsText(file);
    } else {
      if (/\.(docx|xlsx|pdf|bin|dat|zip)$/i.test(file.name)) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  });
}


function getDefaultStudentData(admNo = '1001', name = 'Student') {
  return {
    assignments: [
      {
        id: 'asg-1',
        title: 'Quadratic Equations Practice',
        subject: 'Mathematics',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        priority: 'high',
        completed: false,
        notes: 'Solve exercises 1-10 on factorisation and completing the square.'
      },
      {
        id: 'asg-2',
        title: 'Cell Physiology - Osmosis Lab Report',
        subject: 'Biology',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        priority: 'medium',
        completed: true,
        notes: 'Observe plant tissue turgidity in hypertonic vs hypotonic solutions.'
      }
    ],
    documents: [
      {
        id: 'doc-1',
        title: `${name} - Study Revision Notes`,
        content: '<h2>KCSE Revision Portfolio</h2><p>Focused on KCSE Form 1 to Form 4 core subjects.</p>',
        updatedAt: new Date().toISOString()
      }
    ],
    focusTimerStats: {
      sessionsCompleted: 0,
      totalMinutes: 0
    },
    personalization: { ...DEFAULT_PERSONALIZATION },
    vfs: getDefaultVFS(admNo, name),
    appWorkspaces: {
      word: null,
      spreadsheet: null,
      database: null
    }
  };
}

class OSState {
  constructor() {
    this.currentAdmNo = null;
    this.currentStudent = null;
    this.listeners = new Set();

    this.policyState = this.loadPolicyState();
    this.studentState = getDefaultStudentData();

    // Listen to live browser online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateSettings({ wifiConnected: true });
      });
      window.addEventListener('offline', () => {
        this.updateSettings({ wifiConnected: false });
      });
    }
  }

  loadPolicyState() {
    try {
      const saved = localStorage.getItem(GLOBAL_POLICY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GLOBAL_RESTRICTIONS,
          ...parsed,
          restrictions: { ...DEFAULT_GLOBAL_RESTRICTIONS.restrictions, ...(parsed.restrictions || {}) },
          systemSettings: {
            ...DEFAULT_GLOBAL_RESTRICTIONS.systemSettings,
            ...(parsed.systemSettings || {}),
            wifiConnected: typeof navigator !== 'undefined' ? navigator.onLine : true
          }
        };
      }
    } catch (e) {
      console.warn('Failed to load global policy from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_GLOBAL_RESTRICTIONS));
  }

  savePolicyState() {
    try {
      localStorage.setItem(GLOBAL_POLICY_KEY, JSON.stringify(this.policyState));
    } catch (e) {
      console.error('Failed to save policy to localStorage:', e);
    }
  }

  /**
   * Initializes and loads student-specific isolated storage
   */
  setActiveUser(student) {
    if (!student || !student.admNo) {
      this.currentAdmNo = null;
      this.currentStudent = null;
      this.studentState = getDefaultStudentData();
      this.applyPersonalization(DEFAULT_PERSONALIZATION);
      this.notify();
      return;
    }

    this.currentAdmNo = String(student.admNo);
    this.currentStudent = student;

    const storageKey = `${STUDENT_STORAGE_PREFIX}${this.currentAdmNo}`;
    const persKey = `${STUDENT_PERSONALIZATION_PREFIX}${this.currentAdmNo}`;
    try {
      const saved = localStorage.getItem(storageKey);
      const defaults = getDefaultStudentData(this.currentAdmNo, student.name || 'Student');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.studentState = {
          ...defaults,
          ...parsed,
          personalization: {
            ...DEFAULT_PERSONALIZATION,
            ...(parsed.personalization || {})
          },
          vfs: parsed.vfs && parsed.vfs.folders
            ? {
                folderMeta: { ...defaults.vfs.folderMeta, ...(parsed.vfs.folderMeta || {}) },
                folders: { ...defaults.vfs.folders, ...(parsed.vfs.folders || {}) }
              }
            : defaults.vfs,
          appWorkspaces: {
            ...defaults.appWorkspaces,
            ...(parsed.appWorkspaces || {})
          }
        };
      } else {
        // Initialize clean state for this student
        this.studentState = defaults;
        this.saveStudentState();
      }

      // Check dedicated per-user personalization store as well
      const savedPers = localStorage.getItem(persKey);
      if (savedPers) {
        const parsedPers = JSON.parse(savedPers);
        this.studentState.personalization = {
          ...DEFAULT_PERSONALIZATION,
          ...this.studentState.personalization,
          ...parsedPers
        };
      }
    } catch (err) {
      console.error('Failed to read isolated student state:', err);
      this.studentState = getDefaultStudentData(this.currentAdmNo, student.name || 'Student');
    }

    this.applyPersonalization(this.studentState.personalization);
    this.notify();
  }

  saveStudentState() {
    if (!this.currentAdmNo) return;
    const storageKey = `${STUDENT_STORAGE_PREFIX}${this.currentAdmNo}`;
    const persKey = `${STUDENT_PERSONALIZATION_PREFIX}${this.currentAdmNo}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.studentState));
      if (this.studentState.personalization) {
        localStorage.setItem(persKey, JSON.stringify(this.studentState.personalization));
      }
    } catch (e) {
      console.error('Failed to save isolated student data:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.savePolicyState();
    this.saveStudentState();
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Error in stateStore listener:', err);
      }
    });
  }

  /**
   * Assembles unified state view
   */
  getState() {
    return {
      adminPinHash: this.policyState.adminPinHash,
      restrictions: this.policyState.restrictions,
      systemSettings: this.policyState.systemSettings,
      assignments: this.studentState.assignments || [],
      documents: this.studentState.documents || [],
      focusTimerStats: this.studentState.focusTimerStats || { sessionsCompleted: 0, totalMinutes: 0 },
      personalization: this.getPersonalization(),
      currentUser: this.currentStudent
    };
  }

  getPersonalization() {
    return {
      ...DEFAULT_PERSONALIZATION,
      ...(this.studentState.personalization || {})
    };
  }

  updatePersonalization(updates) {
    this.studentState.personalization = {
      ...this.getPersonalization(),
      ...updates
    };
    this.applyPersonalization(this.studentState.personalization);
    this.notify();
    return this.studentState.personalization;
  }

  applyPersonalization(config = null) {
    if (typeof document === 'undefined') return;
    const pers = config || this.getPersonalization();
    const rootStyle = document.documentElement.style;
    const desktopEl = document.getElementById('desktop');

    rootStyle.setProperty('--primary', pers.accentHex || '#10b981');

    if (pers.wallpaperId === 'custom' && pers.customWallpaperDataUrl) {
      const dim = typeof pers.wallpaperDim === 'number' ? Math.max(0, Math.min(80, pers.wallpaperDim)) / 100 : 0.2;
      const fit = pers.wallpaperFit || 'cover';
      const sizeValue = fit === 'contain' ? 'contain' : (fit === 'center' ? 'auto' : 'cover');
      const safeUrl = String(pers.customWallpaperDataUrl).replace(/"/g, '\\"');
      const bgCss = dim > 0
        ? `linear-gradient(rgba(2, 6, 23, ${dim}), rgba(2, 6, 23, ${Math.min(0.85, dim + 0.1)})), url("${safeUrl}") center / ${sizeValue} no-repeat fixed, #030712`
        : `url("${safeUrl}") center / ${sizeValue} no-repeat fixed, #030712`;
      rootStyle.setProperty('--desktop-bg', bgCss);
      if (desktopEl) {
        desktopEl.style.background = bgCss;
        desktopEl.dataset.wallpaperId = 'custom';
      }
    } else {
      const wp = WALLPAPER_PRESETS.find(w => w.id === pers.wallpaperId) || WALLPAPER_PRESETS[0];
      rootStyle.setProperty('--desktop-bg', wp.bgCss);
      if (desktopEl) {
        desktopEl.style.background = wp.bgCss;
        desktopEl.dataset.wallpaperId = wp.id;
      }
    }

    this.applyDisplaySettings();
  }

  applyDisplaySettings() {
    if (typeof document === 'undefined') return;
    const settings = this.policyState?.systemSettings || DEFAULT_GLOBAL_RESTRICTIONS.systemSettings;
    const bright = typeof settings.brightness === 'number' ? Math.max(20, Math.min(100, settings.brightness)) : 90;
    const night = Boolean(settings.nightLight);

    document.documentElement.style.setProperty('--desktop-brightness', ${bright}%);
    const desktopEl = document.getElementById('desktop');
    if (desktopEl) {
      desktopEl.style.removeProperty('filter');
      desktopEl.classList.toggle('night-light', night);
    }
    document.body?.classList.toggle('sepia', night);
  }

  // Restrictions Mutators
  updateRestrictions(updates) {
    this.policyState.restrictions = { ...this.policyState.restrictions, ...updates };
    this.notify();
  }

  /**
   * Verified PIN check against salted hash
   */
  verifyAdminPin(pin) {
    if (!pin) return false;
    const inputHash = hashAdminPin(pin);
    return inputHash === this.policyState.adminPinHash;
  }

  setAdminPin(newPin) {
    if (!newPin || String(newPin).length < 4) return false;
    this.policyState.adminPinHash = hashAdminPin(newPin);
    this.notify();
    return true;
  }

  // Assignments Mutators (Isolated to Active Student)
  addAssignment(assignment) {
    this.studentState.assignments.unshift({
      id: 'asg-' + Date.now(),
      completed: false,
      ...assignment
    });
    this.notify();
  }

  toggleAssignmentCompleted(id) {
    const item = this.studentState.assignments.find((a) => a.id === id);
    if (item) {
      item.completed = !item.completed;
      this.notify();
    }
  }

  deleteAssignment(id) {
    this.studentState.assignments = this.studentState.assignments.filter((a) => a.id !== id);
    this.notify();
  }

  // Documents Mutators (Isolated to Active Student)
  saveDocument(id, title, content) {
    let doc = this.studentState.documents.find((d) => d.id === id);
    if (doc) {
      doc.title = title;
      doc.content = content;
      doc.updatedAt = new Date().toISOString();
    } else {
      doc = {
        id: id || 'doc-' + Date.now(),
        title: title || 'Untitled Document',
        content: content || '',
        updatedAt: new Date().toISOString()
      };
      this.studentState.documents.unshift(doc);
    }
    this.notify();
    return doc;
  }

  deleteDocument(id) {
    this.studentState.documents = this.studentState.documents.filter((d) => d.id !== id);
    this.notify();
  }

  // Focus Stats Mutator (Isolated to Active Student)
  addFocusSession(minutes) {
    this.studentState.focusTimerStats.sessionsCompleted += 1;
    this.studentState.focusTimerStats.totalMinutes += minutes;
    this.notify();
  }

  // System Settings Mutator
  updateSettings(updates) {
    this.policyState.systemSettings = { ...this.policyState.systemSettings, ...updates };
    this.notify();
  }

  /* ─── PER-STUDENT APP WORKSPACES (Word, Sheets, Database) ─── */
  getAppWorkspace(appKey, fallback = null) {
    if (!this.studentState.appWorkspaces) {
      this.studentState.appWorkspaces = { word: null, spreadsheet: null, database: null };
    }
    const stored = this.studentState.appWorkspaces[appKey];
    return stored !== undefined && stored !== null ? stored : fallback;
  }

  saveAppWorkspace(appKey, data) {
    if (!this.studentState.appWorkspaces) {
      this.studentState.appWorkspaces = { word: null, spreadsheet: null, database: null };
    }
    this.studentState.appWorkspaces[appKey] = data;
    this.notify();
    return data;
  }

  /* ─── PER-STUDENT VIRTUAL FILE SYSTEM (VFS) ─── */
  getVFS() {
    if (!this.studentState.vfs || !this.studentState.vfs.folders) {
      const name = this.currentStudent?.name || 'Student';
      this.studentState.vfs = getDefaultVFS(this.currentAdmNo || '1001', name);
    }
    if (!this.studentState.vfs.folderMeta) {
      this.studentState.vfs.folderMeta = getDefaultVFS().folderMeta;
    }
    return this.studentState.vfs;
  }

  getFolderFiles(folderKey = 'documents') {
    const vfs = this.getVFS();
    if (!vfs.folders[folderKey]) {
      vfs.folders[folderKey] = [];
    }
    return vfs.folders[folderKey];
  }

  getFolderMeta(folderKey = 'documents') {
    const vfs = this.getVFS();
    return vfs.folderMeta[folderKey] || {
      key: folderKey,
      name: folderKey.replace(/_/g, ' '),
      icon: 'fas fa-folder text-amber-400',
      parent: 'documents'
    };
  }

  getAllFoldersList() {
    const vfs = this.getVFS();
    return Object.values(vfs.folderMeta);
  }

  dispatchVFSUpdate(detail = {}) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dawamu-vfs-updated', { detail }));
    }
  }

  /**
   * Saves or updates a file inside the student's Virtual File System folder
   * (e.g. 'documents', 'downloads', 'desktop', 'schoolwork', or a custom folder key).
   */
  saveFileToVFS(folderKey = 'documents', fileObj = {}) {
    const vfs = this.getVFS();
    const targetFolder = folderKey || 'documents';
    if (!vfs.folders[targetFolder]) {
      vfs.folders[targetFolder] = [];
    }

    const cleanName = (fileObj.name || 'Untitled Document.docx').trim();
    const { type, icon } = inferVFSFileIconAndType(cleanName, fileObj.type);
    const contentStr = typeof fileObj.content === 'string'
      ? fileObj.content
      : (fileObj.content ? JSON.stringify(fileObj.content) : '');
    const computedSize = fileObj.size || `${Math.max(1, Math.ceil((contentStr.length || 512) / 1024))} KB`;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const list = vfs.folders[targetFolder];
    const existingIdx = list.findIndex(f =>
      (fileObj.id && f.id === fileObj.id) ||
      f.name.toLowerCase() === cleanName.toLowerCase()
    );

    const savedEntry = {
      id: (existingIdx >= 0 && list[existingIdx].id) ? list[existingIdx].id : (fileObj.id || `vfs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
      name: cleanName,
      size: computedSize,
      date: `Saved ${nowLabel}`,
      updatedAt: new Date().toISOString(),
      icon: fileObj.icon || icon,
      type,
      folderKey: targetFolder,
      content: fileObj.content !== undefined ? fileObj.content : (existingIdx >= 0 ? list[existingIdx].content : ''),
      targetUrl: fileObj.targetUrl || (existingIdx >= 0 ? list[existingIdx].targetUrl : undefined),
      appSource: fileObj.appSource || (existingIdx >= 0 ? list[existingIdx].appSource : undefined)
    };

    if (existingIdx >= 0) {
      list[existingIdx] = savedEntry;
    } else {
      list.unshift(savedEntry);
    }

    this.notify();
    this.dispatchVFSUpdate({ action: 'save', folderKey: targetFolder, file: savedEntry });
    return savedEntry;
  }

  /**
   * Creates a real navigable subfolder inside parentFolderKey
   */
  createFolderInVFS(parentFolderKey = 'documents', folderName = 'New Folder') {
    const vfs = this.getVFS();
    const cleanName = (folderName || 'New Folder').trim();
    if (!vfs.folders[parentFolderKey]) {
      vfs.folders[parentFolderKey] = [];
    }

    const folderKey = `folder_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    vfs.folderMeta[folderKey] = {
      key: folderKey,
      name: cleanName,
      icon: 'fas fa-folder text-amber-400',
      parent: parentFolderKey,
      isCustom: true
    };
    vfs.folders[folderKey] = [];

    const folderEntry = {
      id: folderKey,
      name: cleanName,
      size: 'Folder',
      date: 'Just now',
      icon: 'fas fa-folder text-amber-400',
      type: 'folder',
      target: folderKey,
      folderKey: parentFolderKey
    };

    vfs.folders[parentFolderKey].unshift(folderEntry);
    this.notify();
    this.dispatchVFSUpdate({ action: 'mkdir', folderKey: parentFolderKey, folder: folderEntry });
    return folderEntry;
  }

  /**
   * Moves a file or folder from sourceFolderKey to targetFolderKey
   */
  moveItemInVFS(sourceFolderKey, targetFolderKey, itemName) {
    if (!sourceFolderKey || !targetFolderKey || sourceFolderKey === targetFolderKey) return false;
    const vfs = this.getVFS();
    const srcList = vfs.folders[sourceFolderKey];
    if (!srcList) return false;

    const idx = srcList.findIndex(f => f.name === itemName || f.id === itemName);
    if (idx === -1) return false;

    const item = srcList[idx];
    // Prevent moving a folder into itself
    if (item.type === 'folder' && item.target === targetFolderKey) {
      return false;
    }

    srcList.splice(idx, 1);
    if (!vfs.folders[targetFolderKey]) {
      vfs.folders[targetFolderKey] = [];
    }

    const movedItem = {
      ...item,
      folderKey: targetFolderKey,
      date: `Moved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    // Replace existing with same name in destination or unshift
    const destIdx = vfs.folders[targetFolderKey].findIndex(f => f.name.toLowerCase() === movedItem.name.toLowerCase());
    if (destIdx >= 0) {
      vfs.folders[targetFolderKey][destIdx] = movedItem;
    } else {
      vfs.folders[targetFolderKey].unshift(movedItem);
    }

    if (movedItem.type === 'folder' && movedItem.target && vfs.folderMeta[movedItem.target]) {
      vfs.folderMeta[movedItem.target].parent = targetFolderKey;
    }

    this.notify();
    this.dispatchVFSUpdate({ action: 'move', sourceFolderKey, targetFolderKey, item: movedItem });
    return true;
  }

  /**
   * Copies a file or folder into targetFolderKey
   */
  copyItemInVFS(sourceFolderKey, targetFolderKey, itemName) {
    const vfs = this.getVFS();
    const srcList = vfs.folders[sourceFolderKey];
    if (!srcList) return null;

    const item = srcList.find(f => f.name === itemName || f.id === itemName);
    if (!item) return null;

    if (!vfs.folders[targetFolderKey]) {
      vfs.folders[targetFolderKey] = [];
    }

    const destList = vfs.folders[targetFolderKey];
    let copyName = item.name;
    if (destList.some(f => f.name.toLowerCase() === copyName.toLowerCase())) {
      const dotIdx = copyName.lastIndexOf('.');
      copyName = dotIdx > 0
        ? `${copyName.slice(0, dotIdx)} (Copy)${copyName.slice(dotIdx)}`
        : `${copyName} (Copy)`;
    }

    const copiedItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: `vfs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: copyName,
      folderKey: targetFolderKey,
      date: 'Copied just now'
    };

    destList.unshift(copiedItem);
    this.notify();
    this.dispatchVFSUpdate({ action: 'copy', sourceFolderKey, targetFolderKey, item: copiedItem });
    return copiedItem;
  }

  /**
   * Renames a file or folder inside folderKey
   */
  renameItemInVFS(folderKey, oldName, newName) {
    const cleanNew = (newName || '').trim();
    if (!cleanNew) return false;
    const vfs = this.getVFS();
    const list = vfs.folders[folderKey];
    if (!list) return false;

    const item = list.find(f => f.name === oldName || f.id === oldName);
    if (!item) return false;

    item.name = cleanNew;
    if (item.type !== 'folder') {
      const { type, icon } = inferVFSFileIconAndType(cleanNew, item.type);
      item.type = type;
      item.icon = icon;
    } else if (item.target && vfs.folderMeta[item.target]) {
      vfs.folderMeta[item.target].name = cleanNew;
    }

    this.notify();
    this.dispatchVFSUpdate({ action: 'rename', folderKey, item });
    return true;
  }

  /**
   * Deletes a file or folder from folderKey
   */
  deleteItemInVFS(folderKey, itemName) {
    const vfs = this.getVFS();
    const list = vfs.folders[folderKey];
    if (!list) return false;

    const beforeLen = list.length;
    vfs.folders[folderKey] = list.filter(f => f.name !== itemName && f.id !== itemName);
    if (vfs.folders[folderKey].length === beforeLen) return false;

    this.notify();
    this.dispatchVFSUpdate({ action: 'delete', folderKey, itemName });
    return true;
  }
}

export const stateStore = new OSState();

