import { assert } from "chai";
import { Cursor } from "../Cursor.mjs";
import { describe, it } from "mocha";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { Selection } from "../Selection.mjs";

describe("LineBreak.addLineBreak", () => {
	it("adds a line break at the cursor's location and moves the cursor after the line break", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.instanceOf(doc.componentsGroup.components[0], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
	});
	it("adds a line break after the containing component's last ancestor and moves the cursor after the line break", () => {
		let component1: CompositeMathComponentMock, component2: CompositeMathComponentMock;
		const doc = new MathDocument([
			component1 = new CompositeMathComponentMock(new MathComponentGroup([
				component2 = new CompositeMathComponentMock(),
			])),
		]);
		const cursor = new Cursor(component2.componentsGroup, null);
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 2);
		assert.equal(doc.componentsGroup.components[0], component1);
		assert.instanceOf(doc.componentsGroup.components[1], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
	});
	it("replaces the selected components with a linebreak if the components are top-level", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol, new Selection(symbol, symbol));
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.instanceOf(doc.componentsGroup.components[0], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
	});
	it("adds a line break after the containing component's last ancestor even if the user has a nonempty selection", () => {
		let container: CompositeMathComponentMock, symbol: MathSymbol;
		const doc = new MathDocument([
			container = new CompositeMathComponentMock(new MathComponentGroup([
				symbol = new MathSymbol("A"),
			])),
		]);
		const cursor = new Cursor(container.componentsGroup, symbol, new Selection(symbol, symbol));
		LineBreak.addLineBreak(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 2);
		assert.equal(doc.componentsGroup.components[0], container);
		assert.instanceOf(doc.componentsGroup.components[1], LineBreak);
		assert.instanceOf(cursor.predecessor, LineBreak);
	});
});
