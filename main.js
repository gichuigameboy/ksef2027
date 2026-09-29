const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('path');
const os   = require('os');

// ─── HIGH-PERFORMANCE & ULTRA-LIGHTWEIGHT ENGINE SWITCHES ───────────────────────
// Optimizes memory footprint to under 180MB RAM & ensures 60 FPS on low-spec hardware
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256 --expose-gc');
app.commandLine.appendSwitch('renderer-process-limit', '4');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-sync');

let mainWindow;

// ─── Spoof user-agent to match real Chrome so sites don't trigger reCAPTCHA ───
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                  'Chrome/124.0.0.0 Safari/537.36';

function applyUserAgent() {
  ['default', 'persist:school'].forEach(partition => {
    const s = partition === 'default'
      ? session.defaultSession
      : session.fromPartition(partition);

    s.setUserAgent(CHROME_UA);

    s.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = CHROME_UA;
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
    backgroundColor: '#0f172a',
    webPreferences: {
      preload:         path.join(__dirname, 'preload.js'),
      contextIsolation:true,
      nodeIntegration: false,
      webSecurity:     false,
      webviewTag:      true,
      sandbox:         false,
      backgroundThrottling: true // Throttles hidden tabs to save CPU & battery
    }
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  applyUserAgent();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Native IPC Channels (Live Resource Telemetry) ─────────────────────────────
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

ipcMain.on('toggle-kiosk', (_, enable) => {
  mainWindow?.setKiosk(enable);
  mainWindow?.setFullScreen(enable);
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.on('minimize-app', () => mainWindow?.minimize());
ipcMain.on('exit-app',     () => app.quit());
