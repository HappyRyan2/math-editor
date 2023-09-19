import { assert } from "chai";
import { describe, it } from "mocha";
import { MathDocument } from "../../MathDocument.mjs";
import { Selection } from "../../Selection.mjs";
import { MathSymbol } from "../../math-components/MathSymbol.mjs";
import { Fraction } from "../../math-components/Fraction.mjs";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Cursor } from "../../Cursor.mjs";

describe("Fraction.insertFraction", () => {
	it("puts the selection into a fraction if there is one", () => {
		let symbolA, symbolB;
		const doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]);
		const cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB));
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.equal(doc.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction, new Fraction(new MathComponentGroup([symbolA, symbolB]), new MathComponentGroup([])));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
	});
	it("puts the previous component into a fraction if there is one", () => {
		let symbol;
		const doc = new MathDocument([
			symbol = new MathSymbol("A"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.equal(doc.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction, new Fraction(new MathComponentGroup([symbol]), new MathComponentGroup([])));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
	});
	it("creates an empty fraction if there is no selection or previous component", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.equal(doc.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction, new Fraction(new MathComponentGroup([]), new MathComponentGroup([])));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
	});
});