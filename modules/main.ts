const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
	const window = new BrowserWindow({ width: 800, height: 800 });
	window.loadFile("index.html");
});
