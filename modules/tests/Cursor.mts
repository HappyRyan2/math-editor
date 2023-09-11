import { describe, it } from "mocha";
import { assert } from "chai";
import { Line } from "../Line.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of the line", () => {
		const line = new Line([new MathSymbol("x")]);
		const cursor = new Cursor(line, null);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(line.components, [
			new MathSymbol("y"),
			new MathSymbol("x"),
		]);
		assert.deepEqual(cursor.predecessor, new MathSymbol("y"));
	});
	it("correctly adds the component when the cursor is not at the beginning of the line", () => {
		const line = new Line([new MathSymbol("x")]);
		const cursor = new Cursor(line, line.components[0]);
		cursor.addComponent(new MathSymbol("y"));
		assert.deepEqual(line.components, [
			new MathSymbol("x"),
			new MathSymbol("y"),
		]);
		assert.deepEqual(cursor.predecessor, new MathSymbol("y"));
	});
});
