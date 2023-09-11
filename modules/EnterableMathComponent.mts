import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";

export abstract class EnterableMathComponent extends MathComponent {
	/* Represents a MathComponent that can contain the user's cursor (e.g. fractions, exponents, subscripts, etc.) */
	abstract enterFromLeft(cursor: Cursor): void;
	abstract enterFromRight(cursor: Cursor): void;
}
