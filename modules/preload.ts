const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	sendSave: (content: string, fileName: string) => ipcRenderer.send("save", content, fileName),

	CI: process.env.CI ?? false,
});
