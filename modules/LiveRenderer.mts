/*
This file contains methods that perform an operation on the MathDocument and also update the rendered view, in order to prevent re-renderings of the entire document for performance reasons.
*/

import { App } from "./App.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponent } from "./MathComponent.mjs";

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

	static addComponentOrReplaceSelection(cursor: Cursor, component: MathComponent, app: App) {
		cursor.addComponentOrReplaceSelection(component);
		component.renderAndInsert(app, app.renderingMap);

		for(const selected of cursor.selectedComponents()) {
			app.renderingMap.get(selected)?.remove();
		}
		LiveRenderer.removeEmptyWords();
		LiveRenderer.removeEmptyLines();

		cursor.predecessor = component;
		app.updateCursors();
	}
}
