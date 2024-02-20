import { app } from "../../App.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { Parenthese } from "../Parenthese.mjs";

app.keyHandlers.push({
	key: "(",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		app.cursors.forEach(cursor => {
			Parenthese.insertParenthese(cursor, app.document);
		});
		stopPropagation();
	},
});
app.keyHandlers.push({
	key: ")",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		for(const cursor of app.cursors) {
			Parenthese.closeParenthese(cursor, app.document);
		}
		stopPropagation();
	},
});

MathComponent.subclasses.set("Parenthese", Parenthese);
