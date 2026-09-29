const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  toggleKiosk: (enable) => ipcRenderer.send('toggle-kiosk', enable),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  exitApp: () => ipcRenderer.send('exit-app')
});
