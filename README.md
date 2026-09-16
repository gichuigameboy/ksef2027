# ChromeOS Student Edition 🎓💻

A complete, modern browser-based and native desktop operating system environment designed specifically for K-12 school students. Inspired by ChromeOS and Material Design 3, it combines built-in educational tools with active domain filtering, parental/teacher controls, Focus Mode lockouts, and bedtime curfew enforcement.

---

## 🌟 Key Features & Built-in Apps

- **🎨 ChromeOS Desktop Shell & Window Manager**:
  - **Everything Button Launcher**: Instant app search grid.
  - **Status Tray**: Real-time clock, Wi-Fi status, battery percentage, and protection badges.
  - **Quick Settings Popover**: Volume, brightness, night light, Wi-Fi toggles, and OS shutdown/kiosk triggers.
  - **Window Manager**: Draggable, minimizable, maximizable, and closable app windows with active z-index stacking.

- **🌐 School Mode Web Browser**:
  - Live `<iframe>` web page rendering (Wikipedia, NASA, Khan Academy, Duolingo, Math Is Fun, Project Gutenberg).
  - Live SafeSearch integration.
  - **Domain Restriction Engine**: Blocks social media, gaming, and non-educational domains (`roblox.com`, `facebook.com`, `tiktok.com`, `discord.com`, `twitter.com`, etc.) with a friendly **"Access Restricted by Administrator"** screen and a **"Request Unblock from Teacher"** button.

- **📝 Docs & Homework Notes**:
  - Auto-saving rich-text editor (Bold, Italic, Headings, Lists, Colors).
  - Document sidebar and `.txt` file export.

- **📊 Classroom Assignment Tracker**:
  - Student dashboard for upcoming homework deadlines, priority tags, and subject categories (Math, Science, History, English).
  - Completion checkmarks and visual percentage progress ring.

- **🧮 Scientific Calculator**:
  - Dual-mode calculator with trigonometric (`sin`, `cos`, `tan`), logarithmic (`log`, `ln`), square root, exponent, `pi`, memory functions, and history log.

- **⏱️ Focus Study Timer**:
  - Pomodoro timer blocks (25m Focus, 5m Short Break, 15m Long Break).
  - **Web Audio API Ambient Synthesizer**: Generates Rain, Ocean Waves, and White Noise sounds with volume control.

- **🛡️ Teacher & Parent Control Panel (PIN Protected)**:
  - Default Admin PIN: `1234`.
  - Master toggles for Browser access, SafeSearch, Focus Mode lockout, and App Install lock.
  - Custom URL blocklist manager and Curfew Bedtime lockdown scheduler.

---

## 🚀 Getting Started

### 1. Web Application Mode (Browser)
```bash
git clone https://github.com/YOUR_USERNAME/chromeos-student-edition.git
cd chromeos-student-edition
python3 -m http.server 8080
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

Or using the executable launcher script:
```bash
./start-desktop.sh
```

---

## 📂 Project Structure

```
chromeos-student-edition/
├── package.json          # Electron app manifest & npm scripts
├── main.js              # Electron main process (Kiosk, Window, IPC)
├── preload.js           # Context-isolated security bridge API
├── start-desktop.sh     # Executable desktop launcher script
├── index.html           # Main OS UI layout container
├── css/
│   └── style.css        # ChromeOS Material Design 3 stylesheet
└── js/
    ├── app.js           # Master app entry bootstrap
    ├── os/              # State store, window manager, shelf, launcher, quick settings, restrictions
    └── apps/            # Browser, Docs, Classroom, Calculator, Focus Timer, Admin Panel
```

---

## 📜 License
MIT License
