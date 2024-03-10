import { App } from "../App.mjs";
import { Cursor } from "../Cursor.mjs";
import { CompositeMathComponent } from "../CompositeMathComponent.mjs";
import { LineBreak } from "./LineBreak.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { MathComponent } from "../MathComponent.mjs";

const PARENTHESE_TYPES = ["round", "square", "curly", "angle"] as const;
type ParentheseType = typeof PARENTHESE_TYPES[number];

export class Parenthese extends CompositeMathComponent {
	type: ParentheseType;
	components: MathComponentGroup;
	isGrayedOut: boolean;
	onDeletion(preventDeletion: () => void, doc: MathDocument, cursor: Cursor) {
		if(!this.isGrayedOut) {
			cursor.moveToEnd(this.components);
			this.isGrayedOut = true;
			this.expand(doc);
			preventDeletion();
		}
	}

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
	expand(doc: MathDocument) {
		const containingGroup = doc.containingGroupOf(this);
		const index = containingGroup.components.indexOf(this) + 1;
		const nextLineBreak = containingGroup.components.findIndex((c, i) => c instanceof LineBreak && i >= index);
		const itemsAfter = containingGroup.components.splice(
			index,
			nextLineBreak === -1 ? containingGroup.components.length - index : nextLineBreak - index,
		);
		this.components.components.push(...itemsAfter);
	}
	static parenthesizeSelection(cursor: Cursor, type: ParentheseType) {
		const parenthese = new Parenthese(
			new MathComponentGroup(cursor.selectedComponents()),
			type, false,
		);
		cursor.replaceSelectionWith(parenthese);
		cursor.moveToStart(parenthese.components);
	}
	static insertParenthese(cursor: Cursor, doc: MathDocument) {
		if(cursor.selection == null) {
			const parenthese = new Parenthese(new MathComponentGroup([]), "round", true);
			cursor.addComponent(parenthese);
			parenthese.expand(doc);
			cursor.moveToStart(parenthese.components);
		}
		else {
			Parenthese.parenthesizeSelection(cursor, "round");
		}
	}
	static closeParenthese(cursor: Cursor, doc: MathDocument) {
		const parenthese = ([cursor.predecessor, doc.containingComponentOf(cursor.container)]
			.find(p => p instanceof Parenthese && p.isGrayedOut) as Parenthese) ?? null;
		if(parenthese) {
			if(parenthese.components === cursor.container) {
				parenthese.collapseTo(cursor, doc);
			}
			parenthese.isGrayedOut = false;
			cursor.moveAfter(parenthese, doc.containingGroupOf(parenthese));
		}
		else {
			const parenthese = new Parenthese(new MathComponentGroup([]), "round", true);
			cursor.addComponent(parenthese);
			cursor.moveToStart(parenthese.components);
		}
	}

	static parse(input: object) {
		if(!("type" in input && typeof input.type === "string" &&
			PARENTHESE_TYPES.some(t => t === input.type))
		) { throw new Error("Serialized parenthese did not have a valid `type` property.");}

		if(!("isGrayedOut" in input && typeof input.isGrayedOut === "boolean")) {
			throw new Error("Serialized parenthese did not have a valid `isGrayedOut` property.");
		}
		if(!("components" in input && typeof input.components === "object" && input.components != null)) {
			throw new Error("Serialized parenthese did not have a valid `components` property.");
		}

		return new Parenthese(
			MathComponentGroup.parse(input.components),
			input.type as ParentheseType,
			input.isGrayedOut,
		);
	}

	matches(component: MathComponent) {
		return (
			component instanceof Parenthese &&
			component.type === this.type &&
			component.components.matches(this.components)
		);
	}
}
