import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { App } from "../App.mjs";
import { Line } from "../Line.mjs";
import { JSDOM } from "jsdom";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
});
  

describe("App.render", () => {
	it("renders the app correctly", () => {
		const app = new App();
		app.lines = [new Line([]), new Line([])];

		const expected = document.createElement("div");
		const line1 = document.createElement("div");
		const line2 = document.createElement("div");
		line1.classList.add("line");
		line2.classList.add("line");
		expected.appendChild(line1);
		expected.appendChild(line2);
		line1.appendChild(document.createElement("span"));
		line2.appendChild(document.createElement("span"));
		expected.id = "lines-container";

		assert.equal(app.render().outerHTML, expected.outerHTML);
	});
});
