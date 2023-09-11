import { describe, it } from "mocha";
import { assert } from "chai";
import { Line } from "../Line.mjs";
import { Cursor } from "../Cursor.mjs";
import { Symbol } from "../math-components/Symbol.mjs";

describe("Cursor.addComponent", () => {
	it("correctly adds the component when the cursor is at the beginning of the line", () => {
		const line = new Line([new Symbol("x")]);
		const cursor = new Cursor(line, null);
		cursor.addComponent(new Symbol("y"));
		assert.deepEqual(line.components, [
			new Symbol("y"),
			new Symbol("x"),
		]);
		assert.deepEqual(cursor.predecessor, new Symbol("y"));
	});
	it("correctly adds the component when the cursor is not at the beginning of the line", () => {
		const line = new Line([new Symbol("x")]);
		const cursor = new Cursor(line, line.components[0]);
		cursor.addComponent(new Symbol("y"));
		assert.deepEqual(line.components, [
			new Symbol("x"),
			new Symbol("y"),
		]);
		assert.deepEqual(cursor.predecessor, new Symbol("y"));
	});
});
