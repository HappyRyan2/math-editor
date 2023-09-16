import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { App } from "./App.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";

export class MathComponentGroup {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		this.components = components;
	}

	render(app: App) {
		const span = document.createElement("span");
		span.classList.add("math-component-group");
		for(const component of this.componentsAndCursors(app.cursors)) {
			const renderedComponent = component.render(app);
			span.appendChild(renderedComponent);
			if(component instanceof MathComponent && component.isSelected(app.cursors)) {
				renderedComponent.classList.add("selected");
			}
		}
		return span;
	}
	renderWithMapping(app: App): [HTMLElement, Map<MathComponent, HTMLElement>] {
		const resultMap: Map<MathComponent, HTMLElement> = new Map();
		const result = document.createElement("span");
		result.classList.add("math-component-group");
		for(const component of this.componentsAndCursors(app.cursors)) {
			let renderedComponent: HTMLElement;
			if(component instanceof EnterableMathComponent) {
				let map: Map<MathComponent, HTMLElement>;
				[renderedComponent, map] = component.renderWithMapping(app);
				for(const [key, value] of map.entries()) {
					resultMap.set(key, value);
				}
			}
			else {
				renderedComponent = component.render(app);
			}
			result.appendChild(renderedComponent);
			if(component instanceof MathComponent && component.isSelected(app.cursors)) {
				renderedComponent.classList.add("selected");
			}
			if(component instanceof MathComponent) {
				resultMap.set(component, renderedComponent);
			}
		}
		return [result, resultMap];
	}
	componentsAndCursors(cursors: Cursor[]) {
		cursors = cursors.filter(c => c.container === this).sort((a, b) => a.position() - b.position());
		return [
			...cursors.filter(c => c.predecessor == null),
			...this.components.map(component => [component, ...cursors.filter(c => c.predecessor === component)]),
		].flat();
	}

	*descendants() {
		for(const component of this.components) {
			yield component;
			if(component instanceof EnterableMathComponent) {
				yield* component.descendants();
			}
		}
	}
}
