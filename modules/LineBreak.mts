import { Cursor } from "./Cursor.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathDocument } from "./MathDocument.mjs";

export class LineBreak extends MathComponent {
	render() {
		const result = document.createElement("span");
		result.classList.add("line-break");
		result.innerHTML = " ";
		return result;
	}

	static addLineBreak(cursor: Cursor, doc: MathDocument) {
		if(cursor.container.container instanceof MathDocument) {
			if(cursor.selection == null) {
				cursor.addComponent(new LineBreak());
			}
			else {
				cursor.replaceSelectionWith(new LineBreak());
			}
		}
		else {
			const ancestor = cursor.container.container!.lastComponentAncestor(doc);
			const lineBreak = new LineBreak();
			doc.componentsGroup.components.splice(
				doc.componentsGroup.components.indexOf(ancestor) + 1,
				0, lineBreak,
			);
			cursor.moveAfter(lineBreak, doc);
			cursor.selection = null;
		}
	}
}
