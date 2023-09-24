import { app } from "../../App.mjs";
import { SuperscriptSubscript } from "../SuperscriptSubscript.mjs";

app.keyHandlers.push({
	key: "^",
	handler: () => app.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "superscript")),
});
app.keyHandlers.push({
	key: "_",
	handler: () => app.cursors.forEach(cursor => SuperscriptSubscript.insert(cursor, "subscript")),
});
