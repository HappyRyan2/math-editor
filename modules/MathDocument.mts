import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { App } from "./App.mjs";

export class MathDocument {
	componentsGroup: MathComponentGroup;

	constructor(components: MathComponentGroup | MathComponent[]) {
		this.componentsGroup = (components instanceof MathComponentGroup) ? components : new MathComponentGroup(components);
		this.componentsGroup.container = this;
	}

	render(app: App) {
		const div = document.createElement("div");
		div.id = "math-document";
		div.appendChild(this.componentsGroup.render(app));
		return div;
	}
}