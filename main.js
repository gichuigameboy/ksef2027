const { app, BrowserWindow, ipcMain, Menu, session } = require('electron');
const path = require('path');
const os   = require('os');
const fs   = require('fs');

// Ensure OS virtual storage folder exists for internal "This PC / Downloads"
const OS_STORAGE_DIR = path.join(__dirname, 'os_storage', 'downloads');
if (!fs.existsSync(OS_STORAGE_DIR)) {
  fs.mkdirSync(OS_STORAGE_DIR, { recursive: true });
}

let mainWindow;

function configureSessions() {
  const s = session.fromPartition('persist:school');

  // Strict download handler within virtual sandbox directory
  s.on('will-download', (event, item) => {
    const rawFileName = item.getFilename();
    const safeName = path.basename(rawFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const savePath = path.join(OS_STORAGE_DIR, safeName);

    item.setSavePath(savePath);

    item.on('updated', (ev, state) => {
      if (state === 'progressing' && mainWindow) {
        mainWindow.webContents.send('download-progress', {
          fileName: safeName,
          received: item.getReceivedBytes(),
          total: item.getTotalBytes()
        });
      }
    });

    item.once('done', (ev, state) => {
      if (state === 'completed' && mainWindow) {
        let sizeFormatted = 'Unknown';
        try {
          const stats = fs.statSync(savePath);
          sizeFormatted = stats.size > 1024 * 1024
            ? (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
            : Math.round(stats.size / 1024) + ' KB';
        } catch (_) {}

        mainWindow.webContents.send('download-complete', {
          name: safeName,
          path: savePath,
          size: sizeFormatted,
          date: 'Just now'
        });
      }
    });
  });
}

function createWindow() {
  const isKioskMode = process.argv.includes('--kiosk');

  mainWindow = new BrowserWindow({
    width:     1280,
    height:    800,
    minWidth:  900,
    minHeight: 600,
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
      webSecurity:     true,
      webviewTag:      true,
      sandbox:         true,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Security: Restrict untrusted navigation and window opening.
  // Exact origin matching — a prefix check like startsWith('http://localhost')
  // would also accept attacker hosts such as http://localhost.evil.com.
  const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ];
  const appIndexPath = path.resolve(__dirname, 'index.html').toLowerCase();
  const isAllowedUrl = (rawUrl) => {
    try {
      const u = new URL(rawUrl);
      if (u.protocol === 'file:') return true;
      return allowedOrigins.includes(u.origin);
    } catch (_) {
      return false;
    }
  };

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (allowedOrigins.includes(new URL(url).origin)) return { action: 'allow' };
    } catch (_) {}
    // Deny arbitrary external child window popups
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    if (isAllowedUrl(navigationUrl)) return;
    // Block unexpected top-level navigation to protect OS UI
    event.preventDefault();
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Security: Enforce strict child window policies on all webviews created in the renderer
app.on('web-contents-created', (_, contents) => {
  if (contents.getType() === 'webview') {
    // Deny arbitrary child window popups from within webviews
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));

    // Prevent untrusted webviews from navigating to file:// URLs or privileged internal schemes
    contents.on('will-navigate', (event, navigationUrl) => {
      try {
        const u = new URL(navigationUrl);
        if (u.protocol === 'file:' || u.protocol === 'javascript:') {
          event.preventDefault();
        }
      } catch (_) {
        event.preventDefault();
      }
    });
  }
});

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

// Helper for validating IPC callers
function isAuthorizedSender(event) {
  return mainWindow && event.sender === mainWindow.webContents;
}

// ── Strict & Validated Native IPC Channels ─────────────────────────────
ipcMain.handle('get-system-info', (event) => {
  if (!isAuthorizedSender(event)) return null;
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

ipcMain.handle('get-downloaded-files', (event) => {
  if (!isAuthorizedSender(event)) return [];
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

// Securely save a file only within OS_STORAGE_DIR with basename path traversal check
ipcMain.handle('save-download-file', (event, payload) => {
  if (!isAuthorizedSender(event)) {
    return { success: false, error: 'Unauthorized IPC sender' };
  }
  try {
    if (!payload || typeof payload !== 'object') {
      return { success: false, error: 'Invalid payload' };
    }
    const rawName = String(payload.filename || 'Study_Document.docx');
    const safeName = path.basename(rawName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = path.join(OS_STORAGE_DIR, safeName);

    // Verify resolved path is strictly within OS_STORAGE_DIR
    if (!targetPath.startsWith(OS_STORAGE_DIR)) {
      return { success: false, error: 'Access denied: Path traversal attempted.' };
    }

    const textContent = String(payload.content || `Dawamu OS - Student Study Document\nTitle: ${safeName}\nSaved: ${new Date().toISOString()}\n`);
    fs.writeFileSync(targetPath, textContent, 'utf8');

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

ipcMain.on('toggle-kiosk', (event, enable) => {
  if (!isAuthorizedSender(event)) return;
  mainWindow?.setKiosk(!!enable);
  mainWindow?.setFullScreen(!!enable);
});

ipcMain.on('toggle-fullscreen', (event) => {
  if (!isAuthorizedSender(event)) return;
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

ipcMain.on('minimize-app', (event) => {
  if (!isAuthorizedSender(event)) return;
  mainWindow?.minimize();
});

ipcMain.on('exit-app', (event) => {
  if (!isAuthorizedSender(event)) return;
  app.quit();
});
