import { Line } from "./Line.mjs";

export class App {
	lines: Line[];

	constructor() {
		this.lines = [new Line([])];
	}

	initialize() {
		this.renderAndUpdate();
		this.initializeListeners();	
	}

	render() {
		const div = document.createElement("div");
		div.id = "lines-container";
		for(const line of this.lines) {
			div.appendChild(line.render());
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
		return event; // TODO: write the method
	}
}
