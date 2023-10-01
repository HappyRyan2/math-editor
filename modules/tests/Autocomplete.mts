import { describe, it } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { Autocomplete } from "../Autocomplete.mjs";
import { Cursor } from "../Cursor.mjs";

describe("Autcomplete.getPreviousCharacters", () => {
	it("returns all the characters before the cursor until it reaches a non-character component", () => {
		let symbolB, symbolC;
		const doc = new MathDocument([
			new MathSymbol("A"),
			new EnterableComponentMock([]),
			symbolB = new MathSymbol("B"),
			symbolC = new MathSymbol("C"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbolC);
		const characters = Autocomplete.getPreviousCharacters(cursor);
		assert.sameOrderedMembers(characters, [symbolB, symbolC]);
	});
	it("stops when it reaches a MathSymbol that is not a letter, like an equals sign", () => {
		let symbol;
		const doc = new MathDocument([
			new MathSymbol("A"),
			new MathSymbol("B"),
			new MathSymbol("="),
			symbol = new MathSymbol("C"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		const characters = Autocomplete.getPreviousCharacters(cursor);
		assert.sameOrderedMembers(characters, [symbol]);
	});
	it("stops when it reaches a MathSymbol that is not a letter, like a space", () => {
		let symbol;
		const doc = new MathDocument([
			new MathSymbol("A"),
			new MathSymbol("B"),
			new MathSymbol(" "),
			symbol = new MathSymbol("C"),
		]);
		const cursor = new Cursor(doc.componentsGroup, symbol);
		const characters = Autocomplete.getPreviousCharacters(cursor);
		assert.sameOrderedMembers(characters, [symbol]);
	});
	it("returns an empty array when the cursor is at the beginning of its container", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		const characters = Autocomplete.getPreviousCharacters(cursor);
		assert.sameOrderedMembers(characters, []);
	});
});
