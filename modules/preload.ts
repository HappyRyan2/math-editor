const { contextBridge, ipcRenderer } = require("electron");

console.log("running the preload script!");

contextBridge.exposeInMainWorld("electronAPI", {
	sendSave: (content: string, fileName: string) => ipcRenderer.send("save", content, fileName),
});
