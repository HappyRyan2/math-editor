import { describe, it } from "mocha";
import { assert } from "chai";
import { Line } from "../Line.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { Selection } from "../Selection.mjs";

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of the line", () => {
		const line = new Line([new MathSymbol("x")]);
		const cursor = new Cursor(line.componentsGroup, null);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(line.componentsGroup.components, [
			new MathSymbol("y", line.componentsGroup),
			new MathSymbol("x", line.componentsGroup),
		]);
		assert.equal(cursor.predecessor, line.componentsGroup.components[0]);
	});
	it("correctly adds the component when the cursor is not at the beginning of the line", () => {
		const line = new Line([new MathSymbol("x")]);
		const cursor = new Cursor(line.componentsGroup, line.componentsGroup.components[0]);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(line.componentsGroup.components, [
			new MathSymbol("x", line.componentsGroup),
			new MathSymbol("y", line.componentsGroup),
		]);
		assert.equal(cursor.predecessor, line.componentsGroup.components[1]);
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
			const line = new Line([symbol = new MathSymbol("a")]);
			const cursor = new Cursor(line.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, symbol);
		});
		it("moves into the next component if the component is enterable", () => {
			let mock: EnterableComponentMock;
			const line = new Line([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(line.componentsGroup, null);
			cursor.moveRight();
			assert.isTrue(mock.enteredFromLeft);
			assert.isFalse(mock.enteredFromRight);
		});
		it("moves out of the containing component if there is no next component", () => {
			let mock: EnterableComponentMock;
			const line = new Line([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(mock.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, mock);
		});
		it("does nothing when the cursor is at the end of the line", () => {
			const line = new Line([]);
			const cursor = new Cursor(line.componentsGroup, null);
			cursor.moveRight();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
	});
	describe("Cursor.moveLeft", () => {
		it("moves past the previous component if the component is not enterable", () => {
			const line = new Line([new MathSymbol("a")]);
			const cursor = new Cursor(line.componentsGroup, line.componentsGroup.components[0]);
			cursor.moveLeft();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
		it("moves into the previous component if the previous component is enterable", () => {
			let mock: EnterableComponentMock;
			const line = new Line([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(line.componentsGroup, mock);
			cursor.moveLeft();
			assert.isTrue(mock.enteredFromRight);
			assert.isFalse(mock.enteredFromLeft);
		});
		it("moves out of the containing component if there is no previous component", () => {
			let mock: EnterableComponentMock;
			const line = new Line([mock = new EnterableComponentMock()]);
			const cursor = new Cursor(mock.componentsGroup, null);
			cursor.moveLeft();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
		it("does nothing when the cursor is at the beginning of the line", () => {
			const line = new Line([]);
			const cursor = new Cursor(line.componentsGroup, null);
			cursor.moveLeft();
			assert.equal(cursor.container, line.componentsGroup);
			assert.equal(cursor.predecessor, null);
		});
	});
}) ();
describe("Cursor.selectionPosition", () => {
	it("returns 'start' if the cursor is at the start of the selection", () => {
		const symbol = new MathSymbol("A");
		const line = new Line([symbol]);
		const cursor = new Cursor(line.componentsGroup, null, new Selection(symbol, symbol));
		assert.equal(cursor.selectionPosition(), "start");
	});
	it("returns 'end' if the cursor is at the end of the selection", () => {
		const symbol = new MathSymbol("A");
		const line = new Line([symbol]);
		const cursor = new Cursor(line.componentsGroup, symbol, new Selection(symbol, symbol));
		assert.equal(cursor.selectionPosition(), "end");
	});
	it("returns null if there is no selection", () => {
		const symbol = new MathSymbol("A");
		const line = new Line([symbol]);
		const cursor = new Cursor(line.componentsGroup, symbol);
		assert.equal(cursor.selectionPosition(), null);
	});
});
