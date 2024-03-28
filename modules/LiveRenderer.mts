/*
This file contains methods that perform an operation on the MathDocument and also update the rendered view and the rendering map, in order to prevent re-renderings of the entire document for performance reasons.
*/

import { App } from "./App.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";
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
	private static disconnectCursors(component: MathComponent, app: App) {
		const previousComponent = app.document.getPreviousComponent(component);
		const nextComponent = app.document.getNextComponent(component);

		app.activeTab.cursors = app.activeTab.cursors.filter(c => !app.document.isDescendantOf(c.container, component));
		for(const cursor of app.cursors) {
			if(cursor.predecessor === component) {
				cursor.predecessor = previousComponent;
			}
			if(cursor.selection?.start === component && cursor.selection?.end === component) {
				cursor.selection = null;
			}
			if(cursor.selection?.start === component) {
				if(nextComponent != null) { cursor.selection.start = nextComponent; }
				else { cursor.selection = null; }
			}
			if(cursor.selection?.end === component) {
				if(previousComponent != null) { cursor.selection.end = previousComponent; }
				else { cursor.selection = null; }
			}
		}
	}

	private static renderAndInsert(component: MathComponent, app: App) {
		const containingGroup = app.document.containingGroupOf(component);
		const [rendered, map] = component.renderWithMapping(app);
		mergeMaps(app.renderingMap, map);
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
			if(predecessor instanceof LineBreak) {
				const nextLine = renderedPredecessor!.parentElement!.parentElement!.nextElementSibling;
				const firstWord = nextLine!.firstElementChild;
				if(firstWord) {
					firstWord.insertAdjacentElement("afterbegin", rendered);
				}
				else {
					const word = MathComponentGroup.createEmptyWord();
					word.appendChild(rendered);
					nextLine?.insertAdjacentElement("afterbegin", word);
				}
			}
			else {
				renderedPredecessor!.insertAdjacentElement("afterend", rendered);
			}
		}
	}

	static deleteLineBreak(lineBreak: LineBreak, app: App) {
		const renderedLine = app.renderingMap.get(lineBreak)!.parentElement!.parentElement!;
		const renderedNextLine = renderedLine.nextElementSibling;
		const previousComponent = app.document.getPreviousComponent(lineBreak);
		const nextComponent = app.document.getPreviousComponent(lineBreak);
		app.renderingMap.get(lineBreak)!.remove();
		app.renderingMap.delete(lineBreak);
		LiveRenderer.disconnectCursors(lineBreak, app);
		app.document.componentsGroup.components = app.document.componentsGroup.components.filter(c => c !== lineBreak);
		if(renderedNextLine) {
			for(const element of renderedNextLine.children) {
				renderedLine.appendChild(element);
			}
			renderedNextLine.remove();
		}
		if(previousComponent) {
			app.document.componentsGroup.checkWordBreaks(previousComponent, app.renderingMap);
		}
		else if(nextComponent) {
			app.document.componentsGroup.checkWordBreaks(nextComponent, app.renderingMap);
		}
		else {
			const [word1, word2] = renderedLine.children;
			for(const element of word1.children) {
				word2.insertAdjacentElement("afterbegin", element);
			}
			word1.remove();
		}
	}
	static insertLineBreak(lineBreak: LineBreak, index: number, app: App) {
		app.document.componentsGroup.components.splice(index, 0, lineBreak);
		LiveRenderer.renderAndInsert(lineBreak, app);
		const previousLine = app.renderingMap.get(lineBreak)!.parentElement!.parentElement!;
		const newLine = document.createElement("div");
		newLine.classList.add("line");
		previousLine.insertAdjacentElement("afterend", newLine);
		let currentWordInPreviousLine = null;
		let currentWordInNewLine = null;
		for(const component of app.document.componentsGroup.components.slice(index + 1)) {
			const renderedComponent = app.renderingMap.get(component)!;
			if(renderedComponent.parentElement !== currentWordInPreviousLine) {
				currentWordInPreviousLine = renderedComponent.parentElement;
				newLine.appendChild(currentWordInNewLine = MathComponentGroup.createEmptyWord());
			}
			currentWordInNewLine?.appendChild(renderedComponent);
			if(component instanceof LineBreak) { break; }
		}
	}

	static delete(component: MathComponent, app: App) {
		if(component instanceof LineBreak) {
			LiveRenderer.deleteLineBreak(component, app);
		}
		const previousComponent = app.document.getPreviousComponent(component);
		const nextComponent = app.document.getNextComponent(component);

		app.renderingMap.get(component)?.remove();
		app.renderingMap.delete(component);
		if(component instanceof CompositeMathComponent) {
			for(const descendant of [...component.descendants(), ...component.groupDescendants()]) {
				app.renderingMap.delete(descendant);
			}
		}

		LiveRenderer.disconnectCursors(component, app);

		const container = app.document.containingGroupOf(component);
		container.components = container.components.filter(c => c !== component);

		if(previousComponent != null) {
			container.checkWordBreaks(previousComponent, app.renderingMap);
		}
		if(nextComponent != null) {
			container.checkWordBreaks(nextComponent, app.renderingMap);
		}
	}
	static insertAtIndex(component: MathComponent, container: MathComponentGroup, index: number, app: App) {
		if(component instanceof LineBreak) {
			if(container === app.document.componentsGroup) {
				LiveRenderer.insertLineBreak(component, index, app);
			}
			else {
				throw new Error("Line breaks can only be inserted in the document's MathComponentGroup.");
			}
		}
		container.components.splice(index, 0, component);
		LiveRenderer.renderAndInsert(component, app);
		container.checkWordBreaks(component, app.renderingMap);
	}
	static insert(component: MathComponent, position: "before" | "after", target: MathComponent, app: App): void;
	static insert(component: MathComponent, position: "beginning" | "end", target: MathComponentGroup, app: App): void;
	static insert(component: MathComponent, position: "before" | "after" | "beginning" | "end", target: MathComponent | MathComponentGroup, app: App) {
		const container = (target instanceof MathComponentGroup ? target : app.document.containingGroupOf(target));
		if(position === "beginning" || position === "end") {
			LiveRenderer.insertAtIndex(
				component, container,
				(position === "beginning") ? 0 : container.components.length,
				app,
			);
		}
		else {
			LiveRenderer.insertAtIndex(
				component, container,
				container.components.indexOf(component) + (position === "before" ? 0 : 1),
				app,
			);
		}
	}

	static addComponentOrReplaceSelection(cursor: Cursor, component: MathComponent, app: App) {
		const selectedComponents = [...cursor.selectedComponents()];
		cursor.addComponentOrReplaceSelection(component);
		LiveRenderer.renderAndInsert(component, app);

		for(const selected of selectedComponents) {
			LiveRenderer.delete(selected, app);
		}
		LiveRenderer.removeEmptyWords();
		LiveRenderer.removeEmptyLines();

		cursor.predecessor = component;
		app.updateCursors();
	}
}
