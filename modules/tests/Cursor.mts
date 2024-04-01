import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { CompositeMathComponentMock, assertValidRenderedDocument } from "./test-utils.mjs";
import { Selection } from "../Selection.mjs";
import { Fraction } from "../math-components/Fraction.mjs";
import { JSDOM } from "jsdom";
import { App } from "../App.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";

beforeEach(() => {
	const dom = new JSDOM(
		"<html> <body> <div id='tabs-container'> </div> <div id='math-document'></div> </body> </html>",
		{ url: "http://localhost" },
	);
	global.document = dom.window.document;
	global.HTMLElement = dom.window.HTMLElement;
});

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of its container", () => {
		App.loadDocument(new MathDocument([new MathSymbol("x")]));
		const cursor = new Cursor(App.document.componentsGroup, null);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(App.document.componentsGroup.components, [
			new MathSymbol("y"),
			new MathSymbol("x"),
		]);
		assert.equal(cursor.predecessor, App.document.componentsGroup.components[0]);
		assertValidRenderedDocument(true);
	});
	it("correctly adds the component when the cursor is not at the beginning of its container", () => {
		App.loadDocument(new MathDocument([new MathSymbol("x")]));
		const cursor = new Cursor(App.document.componentsGroup, App.document.componentsGroup.components[0]);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(App.document.componentsGroup.components, [
			new MathSymbol("x"),
			new MathSymbol("y"),
		]);
		assert.equal(cursor.predecessor, App.document.componentsGroup.components[1]);
		assertValidRenderedDocument(true);
	});
});

