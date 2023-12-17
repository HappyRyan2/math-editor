import { app } from "./App.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { Cursor } from "./Cursor.mjs";


const ENABLE_DEBUG_SETTINGS = true;
const DEBUG_SETTINGS = {
	INITIAL_DOCUMENT: new MathDocument([

	]),
};

if(ENABLE_DEBUG_SETTINGS) {
if(ENABLE_DEBUG_SETTINGS && !electronAPI.CI) {
	app.editorTabs = [new EditorTab(
		DEBUG_SETTINGS.INITIAL_DOCUMENT,
		[new Cursor(DEBUG_SETTINGS.INITIAL_DOCUMENT.componentsGroup, null)],
	)];
	app.renderAndUpdate();
}
