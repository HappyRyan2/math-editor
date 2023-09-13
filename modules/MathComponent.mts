import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export abstract class MathComponent {
	container?: MathComponentGroup;
	abstract render(app: App): HTMLElement;

	constructor(container?: MathComponentGroup) {
		this.container = container;
	}

	isSelected(cursors: Cursor[]) {
		return cursors.some(c => c.selectionContains(this));
	}
}
