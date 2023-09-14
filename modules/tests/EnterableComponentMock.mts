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
	render(): HTMLElement {
		throw new Error("Not yet implemented");
	}
	groups() {
		return [this.componentsGroup];
	}
}
