import { describe, it } from "mocha";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { Cursor } from "../Cursor.mjs";
import { EditorTab } from "../EditorTab.mjs";
import { assert } from "chai";

describe("EditorTab.removeDuplicateCursors", () => {
	it("removes cursors at the same position, keeping the last cursor in the list", () => {
		let component: MathComponent;
		const doc = new MathDocument([
			component = new MathSymbol("A"),
		]);
		const cursor1 = new Cursor(doc.componentsGroup, component);
		const cursor2 = new Cursor(doc.componentsGroup, null);
		const cursor3 = new Cursor(doc.componentsGroup, component);
		const tab = new EditorTab(doc, [cursor1, cursor2, cursor3]);
		tab.removeDuplicateCursors();
		assert.sameOrderedMembers(tab.cursors, [cursor2, cursor3]);
	});
});
