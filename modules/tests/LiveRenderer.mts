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
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";

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
		LiveRenderer["renderAndInsert"](app.document.componentsGroup.components[0], app);

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
		LiveRenderer["renderAndInsert"](newSymbol, app);

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
		LiveRenderer["renderAndInsert"](newSymbol, app);

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
		assert.equal(app.document.componentsGroup.components.length, 2);
		assert.equal([...document.querySelectorAll(".symbol")].length, 2);


		LiveRenderer.delete(symbol, app);
		assert.equal(app.renderingMap.size, 1);
		assert.equal([...document.querySelectorAll(".symbol")].length, 1);
		assert.equal(app.document.componentsGroup.components.length, 1);
	});
	it("works when deleting the component results in two words combining into one", () => {
		let space;
		const app = new App(new MathDocument([
			new MathSymbol("A"),
			space = new MathSymbol(" "),
			new MathSymbol("B"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		assert.equal([...document.querySelectorAll(".word")].length, 2);

		LiveRenderer.delete(space, app);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		const word = document.querySelector(".word");
		assert.equal(word?.children[0].innerHTML, "A");
		assert.equal(word?.children[1].innerHTML, "B");
	});
	it("works when the component is a CompositeMathComponent", () => {
		let component;
		const app = new App(new MathDocument([
			component = new CompositeMathComponentMock([
				new MathSymbol("A"),
			]),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		LiveRenderer.delete(component, app);
		const lines = [...document.querySelectorAll(".line")];
		assert.equal(lines.length, 1);
		const words = [...lines[0].querySelectorAll(".word")];
		assert.equal(words.length, 1);
		const components = words[0].querySelectorAll("*");
		assert.equal(components.length, 0);

		assert.equal(app.renderingMap.size, 0);
	});
	it("works when there are cursors after/inside the component, or including the component in their selection", () => {
		let composite, composite2, symbol1, symbol2;
		const app = new App(new MathDocument([
			symbol1 = new MathSymbol("1"),
			composite = new CompositeMathComponentMock([
				composite2 = new CompositeMathComponentMock([]),
			]),
			symbol2 = new MathSymbol("2"),
		]));
		const cursor1 = new Cursor(composite.componentsGroup, null);
		const cursor2 = new Cursor(app.document.componentsGroup, composite);
		const cursor3 = new Cursor(app.document.componentsGroup, composite, new Selection(composite, composite));
		const cursor4 = new Cursor(app.document.componentsGroup, null, new Selection(symbol1, composite));
		const cursor5 = new Cursor(app.document.componentsGroup, symbol1, new Selection(composite, symbol2));
		const cursor6 = new Cursor(composite2.componentsGroup, null);
		app.activeTab.cursors = [cursor1, cursor2, cursor3, cursor4, cursor5, cursor6];
		app.renderAndUpdate();
		LiveRenderer.delete(composite, app);


		assert.sameOrderedMembers(app.cursors, [cursor2, cursor3, cursor4, cursor5]);

		assert.equal(cursor2.container, app.document.componentsGroup);
		assert.equal(cursor2.predecessor, symbol1);
		assert.equal(cursor2.selection, null);

		assert.equal(cursor3.container, app.document.componentsGroup);
		assert.equal(cursor3.predecessor, symbol1);
		assert.equal(cursor3.selection, null);

		assert.equal(cursor4.container, app.document.componentsGroup);
		assert.equal(cursor4.predecessor, null);
		assert.equal(cursor4.selection?.start, symbol1);
		assert.equal(cursor4.selection?.end, symbol1);

		assert.equal(cursor5.container, app.document.componentsGroup);
		assert.equal(cursor5.predecessor, symbol1);
		assert.equal(cursor5.selection?.start, symbol2);
		assert.equal(cursor5.selection?.end, symbol2);
	});
	it("removes any empty words that are created as a result of the deletion, when there is a component before it", () => {
		let lastSymbol;
		const app = new App(new MathDocument([
			new MathSymbol("A"),
			new MathSymbol(" "),
			lastSymbol = new MathSymbol("B"),
		]));
		app.renderAndUpdate();
		LiveRenderer.delete(lastSymbol, app);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
	});
	it("removes any empty words that are created as a result of the deletion, when there is no component before it", () => {
		let firstSymbol;
		const app = new App(new MathDocument([
			firstSymbol = new MathSymbol(" "),
			new MathSymbol("B"),
		]));
		app.renderAndUpdate();
		LiveRenderer.delete(firstSymbol, app);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
	});
});
describe("LiveRenderer.deleteLineBreak", () => {
	it("removes the line break from the MathDocument", () => {
		let lineBreak;
		const app = new App(new MathDocument([ lineBreak = new LineBreak() ]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		assert.equal(app.document.componentsGroup.components.length, 1);
		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal(app.document.componentsGroup.components.length, 0);
	});
	it("removes the line break from the HTML document", () => {
		let lineBreak;
		const app = new App(new MathDocument([ lineBreak = new LineBreak() ]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		assert.isNotNull(document.querySelector(".line-break"));
		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.isNull(document.querySelector(".line-break"));
	});
	it("removes the line break from the rendering map", () => {
		let lineBreak;
		const app = new App(new MathDocument([ lineBreak = new LineBreak() ]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		assert.equal(app.renderingMap.size, 1);
		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal(app.renderingMap.size, 0);
	});
	it("combines the adjacent lines into one line", () => {
		let symbol1, lineBreak, symbol2;
		const app = new App(new MathDocument([
			symbol1 = new MathSymbol(" "),
			lineBreak = new LineBreak(),
			symbol2 = new MathSymbol("A"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		const words = [...document.querySelectorAll(".word")];
		assert.equal(words.length, 2);
		assert.sameOrderedMembers([...words[0].children], [app.renderingMap.get(symbol1)]);
		assert.sameOrderedMembers([...words[1].children], [app.renderingMap.get(symbol2)]);
	});
	it("combines the adjacent words into one word if necessary", () => {
		let symbol1, lineBreak, symbol2;
		const app = new App(new MathDocument([
			symbol1 = new MathSymbol("1"),
			lineBreak = new LineBreak(),
			symbol2 = new MathSymbol("2"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers(
			[...document.querySelector(".word")!.children],
			[app.renderingMap.get(symbol1), app.renderingMap.get(symbol2)],
		);
	});
	it("works when there is a cursor after the line break", () => {
		let lineBreak;
		const app = new App(new MathDocument([ lineBreak = new LineBreak() ]));
		const cursor = new Cursor(app.document.componentsGroup, lineBreak);
		app.activeTab.cursors = [cursor];
		app.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal(cursor.predecessor, null);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.equal([...document.querySelector(".word")!.children].length, 1);
		assert.isTrue(document.querySelector(".word")!.firstElementChild!.classList.contains("cursor"));
	});
	it("works when there is a cursor before the line break", () => {
		let lineBreak;
		const app = new App(new MathDocument([ lineBreak = new LineBreak() ]));
		const cursor = new Cursor(app.document.componentsGroup, null);
		app.activeTab.cursors = [cursor];
		app.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak, app);
		assert.equal(cursor.predecessor, null);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.equal([...document.querySelector(".word")!.children].length, 1);
		assert.isTrue(document.querySelector(".word")!.firstElementChild!.classList.contains("cursor"));
	});
});
describe("LiveRenderer.insertLineBreak", () => {
	it("adds the line break to the MathDocument", () => {
		const app = new App(new MathDocument([]));
		app.renderAndUpdate();
		let lineBreak;
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 0, app);
		assert.sameOrderedMembers(app.document.componentsGroup.components, [lineBreak]);
	});
	it("adds the line break to the rendering map", () => {
		const app = new App(new MathDocument([]));
		app.renderAndUpdate();
		let lineBreak;
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 0, app);
		assert.hasAllKeys(app.renderingMap, [lineBreak]);
	});
	it("adds the line break to the HTML document and splits the line into two lines", () => {
		let symbol1, symbol2, lineBreak;
		const app = new App(new MathDocument([
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol("2"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 1, app);

		assert.equal([...document.querySelectorAll(".line")].length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		assert.equal([...line1.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line1.querySelector(".word")!.children], [app.renderingMap.get(symbol1), app.renderingMap.get(lineBreak)]);
		assert.equal([...line2.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line2.querySelector(".word")!.children], [app.renderingMap.get(symbol2)]);
	});
	it("adds a new empty line if the previous component is also a LineBreak", () => {
		let oldLineBreak, newLineBreak, symbol;
		const app = new App(new MathDocument([
			oldLineBreak = new LineBreak(),
			symbol = new MathSymbol("A"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		LiveRenderer.insertLineBreak(newLineBreak = new LineBreak(), 1, app);

		assert.equal([...document.querySelectorAll(".line")].length, 3);
		const [line1, line2, line3] = document.querySelectorAll(".line");
		assert.equal([...line1.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line1.querySelector(".word")!.children], [app.renderingMap.get(oldLineBreak)]);
		assert.equal([...line2.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line2.querySelector(".word")!.children], [app.renderingMap.get(newLineBreak)]);
		assert.equal([...line3.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line3.querySelector(".word")!.children], [app.renderingMap.get(symbol)]);
	});
});
describe("LiveRenderer.insertAtIndex", () => {
	it("inserts the component in the MathDocument and in the HTML document, and adds it to the rendering map", () => {
		let oldSymbol, newSymbol;
		const app = new App(new MathDocument([
			oldSymbol = new MathSymbol("A"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		LiveRenderer.insertAtIndex(newSymbol = new MathSymbol("B"), app.document.componentsGroup, 1, app);

		assert.sameOrderedMembers(app.document.componentsGroup.components, [oldSymbol, newSymbol]);
		assert.equal(app.renderingMap.size, 2);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers(
			[...document.querySelector(".word")!.childNodes],
			[app.renderingMap.get(oldSymbol), app.renderingMap.get(newSymbol)],
		);
	});
	it("correctly handles words adjacent to the inserted component", () => {
		let symbol1, symbol2;
		const app = new App(new MathDocument([
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol("2"),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		const space = new MathSymbol(" ");
		LiveRenderer.insertAtIndex(space, app.document.componentsGroup, 1, app);

		assert.equal([...document.querySelectorAll(".word")].length, 2);
		const [word1, word2] = document.querySelectorAll(".word");
		assert.sameOrderedMembers(
			[...word1.childNodes],
			[app.renderingMap.get(symbol1), app.renderingMap.get(space)],
		);
		assert.sameOrderedMembers(
			[...word2.childNodes],
			[app.renderingMap.get(symbol2)],
		);
	});
	it("also adds all of the descendants of the component to the rendering map", () => {
		const app = new App(new MathDocument([]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		const newSymbol = new MathSymbol("A");
		const newComponent = new CompositeMathComponentMock([newSymbol]);
		LiveRenderer.insertAtIndex(newComponent, app.document.componentsGroup, 0, app);

		assert.equal(app.renderingMap.size, 3);
		assert.containsAllKeys(app.renderingMap, [
			newComponent,
			newComponent.componentsGroup,
			newSymbol,
		]);
	});
	it("works when the previous component is a line break", () => {
		let lineBreak, newComponent;
		const app = new App(new MathDocument([
			lineBreak = new LineBreak(),
		]));
		app.activeTab.cursors = [];
		app.renderAndUpdate();
		LiveRenderer.insertAtIndex(newComponent = new MathSymbol("A"), app.document.componentsGroup, 1, app);

		assert.equal([...document.querySelectorAll(".line")].length, 2);
		assert.equal([...document.querySelectorAll(".word")].length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		const word1 = line1.querySelector(".word");
		assert.sameOrderedMembers([...word1!.childNodes], [app.renderingMap.get(lineBreak)]);
		const word2 = line2.querySelector(".word");
		assert.sameOrderedMembers([...word2!.childNodes], [app.renderingMap.get(newComponent)]);
	});
	it("places the component before any cursors at the specified position", () => {
		const app = new App(new MathDocument([]));
		const cursor = app.cursors[0];
		app.renderAndUpdate();
		const newComponent = new MathSymbol("A");
		LiveRenderer.insertAtIndex(newComponent, app.document.componentsGroup, 0, app);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(cursor.predecessor, newComponent);
	});
});
describe("LiveRenderer.insert", () => {
	it("places the component before any cursors if it is placed at the beginning of a group", () => {
		const app = new App(new MathDocument([]));
		const component = new MathSymbol("A");
		app.renderAndUpdate();
		LiveRenderer.insert(component, "beginning", app.document.componentsGroup, app);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(app.cursors[0].predecessor, component);
	});
	it("places the component after any cursors if it is placed at the end of a group", () => {
		const app = new App(new MathDocument([]));
		const component = new MathSymbol("A");
		app.renderAndUpdate();
		LiveRenderer.insert(component, "end", app.document.componentsGroup, app);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.isTrue(element2.classList.contains("symbol"));
		assert.equal(app.cursors[0].predecessor, null);
	});
	it("places the component before any cursors if it is placed after a component", () => {
		let oldComponent, newComponent;
		const app = new App(new MathDocument([ oldComponent = new MathSymbol("A")] ));
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, oldComponent)];
		app.renderAndUpdate();
		LiveRenderer.insert(newComponent = new MathSymbol("B"), "after", oldComponent, app);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2, element3] = document.querySelector(".word")!.children;
		assert.equal(element1, app.renderingMap.get(oldComponent));
		assert.equal(element2, app.renderingMap.get(newComponent));
		assert.isTrue(element3.classList.contains("cursor"));
		assert.equal(app.cursors[0].predecessor, newComponent);

	});
	it("places the component after any cursors if it is placed before a component", () => {
		let oldComponent, newComponent;
		const app = new App(new MathDocument([ oldComponent = new MathSymbol("B")] ));
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, null)];
		app.renderAndUpdate();
		LiveRenderer.insert(newComponent = new MathSymbol("A"), "before", oldComponent, app);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2, element3] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.equal(element2, app.renderingMap.get(newComponent));
		assert.equal(element3, app.renderingMap.get(oldComponent));
		assert.equal(app.cursors[0].predecessor, null);
	});
	it("can insert a component before a cursor", () => {
		const app = new App(new MathDocument([]));
		const cursor = app.cursors[0];
		app.renderAndUpdate();

		const component = new MathSymbol("A");
		LiveRenderer.insert(component, "before", cursor, app);
		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(cursor.predecessor, component);
	});
	it("can insert a component after a cursor", () => {
		const app = new App(new MathDocument([]));
		const cursor = app.cursors[0];
		app.renderAndUpdate();

		const component = new MathSymbol("A");
		LiveRenderer.insert(component, "after", cursor, app);
		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.isTrue(element2.classList.contains("symbol"));
		assert.equal(cursor.predecessor, null);
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
