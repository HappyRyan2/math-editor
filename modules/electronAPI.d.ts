declare namespace electronAPI {
	function sendSave(content: string, fileName: string): void;
	function sendSaveWithDialog(content: string, fileTypes: { name: string, extensions: string[] }[]): Promise<string>;
	function openWithDialog(fileTypes: [{ name: string, extensions: string[] }]): Promise<[string, string][]>;

	let CI: boolean;
}
