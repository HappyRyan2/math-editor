import { App, app } from "../../App.mjs";
import { MathComponent } from "../../MathComponent.mjs";
import { Parenthese } from "../Parenthese.mjs";

app.keyHandlers.push({
	key: "(",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		App.cursors.forEach(cursor => {
			Parenthese.insertParenthese(cursor, App.document);
		});
		stopPropagation();
	},
});
app.keyHandlers.push({
	key: ")",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		for(const cursor of App.cursors) {
			Parenthese.closeParenthese(cursor, App.document);
		}
		stopPropagation();
	},
});

MathComponent.subclasses.set("Parenthese", Parenthese);
