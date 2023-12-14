import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";
import { LineBreak } from "./LineBreak.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { RelativeKeyHandler } from "./RelativeKeyHandler.mjs";
import { Fraction } from "./math-components/Fraction.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { Parenthese } from "./math-components/Parenthese.mjs";
import { SuperscriptSubscript } from "./math-components/SuperscriptSubscript.mjs";

type MathComponentSubclass = typeof Parenthese | typeof Fraction | typeof MathSymbol | typeof SuperscriptSubscript | typeof LineBreak;

export abstract class MathComponent {
	relativeKeyHandlers: RelativeKeyHandler[] = [];
	abstract render(app: App, ...components: HTMLElement[]): HTMLElement; // `components` array is only used for EnterableMathComponents
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onDeletion(preventDeletion: () => void, doc: MathDocument, cursor: Cursor) {}

	static subclasses: Map<string, MathComponentSubclass> = new Map();
	static parseObject(input: { constructorName: string }): MathComponent {
		const { constructorName } = input;
		const componentConstructor = MathComponent.subclasses.get(constructorName);
		if(!componentConstructor) {
			throw new Error(`Did not find ${constructorName} in the MathComponent subclass registry.`);
		}
		return componentConstructor.parse(input);
	}

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

	toJSON(): object {
		return {...this, constructorName: this.constructor.name};
	}
}
