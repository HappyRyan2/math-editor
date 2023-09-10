import { app } from "./App.js";

const ENABLE_DEBUG_SETTINGS = true;
const DEBUG_SETTINGS = {
	INITIAL_LINES: [],
};

if(ENABLE_DEBUG_SETTINGS) {
	app.lines = DEBUG_SETTINGS.INITIAL_LINES;
}
