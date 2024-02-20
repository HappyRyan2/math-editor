import { assert } from "chai";
import { describe, it } from "mocha";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Parenthese } from "../../math-components/Parenthese.mjs";

describe("Parenthese.parse", () => {
	it("correctly parses the parenthese", () => {
		const parenthese = new Parenthese(
			new MathComponentGroup([]),
			"round",
		);
		const result = Parenthese.parse(JSON.parse(JSON.stringify(parenthese)));
		assert.deepEqual(result, parenthese);
	});
});
