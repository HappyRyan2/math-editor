import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { EnterableMathComponent } from "./EnterableMathComponent.mjs";
import { Selection } from "./Selection.mjs";

export class Cursor {
	container: MathComponentGroup;
	predecessor: MathComponent | null;
	selection: Selection | null;

	constructor(container: MathComponentGroup, predecessor: MathComponent | null, selection?: Selection) {
		this.container = container;
		this.predecessor = predecessor;
		this.selection = selection ?? null;
	}

	addComponent(component: MathComponent) {
		component.container = this.container;
		this.container.components.splice(this.position(), 0, component);
		this.predecessor = component;
	}
	position() {
		return (this.predecessor == null) ? 0 : (this.container.components.indexOf(this.predecessor) + 1);
	}
	nextComponent(): MathComponent | null {
		return this.container.components[this.position()] ?? null;
	}
	moveBefore(component: MathComponent) {
		const container = component.container!;
		const index = container.components.indexOf(component);
		this.predecessor = container.components[index - 1] ?? null;
		this.container = container;
	}
	moveAfter(component: MathComponent) {
		this.predecessor = component;
		this.container = component.container!;
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = "&ZeroWidthSpace;";
		span.classList.add("cursor");
		if(Cursor.cursorsBlinkOn) {
			span.classList.add("blink-on");
		}
		return span;
	}

	selectionPosition() {
		if(this.selection == null) { return null; }
		if(this.nextComponent() === this.selection.start) { return "start"; }
		return "end";
	}

	moveRight() {
		const nextComponent = this.nextComponent();
		if(nextComponent && nextComponent instanceof EnterableMathComponent) {
			nextComponent.enterFromLeft(this);
		}
		else if(nextComponent) {
			this.predecessor = nextComponent;
		}
		else if(this.container.container instanceof EnterableMathComponent) {
			this.predecessor = this.container.container;
			this.container = this.container.container.container!;
		}
	}
	moveLeft() {
		if(this.predecessor && this.predecessor instanceof EnterableMathComponent) {
			this.predecessor.enterFromRight(this);
		}
		else if(this.predecessor) {
			this.predecessor = this.container.components[this.position() - 2] ?? null;
		}
		else if(this.container.container instanceof EnterableMathComponent) {
			const index = this.container.container.container!.components.indexOf(this.container.container);
			this.predecessor = this.container.container.container!.components[index - 1] ?? null;
			this.container = this.container.container.container!;
		}
	}
	selectRight() {
		const nextComponent = this.nextComponent();
		if(!nextComponent) {
			const containingObject = this.container.container!;
			if(containingObject instanceof EnterableMathComponent) {
				this.moveAfter(containingObject);
				this.selection = new Selection(containingObject, containingObject);
			}
		}
		else if(this.selectionPosition() === "start") {
			if(this.selection!.start === this.selection!.end) {
				this.selection = null;
			}
			else {
				this.selection!.start = this.container.components[this.position() + 1];
			}
			this.moveAfter(nextComponent);
		}
		else if(this.selectionPosition() === "end") {
			this.selection!.end = nextComponent;
			this.moveAfter(nextComponent);
		}
		else {
			this.selection = new Selection(nextComponent, nextComponent);
			this.moveAfter(nextComponent);
		}
	}
	selectLeft() {
		if(!this.predecessor) {
			const containingObject = this.container.container!;
			if(containingObject instanceof EnterableMathComponent) {
				this.moveBefore(containingObject);
				this.selection = new Selection(containingObject, containingObject);
			}
		}
		else if(this.selectionPosition() === "start") {
			this.selection!.start = this.predecessor;
			this.moveBefore(this.predecessor);
		}
		else if(this.selectionPosition() === "end") {
			if(this.selection!.start === this.selection!.end) {
				this.selection = null;
			}
			else {
				this.selection!.end = this.container.components[this.container.components.indexOf(this.predecessor) - 1];
			}
			this.moveBefore(this.predecessor);
		}
		else {
			this.selection = new Selection(this.predecessor, this.predecessor);
			this.moveBefore(this.predecessor);
		}
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
		Cursor.intervalID = window.setInterval(() => {
			Cursor.toggleBlinking();
		}, 1000 / Cursor.BLINKS_PER_SECOND);
	}
	static intervalID: number;
	static resetCursorBlink() {
		Cursor.cursorsBlinkOn = true;
		Cursor.updateCursors();
		window.clearInterval(Cursor.intervalID);
		Cursor.initialize();
	}

	selectionContains(component: MathComponent) {
		if(!this.container.components.includes(component)) {
			return false;
		}
		if(this.selection == null) {
			return false;
		}
		const startIndex = this.container.components.indexOf(this.selection.start);
		const endIndex = this.container.components.indexOf(this.selection.end);
		const index = this.container.components.indexOf(component);
		return (startIndex <= index && index <= endIndex);
	}
}
