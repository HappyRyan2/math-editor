import { describe, it } from "mocha";
import { assert } from "chai";

import { Cursor } from "../Cursor.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";

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
				new MathSymbol("a"),
				new MathSymbol("="),
			],
			[
				new MathSymbol("b"),
				new MathSymbol("+"),
			],
			[
				new MathSymbol("f"),
				new Parenthese(new MathComponentGroup([new MathSymbol("x")]), "round"),
				new LineBreak(),
			],
			[
				new LineBreak(),
			],
			[],
		];
		const mathComponentGroup = new MathComponentGroup(wordGroups.flat());
		assert.deepEqual(mathComponentGroup.getWordGroups(), wordGroups);
	});
	it("works when there is only one word group", () => {
		const wordGroups = [
			[
				new MathSymbol("a"),
				new MathSymbol("="),
			],
		];
		const mathComponentGroup = new MathComponentGroup(wordGroups.flat());
		assert.deepEqual(mathComponentGroup.getWordGroups(), wordGroups);
	});
	it("returns a single empty word when there are no components", () => {
		const mathComponentGroup = new MathComponentGroup([]);
		assert.deepEqual(mathComponentGroup.getWordGroups(), [[]]);
	});
	it("returns a one-component word when there is one composite component", () => {
		const component = new CompositeMathComponentMock();
		const mathComponentGroup = new MathComponentGroup([component]);
		assert.deepEqual(mathComponentGroup.getWordGroups(), [[component]]);
	});
});
