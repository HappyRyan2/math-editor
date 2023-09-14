import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export abstract class EnterableMathComponent extends MathComponent {
	/* Represents a MathComponent that can contain the user's cursor (e.g. fractions, exponents, subscripts, etc.) */
	abstract enterFromLeft(cursor: Cursor): void;
	abstract enterFromRight(cursor: Cursor): void;
	abstract groups(): MathComponentGroup[];

	*descendants(): Generator<MathComponent, void, unknown> {
		for(const group of this.groups()) {
			for(const component of group.components) {
				yield component;
				if(component instanceof EnterableMathComponent) {
					yield* component.descendants();
				}
			}
		}
	}
	*[Symbol.iterator](): Generator<MathComponent, void, undefined> {
		for(const group of this.groups()) {
			yield* group.components;
		}
	}
}
