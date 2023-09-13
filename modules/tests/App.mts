import { describe, it, beforeEach } from "mocha";
import { App } from "../App.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { JSDOM } from "jsdom";
import { MathSymbol } from "../math-components/MathSymbol.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
});


describe("App.render", () => {
	it("renders the app without throwing any errors", () => {
		const app = new App();
		app.document = new MathDocument([new MathSymbol("A")]);
		app.render();
	});
});
