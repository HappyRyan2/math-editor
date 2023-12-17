import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { App } from "../App.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { JSDOM } from "jsdom";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { Selection } from "../Selection.mjs";
import { Cursor } from "../Cursor.mjs";
import { EditorTab } from "../EditorTab.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
});


describe("App.render", () => {
	it("renders the app without throwing any errors", () => {
		const app = new App(new MathDocument([new MathSymbol("A")]));
		app.render();
	});
});
describe("App.renderWithMapping", () => {
	it("returns a rendered app, along with a Map that maps each component to its rendered HTML element", () => {
		let mock: EnterableComponentMock, symbol: MathSymbol;
		const app = new App(new MathDocument([
			mock = new EnterableComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]));
		const [rendered, map] = app.renderWithMapping();
		assert.equal(rendered.outerHTML, app.render().outerHTML);
		assert.equal(map.size, 3);
		assert.equal(map.get(mock)?.outerHTML, mock.render(app).outerHTML);
		assert.equal(map.get(symbol)?.outerHTML, symbol.render().outerHTML);
		assert.equal(map.get(mock.componentsGroup)?.outerHTML, mock.componentsGroup.render(app).outerHTML);
	});
	it("works when there are enterable components, cursors, and selections", () => {
		const app = new App();
		let mock: EnterableComponentMock, symbol: MathSymbol;
		const doc = new MathDocument([
			mock = new EnterableComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]);
		app.activeTab = new EditorTab(doc, []);
		app.editorTabs = [app.activeTab];
		app.activeTab.cursors = [new Cursor(app.document.componentsGroup, mock, new Selection(mock, mock))];
		const [rendered, map] = app.renderWithMapping();

		const expectedMock = mock.render(app);
		expectedMock.classList.add("selected");
		assert.equal(rendered.outerHTML, app.render().outerHTML);
		assert.equal(map.size, 3);
		assert.equal(map.get(mock)?.outerHTML, expectedMock.outerHTML);
		assert.equal(map.get(symbol)?.outerHTML, symbol.render().outerHTML);
		assert.equal(map.get(mock.componentsGroup)?.outerHTML, mock.componentsGroup.render(app).outerHTML);
	});
});
