import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { App } from "../App.mjs";
import { JSDOM } from "jsdom";
import { LiveRenderer } from "../LiveRenderer.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { Cursor } from "../Cursor.mjs";
import { Selection } from "../Selection.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> <div id='tabs-container'> </div> <div id='math-document'></div> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
	global.HTMLElement = dom.window.HTMLElement;
});


describe("LiveRenderer.renderAndInsert", () => {
	it("inserts it at the beginning of the parent if it is the first component in its group", () => {
		let oldSymbol, newSymbol;
		const app = new App(new MathDocument([
			oldSymbol = new MathSymbol("B"),
		]));
		app.renderAndUpdate();

		app.document.componentsGroup.components.unshift(newSymbol = new MathSymbol("A"));
		LiveRenderer["renderAndInsert"](app.document.componentsGroup.components[0], app, app.renderingMap);

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
		LiveRenderer["renderAndInsert"](newSymbol, app, app.renderingMap);

		const word = document.querySelector(".word");
		const [element1, element2] = word!.querySelectorAll(".symbol");
		assert.equal(element1.innerHTML, "A");
		assert.equal(element2.innerHTML, "B");
		assert.equal(app.renderingMap.get(oldSymbol), element1);
		assert.equal(app.renderingMap.get(newSymbol), element2);
	});
	it("inserts it on the next line if the component is directly after a line break", () => {
		const app = new App(new MathDocument([
			new LineBreak(),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		const newSymbol = new MathSymbol("A");
		app.document.componentsGroup.components.push(newSymbol);
		LiveRenderer["renderAndInsert"](newSymbol, app, app.renderingMap);

		const [line1, line2] = document.querySelectorAll(".line");
		assert.equal(line1.childNodes.length, 1);
		assert.equal(line2.childNodes.length, 1);

		const [word1] = line1.childNodes;
		assert.equal(word1.childNodes.length, 1);
		assert.isTrue((word1.childNodes[0] as HTMLElement).classList.contains("line-break"));

		const [word2] = line2.childNodes;
		assert.equal(word2.childNodes.length, 1);
		assert.isTrue((word2.childNodes[0] as HTMLElement).classList.contains("symbol"));
	});
});
describe("LiveRenderer.delete", () => {
	it("deletes the component and updates the rendering map", () => {
		let symbol: MathSymbol;
		const app = new App(new MathDocument([
			symbol = new MathSymbol("A"),
			new MathSymbol("B"),
		]));
		app.renderAndUpdate();
		assert.equal(app.renderingMap.size, 2);
		LiveRenderer.delete(symbol, app);
		assert.equal(app.renderingMap.size, 1);
	});
});
describe("LiveRenderer.addComponentOrReplaceSelection", () => {
	it("replaces the cursor's selection with the given component and updates the rendered document", () => {
		let firstSymbol, lastSymbol;
		const app = new App(new MathDocument([
			firstSymbol = new MathSymbol("A"),
			new MathSymbol("B"),
			lastSymbol = new MathSymbol("C"),
		]));
		app.renderAndUpdate();
		const cursor = new Cursor(app.document.componentsGroup, lastSymbol, new Selection(firstSymbol, lastSymbol));
		app.activeTab.cursors = [cursor];
		LiveRenderer.addComponentOrReplaceSelection(cursor, new MathSymbol("D"), app);

		const renderedDocument = document.getElementById("math-document")!;
		assert.equal(renderedDocument.childElementCount, 1);
		const [line] = renderedDocument.children;
		assert.equal(line.childElementCount, 1);
		const [word] = line.children;
		assert.equal(word.childElementCount, 2);
		const [renderedSymbol, renderedCursor] = word.children;
		assert.isTrue(renderedSymbol.classList.contains("symbol"));
		assert.isTrue(renderedCursor.classList.contains("cursor"));
	});
	it("updates the rendering map, removing the deleted components and adding the new component", () => {
		let firstSymbol, lastSymbol;
		const app = new App(new MathDocument([
			firstSymbol = new MathSymbol("A"),
			new MathSymbol("B"),
			lastSymbol = new MathSymbol("C"),
		]));
		app.renderAndUpdate();
		const cursor = new Cursor(app.document.componentsGroup, lastSymbol, new Selection(firstSymbol, lastSymbol));
		app.activeTab.cursors = [cursor];
		const newSymbol = new MathSymbol("D");
		LiveRenderer.addComponentOrReplaceSelection(cursor, newSymbol, app);

		assert.equal(app.renderingMap.size, 1);
		assert.isTrue(app.renderingMap.get(newSymbol)?.classList.contains("symbol"));
	});
});
