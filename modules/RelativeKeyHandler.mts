import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathDocument } from "./MathDocument.mjs";

type Location = "before" | "after" | ["inside", number];

export class RelativeKeyHandler {
	key: string;
	locations: Location[];
	callback: (cursor: Cursor, component: MathComponent, app: App) => void;

	constructor(key: string, locations: Location[], callback: (cursor: Cursor, component: MathComponent, app: App) => void = (() => {})) {
		this.locations = locations;
		this.key = key;
		this.callback = callback;
	}

	static getHandlers(cursor: Cursor, doc: MathDocument, key: string | null = null): [RelativeKeyHandler, MathComponent][] {
		const result: [RelativeKeyHandler, MathComponent][] = [];
		if(cursor.predecessor != null) {
			result.push(...cursor.predecessor.relativeKeyHandlers
				.filter(h => h.locations.includes("after"))
				.map(h => [h, cursor.predecessor] as [RelativeKeyHandler, MathComponent]),
			);
		}
		const nextComponent = cursor.nextComponent();
		if(nextComponent) {
			result.push(...nextComponent.relativeKeyHandlers
				.filter(h => h.locations.includes("before"))
				.map(h => [h, nextComponent] as [RelativeKeyHandler, MathComponent]),
			);
		}
		const containingComponent = doc.containingComponentOf(cursor.container);
		if(containingComponent instanceof CompositeMathComponent) {
			for(const ancestor of [containingComponent, ...containingComponent.ancestors(doc)]) {
				const groupIndex = ancestor.groups().findIndex(g => g === cursor.container || [...g.descendants()].includes(containingComponent));
				result.push(...ancestor.relativeKeyHandlers
					.filter(h => h.locations.some(l => Array.isArray(l) && l[0] === "inside" && l[1] === groupIndex))
					.map(h => [h, ancestor] as [RelativeKeyHandler, MathComponent]),
				);
			}
		}
		return (key == null) ? result : result.filter(([handler]) => handler.key === key);
	}
}
