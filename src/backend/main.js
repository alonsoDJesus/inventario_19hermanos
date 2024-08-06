const {BrowserWindow} = require('electron')
const path = require('node:path')
//"start": "electron-forge start",
let window;

function createWindow(width, height) {
    window = new BrowserWindow({
        width: width,
        height: height,
        resizable: false,
        webPreferences: {
            nodeIntegration: true, // Habilita Node.js en la ventana del navegador
            enableRemoteModule: true, // Habilita el módulo remote
            preload: path.join(__dirname, 'preload.js')
        }
    })

    const indexPath = path.resolve(__dirname, '..', '..', 'src', 'frontend', 'inicio', 'index.html')
    window.loadFile(indexPath)
}

module.exports = {
    createWindow
}