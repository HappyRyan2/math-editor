import { App } from "../App.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

type ParentheseType = "round" | "square" | "curly" | "angle";

export class Parenthese extends EnterableMathComponent {
	type: ParentheseType;
	components: MathComponentGroup;

	constructor(components: MathComponentGroup, type: ParentheseType) {
		super();
		this.type = type;
		this.components = components;
	}

	groups() {
		return [this.components];
	}
	render(app: App, components: HTMLElement) {
		const result = document.createElement("span");
		result.classList.add("parenthese");
		result.classList.add(`parenthese-${this.type}`);
		result.appendChild(components);
		return result;
	}
}
