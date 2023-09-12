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

	render(): HTMLElement {
		throw new Error("Not yet implemented");
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
