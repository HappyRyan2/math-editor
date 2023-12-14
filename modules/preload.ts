const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	sendSave: (content: string, fileName: string) => ipcRenderer.send("save", content, fileName),
	sendSaveWithDialog: (content: string, fileTypes: { name: string, extensions: string[] }[]) => ipcRenderer.send("save-with-dialog", content, fileTypes),
	openWithDialog: (content: string, fileTypes: { name: string, extensions: string[] }[]) => ipcRenderer.invoke("open-with-dialog", fileTypes),

	CI: process.env.CI ?? false,
});
