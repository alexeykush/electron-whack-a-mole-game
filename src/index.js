const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

const Types = require("./Types");

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minHeight: 800,
        minWidth: 1000,
        webPreferences: {
            nodeIntegration: true
        }
    });

    void mainWindow.loadFile(path.join(__dirname, 'index.html'));

    if (process.env.NODE_ENV === "development") mainWindow.webContents.openDevTools();

    ipcMain.on(Types.LEVEL_SELECTED, (e, data) => {
        mainWindow
            .loadFile(path.join(__dirname, "game", "index.html"))
            .then(() => mainWindow.webContents.send(Types.GAME_INIT, data));
    });
};
app.on('ready', createWindow);
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());