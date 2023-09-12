import { MathComponent } from "./MathComponent.mjs";

export class Selection {
	start: MathComponent;
	end: MathComponent;

	constructor(start: MathComponent, end: MathComponent) {
		this.start = start;
		this.end = end;
	}
}
