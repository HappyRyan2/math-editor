import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathDocument } from "./MathDocument.mjs";

export abstract class MathComponent {
	abstract render(app: App): HTMLElement;

	isSelected(cursors: Cursor[]) {
		return cursors.some(c => c.selectionContains(this));
	}
	lastComponentAncestor(doc: MathDocument): MathComponent {
		const container = doc.containingComponentOf(this);
		if(container instanceof MathDocument) {
			return this;
		}
		return container.lastComponentAncestor(doc);
	}
}
