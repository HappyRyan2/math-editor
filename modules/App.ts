import { Line } from "./Line.js";

class App {
	lines: Line[];

	constructor() {
		this.lines = [new Line([])];
	}

	initialize() {
		
	}

	render() {
		const div = document.createElement("div");
		for(const line of this.lines) {
			div.appendChild(line.render());
		}
		return div;
	}
}

const app = new App();
app.initialize();
export { app };
