const { app, BrowserWindow, ipcMain, session, dialog } = require("electron");
const fs = require("fs").promises;

app.whenReady().then(async () => {
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": [
					"default-src 'self'",
				],
			},
		});
	});

	const window = new BrowserWindow({
		width: 800, height: 800,
		webPreferences: {
			preload: `${__dirname}\\preload.js`,
		},
	});
	try {
		await window.loadFile("index.html");
	}
	catch(error) {
		window.loadFile("../index.html");
	}


	ipcMain.on("save-with-dialog", (_, content: string, fileTypes: { name: string, extensions: string[] }[]) => {
		dialog.showSaveDialog(window, { filters: fileTypes }).then((resolved) => {
			if(!resolved.canceled) {
				fs.writeFile(resolved.filePath, content);
			}
		});
	});
});

ipcMain.on("save", (_, content: string, fileName: string) => {
	fs.writeFile(fileName, content);
});
