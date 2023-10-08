const { app, BrowserWindow } = require("electron");

app.whenReady().then(async () => {
	const window = new BrowserWindow({ width: 800, height: 800 });
	try {
		await window.loadFile("index.html");
	}
	catch(error) {
		window.loadFile("../index.html");
	}
});
