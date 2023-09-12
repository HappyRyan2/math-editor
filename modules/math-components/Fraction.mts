import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

export class Fraction extends EnterableMathComponent {
	numerator: MathComponentGroup;
	denominator: MathComponentGroup;

	constructor(numerator: MathComponentGroup, denominator: MathComponentGroup, container?: MathComponentGroup) {
		super(container);
		this.numerator = numerator;
		this.numerator.container = this;
		this.denominator = denominator;
		this.denominator.container = this;
	}

	render(app: App): HTMLElement {
		const fraction = document.createElement("span");
		fraction.classList.add("fraction");

		const numerator = this.numerator.render(app);
		numerator.classList.add("numerator");
		fraction.appendChild(numerator);

		const denominator = this.denominator.render(app);
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
}
