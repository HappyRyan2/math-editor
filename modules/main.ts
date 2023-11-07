const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs").promises;

app.whenReady().then(async () => {
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
});

ipcMain.on("save", (_, content: string, fileName: string) => {
	fs.writeFile(fileName, content);
});
