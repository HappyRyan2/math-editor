import { App } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { SuperscriptSubscript } from "../SuperscriptSubscript.mjs";

App.keyHandlers.push({
	key: "^",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		App.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "superscript"));
		stopPropagation();
		Autocomplete.close();
	},
});
App.keyHandlers.push({
	key: "_",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		Autocomplete.close();
		stopPropagation();
		App.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "subscript"));
	},
});


MathComponent.subclasses.set("SuperscriptSubscript", SuperscriptSubscript);
