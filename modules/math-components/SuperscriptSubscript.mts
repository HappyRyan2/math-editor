import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { RelativeKeyHandler } from "../RelativeKeyHandler.mjs";

export class SuperscriptSubscript extends EnterableMathComponent {
	superscript: MathComponentGroup;
	subscript: MathComponentGroup;

	constructor(superscript: MathComponentGroup | MathComponent[] = [], subscript: MathComponentGroup | MathComponent[] = []) {
		super();
		this.superscript = (superscript instanceof MathComponentGroup) ? superscript : new MathComponentGroup(superscript);
		this.subscript = (subscript instanceof MathComponentGroup) ? subscript : new MathComponentGroup(subscript);

		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowDown",
			["before", "after", ["inside", 0]],
			(cursor: Cursor, self: MathComponent, app: App) => {
				cursor.moveToClosest(this.subscript.components, app, this.subscript);
				Cursor.resetCursorBlink();
			}),
		);
		this.relativeKeyHandlers.push(new RelativeKeyHandler(
			"ArrowUp",
			["before", "after", ["inside", 1]],
			(cursor: Cursor, self: MathComponent, app: App) => {
				cursor.moveToClosest(this.superscript.components, app, this.superscript);
				Cursor.resetCursorBlink();
			}),
		);
	}

	groups() {
		return [this.superscript, this.subscript];
	}
	render(app: App, superscript: HTMLElement, subscript: HTMLElement) {
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
}
