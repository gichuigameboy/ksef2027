/**
 * ChromeOS Student Edition - System State Store
 */

const STORAGE_KEY = 'cros_student_os_state';

const DEFAULT_STATE = {
  adminPin: '1234',
  restrictions: {
    browserEnabled: true,
    safeSearch: true,
    focusMode: false,
    appInstallLock: true,
    curfewEnabled: true,
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
    blockedKeywords: ['games', 'free games', 'play games', 'unblocked', 'social media', 'hack', 'cheat']
  },
  assignments: [
    {
      id: 'asg-1',
      title: 'Fraction Multiplication & Division',
      subject: 'Math',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      priority: 'high',
      completed: false,
      notes: 'Complete odd numbered problems 1-25 on page 142.'
    },
    {
      id: 'asg-2',
      title: 'Solar System Planetary Orbit Report',
      subject: 'Science',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days
      priority: 'medium',
      completed: true,
      notes: 'Include diagram of Kepler laws and orbital distances.'
    },
    {
      id: 'asg-3',
      title: 'Ancient Nile Civilization Essay',
      subject: 'History',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days
      priority: 'high',
      completed: false,
      notes: 'Write 500 words comparing Lower and Upper Egypt unification.'
    },
    {
      id: 'asg-4',
      title: 'To Kill a Mockingbird - Ch. 5 Analysis',
      subject: 'English',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days
      priority: 'low',
      completed: false,
      notes: 'Summarize character dynamics between Atticus and Scout.'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'Science Project Brainstorming',
      content: '<h2>Solar Energy Harvesting Project</h2><p>Investigating how mini photovoltaic cells generate clean electricity in different weather conditions.</p><ul><li>Test Sunny Day efficiency</li><li>Test Overcast efficiency</li><li>Measure voltage output with multimeter</li></ul>',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'doc-2',
      title: 'Math Study Formulas',
      content: '<h2>Algebra & Geometry Quick Notes</h2><p><b>Pythagorean Theorem:</b> a² + b² = c²</p><p><b>Quadratic Formula:</b> x = (-b ± √(b² - 4ac)) / (2a)</p><p><b>Area of Circle:</b> A = πr²</p>',
      updatedAt: new Date().toISOString()
    }
  ],
  systemSettings: {
    wifiConnected: true,
    bluetoothConnected: false,
    nightLight: false,
    volume: 80,
    brightness: 90,
    theme: 'dark'
  },
  focusTimerStats: {
    sessionsCompleted: 4,
    totalMinutes: 100
  }
};

class OSState {
  constructor() {
    this.state = this.loadState();
    this.listeners = new Set();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults in case of missing keys
        return {
          ...DEFAULT_STATE,
          ...parsed,
          restrictions: { ...DEFAULT_STATE.restrictions, ...(parsed.restrictions || {}) },
          systemSettings: { ...DEFAULT_STATE.systemSettings, ...(parsed.systemSettings || {}) }
        };
      }
    } catch (e) {
      console.warn('Failed to load OS state from localStorage:', e);
    }
    return DEFAULT_STATE;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save OS state to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveState();
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState() {
    return this.state;
  }

  // Restrictions Mutators
  updateRestrictions(updates) {
    this.state.restrictions = { ...this.state.restrictions, ...updates };
    this.notify();
  }

  verifyAdminPin(pin) {
    return this.state.adminPin === pin;
  }

  setAdminPin(newPin) {
    this.state.adminPin = newPin;
    this.notify();
  }

  // Assignments Mutators
  addAssignment(assignment) {
    this.state.assignments.unshift({
      id: 'asg-' + Date.now(),
      completed: false,
      ...assignment
    });
    this.notify();
  }

  toggleAssignmentCompleted(id) {
    const item = this.state.assignments.find((a) => a.id === id);
    if (item) {
      item.completed = !item.completed;
      this.notify();
    }
  }

  deleteAssignment(id) {
    this.state.assignments = this.state.assignments.filter((a) => a.id !== id);
    this.notify();
  }

  // Documents Mutators
  saveDocument(id, title, content) {
    let doc = this.state.documents.find((d) => d.id === id);
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
      this.state.documents.unshift(doc);
    }
    this.notify();
    return doc;
  }

  deleteDocument(id) {
    this.state.documents = this.state.documents.filter((d) => d.id !== id);
    this.notify();
  }

  // Focus Stats Mutator
  addFocusSession(minutes) {
    this.state.focusTimerStats.sessionsCompleted += 1;
    this.state.focusTimerStats.totalMinutes += minutes;
    this.notify();
  }

  // System Settings Mutator
  updateSettings(updates) {
    this.state.systemSettings = { ...this.state.systemSettings, ...updates };
    this.notify();
  }
}

export const stateStore = new OSState();
