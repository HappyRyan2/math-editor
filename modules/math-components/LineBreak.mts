import { Cursor } from "../Cursor.mjs";
import { LiveRenderer } from "../LiveRenderer.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathDocument } from "../MathDocument.mjs";

export class LineBreak extends MathComponent {
	render() {
		const result = document.createElement("span");
		result.classList.add("line-break");
		result.innerHTML = "&nbsp";
		return result;
	}

	static addLineBreak(cursor: Cursor, doc: MathDocument) {
		if(cursor.container === doc.componentsGroup) {
			if(cursor.selection == null) {
				cursor.addComponent(new LineBreak());
			}
			else {
				cursor.replaceSelectionWith(new LineBreak());
			}
		}
		else {
			const ancestor = (doc.containingComponentOf(cursor.container) as MathComponent).lastComponentAncestor(doc);
			const lineBreak = new LineBreak();
			LiveRenderer.insert(lineBreak, "after", ancestor);
			cursor.selection = null;
			cursor.moveAfter(lineBreak, doc.componentsGroup);
		}
	}

	static parse() {
		return new LineBreak();
	}
	matches(mathComponent: MathComponent) {
		return (mathComponent instanceof LineBreak);
	}
}
