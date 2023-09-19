import { app } from "./App.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { Cursor } from "./Cursor.mjs";


const ENABLE_DEBUG_SETTINGS = true;
const DEBUG_SETTINGS = {
	INITIAL_DOCUMENT: new MathDocument([

	]),
};

if(ENABLE_DEBUG_SETTINGS) {
	app.document = DEBUG_SETTINGS.INITIAL_DOCUMENT;
	app.cursors = [new Cursor(app.document.componentsGroup, app.document.componentsGroup.components[0])];
	app.renderAndUpdate();
}
