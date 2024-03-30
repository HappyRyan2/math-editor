import { Cursor } from "../Cursor.mjs";
import { CompositeMathComponent } from "../CompositeMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { App } from "../App.mjs";
import { assert } from "chai";
import { LineBreak } from "../math-components/LineBreak.mjs";

export class CompositeMathComponentMock extends CompositeMathComponent {
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
	render(renderedGroup: HTMLElement = this.componentsGroup.render()): HTMLElement {
		const result = document.createElement("span");
		result.classList.add("composite-math-component-mock");
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
	matches(component: MathComponent): boolean {
		if(!(component instanceof CompositeMathComponentMock)) { return false; }
		return this.componentsGroup.matches(component.componentsGroup);
	}
}

export const assertValidRenderedDocument = function() {
	const componentsAndGroups = [...App.document.descendants(), ...App.document.componentsGroup.groupDescendants()];
	for(const componentOrGroup of componentsAndGroups) {
		assert.isTrue(
			App.renderingMap.has(componentOrGroup),
			`The ${componentOrGroup.constructor.name} was missing from the rendering map.`,
		);
		assert.isTrue(
			[...document.querySelectorAll("*")].includes(App.renderingMap.get(componentOrGroup)!),
			`The ${componentOrGroup.constructor.name} was in the rendering map, but did not appear in the rendered HTML document.`,
		);
	}
	assert.equal(
		componentsAndGroups.length, App.renderingMap.size,
		`The rendering map had too many entries: it had ${App.renderingMap.size} entries, while there were only ${componentsAndGroups.length} components or groups in the MathDocument.`,
	);
	assert.equal(
		App.cursors.length, document.querySelectorAll(".cursor").length,
		`The number of cursors in the App (${App.cursors.length} cursors) did not match the number of rendered cursors in the HTML document (${document.querySelectorAll(".cursor").length} cursors).`,
	);
	const numLines = App.document.componentsGroup.components.filter(c => c instanceof LineBreak).length + 1;
	assert.equal(
		numLines, document.querySelectorAll(".line").length,
		`The number of lines in the MathDocument (${numLines} lines) did not match the number of rendered lines in the HTML document (${document.querySelectorAll(".line").length} lines).`,
	);
};
