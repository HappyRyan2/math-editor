/*
This file contains methods that perform an operation on the MathDocument and also update the rendered view, in order to prevent re-renderings of the entire document for performance reasons.
*/

import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { mergeMaps } from "./utils/utils.mjs";

export class LiveRenderer {
	private static removeEmptyWords() {
		for(const word of [...document.querySelectorAll(".word")]
			.filter(word => ([...word.childNodes] as HTMLElement[]).every(child => child.classList.contains("cursor")))
		) { word.remove(); }
	}
	private static removeEmptyLines() {
		for(const line of [...document.querySelectorAll(".line")]
			.slice(0, -1)
			.filter(line => ([...line.childNodes] as HTMLElement[]).every(child => child.classList.contains("cursor")))
		) { line.remove(); }
	}

	private static renderAndInsert(component: MathComponent, app: App, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const containingGroup = app.document.containingGroupOf(component);
		const [rendered, map] = component.renderWithMapping(app);
		mergeMaps(renderingMap, map);
		if(containingGroup.components.indexOf(component) === 0 && containingGroup === app.document.componentsGroup) {
			const firstWord = document.querySelector(".word");
			firstWord?.insertAdjacentElement("afterbegin", rendered);
		}
		else if(containingGroup.components.indexOf(component) === 0 && containingGroup !== app.document.componentsGroup){
			const container = app.renderingMap.get(containingGroup);
			const firstWord = container!.querySelector(".word");
			firstWord!.insertAdjacentElement("afterbegin", rendered);
		}
		else {
			const predecessor = containingGroup.components[containingGroup.components.indexOf(component) - 1];
			const renderedPredecessor = app.renderingMap.get(predecessor);
			renderedPredecessor!.insertAdjacentElement("afterend", rendered);
		}
	}

	static addComponentOrReplaceSelection(cursor: Cursor, component: MathComponent, app: App) {
		cursor.addComponentOrReplaceSelection(component);
		LiveRenderer.renderAndInsert(component, app, app.renderingMap);

		for(const selected of cursor.selectedComponents()) {
			app.renderingMap.get(selected)?.remove();
		}
		LiveRenderer.removeEmptyWords();
		LiveRenderer.removeEmptyLines();

		cursor.predecessor = component;
		app.updateCursors();
	}
}