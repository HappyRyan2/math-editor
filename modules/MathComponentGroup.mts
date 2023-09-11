import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";

export class MathComponentGroup extends MathComponent {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		super();
		this.components = components;
	}

	render() {
		const span = document.createElement("span");
		for(const component of this.components) {
			span.appendChild(component.render());
		}
		return span;
	}
	componentsAndCursors(cursors: Cursor[]) {
		cursors = cursors.filter(c => c.container === this).sort((a, b) => a.position - b.position);
		return [
			...cursors.filter(c => c.position === 0),
			...this.components.map((component, i) => [component, ...cursors.filter(c => c.position === i + 1)]),
		].flat();
	}
}
