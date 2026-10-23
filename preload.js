const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  toggleKiosk: (enable) => ipcRenderer.send('toggle-kiosk', enable),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  exitApp: () => ipcRenderer.send('exit-app'),

  // Virtual "This PC" download management
  getDownloadedFiles: () => ipcRenderer.invoke('get-downloaded-files'),
  saveDownloadFile: (data) => ipcRenderer.invoke('save-download-file', data),
  onDownloadComplete: (callback) => {
    ipcRenderer.on('download-complete', (_, data) => callback(data));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (_, data) => callback(data));
  },
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info')
});
