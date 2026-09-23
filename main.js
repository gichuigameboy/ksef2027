const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('path');
const os   = require('os');

let mainWindow;

// ─── Spoof user-agent to match real Chrome so sites don't trigger reCAPTCHA ───
// Electron's default UA includes "Electron/X.X.X" which Google flags as a bot.
// We replace it with a standard Chrome UA string matching the bundled Chromium version.
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                  'Chrome/124.0.0.0 Safari/537.36';

function applyUserAgent() {
  // Apply to every session — default + the persistent school partition
  ['default', 'persist:school'].forEach(partition => {
    const s = partition === 'default'
      ? session.defaultSession
      : session.fromPartition(partition);

    s.setUserAgent(CHROME_UA);

    // Also strip the "Electron" header from every outgoing request
    s.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = CHROME_UA;
      // Remove headers that reveal automation
      delete details.requestHeaders['X-Forwarded-For'];
      callback({ requestHeaders: details.requestHeaders });
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
    webPreferences: {
      preload:         path.join(__dirname, 'preload.js'),
      contextIsolation:true,
      nodeIntegration: false,
      webSecurity:     false, // Allows cross-origin webview content
      webviewTag:      true,
      sandbox:         false
    }
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  applyUserAgent();   // ← must run before any window/session touches the network
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Native IPC Channels ──────────────────────────────────────────────────────
ipcMain.handle('get-system-info', () => ({
  platform: process.platform,
  arch:     process.arch,
  totalMem: Math.round(os.totalmem() / (1024**3)) + ' GB',
  freeMem:  Math.round(os.freemem()  / (1024**3)) + ' GB',
  cpus:     os.cpus().length + ' Cores',
  uptime:   Math.round(os.uptime() / 60) + ' Mins'
}));

ipcMain.on('toggle-kiosk', (_, enable) => {
  mainWindow?.setKiosk(enable);
  mainWindow?.setFullScreen(enable);
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('exit-app',     () => app.quit());
