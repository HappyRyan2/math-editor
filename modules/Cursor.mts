import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export class Cursor {
	container: MathComponentGroup;
	position: number;

	constructor(container: MathComponentGroup, position: number) {
		this.container = container;
		this.position = position;
	}

	addComponent(component: MathComponent) {
		this.container.components.splice(this.position, 0, component);
		this.position ++;
	}

	render() {
		const span = document.createElement("span");
		span.classList.add("cursor");
		return span;
	}
}
