import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { App } from "../App.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { JSDOM } from "jsdom";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { Selection } from "../Selection.mjs";
import { Cursor } from "../Cursor.mjs";
import { EditorTab } from "../EditorTab.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
});


describe("App.renderWithMapping", () => {
	it("returns a rendered app, along with a Map that maps each component to its rendered HTML element", () => {
		let mock: CompositeMathComponentMock, symbol: MathSymbol;
		const app = new App(new MathDocument([
			mock = new CompositeMathComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]));
		const [rendered, map] = app.renderWithMapping();
		assert.equal(rendered.outerHTML, app.document.render(app).outerHTML);
		assert.equal(map.size, 3);
		assert.equal(map.get(mock)?.outerHTML, mock.render(app).outerHTML);
		assert.equal(map.get(symbol)?.outerHTML, symbol.render().outerHTML);
		assert.equal(map.get(mock.componentsGroup)?.outerHTML, mock.componentsGroup.render(app).outerHTML);
	});
	it("works when there are composite components, cursors, and selections", () => {
		const app = new App();
		let mock: CompositeMathComponentMock, symbol: MathSymbol;
		const doc = new MathDocument([
			mock = new CompositeMathComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]);
		app.activeTab = new EditorTab(doc, []);
		app.editorTabs = [app.activeTab];
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, mock, new Selection(mock, mock))];
		const [rendered, map] = app.renderWithMapping();

		const expectedMock = mock.render(app);
		expectedMock.classList.add("selected");
		assert.equal(rendered.outerHTML, app.document.render(app).outerHTML);
		assert.equal(map.size, 3);
		assert.equal(map.get(mock)?.outerHTML, expectedMock.outerHTML);
		assert.equal(map.get(symbol)?.outerHTML, symbol.render().outerHTML);
		assert.equal(map.get(mock.componentsGroup)?.outerHTML, mock.componentsGroup.render(app).outerHTML);
	});
});
describe("App.renderTabs", () => {
	it("renders the tabs, with a special ID for the active tab", () => {
		const app = new App();
		app.editorTabs = [
			new EditorTab(new MathDocument([], "C:\\folder\\file1.mathdoc"), []),
			new EditorTab(new MathDocument([], "C:\\folder\\file2.mathdoc"), []),
		];
		app.activeTab = app.editorTabs[0];

		const result = app.renderTabs();
		const tab1 = result.children[0];
		const tab2 = result.children[1];
		const [text1, button1] = [...tab1.childNodes] as [Text, HTMLDivElement];
		const [text2, button2] = [...tab2.childNodes] as [Text, HTMLDivElement];
		assert.equal(tab1.id, "active-tab");
		assert.equal(text1.wholeText, "file1.mathdoc");
		assert.isTrue(button1.classList.contains("tab-close-button"));
		assert.equal(tab2.id, "");
		assert.equal(text2.wholeText, "file2.mathdoc");
		assert.isTrue(button2.classList.contains("tab-close-button"));
	});
});
describe("App.updateCursors", () => {
	it("places the cursor at the beginning of the first word when the cursor is at the beginning of its container", () => {
		const app = new App();
		app.renderAndUpdate();
		app.updateCursors();

		assert.equal(document.querySelectorAll(".word").length, 1);
		const word = document.querySelector(".word")!;
		assert.equal(word.childElementCount, 1);
		assert.isTrue(word.children[0].classList.contains("cursor"));
	});
	it("places the cursor in the first word of the next line if the cursor is after a line break", () => {
		const lineBreak = new LineBreak();
		const app = new App(new MathDocument([ lineBreak ]));
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, lineBreak)];
		app.renderAndUpdate();
		app.updateCursors();

		assert.equal(document.querySelectorAll(".line").length, 2);
		const [line1, line2] = document.querySelectorAll(".line");
		assert.equal(line1.querySelectorAll(".word").length, 1);
		assert.equal(line1.querySelector(".word")!.children.length, 1);
		assert.isTrue(line1.querySelector(".word")!.children[0].classList.contains("line-break"));

		assert.equal(line2.querySelectorAll(".word").length, 1);
		assert.equal(line2.querySelector(".word")!.children.length, 1);
		assert.isTrue(line2.querySelector(".word")!.children[0].classList.contains("cursor"));
	});
	it("places the cursor after the previous component if the previous component is not a line break", () => {
		const component = new MathSymbol("A");
		const app = new App(new MathDocument([ component ]));
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, component)];
		app.renderAndUpdate();
		app.updateCursors();

		assert.equal(document.querySelectorAll(".line").length, 1);
		assert.equal(document.querySelector(".line")!.querySelectorAll(".word").length, 1);
		assert.equal(document.querySelector(".line")!.querySelector(".word")!.childElementCount, 2);
		assert.isTrue(document.querySelector(".line")!.querySelector(".word")!.children[0].classList.contains("symbol"));
		assert.isTrue(document.querySelector(".line")!.querySelector(".word")!.children[1].classList.contains("cursor"));
	});
});
