const { app, BrowserWindow, Menu } = require('electron')
const { ipcMain } = require('electron')
const menu = require('./scripts/app/menu')
const path = require('path')
const Store = require('electron-store');

const store = new Store();
let win;

ipcMain.on("store-json", (event, args) => {
	store.set('document.wip', args);
});

ipcMain.on("select-scene", (event, args) => {
	store.set('document.scene', args);
});

function createWindow() {
	win = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			contextIsolation: true,
      		enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	win.loadFile('index.html')
	win.webContents.openDevTools()
	menu.setWindow(win);
	
	var document = store.get('document');
	const sceneId = document.scene;
	
	if (document.wip)
	{
		var wipJSON = JSON.stringify(document.wip);
		win.webContents.executeJavaScript(`render(${wipJSON})`);
	}

	if (sceneId)
	{
		win.webContents.executeJavaScript(`selectNodeById("${sceneId}")`);
	}
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
