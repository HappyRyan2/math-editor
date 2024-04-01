import { Cursor } from "../Cursor.mjs";
import { CompositeMathComponent } from "../CompositeMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { App } from "../App.mjs";
import { assert } from "chai";

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

export const assertValidRenderedDocument = function(validateCursors: boolean) {
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
	if(!validateCursors) {
		for(const cursor of document.querySelectorAll(".cursor")) { cursor.remove(); }
		for(const selected of document.querySelectorAll(".selected")) { selected.classList.remove("selected"); }
	}
	const renderedHTML = document.getElementById("math-document")!.outerHTML;
	App.renderAndUpdate();
	if(!validateCursors) {
		for(const cursor of document.querySelectorAll(".cursor")) { cursor.remove(); }
		for(const selected of document.querySelectorAll(".selected")) { selected.classList.remove("selected"); }
	}
	const newRenderedHTML = document.getElementById("math-document")!.outerHTML;
	assert.equal(renderedHTML, newRenderedHTML, "After re-rendering, the document changed, so it must not have been fully updated.");
};
