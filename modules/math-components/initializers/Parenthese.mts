import { app } from "../../App.mjs";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Parenthese } from "../Parenthese.mjs";

app.keyHandlers.push({
	key: "(",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		app.cursors.forEach(cursor => {
			const parenthese = new Parenthese(new MathComponentGroup([]), "round");
			cursor.addComponent(parenthese);
			cursor.moveToStart(parenthese.components);
		});
		stopPropagation();
	},
});
