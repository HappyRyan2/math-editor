import { MathComponent } from "./MathComponent.mjs";
import { Line } from "./Line.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export class Cursor {
	container: MathComponentGroup | Line;
	predecessor: MathComponent | null;

	constructor(container: MathComponentGroup | Line, predecessor: MathComponent | null) {
		this.container = container;
		this.predecessor = predecessor;
	}

	addComponent(component: MathComponent) {
		const index = (this.predecessor == null) ? 0 : (this.container.components.indexOf(this.predecessor) + 1);
		this.container.components.splice(index, 0, component);
	}
}
