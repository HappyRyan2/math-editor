import { describe, it } from "mocha";
import { assert } from "chai";

import { Cursor } from "../Cursor.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";
import { LineBreak } from "../math-components/LineBreak.mjs";
import { CompositeMathComponentMock } from "./CompositeMathComponentMock.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { App } from "../App.mjs";

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
	it("works when the first character is a word boundary", () => {
		const component = new MathSymbol("=");
		const group = new MathComponentGroup([component]);
		assert.deepEqual(group.getWordGroups(), [[component]]);
	});
});
describe("MathComponentGroup.addWordBreakAfter", () => {
	it("breaks the word into two if there is not already a word break at the specified location", () => {
		let symbol1;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				symbol1 = new MathSymbol("A"),
				new MathSymbol("B"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);

		MathComponentGroup.addWordBreakAfter(symbol1, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 2);
		const [word1, word2] = rendered.querySelectorAll(".word");
		assert.equal(word1.querySelector(".symbol")?.innerHTML, "A");
		assert.equal(word2.querySelector(".symbol")?.innerHTML, "B");
	});
	it("does nothing if there is already a word break at the specified location", () => {
		let symbol1;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				symbol1 = new MathSymbol(" "),
				new MathSymbol("A"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 2);

		MathComponentGroup.addWordBreakAfter(symbol1, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 2);
		const [word1, word2] = rendered.querySelectorAll(".word");
		assert.equal(word1.querySelector(".symbol")?.innerHTML, "&nbsp;");
		assert.equal(word2.querySelector(".symbol")?.innerHTML, "A");
	});
	it("does nothing if the specified location is at the end of the group", () => {
		let symbol2;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				new MathSymbol("A"),
				symbol2 = new MathSymbol("B"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);

		MathComponentGroup.addWordBreakAfter(symbol2, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);
		const [word] = rendered.querySelectorAll(".word");
		const [renderedSymbol1, renderedSymbol2] = word.querySelectorAll(".symbol");
		assert.equal(renderedSymbol1.innerHTML, "A");
		assert.equal(renderedSymbol2.innerHTML, "B");
	});
});
describe("MathComponentGroup.removeWordBreakAfter", () => {
	it("merges the two words if there is a word break at the specified location", () => {
		let symbol1;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				symbol1 = new MathSymbol(" "),
				new MathSymbol("A"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 2);

		MathComponentGroup.removeWordBreakAfter(symbol1, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);
		const [word] = rendered.querySelectorAll(".word");
		const [renderedSymbol1, renderedSymbol2] = word.querySelectorAll(".symbol");
		assert.equal(renderedSymbol1.innerHTML, "&nbsp;");
		assert.equal(renderedSymbol2.innerHTML, "A");
	});
	it("does nothing if there is no word break at the specified location", () => {
		let symbol1;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				symbol1 = new MathSymbol("A"),
				new MathSymbol("B"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);

		MathComponentGroup.removeWordBreakAfter(symbol1, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);
		const [word] = rendered.querySelectorAll(".word");
		const [renderedSymbol1, renderedSymbol2] = word.querySelectorAll(".symbol");
		assert.equal(renderedSymbol1.innerHTML, "A");
		assert.equal(renderedSymbol2.innerHTML, "B");
	});
	it("does nothing if the specified location is at the end of the group", () => {
		let symbol2;
		const app = new App(new MathDocument(
			new MathComponentGroup([
				new MathSymbol("A"),
				symbol2 = new MathSymbol("B"),
			]),
		));
		app.renderAndUpdate();
		const rendered = document.getElementById("math-document")!;
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);

		MathComponentGroup.removeWordBreakAfter(symbol2, app.renderingMap);
		assert.equal([...rendered.querySelectorAll(".word")].length, 1);
		const [word] = rendered.querySelectorAll(".word");
		const [renderedSymbol1, renderedSymbol2] = word.querySelectorAll(".symbol");
		assert.equal(renderedSymbol1.innerHTML, "A");
		assert.equal(renderedSymbol2.innerHTML, "B");
	});
});
describe("MathComponentGroup.isWordBreakAfter", () => {
	it("returns true when there is a word break after the component", () => {
		const group = new MathComponentGroup([
			new MathSymbol(" "),
			new MathSymbol("A"),
		]);
		assert.isTrue(group.isWordBreakAfter(group.components[0]));
	});
	it("returns false when there is not a word break after the component", () => {
		const group = new MathComponentGroup([
			new MathSymbol("A"),
			new MathSymbol("B"),
		]);
		assert.isFalse(group.isWordBreakAfter(group.components[0]));
	});
});
describe("MathComponentGroup.deleteEmptyWords", () => {
	it("removes any empty words adjacent to the component", () => {
		let symbol;
		const app = new App(new MathDocument([
			symbol = new MathSymbol("A"),
		]));
		app.renderAndUpdate();
		const emptyWord1 = MathComponentGroup.createEmptyWord();
		const emptyWord2 = MathComponentGroup.createEmptyWord();
		app.renderingMap.get(symbol)?.parentElement?.insertAdjacentElement("beforebegin", emptyWord1);
		app.renderingMap.get(symbol)?.parentElement?.insertAdjacentElement("afterend", emptyWord2);

		assert.equal([...document.querySelectorAll(".word")].length, 3);
		app.document.componentsGroup.deleteEmptyWords(symbol, app.renderingMap);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
	});
	it("removes any words containing only cursors and puts the cursors inside the current word", () => {
		let symbol;
		const app = new App(new MathDocument([
			symbol = new MathSymbol("A"),
		]));
		App.activeTab.cursors = [];
		app.renderAndUpdate();

		const cursor1 = new Cursor(app.document.componentsGroup, null);
		const word1 = MathComponentGroup.createEmptyWord();
		word1.appendChild(cursor1.render());
		app.renderingMap.get(symbol)?.parentElement?.insertAdjacentElement("beforebegin", word1);

		const word2 = MathComponentGroup.createEmptyWord();
		const cursor2 = new Cursor(app.document.componentsGroup, symbol);
		word2.appendChild(cursor2.render());
		app.renderingMap.get(symbol)?.parentElement?.insertAdjacentElement("afterend", word2);

		app.document.componentsGroup.deleteEmptyWords(symbol, app.renderingMap);
		assert.equal([...document.querySelectorAll(".word")].length, 1);
		const word = document.querySelector(".word");
		const [element1, element2, element3] = word!.children;
		assert.isTrue(element1.classList.contains("cursor"));
		assert.isTrue(element2.classList.contains("symbol"));
		assert.isTrue(element3.classList.contains("cursor"));
	});
});
