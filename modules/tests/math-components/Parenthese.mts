import { assert } from "chai";
import { describe, it } from "mocha";
import { MathComponentGroup } from "../../MathComponentGroup.mjs";
import { Parenthese } from "../../math-components/Parenthese.mjs";
import { MathDocument } from "../../MathDocument.mjs";
import { MathSymbol } from "../../math-components/MathSymbol.mjs";
import { LineBreak } from "../../math-components/LineBreak.mjs";
import { Cursor } from "../../Cursor.mjs";
import { App } from "../../App.mjs";
import { assertValidRenderedDocument } from "../test-utils.mjs";
import { Selection } from "../../Selection.mjs";

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
describe("Parenthese.insertParenthese", () => {
	it("works when there is a line break not immediately after the cursor", () => {
		let doc, symbol, cursor;
		App.loadDocument(doc = new MathDocument([
			symbol = new MathSymbol("A"),
			new MathSymbol("B"),
			new LineBreak(),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, symbol)];
		App.renderAndUpdate();
		Parenthese.insertParenthese(cursor, doc);
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("A"),
			new Parenthese(new MathComponentGroup([
				new MathSymbol("B"),
			]), "round", true),
			new LineBreak(),
		]);
		assertValidRenderedDocument(false);
	});
	it("works when there is a line break immediately after the cursor", () => {
		let doc, symbol, cursor;
		App.loadDocument(doc = new MathDocument([
			new MathSymbol("A"),
			symbol = new MathSymbol("B"),
			new LineBreak(),
			new MathSymbol("C"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(doc.componentsGroup, symbol)];
		App.renderAndUpdate();
		Parenthese.insertParenthese(cursor, doc);
		assert.deepEqual(doc.componentsGroup.components, [
			new MathSymbol("A"),
			new MathSymbol("B"),
			new Parenthese(new MathComponentGroup([]), "round", true),
			new LineBreak(),
			new MathSymbol("C"),
		]);
		assertValidRenderedDocument(false);
	});
	it("parenthesizes the selection when the cursor has a selection", () => {
		let symbol1, symbol2, cursor;
		App.loadDocument(new MathDocument([
			symbol1 = new MathSymbol("1"),
			symbol2 = new MathSymbol("2"),
			new MathSymbol("3"),
		]));
		App.activeTab.cursors = [cursor = new Cursor(App.document.componentsGroup, null, new Selection(symbol1, symbol2))];
		App.renderAndUpdate();

		Parenthese.insertParenthese(cursor, App.document);
		assert.deepEqual(App.document.componentsGroup.components, [
			new Parenthese(new MathComponentGroup([
				new MathSymbol("1"),
				new MathSymbol("2"),
			]), "round"),
			new MathSymbol("3"),
		]);
		assertValidRenderedDocument(false);
	});
});
