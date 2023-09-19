import { MathDocument } from "./MathDocument.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { LineBreak } from "./LineBreak.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export class App {
	document: MathDocument;
	cursors: Cursor[];

	lastMouseDownEvent: MouseEvent | null = null;
	isMousePressed: boolean = false;

	keyHandlers: ({ key: string, handler: (event: KeyboardEvent) => void })[] = [];

	constructor() {
		this.document = new MathDocument([]);
		this.cursors = [new Cursor(this.document.componentsGroup, null)];
	}

	initialize() {
		this.renderAndUpdate();
		this.initializeListeners();
		this.initializeKeyHandlers();
		Cursor.initialize();
	}
	initializeKeyHandlers() {
		this.keyHandlers.push({
			key: "Enter",
			handler: () => this.cursors.forEach(cursor => LineBreak.addLineBreak(cursor, this.document)),
		});
		this.keyHandlers.push({
			key: "Backspace",
			handler: () => this.cursors.forEach(cursor => cursor.deletePrevious(this.document)),
		});
	}

	render(renderedDoc = this.document.render(this)) {
		const div = document.createElement("div");
		div.id = "document-container";
		div.appendChild(renderedDoc);
		return div;
	}
	initializeListeners() {
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
		document.addEventListener("mousedown", (event) => this.handleMouseDown(event));
		document.addEventListener("mouseup", () => this.handleMouseUp());
		document.addEventListener("mousemove", (event) => this.handleMouseMove(event));
	}
	renderAndUpdate(div: HTMLDivElement = this.render()) {
		const oldDiv = document.getElementById("document-container")!;
		oldDiv.insertAdjacentElement("afterend", div);
		oldDiv.remove();
	}
	renderWithMapping(): [HTMLDivElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const [renderedDoc, map] = this.document.renderWithMapping(this);
		return [this.render(renderedDoc), map];
	}

	handleKeyDown(event: KeyboardEvent) {
		const handled = this.handleSpecialKeys(event);
		if(!handled) {
			this.handleArrowKeys(event);
			this.handleCharacterKeys(event);
		}
		this.renderAndUpdate();
	}
	handleCharacterKeys(event: KeyboardEvent) {
		if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
			Cursor.resetCursorBlink();
		}
		for(const cursor of this.cursors) {
			if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
				cursor.addComponent(new MathSymbol(event.key));
			}
		}
	}
	handleArrowKeys(event: KeyboardEvent) {
		if(event.code === "ArrowLeft" || event.code === "ArrowRight") {
			Cursor.resetCursorBlink();
		}
		for(const cursor of this.cursors) {
			if(event.code === "ArrowLeft" && !event.shiftKey) {
				cursor.moveLeft(this.document);
			}
			else if(event.code === "ArrowRight" && !event.shiftKey) {
				cursor.moveRight(this.document);
			}
			else if(event.code === "ArrowLeft" && event.shiftKey) {
				cursor.selectLeft(this.document);
			}
			else if(event.code === "ArrowRight" && event.shiftKey) {
				cursor.selectRight(this.document);
			}
		}
	}
	handleSpecialKeys(event: KeyboardEvent) {
		for(const { key, handler } of this.keyHandlers) {
			if(event.key === key) {
				handler(event);
				return true;
			}
		}
		return false;
	}

	handleMouseUp() {
		this.isMousePressed = false;
	}
	handleMouseDown(event: MouseEvent) {
		this.lastMouseDownEvent = event;
		this.isMousePressed = true;

		this.cursors = [Cursor.fromClick(this, event)];
		Cursor.resetCursorBlink();
		this.renderAndUpdate();
	}
	handleMouseMove(event: MouseEvent) {
		if(this.isMousePressed) {
			this.cursors = [Cursor.fromDrag(this, this.lastMouseDownEvent!, event)];
			Cursor.resetCursorBlink();
			this.renderAndUpdate();
		}
	}
}

const app = new App();
export { app };
