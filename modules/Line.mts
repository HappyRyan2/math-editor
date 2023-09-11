import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { MathComponent } from "./MathComponent.mjs";

export class Line {
	componentsGroup: MathComponentGroup;

	constructor(components: MathComponentGroup | MathComponent[]) {
		this.componentsGroup = (components instanceof MathComponentGroup) ? components : new MathComponentGroup(components);
	}

	render() {
		const div = document.createElement("div");
		div.classList.add("line");
		div.appendChild(this.componentsGroup.render());
		return div;
	}
}
