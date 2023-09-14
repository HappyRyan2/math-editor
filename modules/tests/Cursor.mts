import { describe, it } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { Selection } from "../Selection.mjs";

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of its container", () => {
		const doc = new MathDocument([new MathSymbol("x")]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("y"),
			new MathSymbol("x"),
		]);
		assert.equal(cursor.predecessor, doc.componentsGroup.components[0]);
	});
	it("correctly adds the component when the cursor is not at the beginning of its container", () => {
		const doc = new MathDocument([new MathSymbol("x")]);
		const cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0]);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("x"),
			new MathSymbol("y"),
		]);
		assert.equal(cursor.predecessor, doc.componentsGroup.components[1]);
	});
});

describe("Cursor.moveRight", () => {
	it("moves past the next component if the component is not enterable", () => {
		let symbol: MathSymbol;
		const doc = new MathDocument([symbol = new MathSymbol("a")]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("moves into the next component if the component is enterable", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([mock = new EnterableComponentMock()]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveRight(doc);
		assert.isTrue(mock.enteredFromLeft);
		assert.isFalse(mock.enteredFromRight);
	});
	it("moves out of the containing component if there is no next component", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([mock = new EnterableComponentMock()]);
		const cursor = new Cursor(mock.componentsGroup, null);
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, mock);
	});
	it("does nothing when the cursor is at the end of the document", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
});
describe("Cursor.moveLeft", () => {
	it("moves past the previous component if the component is not enterable", () => {
		const doc = new MathDocument([new MathSymbol("a")]);
		const cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0]);
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("moves into the previous component if the previous component is enterable", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([mock = new EnterableComponentMock()]);
		const cursor = new Cursor(doc.componentsGroup, mock);
		cursor.moveLeft(doc);
		assert.isTrue(mock.enteredFromRight);
		assert.isFalse(mock.enteredFromLeft);
	});
	it("moves out of the containing component if there is no previous component", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([mock = new EnterableComponentMock()]);
		const cursor = new Cursor(mock.componentsGroup, null);
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("does nothing when the cursor is at the beginning of the doc", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
});
describe("Cursor.selectRight", () => {
	it("selects the next component if there is one and the current selection is empty", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.selectRight(doc);
		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbol);
		assert.equal(cursor.selection!.end, symbol);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("selects the next component if there is one and the current selection is nonempty", () => {
		const symbolA = new MathSymbol("A");
		const symbolB = new MathSymbol("B");
		const doc = new MathDocument([symbolA, symbolB]);
		const cursor = new Cursor(doc.componentsGroup, symbolA, new Selection(symbolA, symbolA));
		cursor.selectRight(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolA);
		assert.equal(cursor.selection!.end, symbolB);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolB);
	});
	it("does nothing if it is at the end of the document and the current selection is empty", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		cursor.selectRight(doc);

		assert.isNull(cursor.selection);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("does nothing if it is at the end of the document and the current selection is nonempty", () => {
		const symbolA = new MathSymbol("A");
		const doc = new MathDocument([symbolA]);
		const cursor = new Cursor(doc.componentsGroup, symbolA, new Selection(symbolA, symbolA));
		cursor.selectRight(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolA);
		assert.equal(cursor.selection!.end, symbolA);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
	});
	it("selects the containing component if there is no next component and the current selection is empty", () => {
		const mock = new EnterableComponentMock();
		const doc = new MathDocument([mock]);
		const cursor = new Cursor(mock.componentsGroup, null);
		cursor.selectRight(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, mock);
		assert.equal(cursor.selection!.end, mock);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, mock);
	});
	it("selects the containing component if there is no next component and the current selection is nonempty", () => {
		const symbol = new MathSymbol("A");
		const mock = new EnterableComponentMock(new MathComponentGroup([symbol]));
		const doc = new MathDocument([mock]);
		const cursor = new Cursor(mock.componentsGroup, symbol, new Selection(symbol, symbol));
		cursor.selectRight(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, mock);
		assert.equal(cursor.selection!.end, mock);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, mock);
	});
	it("deselects the next component if the next component is selected, possibly resulting in an empty selection", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbol, symbol));
		cursor.selectRight(doc);

		assert.isNull(cursor.selection);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("deselects the next component if the next component is selected, possibly resulting in a nonempty selection", () => {
		const symbolA = new MathSymbol("A");
		const symbolB = new MathSymbol("B");
		const doc = new MathDocument([symbolA, symbolB]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB));
		cursor.selectRight(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolB);
		assert.equal(cursor.selection!.end, symbolB);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
	});
});
describe("Cursor.selectLeft", () => {
	it("selects the previous component if there is one and the current selection is empty", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		cursor.selectLeft(doc);
		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbol);
		assert.equal(cursor.selection!.end, symbol);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("selects the previous component if there is one and the current selection is nonempty", () => {
		const symbolA = new MathSymbol("A");
		const symbolB = new MathSymbol("B");
		const doc = new MathDocument([symbolA, symbolB]);
		const cursor = new Cursor(doc.componentsGroup, symbolA, new Selection(symbolB, symbolB));
		cursor.selectLeft(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolA);
		assert.equal(cursor.selection!.end, symbolB);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("does nothing if it is at the beginning of the document and the current selection is empty", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.selectLeft(doc);

		assert.isNull(cursor.selection);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("does nothing if it is at the beginning of the document and the current selection is nonempty", () => {
		const symbolA = new MathSymbol("A");
		const doc = new MathDocument([symbolA]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolA));
		cursor.selectLeft(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolA);
		assert.equal(cursor.selection!.end, symbolA);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("selects the containing component if there is no previous component and the current selection is empty", () => {
		const mock = new EnterableComponentMock();
		const doc = new MathDocument([mock]);
		const cursor = new Cursor(mock.componentsGroup, null);
		cursor.selectLeft(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, mock);
		assert.equal(cursor.selection!.end, mock);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("selects the containing component if there is no previous component and the current selection is nonempty", () => {
		const symbol = new MathSymbol("A");
		const mock = new EnterableComponentMock(new MathComponentGroup([symbol]));
		const doc = new MathDocument([mock]);
		const cursor = new Cursor(mock.componentsGroup, null, new Selection(symbol, symbol));
		cursor.selectLeft(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, mock);
		assert.equal(cursor.selection!.end, mock);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("deselects the previous component if the previous component is selected, possibly resulting in an empty selection", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol, new Selection(symbol, symbol));
		cursor.selectLeft(doc);

		assert.isNull(cursor.selection);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("deselects the previous component if the previous component is selected, possibly resulting in a nonempty selection", () => {
		const symbolA = new MathSymbol("A");
		const symbolB = new MathSymbol("B");
		const doc = new MathDocument([symbolA, symbolB]);
		const cursor = new Cursor(doc.componentsGroup, symbolB, new Selection(symbolA, symbolB));
		cursor.selectLeft(doc);

		assert.isNotNull(cursor.selection);
		assert.equal(cursor.selection!.start, symbolA);
		assert.equal(cursor.selection!.end, symbolA);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
	});
});
describe("Cursor.selectionPosition", () => {
	it("returns 'start' if the cursor is at the start of the selection", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbol, symbol));
		assert.equal(cursor.selectionPosition(), "start");
	});
	it("returns 'end' if the cursor is at the end of the selection", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol, new Selection(symbol, symbol));
		assert.equal(cursor.selectionPosition(), "end");
	});
	it("returns null if there is no selection", () => {
		const symbol = new MathSymbol("A");
		const doc = new MathDocument([symbol]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		assert.equal(cursor.selectionPosition(), null);
	});
});
