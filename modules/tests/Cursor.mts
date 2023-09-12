import { describe, it } from "mocha";
import { assert } from "chai";
import { Line } from "../Line.mjs";
import { Cursor } from "../Cursor.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";

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
