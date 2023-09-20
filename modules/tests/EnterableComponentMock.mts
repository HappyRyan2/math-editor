import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

export class EnterableComponentMock extends EnterableMathComponent {
	componentsGroup: MathComponentGroup;
	enteredFromLeft: boolean = false;
	enteredFromRight: boolean = false;
	rect: DOMRect | null;
	constructor(componentsGroup: MathComponentGroup | MathComponent[] = [], rect: DOMRect | null = null) {
		super();
		this.componentsGroup = (componentsGroup instanceof MathComponentGroup ? componentsGroup : new MathComponentGroup(componentsGroup));
		this.rect = rect;
	}
	enterFromLeft(cursor: Cursor): void {
		super.enterFromLeft(cursor);
		this.enteredFromLeft = true;
	}
	enterFromRight(cursor: Cursor): void {
		super.enterFromRight(cursor);
		this.enteredFromRight = true;
	}
	render(app: App, renderedGroup: HTMLElement = this.componentsGroup.render(app)): HTMLElement {
		const result = document.createElement("span");
		result.classList.add("enterable-mock");
		result.appendChild(renderedGroup);
		if(this.rect) {
			result.getBoundingClientRect = () => this.rect!;
			renderedGroup.getBoundingClientRect = () => this.rect!;
		}
		return result;
	}
	groups() {
		return [this.componentsGroup];
	}
}
