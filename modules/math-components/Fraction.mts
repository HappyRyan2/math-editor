import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { app } from "../app-initializer.mjs";

export class Fraction extends EnterableMathComponent {
	numerator: MathComponentGroup;
	denominator: MathComponentGroup;

	constructor(numerator: MathComponentGroup, denominator: MathComponentGroup) {
		super();
		this.numerator = numerator;
		this.denominator = denominator;
	}

	render(app: App, numerator: HTMLElement = this.numerator.render(app), denominator: HTMLElement = this.denominator.render(app)): HTMLElement {
		const fraction = document.createElement("span");
		fraction.classList.add("fraction");

		numerator.classList.add("numerator");
		fraction.appendChild(numerator);

		denominator.classList.add("denominator");
		fraction.appendChild(denominator);

		return fraction;
	}
	enterFromLeft(cursor: Cursor) {
		cursor.container = this.numerator;
		cursor.predecessor = null;
	}
	enterFromRight(cursor: Cursor) {
		cursor.container = this.numerator;
		cursor.predecessor = (this.numerator.components[this.numerator.components.length - 1] ?? null);
	}
	groups() {
		return [this.numerator, this.denominator];
	}

	static insertFraction(cursor: Cursor, doc: MathDocument): Fraction {
		let fraction;
		if(cursor.selection != null) {
			fraction = new Fraction(
				new MathComponentGroup(cursor.selectedComponents()),
				new MathComponentGroup([]),
			);
			cursor.replaceSelectionWith(fraction);
		}
		else if(cursor.predecessor) {
			fraction = new Fraction(
				new MathComponentGroup([cursor.predecessor]),
				new MathComponentGroup([]),
			);
			cursor.deletePrevious(doc);
			cursor.addComponent(fraction);
		}
		else {
			fraction = new Fraction(new MathComponentGroup([]), new MathComponentGroup([]));
			cursor.addComponent(fraction);
		}
		cursor.container = fraction.denominator;
		cursor.predecessor = null;
		return fraction;
	}
}

app.keyHandlers.push({
	keyCode: "Slash",
	handler: () => app.cursors.forEach(cursor => Fraction.insertFraction(cursor, app.document)),
});
