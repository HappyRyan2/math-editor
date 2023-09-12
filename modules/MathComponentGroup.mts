import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { App } from "./App.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";
import { Line } from "./Line.mjs";

export class MathComponentGroup {
	components: MathComponent[];
	container?: EnterableMathComponent | Line;

	constructor(components: MathComponent[]) {
		this.components = components;
		for(const component of components) {
			component.container = this;
		}
	}

	render(app: App) {
		const span = document.createElement("span");
		for(const component of this.componentsAndCursors(app.cursors)) {
			span.appendChild(component.render(app));
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
