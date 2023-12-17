import { describe, it, beforeEach } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { Selection } from "../Selection.mjs";
import { Fraction } from "../math-components/Fraction.mjs";
import { JSDOM } from "jsdom";
import { App } from "../App.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";

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
describe("Cursor.deletePrevious", () => {
	it("deletes the previous component if there is one", () => {
		let symbolA, symbolB: MathSymbol;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbolA);
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, [symbolB]);
		assert.equal(cursor.predecessor, null);
	});
	it("exits the containing component if there is no previous component and the group is nonempty", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([mock = new EnterableComponentMock([new MathSymbol("A")])]);
		const cursor = new Cursor(mock.componentsGroup, null);
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, [mock]);
		assert.deepEqual(mock.componentsGroup.components, [new MathSymbol("A")]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("deletes the selected components if the selection is nonempty", () => {
		let symbolA, symbolB: MathSymbol;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB));
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, []);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("does nothing if the cursor is at the beginning of the document and there is no selection", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.deletePrevious(doc);

		assert.deepEqual(doc.componentsGroup.components, []);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("deletes the previous EnterableMathComponent if it is empty", () => {
		let mock;
		const doc = new MathDocument([
			mock = new EnterableComponentMock(),
		]);
		const cursor = new Cursor(doc.componentsGroup, mock);
		cursor.deletePrevious(doc);
		assert.equal(doc.componentsGroup.components.length, 0);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("enters the previous EnterableMathComponent if it is not empty", () => {
		let mock, symbol;
		const doc = new MathDocument([
			mock = new EnterableComponentMock([
				symbol = new MathSymbol("A"),
			]),
		]);
		const cursor = new Cursor(doc.componentsGroup, mock);
		cursor.deletePrevious(doc);
		assert.deepEqual(doc.componentsGroup.components, [mock]);
		assert.deepEqual(mock.componentsGroup.components, [symbol]);
		assert.equal(cursor.container, mock.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("deletes the container and concatenates the groups if the group is empty and has deleteOnStart=only-when-empty", () => {
		let symbol;
		const fraction = new Fraction(new MathComponentGroup([]), new MathComponentGroup([symbol = new MathSymbol("A")]));
		fraction.deleteAtStart = "only-when-empty";
		const doc = new MathDocument([fraction]);
		const cursor = new Cursor(fraction.numerator, null);
		cursor.deletePrevious(doc);
		assert.sameOrderedMembers(doc.componentsGroup.components, [symbol]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
	it("deletes the container and concatenates the groups if the container has deleteOnStart=always", () => {
		let symbolA, symbolB;
		const parenthese = new Parenthese(new MathComponentGroup([
			symbolA = new MathSymbol("A"),
		]), "round");
		parenthese.deleteAtStart = "always";
		const doc = new MathDocument([symbolB = new MathSymbol("B"), parenthese]);
		const cursor = new Cursor(parenthese.components, null);
		cursor.deletePrevious(doc);
		assert.sameOrderedMembers(doc.componentsGroup.components, [symbolB, symbolA]);
		assert.equal(cursor.container, doc.componentsGroup);
		assert.equal(cursor.predecessor, symbolB);
	});
});
describe("Cursor.lastCommonAncestor", () => {
	it("returns the last common ancestor, along with the two children that contain each cursor", () => {
		let container1, container2, container3;
		const doc = new MathDocument([
			container1 = new EnterableComponentMock(new MathComponentGroup([
				container2 = new EnterableComponentMock(),
			])),
			container3 = new EnterableComponentMock(),
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
			container = new EnterableComponentMock(),
		]);
		const cursor1 = new Cursor(doc.componentsGroup, null);
		const cursor2 = new Cursor(container.componentsGroup, null);
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		assert.equal(ancestor, doc.componentsGroup);
		assert.equal(child1, cursor1);
		assert.equal(child2, container);
	});
	it("works when there is an EnterableMathComponent with multiple MathComponentGroups", () => {
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
			container1 = new EnterableComponentMock(new MathComponentGroup([])),
			container2 = new EnterableComponentMock(new MathComponentGroup([])),
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
			"<html> <body> <div id='document-container'></div> </body> </html>",
			{ url: "http://localhost" },
		);
		global.document = dom.window.document;
		global.DOMRect = dom.window.DOMRect;
		global.MouseEvent = dom.window.MouseEvent;
	});

	it("returns a cursor next to the component you clicked on", () => {
		let symbol;
		const app = new App(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			symbol = new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			new MathSymbolMock("C", new DOMRect(20, 0, 10, 10)),
		]));
		app.renderAndUpdate();
		document.querySelector(".line")!.getBoundingClientRect = () => new DOMRect(0, 0, 30, 10);

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 20, clientY: 5 }));
		assert.equal(cursor.container, app.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor at the end of the line, but before the line break, when you click to the right of the last component", () => {
		let symbol;
		const app = new App(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new LineBreak(),
			symbol = new MathSymbolMock("B", new DOMRect(0, 10, 10, 10)),
			new LineBreak(),
			new MathSymbolMock("C", new DOMRect(0, 20, 10, 10)),
		]));
		app.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 10, 10);
		lines[2].getBoundingClientRect = () => new DOMRect(0, 20, 10, 10);

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 100, clientY: 15 }));
		assert.equal(cursor.container, app.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor inside the enterable component when you click on one", () => {
		let symbol, enterable;
		const app = new App(new MathDocument([
			enterable = new EnterableComponentMock([
				symbol = new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
				new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			], new DOMRect(0, 0, 20, 10)),
			new MathSymbolMock("C", new DOMRect(20, 0, 10, 10)),
		]));
		app.renderAndUpdate();
		document.querySelector(".line")!.getBoundingClientRect = () => new DOMRect(0, 0, 30, 10);

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 10, clientY: 5 }));
		assert.equal(cursor.container, enterable.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor on the first line when you click above the first line", () => {
		let symbol;
		const app = new App(new MathDocument([
			symbol = new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new MathSymbolMock("B", new DOMRect(10, 0, 10, 10)),
			new LineBreak(),
			new MathSymbolMock("C", new DOMRect(0, 10, 10, 10)),
		]));
		app.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 20, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 10, 10);

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 10, clientY: -100 }));
		assert.equal(cursor.container, app.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("returns a cursor on the last line when you click below the last line", () => {
		let symbol;
		const app = new App(new MathDocument([
			new MathSymbolMock("A", new DOMRect(0, 0, 10, 10)),
			new LineBreak(),
			symbol = new MathSymbolMock("B", new DOMRect(0, 10, 10, 10)),
			new MathSymbolMock("C", new DOMRect(10, 10, 10, 10)),
		]));
		app.renderAndUpdate();
		const lines = [...document.querySelectorAll(".line")];
		lines[0].getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
		lines[1].getBoundingClientRect = () => new DOMRect(0, 10, 20, 10);

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 10, clientY: 100 }));
		assert.equal(cursor.container, app.document.componentsGroup);
		assert.equal(cursor.predecessor, symbol);
	});
	it("works when you click on an empty line", () => {
		const app = new App(new MathDocument([]));
		app.renderAndUpdate();

		const cursor = Cursor.fromClick(app, new MouseEvent("click", { clientX: 10, clientY: 5 }));
		assert.equal(cursor.container, app.document.componentsGroup);
		assert.equal(cursor.predecessor, null);
	});
});
