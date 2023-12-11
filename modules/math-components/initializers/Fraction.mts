import { app } from "../../App.mjs";
import { Autocomplete } from "../../Autocomplete.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { Fraction } from "../Fraction.mjs";

app.keyHandlers.push({
	key: "/",
	handler: (event, stopPropagation) => {
		app.cursors.forEach(cursor => Fraction.insertFraction(cursor, app.document));
		Autocomplete.close();
		stopPropagation();
	},
});

MathComponent.subclasses.set("Fraction", Fraction);
