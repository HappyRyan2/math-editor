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


	ipcMain.handle("save-with-dialog", (_, content: string, fileTypes: { name: string, extensions: string[] }[]) => {
		return dialog.showSaveDialog(window, { filters: fileTypes }).then((resolved) => {
			if(!resolved.canceled) {
				return fs.writeFile(resolved.filePath, content).then(() => { return resolved.filePath; });
			}
		});
	});
	ipcMain.handle("open-with-dialog", (_, fileTypes: { name: string, extensions: string[] }[]) => {
		return dialog.showOpenDialog(window, { filters: fileTypes }).then((resolved) => {
			return Promise.all(resolved.filePaths.map(p => fs.readFile(p, "utf8")))
				.then(contents => contents.map((str, i) => [resolved.filePaths[i], str]));
		});
	});
});

ipcMain.on("save", (_, content: string, fileName: string) => {
	fs.writeFile(fileName, content);
});
