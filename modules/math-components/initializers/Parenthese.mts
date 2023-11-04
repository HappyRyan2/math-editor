import { app } from "../../App.mjs";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Parenthese } from "../Parenthese.mjs";

app.keyHandlers.push({
	key: "(",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		app.cursors.forEach(cursor => {
			const parenthese = new Parenthese(new MathComponentGroup([]), "round", true);
			cursor.addComponent(parenthese);
			cursor.moveToStart(parenthese.components);
		});
		stopPropagation();
	},
});
app.keyHandlers.push({
	key: ")",
	shiftKey: true,
	handler: (event, stopPropagation) => {
		for(const cursor of app.cursors) {
			const parenthese = ([cursor.predecessor, app.document.containingComponentOf(cursor.container)]
				.find(p => p instanceof Parenthese && p.isGrayedOut) as Parenthese) ?? null;
			if(parenthese) {
				if(parenthese.components === cursor.container) {
					parenthese.collapseTo(cursor, app.document);
				}
				parenthese.isGrayedOut = false;
				cursor.moveAfter(parenthese, app.document.containingGroupOf(parenthese));
			}
			else {
				const parenthese = new Parenthese(new MathComponentGroup([]), "round", true);
				cursor.addComponent(parenthese);
				cursor.moveToStart(parenthese.components);
			}
			stopPropagation();
		}
	},
});