describe("Cursor.moveRight", () => {
	it("moves past the next component if the component is not a composite component", () => {
		let symbol: MathSymbol;
		const doc = new MathDocument([symbol = new MathSymbol("a")]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("moves into the next component if the component is a composite component", () => {
		let mock: CompositeMathComponentMock;
		const doc = new MathDocument([mock = new CompositeMathComponentMock()]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.moveRight(doc);
		assert.isTrue(mock.enteredFromLeft);
		assert.isFalse(mock.enteredFromRight);
	});
	it("moves out of the containing component if there is no next component", () => {
		let mock: CompositeMathComponentMock;
		const doc = new MathDocument([mock = new CompositeMathComponentMock()]);
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
	it("clears the selection when the cursor is at the end of its selection", () => {
		let symbolA;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbolA, new Selection(symbolA, symbolA));
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
		assert.equal(cursor.selection, null);
	});
	it("moves the cursor to the end of its selection when the cursor is at the beginning of its selection", () => {
		let symbolA, symbolB;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
			new MathSymbol("C"),
		]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB));
		cursor.moveRight(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolB);
		assert.equal(cursor.selection, null);
	});
});
describe("Cursor.moveLeft", () => {
	it("moves past the previous component if the component is not a composite component", () => {
		const doc = new MathDocument([new MathSymbol("a")]);
		const cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0]);
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("moves into the previous component if the previous component is a composite component", () => {
		let mock: CompositeMathComponentMock;
		const doc = new MathDocument([mock = new CompositeMathComponentMock()]);
		const cursor = new Cursor(doc.componentsGroup, mock);
		cursor.moveLeft(doc);
		assert.isTrue(mock.enteredFromRight);
		assert.isFalse(mock.enteredFromLeft);
	});
	it("moves out of the containing component if there is no previous component", () => {
		let mock: CompositeMathComponentMock;
		const doc = new MathDocument([mock = new CompositeMathComponentMock()]);
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
	it("clears the selection when the cursor is at the beginning of its selection", () => {
		let symbolA, symbolB;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbolA, new Selection(symbolB, symbolB));
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
		assert.equal(cursor.selection, null);
	});
	it("moves the cursor to the beginning of its selection when the cursor is at the end of its selection", () => {
		let symbolA, symbolB, symbolC;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
			symbolC = new MathSymbol("C"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbolC, new Selection(symbolB, symbolC));
		cursor.moveLeft(doc);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolA);
		assert.equal(cursor.selection, null);
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
		const mock = new CompositeMathComponentMock();
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
		const mock = new CompositeMathComponentMock(new MathComponentGroup([symbol]));
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
		const mock = new CompositeMathComponentMock();
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
		const mock = new CompositeMathComponentMock(new MathComponentGroup([symbol]));
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
describe("Cursor.deletePrevious", () => {
	it("deletes the previous component if there is one", () => {
		let symbolA, symbolB: MathSymbol, doc: MathDocument;
		App.loadDocument(doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]));
		const cursor = new Cursor(doc.componentsGroup, symbolA);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, [symbolB]);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("exits the containing component if there is no previous component and the group is nonempty", () => {
		let mock: CompositeMathComponentMock, doc: MathDocument;
		App.loadDocument(doc = new MathDocument([mock = new CompositeMathComponentMock([new MathSymbol("A")])]));
		const cursor = new Cursor(mock.componentsGroup, null);
		App.activeTab.cursors = [cursor];
		App.renderAndUpdate();
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, [mock]);
		assert.deepEqual(mock.componentsGroup.components, [new MathSymbol("A")]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("deletes the selected components if the selection is nonempty", () => {
		let symbolA, symbolB: MathSymbol, doc: MathDocument, cursor: Cursor;
		App.loadDocument(doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB))];
		App.renderAndUpdate();
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, []);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("does nothing if the cursor is at the beginning of the document and there is no selection", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();
		App.cursors[0].deletePrevious(App.document);

		assert.deepEqual(App.document.componentsGroup.components, []);
		assert.equal(App.cursors[0].container, App.document.componentsGroup);
		assert.equal(App.cursors[0].predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("deletes the previous CompositeMathComponent if it is empty", () => {
		let mock, doc, cursor;
		App.loadDocument(doc = new MathDocument([
			mock = new CompositeMathComponentMock(),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, mock)];
		App.renderAndUpdate();

		cursor.deletePrevious(doc);
		assert.equal(doc.componentsGroup.components.length, 0);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("enters the previous CompositeMathComponent if it is not empty", () => {
		let doc, mock, symbol, cursor;
		App.loadDocument(doc = new MathDocument([
			mock = new CompositeMathComponentMock([
				symbol = new MathSymbol("A"),
			]),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, mock)];
		App.renderAndUpdate();
		cursor.deletePrevious(doc);
		assert.deepEqual(doc.componentsGroup.components, [mock]);
		assert.deepEqual(mock.componentsGroup.components, [symbol]);
		assert.equal(cursor.container, mock.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
		assertValidRenderedDocument(false);
	});
	it("deletes the container and concatenates the groups if the group is empty and has deleteOnStart=only-when-empty", () => {
		let doc, symbol, fraction, cursor;
		App.loadDocument(doc = new MathDocument([
			fraction = new Fraction(new MathComponentGroup([]), new MathComponentGroup([symbol = new MathSymbol("A")])),
		]));
		App.activeTab.cursors = [cursor = new Cursor(fraction.numerator, null)];
		App.renderAndUpdate();
		fraction.deleteAtStart = "only-when-empty";

		cursor.deletePrevious(doc);
		assert.sameOrderedMembers(doc.componentsGroup.components, [symbol]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("does not remove the cursor from App.cursors", () => {
		let doc, fraction, cursor;
		App.loadDocument(doc = new MathDocument([
			fraction = new Fraction(new MathComponentGroup([]), new MathComponentGroup([])),
		]));
		App.activeTab.cursors = [cursor = new Cursor(fraction.denominator, null)];
		App.renderAndUpdate();

		cursor.deletePrevious(doc);
		assert.sameOrderedMembers(App.cursors, [cursor]);
		assertValidRenderedDocument(false);
	});
	it("deletes the container and concatenates the groups if the container has deleteOnStart=always", () => {
		let doc, symbolA, symbolB, parenthese, cursor;
		App.loadDocument(doc = new MathDocument([
			symbolB = new MathSymbol("B"),
			parenthese = new Parenthese(
				new MathComponentGroup([ symbolA = new MathSymbol("A") ]),
				"round",
			),
		]));
		App.activeTab.cursors = [cursor = new Cursor(parenthese.components, null)];
		App.renderAndUpdate();
		parenthese.deleteAtStart = "always";

		cursor.deletePrevious(doc);
		assert.sameOrderedMembers(doc.componentsGroup.components, [symbolB, symbolA]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolB);
		assertValidRenderedDocument(false);
	});
	it("works when the previous component is a line break", () => {
		let doc, lineBreak, cursor;
		App.loadDocument(doc = new MathDocument([
			lineBreak = new LineBreak(),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, lineBreak)];
		App.renderAndUpdate();

		cursor.deletePrevious(doc);
		assert.equal(doc.componentsGroup.components.length, 0);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
		assert.equal(cursor.selection, null);
		assertValidRenderedDocument(false);
	});
});
describe("Cursor.lastCommonAncestor", () => {
	it("returns the last common ancestor, along with the two children that contain each cursor", () => {
		let container1, container2, container3;
		const doc = new MathDocument([
			container1 = new CompositeMathComponentMock(new MathComponentGroup([
				container2 = new CompositeMathComponentMock(),
			])),
			container3 = new CompositeMathComponentMock(),
		]);
		const cursor1 = new Cursor(container2.componentsGroup, null);
		const cursor2 = new Cursor(container3.componentsGroup, null);
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		assert.equal(ancestor, doc.componentsGroup);
		assert.equal(child1, container1);
		assert.equal(child2, container3);
	});
	it("works when the two cursors have the same container", () => {
		const doc = new MathDocument([]);
		const cursor1 = new Cursor(doc.componentsGroup, null);
		const cursor2 = new Cursor(doc.componentsGroup, null);
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		assert.equal(ancestor, doc.componentsGroup);
		assert.equal(child1, cursor1);
		assert.equal(child2, cursor2);
	});
	it("works when the last common ancestor is the container of only one of the cursors", () => {
		let container;
		const doc = new MathDocument([
			container = new CompositeMathComponentMock(),
		]);
		const cursor1 = new Cursor(doc.componentsGroup, null);
		const cursor2 = new Cursor(container.componentsGroup, null);
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		assert.equal(ancestor, doc.componentsGroup);
		assert.equal(child1, cursor1);
		assert.equal(child2, container);
	});
	it("works when there is an CompositeMathComponent with multiple MathComponentGroups", () => {
		let fraction: Fraction, group1:MathComponentGroup, group2: MathComponentGroup;
		const doc = new MathDocument([
			fraction = new Fraction(
				group1 = new MathComponentGroup([]),
				group2 = new MathComponentGroup([]),
			),
		]);
		const cursor1 = new Cursor(group1, null);
		const cursor2 = new Cursor(group2, null);
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		assert.equal(ancestor, doc.componentsGroup);
		assert.equal(child1, fraction);
		assert.equal(child2, fraction);
	});
});
describe("Cursor.selectBetween", () => {
	it("selects the content between the two cursors", () => {
		let symbolA, symbolB, symbolC;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
			symbolC = new MathSymbol("C"),
			new MathSymbol("D"),
		]);
		const cursor1 = new Cursor(doc.componentsGroup, symbolA);
		const cursor2 = new Cursor(doc.componentsGroup, symbolC);
		const result = Cursor.selectBetween(cursor1, cursor2, doc);
		assert.equal(result.container, doc.componentsGroup);
		assert.equal(result.predecessor, symbolA);
		assert.equal(result.selection?.start, symbolB);
		assert.equal(result.selection?.end, symbolC);
	});
	it("selects the content in the last common ancestor if the cursors do not have the same container", () => {
		let container1, container2;
		const doc = new MathDocument([
			container1 = new CompositeMathComponentMock(new MathComponentGroup([])),
			container2 = new CompositeMathComponentMock(new MathComponentGroup([])),
		]);
		const cursor1 = new Cursor(container1.componentsGroup, null);
		const cursor2 = new Cursor(container2.componentsGroup, null);
		const result = Cursor.selectBetween(cursor1, cursor2, doc);
		assert.equal(result.container, doc.componentsGroup);
		assert.equal(result.predecessor, null);
		assert.equal(result.selection?.start, container1);
		assert.equal(result.selection?.end, container2);
	});
});

describe("Cursor.fromClick", () => {
	class MathSymbolMock extends MathSymbol {
		rect: DOMRect;
		constructor(symbol: string, rect: DOMRect) {
			super(symbol);
			this.rect = rect;
		}
		render() {
			const result = super.render();
			result.getBoundingClientRect = () => this.rect;
			return result;
		}
	}
	beforeEach(() => {
		const dom = new JSDOM(
			"<html> <body> <div id='tabs-container'> </div> <div id='math-document'></div> </body> </html>",
			{ url: "http://localhost" },
		);
		global.document = dom.window.document;
		global.DOMRect = dom.window.DOMRect;
		global.MouseEvent = dom.window.MouseEvent;
	});

	it("returns a cursor next to the component you clicked on", () => {
		let symbol;
		App.loadDocument(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			symbol = new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			new MathSymbolMock("C", new DOMRect(20, 0, 10, 10)),
		]));
		App.renderAndUpdate();
		document.querySelector(".line")!.getBoundingClientRect = () => new DOMRect(0, 0, 30, 10);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 20, clientY: 5 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor at the end of the line, but before the line break, when you click to the right of the last component", () => {
		let symbol;
		App.loadDocument(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new LineBreak(),
			symbol = new MathSymbolMock("B", new DOMRect(0, 10, 10, 10)),
			new LineBreak(),
			new MathSymbolMock("C", new DOMRect(0, 20, 10, 10)),
		]));
		App.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 10, 10);
		lines[2].getBoundingClientRect = () => new DOMRect(0, 20, 10, 10);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 100, clientY: 15 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor inside the composite math component when you click on one", () => {
		let symbol, mock;
		App.loadDocument(new MathDocument([
			mock = new CompositeMathComponentMock([
				symbol = new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
				new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			], new DOMRect(0, 0, 20, 10)),
			new MathSymbolMock("C", new DOMRect(20, 0, 10, 10)),
		]));
		App.renderAndUpdate();
		document.querySelector(".line")!.getBoundingClientRect = () => new DOMRect(0, 0, 30, 10);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 10, clientY: 5 }));
		assert.equal(cursor.container, mock.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor on the first line when you click above the first line", () => {
		let symbol;
		App.loadDocument(new MathDocument([
			symbol = new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			new LineBreak(),
			new MathSymbolMock("C", new DOMRect(0, 10, 10, 10)),
		]));
		App.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 20, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 10, 10);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 10, clientY: -100 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor on the last line when you click below the last line", () => {
		let symbol;
		App.loadDocument(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new LineBreak(),
			symbol = new MathSymbolMock("B", new DOMRect(0, 10, 10, 10)),
			new MathSymbolMock("C", new DOMRect(10, 10, 10, 10)),
		]));
		App.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 20, 10);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 10, clientY: 100 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("works when you click on an empty line", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 10, clientY: 5 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("works when you click on a line that is broken by word wrapping", () => {
		let symbol;
		App.loadDocument(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new MathSymbolMock(" ", new DOMRect(10, 0, 10, 10)),

			symbol = new MathSymbolMock("B", new DOMRect(0, 10, 10, 10)),
			new MathSymbolMock(" ", new DOMRect(10, 10, 10, 10)),

			new MathSymbolMock("C", new DOMRect(0, 20, 10, 10)),
			new MathSymbolMock(" ", new DOMRect(10, 20, 10, 10)),
		]));
		App.renderAndUpdate();
		const line = document.querySelector(".line");
		line!.getBoundingClientRect = () => new DOMRect(0, 0, 20, 30);

		const cursor = Cursor.fromClick(new MouseEvent("click", { clientX: 10, clientY: 15 }));
		assert.equal(cursor.container, App.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
});
describe("Cursor.createCursorFromSelection", () => {
	it("works when the selection is a sequence of MathSymbols", () => {
		let originalPredecessor, originalSelectionStart, originalSelectionEnd, additionalPredecessor, additionalSelectionStart, additionalSelectionEnd;
		const doc = new MathDocument([
			new MathSymbol("A"),
			originalPredecessor = new MathSymbol("B"),
			originalSelectionStart = new MathSymbol("A"),
			originalSelectionEnd = new MathSymbol("B"),
			additionalPredecessor = new MathSymbol("C"),
			additionalSelectionStart = new MathSymbol("A"),
			additionalSelectionEnd = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, originalPredecessor, new Selection(originalSelectionStart, originalSelectionEnd));
		const newCursor = cursor.createCursorFromSelection(doc);
		assert.isNotNull(newCursor);
		assert.equal(newCursor!.container, doc.componentsGroup);
		assert.equal(newCursor!.predecessor, additionalPredecessor);
		assert.equal(newCursor!.selection?.start, additionalSelectionStart);
		assert.equal(newCursor!.selection?.end, additionalSelectionEnd);
	});
	it("wraps around to the beginning of the document when there is no match before the end", () => {
		let originalSelectionStart, originalSelectionEnd, additionalSelectionStart, additionalSelectionEnd;
		const doc = new MathDocument([
			additionalSelectionStart = new MathSymbol("A"),
			additionalSelectionEnd = new MathSymbol("B"),
			new MathSymbol("A"),
			new MathSymbol("B"),
			new MathSymbol("C"),
			originalSelectionStart = new MathSymbol("A"),
			originalSelectionEnd = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, originalSelectionEnd, new Selection(originalSelectionStart, originalSelectionEnd));
		const newCursor = cursor.createCursorFromSelection(doc);
		assert.isNotNull(newCursor);
		assert.equal(newCursor!.container, doc.componentsGroup);
		assert.equal(newCursor!.predecessor, additionalSelectionEnd);
		assert.equal(newCursor!.selection?.start, additionalSelectionStart);
		assert.equal(newCursor!.selection?.end, additionalSelectionEnd);
	});
});
