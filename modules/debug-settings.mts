import { app } from "./App.mjs";
import { Line } from "./Line.mjs";


const ENABLE_DEBUG_SETTINGS = false;
const DEBUG_SETTINGS = {
	INITIAL_LINES: [new Line([])],
};

if(ENABLE_DEBUG_SETTINGS) {
	app.lines = DEBUG_SETTINGS.INITIAL_LINES;
	app.renderAndUpdate();
}
