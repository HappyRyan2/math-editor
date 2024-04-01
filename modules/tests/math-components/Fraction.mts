import { assert } from "chai";
import { describe, it } from "mocha";
import { MathDocument } from "../../MathDocument.mjs";
import { Selection } from "../../Selection.mjs";
import { MathSymbol } from "../../math-components/MathSymbol.mjs";
import { Fraction } from "../../math-components/Fraction.mjs";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Cursor } from "../../Cursor.mjs";
import { LineBreak } from "../../math-components/LineBreak.mjs";
import "../../math-components/initializers/all-initializers.mjs";
import { Parenthese } from "../../math-components/Parenthese.mjs";
import { App } from "../../App.mjs";
import { assertValidRenderedDocument } from "../test-utils.mjs";

describe("Fraction.insertFraction", () => {
	it("puts the selection into a fraction if there is one", () => {
		let doc, symbolA, symbolB, cursor;
		App.loadDocument(doc = new MathDocument([
			symbolA = new MathSymbol("A"),
			symbolB = new MathSymbol("B"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, null, new Selection(symbolA, symbolB))];
		App.renderAndUpdate();
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.equal(doc.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction.numerator, new MathComponentGroup([symbolA, symbolB]));
		assert.deepEqual(fraction.denominator, new MathComponentGroup([]));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("puts the previous component into a fraction if there is one", () => {
		let doc, symbol, cursor;
		App.loadDocument(doc = new MathDocument([
			symbol = new MathSymbol("A"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, symbol)];
		App.renderAndUpdate();
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 1);
		assert.equal(doc.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction.numerator, new MathComponentGroup([symbol]));
		assert.deepEqual(fraction.denominator, new MathComponentGroup([]));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("creates an empty fraction if there is no selection or previous component", () => {
		App.loadEmptyDocument();
		App.renderAndUpdate();
		const cursor = App.cursors[0];
		const fraction = Fraction.insertFraction(cursor, App.document);

		assert.equal(App.document.componentsGroup.components.length, 1);
		assert.equal(App.document.componentsGroup.components[0], fraction);
		assert.deepEqual(fraction.numerator, new MathComponentGroup([]));
		assert.deepEqual(fraction.denominator, new MathComponentGroup([]));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("creates an empty fraction if the previous component is a line break", () => {
		let doc, lineBreak, cursor;
		App.loadDocument(doc = new MathDocument([
			lineBreak = new LineBreak(),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, doc.componentsGroup.components[0])];
		App.renderAndUpdate();
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.equal(doc.componentsGroup.components.length, 2);
		assert.equal(doc.componentsGroup.components[0], lineBreak);
		assert.equal(doc.componentsGroup.components[1], fraction);
		assert.deepEqual(fraction.numerator, new MathComponentGroup([]));
		assert.deepEqual(fraction.denominator, new MathComponentGroup([]));
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
	it("works when the previous component is a composite math component", () => {
		let doc, parenthese, cursor;
		App.loadDocument(doc = new MathDocument([
			parenthese = new Parenthese(new MathComponentGroup([]), "round"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(App.document.componentsGroup, parenthese)];
		App.renderAndUpdate();
		const fraction = Fraction.insertFraction(cursor, doc);

		assert.sameOrderedMembers(doc.componentsGroup.components, [fraction]);
		assert.sameOrderedMembers(fraction.numerator.components, [parenthese]);
		assert.sameOrderedMembers(fraction.denominator.components, []);
		assert.sameOrderedMembers(parenthese.components.components, []);
		assert.equal(cursor.container, fraction.denominator);
		assert.equal(cursor.predecessor, null);
		assertValidRenderedDocument(false);
	});
});

describe("Fraction.parse()", () => {
	const fraction = new Fraction(
		new MathComponentGroup([new MathSymbol("A")]),
		new MathComponentGroup([new MathSymbol("B")]),
	);
	const result = Fraction.parse(JSON.parse(JSON.stringify(fraction)));
	result.relativeKeyHandlers = fraction.relativeKeyHandlers = []; // prevents false positives since Mocha can't check if functions are deeply equal
	assert.deepEqual(result, fraction);
});
