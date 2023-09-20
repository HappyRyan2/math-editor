import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { RelativeKeyHandler } from "./RelativeKeyHandler.mjs";

export abstract class MathComponent {
	relativeKeyHandlers: RelativeKeyHandler[] = [];
	abstract render(app: App, ...components: HTMLElement[]): HTMLElement; // `components` array is only used for EnterableMathComponents

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
	ancestors(doc: MathDocument): EnterableMathComponent[] {
		const container = doc.containingComponentOf(this);
		if(container instanceof MathDocument) {
			return [];
		}
		return [container, ...container.ancestors(doc)];
	}
}
