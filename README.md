# Dawamu OS • Student Edition 🎓💻
### Kenya Science & Engineering Fair (KSEF 2027)

A complete, ultra-fast, modern browser-based and native desktop operating system environment designed specifically for Kenyan secondary school students. Inspired by ChromeOS and Windows 11 Fluent Material Design, it combines built-in offline educational tools, active domain filtering, parental/teacher controls, Focus Mode lockouts, bedtime curfew enforcement, and **EduGuard AI Academic Intelligence & Exam Proctoring**.

---

## 🌟 Key Features & Built-in Applications

- **🛡️ EduGuard AI Academic Intelligence & Exam Proctoring (NEW - KSEF 2027)**:
  - **AI Study Tutor**: Socratic interactive tutor for Kenyan KCSE subjects (Mathematics, Biology, Chemistry, Physics, Computer Studies) with step-by-step problem explanations and exam tips.
  - **Exam Proctor Shield**: Anti-cheat proctoring engine with window focus tracking, tab-switch penalties, clipboard protection, audio alert synthesis, and real-time Candidate Integrity Index (0–100%).
  - **Adaptive Diagnostic Engine**: Form 1 to Form 4 competency diagnostics with automatic cognitive roadblock detection and personalized 7-day retention recovery roadmaps.
  - **Knowledge Map & Memory Decay**: Visual subject mastery ring and Ebbinghaus forgetting curve modeling for spaced repetition.
  - **Notes AI Analyzer**: Real-time KCSE syllabus alignment evaluator that detects missing exam points and produces revision flashcards.
  - **Teacher / Proctor Command Portal**: Live classroom exam monitoring, candidate roster status, and incident audit log.
  - **Hybrid Service Connector**: Seamless local offline engine with optional live sync to EduGuard's Python FastAPI backend (Port 8000) and Flutter Web (Port 3000).

- **📚 8-4-4 Form 3 & Form 4 Coursebook Library**:
  - Full offline KCSE curriculum coursebooks for Form 3 and Form 4 in Mathematics, Biology, Chemistry, Physics, History, Geography, Business Studies, English Literature (*Fathers of Nations*, *The Samaritan*), and Kiswahili (*Bembea ya Maisha*).

- **🌐 Dual-Mode Web Browsers**:
  - **School Mode Safe Browser**: Live web browsing with SafeSearch and automated domain restriction engine blocking distractions and non-educational portals.
  - **Offline Web Encyclopedia**: Fully local curated offline knowledgebase spanning science, mathematics, geography, world history, and computer science with zero network connectivity required.

- **💼 Dawamu Office Productivity Suite**:
  - **Dawamu Word**: Rich document editor supporting formatting, headings, and `.docx` download/export.
  - **Dawamu Sheets**: Spreadsheet processor with formulas, live calculations, and gradebook tables.
  - **Dawamu Database**: Relational student, course, and library records database with CSV export.
  - **Docs & Homework Notes**: Auto-saving note-taking pad with quick export.

- **🧮 STEM & Study Tools**:
  - **Scientific Calculator**: Full trigonometry, logarithms, roots, exponents, memory functions, and calculation history.
  - **Focus Study Timer**: Pomodoro intervals with built-in Web Audio ambient sound synthesizer (Rain, Ocean Waves, White Noise).
  - **Classroom Assignment Dashboard**: Subject tracking, deadlines, priority tags, and completion percentage ring.

- **🛡️ Teacher & Parent Controls (PIN Protected)**:
  - Default Admin PIN: `1234`.
  - Master toggles for Browser access, SafeSearch, Focus Mode lockout, and App Install lock.
  - Custom URL blocklist manager and night curfew bedtime lockdown scheduler.

- **💾 System & Hardware Installer**:
  - **This PC (File Explorer)**: Virtual file system with persistent downloads and documents.
  - **Hardware Disk Installer Wizard**: Guides installation to physical PC disks/partitions and building live bootable USB drives.

---

## 🚀 Getting Started

### 1. Web Application Mode (Browser)
```bash
git clone https://github.com/gichuigameboy/ksef2027.git
cd ksef2027
python -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.

---

### 2. Standalone Desktop OS Application (Electron)
```bash
npm install
npm start
```

For **School Kiosk Fullscreen Lockdown Mode**:
```bash
npm run kiosk
```

Or using the executable launcher scripts:
- **Windows**: `start-desktop.bat`
- **Linux / macOS**: `./start-desktop.sh`

---

## 📂 Project Structure

```
ksef2027/
├── package.json                   # Electron app manifest & npm scripts
├── main.js                       # Electron main process (Hardware acceleration, IPC, storage)
├── preload.js                    # Context-isolated security bridge API
├── start-desktop.sh              # Linux/macOS executable desktop launcher
├── start-desktop.bat             # Windows executable desktop launcher
├── index.html                    # Main OS UI layout container & desktop icons
├── css/
│   ├── style.css                 # Dawamu OS Material Design 3 stylesheet
│   └── fa/                       # Local embedded FontAwesome icons & fonts
└── js/
    ├── app.js                    # Master app bootstrap & student authentication
    ├── os/                       # Window manager, taskbar shelf, start launcher, quick settings
    └── apps/
        ├── eduguard.js           # EduGuard AI Learning Intelligence & Exam Proctor Guard
        ├── books844.js           # 8-4-4 Form 3 & Form 4 Coursebook Library
        ├── browser.js            # School Web Browser with safe filtering
        ├── offlineBrowser.js     # Offline Web Encyclopedia & Library
        ├── offlineContent.js     # Curated KCSE curriculum knowledgebase
        ├── word.js               # Dawamu Word document editor
        ├── spreadsheet.js        # Dawamu Sheets spreadsheet processor
        ├── database.js           # School Database records manager
        ├── classroom.js          # Assignment & study tracker
        ├── docs.js               # Homework notes editor
        ├── calculator.js         # Dual-mode scientific calculator
        ├── focusTimer.js         # Pomodoro study timer & ambient audio
        ├── adminPanel.js         # PIN-protected teacher & parental controls
        ├── settings.js           # System preferences & customization
        └── installer.js          # OS disk installation wizard
```

---

## 📜 License
MIT License
