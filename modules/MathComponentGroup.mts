import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { App } from "./App.mjs";

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
	componentsAndCursors(cursors: Cursor[]) {
		cursors = cursors.filter(c => c.container === this).sort((a, b) => a.position() - b.position());
		return [
			...cursors.filter(c => c.predecessor == null),
			...this.components.map(component => [component, ...cursors.filter(c => c.predecessor === component)]),
		].flat();
	}
}
