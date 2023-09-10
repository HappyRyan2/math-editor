import { Line } from "./Line.js";

export class App {
	lines: Line[];

	constructor() {
		this.lines = [new Line([])];
	}

	initialize() {
		this.renderAndUpdate();	
	}

	render() {
		const div = document.createElement("div");
		div.id = "lines-container";
		for(const line of this.lines) {
			div.appendChild(line.render());
		}
		return div;
	}
	renderAndUpdate() {
		const newDiv = this.render();
		const oldDiv = document.getElementById("lines-container")!;
		oldDiv.insertAdjacentElement("afterend", newDiv);
		oldDiv.remove();
	}
}

const app = new App();
app.initialize();
export { app };
