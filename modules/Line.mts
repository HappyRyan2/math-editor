import { MathComponent } from "./MathComponent.mjs";

export class Line {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		this.components = components;
	}

	render() {
		const div = document.createElement("div");
		for(const component of this.components) {
			div.appendChild(component.render());
		}
		return div;
	}
}
