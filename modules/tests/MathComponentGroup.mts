import { describe, it } from "mocha";
import { assert } from "chai";

import { Cursor } from "../Cursor.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";
import { Fraction } from "../math-components/Fraction.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";

describe("MathComponentGroup.componentsAndCursors", () => {
	it("works when there is one cursor", () => {
		let symbol: MathSymbol;
		const componentGroup = new MathComponentGroup([
			symbol = new MathSymbol("A"),
		]);
		const cursor = new Cursor(componentGroup, null);
		const result = componentGroup.componentsAndCursors([cursor]);
		assert.deepEqual(result, [cursor, symbol]);
	});
	it("works when there is more than one cursor", () => {
		let symbol: MathSymbol;
		const componentGroup = new MathComponentGroup([
			symbol = new MathSymbol("A"),
		]);
		const cursor1 = new Cursor(componentGroup, null);
		const cursor2 = new Cursor(componentGroup, componentGroup.components[0]);
		const result = componentGroup.componentsAndCursors([cursor1, cursor2]);
		assert.deepEqual(result, [cursor1, symbol, cursor2]);
	});
});
describe("MathComponentGroup.getWordGroups", () => {
	it("returns all the word groups", () => {
		const wordGroups = [
			[
				new MathSymbol(" "),
				new MathSymbol(" "),
				new MathSymbol(" "),
			],
			[
				new MathSymbol("x"),
				new MathSymbol("y"),
				new MathSymbol("z"),
			],
			[
				new MathSymbol("+"),
				new MathSymbol("-"),
				new MathSymbol("+"),
			],
			[
				new Parenthese(new MathComponentGroup([]), "round"),
				new Fraction(new MathComponentGroup([]), new MathComponentGroup([])),
			],
			[
				new LineBreak(),
				new LineBreak(),
				new LineBreak(),
			],
		];
		const mathComponentGroup = new MathComponentGroup(wordGroups.flat());
		assert.deepEqual(mathComponentGroup.getWordGroups(), wordGroups);
	});
});
