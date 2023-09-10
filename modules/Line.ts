import { MathComponent } from "./MathComponent.js";

export class Line {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		this.components = components;
	}
}
