import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export abstract class CompositeMathComponent extends MathComponent {
	/* Represents a MathComponent that can contain the user's cursor (e.g. fractions, exponents, subscripts, etc.) */
	abstract groups(): MathComponentGroup[];
	abstract render(...renderedGroups: HTMLElement[]): HTMLElement;
	deleteAtStart: "always" | "only-when-empty" = "only-when-empty";

	*descendants(): Generator<MathComponent, void, unknown> {
		for(const group of this.groups()) {
			yield* group.descendants();
		}
	}
	*groupDescendants(): Generator<MathComponentGroup, void, unknown> {
		for(const group of this.groups()) {
			yield group;
			yield* group.groupDescendants();
		}
	}
	*[Symbol.iterator](): Generator<MathComponent, void, undefined> {
		for(const group of this.groups()) {
			yield* group.components;
		}
	}
	renderWithMapping(): [HTMLElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const groupsAndMappings = this.groups().map(g => g.renderWithMapping());
		const groups = groupsAndMappings.map((tuple) => tuple[0]);
		const maps = groupsAndMappings.map(tuple => tuple[1]);
		const result = this.render(...groups);
		let resultMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();
		for(const map of maps) {
			resultMap = new Map([...resultMap, ...map]);
		}
		resultMap.set(this, result);
		return [result, resultMap];
	}
	enterFromLeft(cursor: Cursor) {
		cursor.container = this.groups()[0];
		cursor.predecessor = null;
	}
	enterFromRight(cursor: Cursor) {
		const mainGroup = this.groups()[0];
		cursor.container = mainGroup;
		cursor.predecessor = mainGroup.components[mainGroup.components.length - 1];
	}
	isEmpty() {
		return this.groups().every(g => g.components.length === 0);
	}
}
