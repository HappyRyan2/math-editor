import { app } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { SuperscriptSubscript } from "../SuperscriptSubscript.mjs";

app.keyHandlers.push({
	key: "^",
	shiftKey: true,
	handler: () => {
		app.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "superscript"));
		Autocomplete.close();
	},
});
app.keyHandlers.push({
	key: "_",
	shiftKey: true,
	handler: () => {
		Autocomplete.close();
		app.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "subscript"));
	},
});
