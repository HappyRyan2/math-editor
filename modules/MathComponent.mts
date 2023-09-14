import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { MathDocument } from "./MathDocument.mjs";

export abstract class MathComponent {
	container?: MathComponentGroup;
	abstract render(app: App): HTMLElement;

	constructor(container?: MathComponentGroup) {
		this.container = container;
	}

	isSelected(cursors: Cursor[]) {
		return cursors.some(c => c.selectionContains(this));
	}
	lastComponentAncestor(): MathComponent {
		if(this.container!.container instanceof MathDocument) {
			return this;
		}
		return this.container!.container!.lastComponentAncestor();
	}
}
