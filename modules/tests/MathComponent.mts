import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { App } from "../App.mjs";
import { JSDOM } from "jsdom";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> <div id='tabs-container'> </div> <div id='math-document'></div> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
	global.HTMLElement = dom.window.HTMLElement;
});


describe("MathComponent.renderAndInsert", () => {
	it("inserts it at the beginning of the parent if it is the first component in its group", () => {
		let oldSymbol, newSymbol;
		const app = new App(new MathDocument([
			oldSymbol = new MathSymbol("B"),
		]));
		app.renderAndUpdate();

		app.document.componentsGroup.components.unshift(newSymbol = new MathSymbol("A"));
		app.document.componentsGroup.components[0].renderAndInsert(app, app.renderingMap);

		const word = document.querySelector(".word")!;
		const [element1, element2] = word.querySelectorAll(".symbol");
		assert.equal(element1.innerHTML, "A");
		assert.equal(element2.innerHTML, "B");
		assert.equal(app.renderingMap.get(newSymbol), element1);
		assert.equal(app.renderingMap.get(oldSymbol), element2);
	});
	it("inserts it after the predecessor if it is not the first component in its group", () => {
		let oldSymbol;
		const app = new App(new MathDocument([
			oldSymbol = new MathSymbol("A"),
		]));
		app.renderAndUpdate();

		const newSymbol = new MathSymbol("B");
		app.document.componentsGroup.components.push(newSymbol);
		newSymbol.renderAndInsert(app, app.renderingMap);

		const word = document.querySelector(".word");
		const [element1, element2] = word!.querySelectorAll(".symbol");
		assert.equal(element1.innerHTML, "A");
		assert.equal(element2.innerHTML, "B");
		assert.equal(app.renderingMap.get(oldSymbol), element1);
		assert.equal(app.renderingMap.get(newSymbol), element2);
	});
});
