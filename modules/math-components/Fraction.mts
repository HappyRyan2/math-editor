import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { LineBreak } from "../LineBreak.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { RelativeKeyHandler } from "../RelativeKeyHandler.mjs";

export class Fraction extends EnterableMathComponent {
	numerator: MathComponentGroup;
	denominator: MathComponentGroup;

	constructor(numerator: MathComponentGroup, denominator: MathComponentGroup) {
		super();
		this.numerator = numerator;
		this.denominator = denominator;

		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowDown",
			["before", "after", ["inside", 0]],
			(cursor: Cursor, self: MathComponent, app: App) => {
				cursor.moveToClosest(this.denominator.components, app);
				Cursor.resetCursorBlink();
			}),
		);
		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowUp",
			["before", "after", ["inside", 1]],
			(cursor: Cursor, self: MathComponent, app: App) => {
				cursor.moveToClosest(this.numerator.components, app);
				Cursor.resetCursorBlink();
			}),
		);
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
		else if(cursor.predecessor && !(cursor.predecessor instanceof LineBreak)) {
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

