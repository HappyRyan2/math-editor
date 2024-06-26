import { Cursor } from "../Cursor.mjs";
import { CompositeMathComponent } from "../CompositeMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { RelativeKeyHandler } from "../RelativeKeyHandler.mjs";
import { App } from "../App.mjs";

export class SuperscriptSubscript extends CompositeMathComponent {
	superscript: MathComponentGroup;
	subscript: MathComponentGroup;

	constructor(superscript: MathComponentGroup | MathComponent[] = [], subscript: MathComponentGroup | MathComponent[] = []) {
		super();
		this.superscript = (superscript instanceof MathComponentGroup) ? superscript : new MathComponentGroup(superscript);
		this.subscript = (subscript instanceof MathComponentGroup) ? subscript : new MathComponentGroup(subscript);

		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowDown",
			["before", "after", ["inside", 0]],
			(cursor: Cursor) => {
				cursor.moveToClosest(this.subscript.components, this.subscript);
				App.updateCursors();
				Cursor.resetCursorBlink();
			}),
		);
		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowUp",
			["before", "after", ["inside", 1]],
			(cursor: Cursor) => {
				cursor.moveToClosest(this.superscript.components, this.superscript);
				App.updateCursors();
				Cursor.resetCursorBlink();
			}),
		);
	}

	groups() {
		return [this.superscript, this.subscript];
	}
	render(superscript: HTMLElement, subscript: HTMLElement) {
		const result = document.createElement("span");
		result.classList.add("superscript-subscript");

		superscript.classList.add("superscript");
		result.appendChild(superscript);

		subscript.classList.add("subscript");
		result.appendChild(subscript);

		return result;
	}

	static insert(cursor: Cursor, type: "superscript" | "subscript") {
		const nextComponent = cursor.nextComponent();
		if(cursor.predecessor instanceof SuperscriptSubscript) {
			cursor.moveToStart(cursor.predecessor[type]);
		}
		else if(nextComponent instanceof SuperscriptSubscript) {
			cursor.moveToEnd(nextComponent[type]);
		}
		else {
			const superscriptSubscript = new SuperscriptSubscript();
			cursor.addComponent(superscriptSubscript);
			cursor.moveToStart(superscriptSubscript[type]);
		}
	}

	static parse(input: object) {
		if(!("superscript" in input && typeof input.superscript === "object" && input.superscript != null)) {
			throw new Error("Serialized SuperscriptSubscript did not have a valid `superscript` property.");
		}
		if(!("subscript" in input && typeof input.subscript === "object" && input.subscript != null)) {
			throw new Error("Serialized SuperscriptSubscript did not have a valid `subscript` property.");
		}

		return new SuperscriptSubscript(
			MathComponentGroup.parse(input.superscript),
			MathComponentGroup.parse(input.subscript),
		);
	}

	matches(component: MathComponent) {
		if(!(component instanceof SuperscriptSubscript)) { return false; }
		return this.superscript.matches(component.superscript) && this.subscript.matches(component.subscript);
	}
}
