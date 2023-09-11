import { Line } from "./Line.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class App {
	lines: Line[];
	cursors: Cursor[];

	constructor() {
		this.lines = [new Line([])];
		this.cursors = [new Cursor(this.lines[0].componentsGroup, 0)];
	}

	initialize() {
		this.renderAndUpdate();
		this.initializeListeners();	
		Cursor.initialize();
	}

	render() {
		const div = document.createElement("div");
		div.id = "lines-container";
		for(const line of this.lines) {
			div.appendChild(line.render(this));
		}
		return div;
	}
	initializeListeners() {
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
	}
	renderAndUpdate() {
		const newDiv = this.render();
		const oldDiv = document.getElementById("lines-container")!;
		oldDiv.insertAdjacentElement("afterend", newDiv);
		oldDiv.remove();
	}

	handleKeyDown(event: KeyboardEvent) {
		for(const cursor of this.cursors) {
			if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
				cursor.addComponent(new MathSymbol(event.key));
			}
		}
		this.renderAndUpdate();
	}
}
