import { Line } from "./Line.js";

class App {
	lines: Line[];

	constructor() {
		this.lines = [new Line([])];
	}

	initialize() {
		
	}
}

const app = new App();
app.initialize();
export { app };
