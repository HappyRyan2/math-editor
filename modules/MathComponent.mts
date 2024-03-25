import { App } from "./App.mjs";
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
import { mergeMaps } from "./utils/utils.mjs";

type MathComponentSubclass = typeof Parenthese | typeof Fraction | typeof MathSymbol | typeof SuperscriptSubscript | typeof LineBreak;

export abstract class MathComponent {
	relativeKeyHandlers: RelativeKeyHandler[] = [];
	abstract render(app: App, ...components: HTMLElement[]): HTMLElement; // `components` array is only used for CompositeMathComponents
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

	renderWithMapping(app: App): [HTMLElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const rendered = this.render(app);
		return [rendered, new Map([[this, rendered]])];
	}
	static getOrRender(component: MathComponent | MathComponentGroup, app: App, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		let rendered = renderingMap.get(component);
		if(rendered) { return rendered; }

		if(component instanceof MathComponent) {
			component.renderAndInsert(app, renderingMap);
			const rendered = renderingMap.get(component);
			if(rendered) { return rendered; }
			else { throw new Error("Unexpected: After rendering and inserting, the MathComponent was not found in the document."); }
		}
		else {
			const containingComponent = app.document.containingComponentOf(component);
			if(containingComponent instanceof MathDocument) {
				throw new Error("The document's MathComponentGroup does not appear in the rendered document (it gets replaced with a div with an ID of `math-document`), so it cannot be looked up using MathComponent.getOrRender.");
			}
			else {
				containingComponent.renderAndInsert(app, renderingMap);
			}
			rendered = renderingMap.get(component);
			if(rendered) { return rendered; }
			else {
				throw new Error("Unexpected: After rendering and inserting, the MathComponentGroup was not found in the document.");
			}
		}
	}
	renderAndInsert(app: App, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const containingGroup = app.document.containingGroupOf(this);
		const [rendered, map] = this.renderWithMapping(app);
		mergeMaps(renderingMap, map);
		if(containingGroup.components.indexOf(this) === 0 && containingGroup === app.document.componentsGroup) {
			const firstWord = document.querySelector(".word");
			firstWord?.insertAdjacentElement("afterbegin", rendered);
		}
		else if(containingGroup.components.indexOf(this) === 0 && containingGroup !== app.document.componentsGroup){
			const container = MathComponent.getOrRender(containingGroup, app, renderingMap);
			const firstWord = container.querySelector(".word");
			firstWord?.insertAdjacentElement("afterbegin", rendered);
		}
		else {
			const predecessor = containingGroup.components[containingGroup.components.indexOf(this) - 1] ?? null;
			const renderedPredecessor = MathComponent.getOrRender(predecessor, app, renderingMap);
			renderedPredecessor.insertAdjacentElement("afterend", rendered);
		}
	}
}
