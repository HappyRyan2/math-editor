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
import { CompositeMathComponentMock, assertValidRenderedDocument } from "./test-utils.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

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
		App.loadDocument(new MathDocument([
			oldSymbol = new MathSymbol("B"),
		]));
		App.renderAndUpdate();

		App.document.componentsGroup.components.unshift(newSymbol = new MathSymbol("A"));
		LiveRenderer["renderAndInsert"](App.document.componentsGroup.components[0]);

		const word = document.querySelector(".word")!;
		const [element1, element2] = word.querySelectorAll(".symbol");
		assert.equal(element1.innerHTML, "A");
		assert.equal(element2.innerHTML, "B");
		assert.equal(App.renderingMap.get(newSymbol), element1);
		assert.equal(App.renderingMap.get(oldSymbol), element2);
	});
	it("inserts it after the predecessor if it is not the first component in its group", () => {
		let oldSymbol;
		App.loadDocument(new MathDocument([
			oldSymbol = new MathSymbol("A"),
		]));
		App.renderAndUpdate();

		const newSymbol = new MathSymbol("B");
		App.document.componentsGroup.components.push(newSymbol);
		LiveRenderer["renderAndInsert"](newSymbol);

		const word = document.querySelector(".word");
		const [element1, element2] = word!.querySelectorAll(".symbol");
		assert.equal(element1.innerHTML, "A");
		assert.equal(element2.innerHTML, "B");
		assert.equal(App.renderingMap.get(oldSymbol), element1);
		assert.equal(App.renderingMap.get(newSymbol), element2);
	});
	it("inserts it on the next line if the component is directly after a line break", () => {
		App.loadDocument(new MathDocument([
			new LineBreak(),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		const newSymbol = new MathSymbol("A");
		App.document.componentsGroup.components.push(newSymbol);
		LiveRenderer["renderAndInsert"](newSymbol);

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
		App.loadDocument(new MathDocument([
			symbol = new MathSymbol("A"),
			new MathSymbol("B"),
		]));
		App.renderAndUpdate();
		assert.equal(App.renderingMap.size, 2);
		assert.equal(App.document.componentsGroup.components.length, 2);
		assert.equal([...document.querySelectorAll(".symbol")].length, 2);


		LiveRenderer.delete(symbol);
		assert.equal(App.renderingMap.size, 1);
		assert.equal([...document.querySelectorAll(".symbol")].length, 1);
		assert.equal(App.document.componentsGroup.components.length, 1);
	});
	it("works when deleting the component results in two words combining into one", () => {
		let space;
		App.loadDocument(new MathDocument([
			new MathSymbol("A"),
			space = new MathSymbol(" "),
			new MathSymbol("B"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		assert.equal([...document.querySelectorAll(".word")].length, 2);

		LiveRenderer.delete(space);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		const word = document.querySelector(".word");
		assert.equal(word?.children[0].innerHTML, "A");
		assert.equal(word?.children[1].innerHTML, "B");
	});
	it("works when the component is a CompositeMathComponent", () => {
		let component;
		App.loadDocument(new MathDocument([
			component = new CompositeMathComponentMock([
				new MathSymbol("A"),
			]),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		LiveRenderer.delete(component);
		const lines = [...document.querySelectorAll(".line")];
		assert.equal(lines.length, 1);
		const words = [...lines[0].querySelectorAll(".word")];
		assert.equal(words.length, 1);
		const components = words[0].querySelectorAll("*");
		assert.equal(components.length, 0);

		assert.equal(App.renderingMap.size, 0);
	});
	it("works when there are cursors after/inside the component, or including the component in their selection", () => {
		let composite, composite2, symbol1, symbol2;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol("1"),
			composite = new CompositeMathComponentMock([
				composite2 = new CompositeMathComponentMock([]),
			]),
			symbol2 = new MathSymbol("2"),
		]));
		const cursor1 = new Cursor(composite.componentsGroup, null);
		const cursor2 = new Cursor(App.document.componentsGroup, composite);
		const cursor3 = new Cursor(App.document.componentsGroup, composite, new Selection(composite, composite));
		const cursor4 = new Cursor(App.document.componentsGroup, null, new Selection(symbol1, composite));
		const cursor5 = new Cursor(App.document.componentsGroup, symbol1, new Selection(composite, symbol2));
		const cursor6 = new Cursor(composite2.componentsGroup, null);
		App.activeTab.cursors = [cursor1, cursor2, cursor3, cursor4, cursor5, cursor6];
		App.renderAndUpdate();
		LiveRenderer.delete(composite);


		assert.sameOrderedMembers(App.cursors, [cursor2, cursor3, cursor4, cursor5]);

		assert.equal(cursor2.container, App.document.componentsGroup);
		assert.equal(cursor2.predecessor, symbol1);
		assert.equal(cursor2.selection, null);

		assert.equal(cursor3.container, App.document.componentsGroup);
		assert.equal(cursor3.predecessor, symbol1);
		assert.equal(cursor3.selection, null);

		assert.equal(cursor4.container, App.document.componentsGroup);
		assert.equal(cursor4.predecessor, null);
		assert.equal(cursor4.selection?.start, symbol1);
		assert.equal(cursor4.selection?.end, symbol1);

		assert.equal(cursor5.container, App.document.componentsGroup);
		assert.equal(cursor5.predecessor, symbol1);
		assert.equal(cursor5.selection?.start, symbol2);
		assert.equal(cursor5.selection?.end, symbol2);
	});
	it("removes any empty words that are created as a result of the deletion, when there is a component before it", () => {
		let lastSymbol;
		App.loadDocument(new MathDocument([
			new MathSymbol("A"),
			new MathSymbol(" "),
			lastSymbol = new MathSymbol("B"),
		]));
		App.renderAndUpdate();
		LiveRenderer.delete(lastSymbol);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
	});
	it("removes any empty words that are created as a result of the deletion, when there is no component before it", () => {
		let firstSymbol;
		App.loadDocument(new MathDocument([
			firstSymbol = new MathSymbol(" "),
			new MathSymbol("B"),
		]));
		App.renderAndUpdate();
		LiveRenderer.delete(firstSymbol);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
	});
});
describe("LiveRenderer.deleteLineBreak", () => {
	it("removes the line break from the MathDocument", () => {
		let lineBreak;
		App.loadDocument(new MathDocument([ lineBreak = new LineBreak() ]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		assert.equal(App.document.componentsGroup.components.length, 1);
		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.equal(App.document.componentsGroup.components.length, 0);
	});
	it("removes the line break from the HTML document", () => {
		let lineBreak;
		App.loadDocument(new MathDocument([ lineBreak = new LineBreak() ]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		assert.isNotNull(document.querySelector(".line-break"));
		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.isNull(document.querySelector(".line-break"));
	});
	it("removes the line break from the rendering map", () => {
		let lineBreak;
		App.loadDocument(new MathDocument([ lineBreak = new LineBreak() ]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		assert.equal(App.renderingMap.size, 1);
		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.equal(App.renderingMap.size, 0);
	});
	it("combines the adjacent lines into one line", () => {
		let symbol1, lineBreak, symbol2;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol(" "),
			lineBreak = new LineBreak(),
			symbol2 = new MathSymbol("A"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		const words = [...document.querySelectorAll(".word")];
		assert.equal(words.length, 2);
		assert.sameOrderedMembers([...words[0].children], [App.renderingMap.get(symbol1)]);
		assert.sameOrderedMembers([...words[1].children], [App.renderingMap.get(symbol2)]);
	});
	it("combines the adjacent words into one word if necessary", () => {
		let symbol1, lineBreak, symbol2;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol("1"),
			lineBreak = new LineBreak(),
			symbol2 = new MathSymbol("2"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers(
			[...document.querySelector(".word")!.children],
			[App.renderingMap.get(symbol1), App.renderingMap.get(symbol2)],
		);
	});
	it("does not combine the adjacent words when it is not necessary", () => {
		let symbol1, lineBreak, symbol2;
		App.loadDocument(new MathDocument([
			lineBreak = new LineBreak(),
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol(" "),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();

		debugger;
		LiveRenderer.deleteLineBreak(lineBreak);
		assert.sameOrderedMembers(App.document.componentsGroup.components, [symbol1, symbol2]);
		assertValidRenderedDocument(true);
	});
	it("works when there is a cursor after the line break", () => {
		let lineBreak;
		App.loadDocument(new MathDocument([ lineBreak = new LineBreak() ]));
		const cursor = new Cursor(App.document.componentsGroup, lineBreak);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.strictEqual(cursor.predecessor, null);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.equal([...document.querySelector(".word")!.children].length, 1);
		assert.isTrue(document.querySelector(".word")!.firstElementChild!.classList.contains("cursor"));
	});
	it("works when there is a cursor before the line break", () => {
		let lineBreak;
		App.loadDocument(new MathDocument([ lineBreak = new LineBreak() ]));
		const cursor = new Cursor(App.document.componentsGroup, null);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();

		LiveRenderer["deleteLineBreak"](lineBreak);
		assert.strictEqual(cursor.predecessor, null);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.equal([...document.querySelector(".word")!.children].length, 1);
		assert.isTrue(document.querySelector(".word")!.firstElementChild!.classList.contains("cursor"));
	});
	it("works when there is a component before the line break but not after it", () => {
		let symbol, lineBreak;
		App.loadDocument(new MathDocument([
			symbol = new MathSymbol("1"),
			lineBreak = new LineBreak(),
		]));
		App.renderAndUpdate();
		LiveRenderer.deleteLineBreak(lineBreak);

		assert.sameOrderedMembers(App.document.componentsGroup.components, [symbol]);
		assertValidRenderedDocument(true);
	});
	it("works when there is a component after the line break but not before it", () => {
		let symbol, lineBreak;
		App.loadDocument(new MathDocument([
			lineBreak = new LineBreak(),
			symbol = new MathSymbol("1"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.deleteLineBreak(lineBreak);

		assert.sameOrderedMembers(App.document.componentsGroup.components, [symbol]);
		assertValidRenderedDocument(true);
	});
	it("works when there is a component after the line break but not before it, and the cursor is on a different line", () => {
		let symbol, lineBreak, lineBreak2;
		App.loadDocument(new MathDocument([
			lineBreak = new LineBreak(),
			symbol = new MathSymbol("1"),
			lineBreak2 = new LineBreak(),
		]));
		App.activeTab.cursors = [new Cursor(App.document.componentsGroup, lineBreak2)];
		App.renderAndUpdate();
		LiveRenderer.deleteLineBreak(lineBreak);

		assert.sameOrderedMembers(App.document.componentsGroup.components, [symbol, lineBreak2]);
		assertValidRenderedDocument(true);
	});
});
describe("LiveRenderer.insertLineBreak", () => {
	it("adds the line break to the MathDocument", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();
		let lineBreak;
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 0);
		assert.sameOrderedMembers(App.document.componentsGroup.components, [lineBreak]);
	});
	it("adds the line break to the rendering map", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();
		let lineBreak;
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 0);
		assert.hasAllKeys(App.renderingMap, [lineBreak]);
	});
	it("adds the line break to the HTML document and splits the line into two lines", () => {
		let symbol1, symbol2, lineBreak;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol("2"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.insertLineBreak(lineBreak = new LineBreak(), 1);

		assert.equal([...document.querySelectorAll(".line")].length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		assert.equal([...line1.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line1.querySelector(".word")!.children], [App.renderingMap.get(symbol1), App.renderingMap.get(lineBreak)]);
		assert.equal([...line2.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line2.querySelector(".word")!.children], [App.renderingMap.get(symbol2)]);
	});
	it("adds a new empty line if the previous component is also a LineBreak", () => {
		let oldLineBreak, newLineBreak, symbol;
		App.loadDocument(new MathDocument([
			oldLineBreak = new LineBreak(),
			symbol = new MathSymbol("A"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.insertLineBreak(newLineBreak = new LineBreak(), 1);

		assert.equal([...document.querySelectorAll(".line")].length, 3);
		const [line1, line2, line3] = document.querySelectorAll(".line");
		assert.equal([...line1.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line1.querySelector(".word")!.children], [App.renderingMap.get(oldLineBreak)]);
		assert.equal([...line2.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line2.querySelector(".word")!.children], [App.renderingMap.get(newLineBreak)]);
		assert.equal([...line3.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers([...line3.querySelector(".word")!.children], [App.renderingMap.get(symbol)]);
	});
});
describe("LiveRenderer.insertAtIndex", () => {
	it("inserts the component in the MathDocument and in the HTML document, and adds it to the rendering map", () => {
		let oldSymbol, newSymbol;
		App.loadDocument(new MathDocument([
			oldSymbol = new MathSymbol("A"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.insertAtIndex(newSymbol = new MathSymbol("B"), App.document.componentsGroup, 1);

		assert.sameOrderedMembers(App.document.componentsGroup.components, [oldSymbol, newSymbol]);
		assert.equal(App.renderingMap.size, 2);
		assert.equal([...document.querySelectorAll(".line")].length, 1);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		assert.sameOrderedMembers(
			[...document.querySelector(".word")!.childNodes],
			[App.renderingMap.get(oldSymbol), App.renderingMap.get(newSymbol)],
		);
	});
	it("correctly handles words adjacent to the inserted component", () => {
		let symbol1, symbol2;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol("2"),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		const space = new MathSymbol(" ");
		LiveRenderer.insertAtIndex(space, App.document.componentsGroup, 1);

		assert.equal([...document.querySelectorAll(".word")].length, 2);
		const [word1, word2] = document.querySelectorAll(".word");
		assert.sameOrderedMembers(
			[...word1.childNodes],
			[App.renderingMap.get(symbol1), App.renderingMap.get(space)],
		);
		assert.sameOrderedMembers(
			[...word2.childNodes],
			[App.renderingMap.get(symbol2)],
		);
	});
	it("also adds all of the descendants of the component to the rendering map", () => {
		App.loadEmptyDocument();
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		const newSymbol = new MathSymbol("A");
		const newComponent = new CompositeMathComponentMock([newSymbol]);
		LiveRenderer.insertAtIndex(newComponent, App.document.componentsGroup, 0);

		assert.equal(App.renderingMap.size, 3);
		assert.containsAllKeys(App.renderingMap, [
			newComponent,
			newComponent.componentsGroup,
			newSymbol,
		]);
	});
	it("works when the previous component is a line break", () => {
		let lineBreak, newComponent;
		App.loadDocument(new MathDocument([
			lineBreak = new LineBreak(),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.insertAtIndex(newComponent = new MathSymbol("A"), App.document.componentsGroup, 1);

		assert.equal([...document.querySelectorAll(".line")].length, 2);
		assert.equal([...document.querySelectorAll(".word")].length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		const word1 = line1.querySelector(".word");
		assert.sameOrderedMembers([...word1!.childNodes], [App.renderingMap.get(lineBreak)]);
		const word2 = line2.querySelector(".word");
		assert.sameOrderedMembers([...word2!.childNodes], [App.renderingMap.get(newComponent)]);
	});
	it("places the component before any cursors at the specified position", () => {
		App.loadEmptyDocument();
		const cursor = App.cursors[0];
		App.renderAndUpdate();
		const newComponent = new MathSymbol("A");
		LiveRenderer.insertAtIndex(newComponent, App.document.componentsGroup, 0);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(cursor.predecessor, newComponent);
	});
	it("can insert a line break", () => {
		App.loadEmptyDocument();
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		LiveRenderer.insertAtIndex(new LineBreak(), App.document.componentsGroup, 0);

		assert.sameDeepOrderedMembers(App.document.componentsGroup.components, [ new LineBreak() ]);
		assert.equal(document.querySelectorAll(".line").length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		assert.equal(line1.querySelectorAll(".word").length, 1);
		assert.equal(line1.querySelector(".word")!.children.length, 1);
		assert.isTrue(line1.querySelector(".word")!.children[0].classList.contains("line-break"));
		assert.equal(line2.querySelectorAll(".word").length, 1);
		assert.equal(line2.querySelector(".word")!.children.length, 0);
	});
});
describe("LiveRenderer.insert", () => {
	it("places the component before any cursors if it is placed at the beginning of a group", () => {
		App.loadEmptyDocument();
		const component = new MathSymbol("A");
		App.renderAndUpdate();
		LiveRenderer.insert(component, "beginning", App.document.componentsGroup);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(App.cursors[0].predecessor, component);
	});
	it("places the component after any cursors if it is placed at the end of a group", () => {
		App.loadEmptyDocument();
		const component = new MathSymbol("A");
		App.renderAndUpdate();
		LiveRenderer.insert(component, "end", App.document.componentsGroup);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.isTrue(element2.classList.contains("symbol"));
		assert.equal(App.cursors[0].predecessor, null);
	});
	it("places the component before any cursors if it is placed after a component", () => {
		let oldComponent, newComponent;
		App.loadDocument(new MathDocument([ oldComponent = new MathSymbol("A")] ));
		App.activeTab.cursors = [new Cursor(App.document.componentsGroup, oldComponent)];
		App.renderAndUpdate();
		LiveRenderer.insert(newComponent = new MathSymbol("B"), "after", oldComponent);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2, element3] = document.querySelector(".word")!.children;
		assert.equal(element1, App.renderingMap.get(oldComponent));
		assert.equal(element2, App.renderingMap.get(newComponent));
		assert.isTrue(element3.classList.contains("cursor"));
		assert.equal(App.cursors[0].predecessor, newComponent);

	});
	it("places the component after any cursors if it is placed before a component", () => {
		let oldComponent, newComponent;
		App.loadDocument(new MathDocument([ oldComponent = new MathSymbol("B")] ));
		App.activeTab.cursors = [new Cursor(App.document.componentsGroup, null)];
		App.renderAndUpdate();
		LiveRenderer.insert(newComponent = new MathSymbol("A"), "before", oldComponent);

		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2, element3] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.equal(element2, App.renderingMap.get(newComponent));
		assert.equal(element3, App.renderingMap.get(oldComponent));
		assert.equal(App.cursors[0].predecessor, null);
	});
	it("can insert a component before a cursor", () => {
		App.loadEmptyDocument();
		const cursor = App.cursors[0];
		App.renderAndUpdate();

		const component = new MathSymbol("A");
		LiveRenderer.insert(component, "before", cursor);
		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("symbol"));
		assert.isTrue(element2.classList.contains("cursor"));
		assert.equal(cursor.predecessor, component);
	});
	it("can insert a component after a cursor", () => {
		App.loadEmptyDocument();
		const cursor = App.cursors[0];
		App.renderAndUpdate();

		const component = new MathSymbol("A");
		LiveRenderer.insert(component, "after", cursor);
		assert.equal(document.querySelectorAll(".word").length, 1);
		const [element1, element2] = document.querySelector(".word")!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.isTrue(element2.classList.contains("symbol"));
		assert.strictEqual(cursor.predecessor, null);
	});
});
describe("LiveRenderer.addComponentOrReplaceSelection", () => {
	it("replaces the cursor's selection with the given component and updates the rendered document", () => {
		let firstSymbol, lastSymbol;
		App.loadDocument(new MathDocument([
			firstSymbol = new MathSymbol("A"),
			new MathSymbol("B"),
			lastSymbol = new MathSymbol("C"),
		]));
		App.renderAndUpdate();
		const cursor = new Cursor(App.document.componentsGroup, lastSymbol, new Selection(firstSymbol, lastSymbol));
		App.activeTab.cursors = [cursor];
		LiveRenderer.addComponentOrReplaceSelection(cursor, new MathSymbol("D"));

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
		App.loadDocument(new MathDocument([
			firstSymbol = new MathSymbol("A"),
			new MathSymbol("B"),
			lastSymbol = new MathSymbol("C"),
		]));
		App.renderAndUpdate();
		const cursor = new Cursor(App.document.componentsGroup, lastSymbol, new Selection(firstSymbol, lastSymbol));
		App.activeTab.cursors = [cursor];
		const newSymbol = new MathSymbol("D");
		LiveRenderer.addComponentOrReplaceSelection(cursor, newSymbol);

		assert.equal(App.renderingMap.size, 1);
		assert.isTrue(App.renderingMap.get(newSymbol)?.classList.contains("symbol"));
	});
});
describe("LiveRenderer.rerender", () => {
	it("rerenders the component and updates the rendering map, including the component's descendants", () => {
		let parenthese1, parenthese2;
		App.loadDocument(new MathDocument([
			parenthese1 = new Parenthese(new MathComponentGroup([
				parenthese2 = new Parenthese(new MathComponentGroup([]), "round", false),
			]), "round", false),
		]));
		App.activeTab.cursors = [];
		App.renderAndUpdate();
		parenthese1.isGrayedOut = true;
		parenthese2.isGrayedOut = true;
		LiveRenderer.rerender(parenthese1);

		assert.isTrue(App.renderingMap.get(parenthese1)!.classList.contains("parenthese-grayed-out"));
		assert.isTrue(App.renderingMap.get(parenthese2)!.classList.contains("parenthese-grayed-out"));
		assertValidRenderedDocument(true);
	});
});
