import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { App } from "../App.mjs";
import { JSDOM } from "jsdom";
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> <div id='tabs-container'> </div> <div id='math-document'></div> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
	global.HTMLElement = dom.window.HTMLElement;
});


describe("MathComponent.renderAndInsert", () => {
	// it("inserts it at the beginning of the parent if it is the first component in its group", () => {
	// 	let oldSymbol, newSymbol;
	// 	const app = new App(new MathDocument([
	// 		oldSymbol = new MathSymbol("B"),
	// 	]));
	// 	app.renderAndUpdate();

	// 	app.document.componentsGroup.components.unshift(newSymbol = new MathSymbol("A"));
	// 	app.document.componentsGroup.components[0].renderAndInsert(app, app.renderingMap);

	// 	const word = document.querySelector(".word")!;
	// 	const [element1, element2] = word.querySelectorAll(".symbol");
	// 	assert.equal(element1.innerHTML, "A");
	// 	assert.equal(element2.innerHTML, "B");
	// 	assert.equal(app.renderingMap.get(newSymbol), element1);
	// 	assert.equal(app.renderingMap.get(oldSymbol), element2);
	// });
	// it("inserts it after the predecessor if it is not the first component in its group", () => {
	// 	const app = new App(new MathDocument([
	// 		new MathSymbol("A"),
	// 	]));
	// 	app.renderAndUpdate();
	// });
	// it("renders and inserts the container (and the container's container, and so on) if the container is not found in the document", () => {
	// 	const app = new App(new MathDocument([]));
	// 	app.renderAndUpdate();

	// 	let container1, container2, container3, newComponent;
	// 	app.document.componentsGroup.components.push(container1 = new CompositeMathComponentMock([
	// 		container2 = new CompositeMathComponentMock([
	// 			container3 = new CompositeMathComponentMock([
	// 				newComponent = new MathSymbol("A"),
	// 			]),
	// 		]),
	// 	]));
	// 	debugger;
	// 	newComponent.renderAndInsert(app, app.renderingMap);

	// 	const [renderedContainer1, renderedContainer2, renderedContainer3] = document.querySelectorAll(".composite-math-component-mock");
	// 	const renderedComponent = document.querySelector(".symbol");
	// 	assert(renderedContainer1 instanceof HTMLElement);
	// 	assert(renderedContainer2 instanceof HTMLElement);
	// 	assert(renderedContainer3 instanceof HTMLElement);
	// 	assert(renderedComponent instanceof HTMLElement);
	// 	assert.equal(renderedContainer1, app.renderingMap.get(container1));
	// 	assert.equal(renderedContainer2, app.renderingMap.get(container2));
	// 	assert.equal(renderedContainer3, app.renderingMap.get(container3));
	// });
});
