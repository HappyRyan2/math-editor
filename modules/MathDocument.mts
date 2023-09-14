import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { App } from "./App.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";

export class MathDocument {
	componentsGroup: MathComponentGroup;

	constructor(components: MathComponentGroup | MathComponent[]) {
		this.componentsGroup = (components instanceof MathComponentGroup) ? components : new MathComponentGroup(components);
	}

	render(app: App, renderedComponents = this.componentsGroup.render(app)) {
		const div = document.createElement("div");
		div.id = "math-document";
		div.append(...renderedComponents.children);
		this.insertLineBreaks(div);
		return div;
	}
	insertLineBreaks(renderedDocument: Element) {
		const lines: HTMLElement[][] = [[]];
		while(renderedDocument.children.length > 0) {
			const element = renderedDocument.children[0];
			element.remove();
			lines[lines.length - 1].push(element as HTMLElement);
			if(element.classList.contains("line-break")) {
				lines.push([]);
			}
		}
		for(const line of lines) {
			const lineElement = document.createElement("div");
			lineElement.classList.add("line");
			lineElement.append(...line);
			renderedDocument.appendChild(lineElement);
		}
	}

	*descendants(): Generator<MathComponent, void, unknown> {
		for(const component of this.componentsGroup.components) {
			yield component;
			if(component instanceof EnterableMathComponent) {
				yield* component.descendants();
			}
		}
	}
	*[Symbol.iterator]() {
		yield* this.componentsGroup.components;
	}

	containingComponentOf(componentOrGroup: MathComponent | MathComponentGroup) {
		if(componentOrGroup instanceof MathComponent && this.componentsGroup.components.includes(componentOrGroup)) {
			return this;
		}
		if(componentOrGroup === this.componentsGroup) {
			return this;
		}
		for(const descendant of this.descendants()) {
			if(
				descendant instanceof EnterableMathComponent && (
					(componentOrGroup instanceof MathComponent && [...descendant].includes(componentOrGroup))
					|| (componentOrGroup instanceof MathComponentGroup && descendant.groups().includes(componentOrGroup)
					))) { return descendant; }
		}
		throw new Error("Did not find the component or group in the provided tree.");
	}
	containingGroupOf(component: MathComponent) {
		const container = this.containingComponentOf(component);
		if(container instanceof MathDocument) {
			return container.componentsGroup;
		}
		for(const group of container.groups()) {
			if(group.components.includes(component)) {
				return group;
			}
		}
		throw new Error("Unexpected: did not find the component in any of the groups of its container.");
	}
}
