declare namespace electronAPI {
	function sendSave(content: string, fileName: string): void;
	function sendSaveWithDialog(content: string, fileTypes: { name: string, extensions: string[] }[]): void;

	let CI: boolean;
}
