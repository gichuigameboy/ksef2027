const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('path');
const os   = require('os');
const fs   = require('fs');

// Ensure OS virtual storage folder exists for internal "This PC / Downloads"
const OS_STORAGE_DIR = path.join(__dirname, 'os_storage', 'downloads');
if (!fs.existsSync(OS_STORAGE_DIR)) {
  fs.mkdirSync(OS_STORAGE_DIR, { recursive: true });
}

// ─── HIGH PERFORMANCE HARDWARE & ANTI-CAPTCHA ENGINE ──────────────────────────
// Disables automation control flags to prevent Cloudflare/reCAPTCHA bot triggers
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-sync');

let mainWindow;

// ─── Browser User-Agent & Client Hints (Genuine Chrome 131) ───────────────────
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                  'Chrome/131.0.0.0 Safari/537.36';

function configureSessions() {
  ['default', 'persist:school'].forEach(partition => {
    const s = partition === 'default'
      ? session.defaultSession
      : session.fromPartition(partition);

    s.setUserAgent(CHROME_UA);

    // Realistic browser headers to pass Cloudflare, Google & hCaptcha checks
    s.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = CHROME_UA;
      details.requestHeaders['sec-ch-ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
      details.requestHeaders['sec-ch-ua-mobile'] = '?0';
      details.requestHeaders['sec-ch-ua-platform'] = '"macOS"';
      details.requestHeaders['sec-ch-ua-platform-version'] = '"15.0.0"';
      details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.9';
      details.requestHeaders['Upgrade-Insecure-Requests'] = '1';
      delete details.requestHeaders['X-Forwarded-For'];
      callback({ requestHeaders: details.requestHeaders });
    });

    // Intercept downloads: Store strictly in OS Virtual "This PC" Storage, not on host live device
    s.on('will-download', (event, item, webContents) => {
      const fileName = item.getFilename();
      const savePath = path.join(OS_STORAGE_DIR, fileName);
      
      // Auto-save silently into OS virtual drive without prompting native macOS dialogs
      item.setSavePath(savePath);

      item.on('updated', (ev, state) => {
        if (state === 'progressing') {
          mainWindow?.webContents.send('download-progress', {
            fileName,
            received: item.getReceivedBytes(),
            total: item.getTotalBytes()
          });
        }
      });

      item.once('done', (ev, state) => {
        if (state === 'completed') {
          let sizeFormatted = 'Unknown';
          try {
            const stats = fs.statSync(savePath);
            sizeFormatted = stats.size > 1024 * 1024
              ? (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
              : Math.round(stats.size / 1024) + ' KB';
          } catch (_) {}

          mainWindow?.webContents.send('download-complete', {
            name: fileName,
            path: savePath,
            size: sizeFormatted,
            date: 'Just now'
          });
        }
      });
    });
  });
}

function createWindow() {
  const isKioskMode = process.argv.includes('--kiosk');

  mainWindow = new BrowserWindow({
    width:    1280,
    height:   800,
    minWidth: 900,
    minHeight:600,
    frame: false,
    titleBarStyle: 'hidden',
    kiosk:      isKioskMode,
    fullscreen: isKioskMode,
    backgroundColor: '#020c07',
    show: false,
    webPreferences: {
      preload:         path.join(__dirname, 'preload.js'),
      contextIsolation:true,
      nodeIntegration: false,
      webSecurity:     false,
      webviewTag:      true,
      sandbox:         false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Smooth instant display when first paint is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  configureSessions();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Native IPC Channels (Live Resource Telemetry, Downloads & Power) ───────────
ipcMain.handle('get-system-info', () => {
  const memUsage = process.memoryUsage();
  return {
    platform: process.platform,
    arch:     process.arch,
    totalMem: Math.round(os.totalmem() / (1024**3)) + ' GB',
    freeMem:  Math.round(os.freemem()  / (1024**3)) + ' GB',
    usedMemMB: Math.round(memUsage.rss / (1024 * 1024)) + ' MB',
    cpus:     os.cpus().length + ' Cores',
    uptime:   Math.round(os.uptime() / 60) + ' Mins'
  };
});

// Retrieve virtual "This PC > Downloads" file list
ipcMain.handle('get-downloaded-files', () => {
  try {
    if (!fs.existsSync(OS_STORAGE_DIR)) return [];
    const files = fs.readdirSync(OS_STORAGE_DIR);
    return files.map(file => {
      const fullPath = path.join(OS_STORAGE_DIR, file);
      const stats = fs.statSync(fullPath);
      const isPdf = file.toLowerCase().endsWith('.pdf');
      const isDoc = file.toLowerCase().endsWith('.docx') || file.toLowerCase().endsWith('.doc');
      const isSheet = file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.csv');
      const isImg = file.toLowerCase().match(/\.(png|jpg|jpeg|gif|webp)$/);

      return {
        name: file,
        size: stats.size > 1024 * 1024 
          ? (stats.size / (1024 * 1024)).toFixed(1) + ' MB' 
          : Math.round(stats.size / 1024) + ' KB',
        date: stats.mtime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        type: isPdf ? 'pdf' : (isDoc ? 'doc' : (isSheet ? 'excel' : (isImg ? 'image' : 'file'))),
        icon: isPdf ? 'fas fa-file-pdf text-rose-500' 
            : (isDoc ? 'fas fa-file-word text-blue-500' 
            : (isSheet ? 'fas fa-file-excel text-emerald-500' 
            : (isImg ? 'fas fa-file-image text-purple-400' : 'fas fa-file text-slate-300')))
      };
    });
  } catch (err) {
    console.error('Failed to read downloaded files:', err);
    return [];
  }
});

// Save downloaded or exported file to "This PC > Downloads"
ipcMain.handle('save-download-file', (_, { filename, content = '' }) => {
  try {
    if (!fs.existsSync(OS_STORAGE_DIR)) {
      fs.mkdirSync(OS_STORAGE_DIR, { recursive: true });
    }
    const safeName = path.basename(filename || 'Study_Document.docx');
    const targetPath = path.join(OS_STORAGE_DIR, safeName);
    const textContent = content || `Dawamu OS - 8-4-4 Senior Secondary Study Guide\nTitle: ${safeName}\nSaved on: ${new Date().toLocaleString()}\nOfficial 8-4-4 KCSE Curriculum Material\n`;
    fs.writeFileSync(targetPath, textContent, 'utf8');
    
    // Broadcast download-complete event so Explorer updates automatically
    const stats = fs.statSync(targetPath);
    mainWindow?.webContents.send('download-complete', {
      filename: safeName,
      size: Math.round(stats.size / 1024) + ' KB',
      date: 'Just now'
    });
    return { success: true, path: targetPath };
  } catch (err) {
    console.error('Failed to save download file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('toggle-kiosk', (_, enable) => {
  mainWindow?.setKiosk(enable);
  mainWindow?.setFullScreen(enable);
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('exit-app',     () => app.quit());
