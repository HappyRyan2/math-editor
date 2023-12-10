import { assert } from "chai";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Parenthese } from "../../math-components/Parenthese.mjs";

test("Parenthese.parse", () => {
	const parenthese = new Parenthese(
		new MathComponentGroup([]),
		"round",
	);
	const result = Parenthese.parse(JSON.parse(JSON.stringify(parenthese)));
	assert.deepEqual(result, parenthese);
});
