import { App } from "../App.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

export class SuperscriptSubscript extends EnterableMathComponent {
	superscript: MathComponentGroup;
	subscript: MathComponentGroup;

	constructor(superscript: MathComponentGroup | MathComponent[] = [], subscript: MathComponentGroup | MathComponent[] = []) {
		super();
		this.superscript = (superscript instanceof MathComponentGroup) ? superscript : new MathComponentGroup(superscript);
		this.subscript = (subscript instanceof MathComponentGroup) ? subscript : new MathComponentGroup(subscript);
	}

	groups() {
		return [this.superscript, this.subscript];
	}
	render(app: App, superscript: HTMLElement, subscript: HTMLElement) {
		const result = document.createElement("span");
		result.classList.add("superscript-subscript");

		superscript.classList.add("superscript");
		result.appendChild(superscript);

		subscript.classList.add("subscript");
		result.appendChild(subscript);

		return result;
	}
}
