import { app } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { MathSymbol } from "../MathSymbol.mjs";

app.keyHandlers.push({
	key: "*",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		app.cursors.forEach(cursor => cursor.addComponent(new MathSymbol("⋅")));
		Autocomplete.close();
		stopPropagation();
	},
});

MathComponent.subclasses.set("MathSymbol", MathSymbol);
