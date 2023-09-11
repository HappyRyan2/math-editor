import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export class Cursor {
	container: MathComponentGroup;
	position: number;

	constructor(container: MathComponentGroup, position: number) {
		this.container = container;
		this.position = position;
	}

	addComponent(component: MathComponent) {
		component.container = this.container;
		this.container.components.splice(this.position, 0, component);
		this.position ++;
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = "&ZeroWidthSpace;";
		span.classList.add("cursor");
		return span;
	}

	static cursorsBlinkOn: boolean = true;
	static BLINKS_PER_SECOND = 2;
	static updateCursors() {
		for(const cursor of document.getElementsByClassName("cursor")) {
			if(Cursor.cursorsBlinkOn) {
				cursor.classList.add("blink-on");
			}
			else {
				cursor.classList.remove("blink-on");
			}
		}
	}
	static toggleBlinking() {
		Cursor.cursorsBlinkOn = !Cursor.cursorsBlinkOn;
		Cursor.updateCursors();
	}
	static initialize() {
		window.setInterval(() => {
			Cursor.toggleBlinking();
		}, 1000 / Cursor.BLINKS_PER_SECOND);
	}
}
