import { describe, it } from "mocha";
import { assert } from "chai";

import { Cursor } from "../Cursor.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";

describe("MathComponentGroup.componentsAndCursors", () => {
	it("works when there is one cursor", () => {
		const componentGroup = new MathComponentGroup([
			new MathSymbol("A"),
		]);
		const cursor = new Cursor(componentGroup, 0);
		const result = componentGroup.componentsAndCursors([cursor]);
		assert.deepEqual(result, [
			cursor,
			new MathSymbol("A"),
		]);
	});
	it("works when there is more than one cursor", () => {
		const componentGroup = new MathComponentGroup([
			new MathSymbol("A"),
		]);
		const cursor1 = new Cursor(componentGroup, 0);
		const cursor2 = new Cursor(componentGroup, 1);
		const result = componentGroup.componentsAndCursors([cursor1, cursor2]);
		assert.deepEqual(result, [
			cursor1,
			new MathSymbol("A"),
			cursor2,
		]);
	});
});
