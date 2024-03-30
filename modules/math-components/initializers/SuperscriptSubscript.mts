import { App, app } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { SuperscriptSubscript } from "../SuperscriptSubscript.mjs";

app.keyHandlers.push({
	key: "^",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		App.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "superscript"));
		stopPropagation();
		Autocomplete.close();
	},
});
app.keyHandlers.push({
	key: "_",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		Autocomplete.close();
		stopPropagation();
		App.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "subscript"));
	},
});


MathComponent.subclasses.set("SuperscriptSubscript", SuperscriptSubscript);
