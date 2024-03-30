import { assert } from "chai";
import { Cursor } from "../Cursor.mjs";
import { describe, it } from "mocha";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { CompositeMathComponentMock, assertValidRenderedDocument } from "./test-utils.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { Selection } from "../Selection.mjs";
import { App } from "../App.mjs";

describe("LineBreak.addLineBreak", () => {
	it("adds a line break at the cursor's location and moves the cursor after the line break", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();
		LineBreak.addLineBreak(App.cursors[0], App.document);

		assert.equal(App.document.componentsGroup.components.length, 1);
		assert.instanceOf(App.document.componentsGroup.components[0], LineBreak);
		assert.instanceOf(App.cursors[0].predecessor, LineBreak);
		assertValidRenderedDocument();
	});
	it("adds a line break after the containing component's last ancestor and moves the cursor after the line break", () => {
		let doc: MathDocument, component1: CompositeMathComponentMock, component2: CompositeMathComponentMock;
		App.loadDocument(doc = new MathDocument([
			component1 = new CompositeMathComponentMock(new MathComponentGroup([
				component2 = new CompositeMathComponentMock(),
			])),
		]));
		const cursor = new Cursor(component2.componentsGroup, null);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 2);
		assert.equal(doc.componentsGroup.components[0], component1);
		assert.instanceOf(doc.componentsGroup.components[1], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
		assertValidRenderedDocument();
	});
	it("replaces the selected components with a linebreak if the components are top-level", () => {
		let doc, symbol, cursor;
		App.loadDocument(doc = new MathDocument([symbol = new MathSymbol("A")]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, symbol, new Selection(symbol, symbol))];
		App.renderAndUpdate();
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.instanceOf(doc.componentsGroup.components[0], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
		assertValidRenderedDocument();
	});
	it("adds a line break after the containing component's last ancestor even if the user has a nonempty selection", () => {
		let doc: MathDocument, container: CompositeMathComponentMock, symbol: MathSymbol, cursor: Cursor;
		App.loadDocument(doc = new MathDocument([
			container = new CompositeMathComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]));
		App.activeTab.cursors = [cursor = new Cursor(container.componentsGroup, symbol, new Selection(symbol, symbol))];
		App.renderAndUpdate();
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 2);
		assert.equal(doc.componentsGroup.components[0], container);
		assert.instanceOf(doc.componentsGroup.components[1], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
		assertValidRenderedDocument();
	});
});
