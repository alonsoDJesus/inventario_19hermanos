const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
    selectInitialSales: () => {
        return ipcRenderer.invoke('select:initialSales') 
    },
})