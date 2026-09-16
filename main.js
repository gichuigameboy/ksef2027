const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const os = require('os');

let mainWindow;

function createWindow() {
  const isKioskMode = process.argv.includes('--kiosk');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Custom ChromeOS desktop style
    titleBarStyle: 'hidden',
    kiosk: isKioskMode,
    fullscreen: isKioskMode,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Enables cross-origin live website embedding inside school browser iframe
      webviewTag: true,
      sandbox: false
    }
  });

  mainWindow.loadFile('index.html');

  // Remove default top menu bar for seamless ChromeOS feel
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Native IPC Channels
ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    totalMem: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + ' GB',
    freeMem: Math.round(os.freemem() / (1024 * 1024 * 1024)) + ' GB',
    cpus: os.cpus().length + ' Cores',
    uptime: Math.round(os.uptime() / 60) + ' Mins'
  };
});

ipcMain.on('toggle-kiosk', (event, enable) => {
  if (mainWindow) {
    mainWindow.setKiosk(enable);
    mainWindow.setFullScreen(enable);
  }
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    const current = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!current);
  }
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('exit-app', () => {
  app.quit();
});
