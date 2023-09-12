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

		const group1 = document.createElement("span");
		const group2 = document.createElement("span");
		group1.classList.add("math-component-group");
		group2.classList.add("math-component-group");
		line1.appendChild(group1);
		line2.appendChild(group2);
		expected.id = "lines-container";

		assert.equal(app.render().outerHTML, expected.outerHTML);
	});
});
