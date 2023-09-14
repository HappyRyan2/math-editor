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

	static addLineBreak(cursor: Cursor) {
		if(cursor.container.container instanceof MathDocument) {
			if(cursor.selection == null) {
				cursor.addComponent(new LineBreak());
			}
			else {
				cursor.replaceSelectionWith(new LineBreak());
			}
		}
		else {
			const ancestor = cursor.container.container!.lastComponentAncestor();
			const lineBreak = new LineBreak();
			ancestor.container!.components.splice(
				ancestor.container!.components.indexOf(ancestor) + 1,
				0, lineBreak,
			);
			cursor.moveAfter(lineBreak);
			cursor.selection = null;
		}
	}
}
