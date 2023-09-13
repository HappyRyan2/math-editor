import { describe, it } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { Selection } from "../Selection.mjs";

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of its container", () => {
		const doc = new MathDocument([new MathSymbol("x")]);
		const cursor = new Cursor(doc.componentsGroup, null);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("y", doc.componentsGroup),
			new MathSymbol("x", doc.componentsGroup),
		]);
		assert.equal(cursor.predecessor, doc.componentsGroup.components[0]);
	});
	it("correctly adds the component when the cursor is not at the beginning of its container", () => {
		const doc = new MathDocument([new MathSymbol("x")]);
		const cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0]);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("x", doc.componentsGroup),
			new MathSymbol("y", doc.componentsGroup),
		]);
		assert.equal(cursor.predecessor, doc.componentsGroup.components[1]);
	});
});

(() => {
	class EnterableComponentMock extends EnterableMathComponent {
		componentsGroup: MathComponentGroup;
		enteredFromLeft: boolean = false;
		enteredFromRight: boolean = false;
		constructor(componentsGroup?: MathComponentGroup) {
			super();
			this.componentsGroup = componentsGroup ?? new MathComponentGroup([]);
			this.componentsGroup.container = this;
		}
		enterFromLeft(): void {
			this.enteredFromLeft = true;
		}
		enterFromRight(): void {
			this.enteredFromRight = true;
		}
		render(): HTMLElement {
			throw new Error("Not yet implemented");
		}
	}
	describe("Cursor.moveRight", () => {
		it("moves past the next component if the component is not enterable", () => {
			let symbol: MathSymbol;
			const doc = new MathDocument([symbol = new MathSymbol("a")]);
			const cursor = new Cursor(doc.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, symbol);
		});
		it("moves into the next component if the component is enterable", () => {
			let mock: EnterableComponentMock;
			const doc = new MathDocument([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(doc.componentsGroup, null);
			cursor.moveRight();
			assert.isTrue(mock.enteredFromLeft);
			assert.isFalse(mock.enteredFromRight);
		});
		it("moves out of the containing component if there is no next component", () => {
			let mock: EnterableComponentMock;
			const doc = new MathDocument([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(mock.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, mock);
		});
		it("does nothing when the cursor is at the end of the document", () => {
			const doc = new MathDocument([]);
			const cursor = new Cursor(doc.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
	});
	describe("Cursor.moveLeft", () => {
		it("moves past the previous component if the component is not enterable", () => {
			const doc = new MathDocument([new MathSymbol("a")]);
			const cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0]);
			cursor.moveLeft();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
		it("moves into the previous component if the previous component is enterable", () => {
			let mock: EnterableComponentMock;
			const doc = new MathDocument([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(doc.componentsGroup, mock);
			cursor.moveLeft();
			assert.isTrue(mock.enteredFromRight);
			assert.isFalse(mock.enteredFromLeft);
		});
		it("moves out of the containing component if there is no previous component", () => {
			let mock: EnterableComponentMock;
			const doc = new MathDocument([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(mock.componentsGroup, null);
			cursor.moveLeft();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
		it("does nothing when the cursor is at the beginning of the doc", () => {
			const doc = new MathDocument([]);
			const cursor = new Cursor(doc.componentsGroup, null);
			cursor.moveLeft();
			assert.equal(cursor.container, doc.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
	});
}) ();
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
