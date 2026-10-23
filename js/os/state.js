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
      this.notify();
      return;
    }

    this.currentAdmNo = String(student.admNo);
    this.currentStudent = student;

    const storageKey = `${STUDENT_STORAGE_PREFIX}${this.currentAdmNo}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        this.studentState = JSON.parse(saved);
      } else {
        // Initialize clean state for this student
        this.studentState = getDefaultStudentData(this.currentAdmNo, student.name || 'Student');
        this.saveStudentState();
      }
    } catch (err) {
      console.error('Failed to read isolated student state:', err);
      this.studentState = getDefaultStudentData(this.currentAdmNo, student.name || 'Student');
    }

    this.notify();
  }

  saveStudentState() {
    if (!this.currentAdmNo) return;
    const storageKey = `${STUDENT_STORAGE_PREFIX}${this.currentAdmNo}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.studentState));
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
      currentUser: this.currentStudent
    };
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
}

export const stateStore = new OSState();

