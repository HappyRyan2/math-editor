import { MathComponent } from "./MathComponent.mjs";
import { Line } from "./Line.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export class Cursor {
	container: MathComponentGroup | Line;
	predecessor: MathComponent | null;

	constructor(container: MathComponentGroup | Line, predecessor: MathComponent) {
		this.container = container;
		this.predecessor = predecessor;
	}
}
