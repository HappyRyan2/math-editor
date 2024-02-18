import { Cursor } from "./Cursor.mjs";
import { MathDocument } from "./MathDocument.mjs";

export class EditorTab {
	document: MathDocument;
	cursors: Cursor[];

	constructor(document: MathDocument, cursors: Cursor[]) {
		this.document = document;
		this.cursors = cursors;
	}
	static createEmpty() {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		return new EditorTab(doc, [cursor]);
	}

	removeDuplicateCursors() {
		this.cursors = this.cursors.filter((cursor1, i) => {
			return !this.cursors.slice(i + 1).some(cursor2 => cursor1.hasSamePosition(cursor2));
		});
	}
}
