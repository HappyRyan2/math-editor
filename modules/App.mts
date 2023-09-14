import { MathDocument } from "./MathDocument.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { LineBreak } from "./LineBreak.mjs";

export class App {
	document: MathDocument;
	cursors: Cursor[];

	constructor() {
		this.document = new MathDocument([]);
		this.cursors = [new Cursor(this.document.componentsGroup, null)];
	}

	initialize() {
		this.renderAndUpdate();
		this.initializeListeners();
		Cursor.initialize();
	}

	render() {
		const div = document.createElement("div");
		div.id = "document-container";
		div.appendChild(this.document.render(this));
		return div;
	}
	initializeListeners() {
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
	}
	renderAndUpdate() {
		const newDiv = this.render();
		const oldDiv = document.getElementById("document-container")!;
		oldDiv.insertAdjacentElement("afterend", newDiv);
		oldDiv.remove();
	}

	handleKeyDown(event: KeyboardEvent) {
		this.handleCharacterKeys(event);
		this.handleArrowKeys(event);
		this.handleSpecialKeys(event);
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
				cursor.moveLeft();
			}
			else if(event.code === "ArrowRight" && !event.shiftKey) {
				cursor.moveRight();
			}
			else if(event.code === "ArrowLeft" && event.shiftKey) {
				cursor.selectLeft();
			}
			else if(event.code === "ArrowRight" && event.shiftKey) {
				cursor.selectRight();
			}
		}
	}
	handleSpecialKeys(event: KeyboardEvent) {
		if(event.code === "Enter") {
			for(const cursor of this.cursors) {
				LineBreak.addLineBreak(cursor);
			}
		}
	}
}
