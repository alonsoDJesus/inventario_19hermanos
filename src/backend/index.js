const {app, screen} = require('electron')
const {createWindow} = require('./main')

require('electron-reload')(__dirname)

app.whenReady().then( () => {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    createWindow(width, height)
} );
