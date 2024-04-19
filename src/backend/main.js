const {BrowserWindow} = require('electron')
const path = require('node:path')

let window;

function createWindow(width, height) {
    window = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true, // Habilita Node.js en la ventana del navegador
            enableRemoteModule: true, // Habilita el módulo remote
            preload: path.join(__dirname, 'preload.js')
        }
    })
    window.loadFile('../inv_19h_electron_mysql/src/frontend/index.html')
}

module.exports = {
    createWindow
}