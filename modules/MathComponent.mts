import { Cursor } from "./Cursor.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { RelativeKeyHandler } from "./RelativeKeyHandler.mjs";
import { Fraction } from "./math-components/Fraction.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { Parenthese } from "./math-components/Parenthese.mjs";
import { SuperscriptSubscript } from "./math-components/SuperscriptSubscript.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

type MathComponentSubclass = typeof Parenthese | typeof Fraction | typeof MathSymbol | typeof SuperscriptSubscript | typeof LineBreak;

export abstract class MathComponent {
	relativeKeyHandlers: RelativeKeyHandler[] = [];
	abstract render(...components: HTMLElement[]): HTMLElement; // `components` array is only used for CompositeMathComponents
	abstract matches(component: MathComponent): boolean;
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
	ancestors(doc: MathDocument): CompositeMathComponent[] {
		const container = doc.containingComponentOf(this);
		if(container instanceof MathDocument) {
			return [];
		}
		return [container, ...container.ancestors(doc)];
	}

	toJSON(): object {
		return {...this, constructorName: this.constructor.name};
	}

	renderWithMapping(): [HTMLElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const rendered = this.render();
		return [rendered, new Map([[this, rendered]])];
	}
}
