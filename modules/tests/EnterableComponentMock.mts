import { App } from "../App.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

export class EnterableComponentMock extends EnterableMathComponent {
	componentsGroup: MathComponentGroup;
	enteredFromLeft: boolean = false;
	enteredFromRight: boolean = false;
	constructor(componentsGroup?: MathComponentGroup) {
		super();
		this.componentsGroup = componentsGroup ?? new MathComponentGroup([]);
	}
	enterFromLeft(): void {
		this.enteredFromLeft = true;
	}
	enterFromRight(): void {
		this.enteredFromRight = true;
	}
	render(app: App, renderedGroup: HTMLElement = this.componentsGroup.render(app)): HTMLElement {
		const result = document.createElement("span");
		result.classList.add("enterable-mock");
		result.appendChild(renderedGroup);
		return result;
	}
	groups() {
		return [this.componentsGroup];
	}
}
