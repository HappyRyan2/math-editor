import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { EnterableMathComponent } from "../EnterableMathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathDocument } from "../MathDocument.mjs";

type ParentheseType = "round" | "square" | "curly" | "angle";

export class Parenthese extends EnterableMathComponent {
	type: ParentheseType;
	components: MathComponentGroup;
	isGrayedOut: boolean;

	constructor(components: MathComponentGroup, type: ParentheseType, isGrayedOut: boolean = false) {
		super();
		this.type = type;
		this.components = components;
		this.isGrayedOut = isGrayedOut;
		this.deleteAtStart = "always";
	}

	groups() {
		return [this.components];
	}
	render(app: App, components: HTMLElement) {
		const result = document.createElement("span");
		result.classList.add("parenthese");
		result.classList.add(`parenthese-${this.type}`);
		if(this.isGrayedOut) {
			result.classList.add("parenthese-grayed-out");
		}
		result.appendChild(components);
		return result;
	}

	collapseTo(cursor: Cursor, doc: MathDocument) {
		if(cursor.container !== this.components) {
			throw new Error("Parenthese group must contain cursor.");
		}
		const itemsAfter = this.components.components.splice(cursor.position(), Infinity);
		doc.containingGroupOf(this).insertAfter(this, itemsAfter);
	}
}
