import { app } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { Fraction } from "../Fraction.mjs";
import { App } from "../../App.mjs";

app.keyHandlers.push({
	key: "/",
	handler: (event, stopPropagation) => {
		App.cursors.forEach(cursor => Fraction.insertFraction(cursor, App.document));
		Autocomplete.close();
		stopPropagation();
	},
});

MathComponent.subclasses.set("Fraction", Fraction);
