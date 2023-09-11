import { MathComponent } from "./MathComponent.mjs";

export class MathComponentGroup extends MathComponent {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		super();
		this.components = components;
	}

	render() {
		const span = document.createElement("span");
		for(const component of this.components) {
			span.appendChild(component.render());
		}
		return span;
	}
}
