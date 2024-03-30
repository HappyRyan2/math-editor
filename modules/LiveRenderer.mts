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
	private static disconnectCursors(component: MathComponent) {
		const previousComponent = App.document.getPreviousComponent(component);
		const nextComponent = App.document.getNextComponent(component);

		App.activeTab.cursors = App.activeTab.cursors.filter(c => !App.document.isDescendantOf(c.container, component));
		for(const cursor of App.cursors) {
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

	private static renderAndInsert(component: MathComponent) {
		const containingGroup = App.document.containingGroupOf(component);
		const [rendered, map] = component.renderWithMapping();
		mergeMaps(App.renderingMap, map);
		if(containingGroup.components.indexOf(component) === 0 && containingGroup === App.document.componentsGroup) {
			const firstWord = document.querySelector(".word");
			firstWord?.insertAdjacentElement("afterbegin", rendered);
		}
		else if(containingGroup.components.indexOf(component) === 0 && containingGroup !== App.document.componentsGroup){
			const container = App.renderingMap.get(containingGroup);
			const firstWord = container!.querySelector(".word");
			firstWord!.insertAdjacentElement("afterbegin", rendered);
		}
		else {
			const predecessor = containingGroup.components[containingGroup.components.indexOf(component) - 1];
			const renderedPredecessor = App.renderingMap.get(predecessor);
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
	private static insertRelativeToComponent(component: MathComponent, position: "before" | "after", target: MathComponent) {
		const container = App.document.containingGroupOf(target);
		LiveRenderer.insertAtIndex(
			component, container,
			container.components.indexOf(target) + (position === "before" ? 0 : 1),
		);
		if(position === "before") {
			for(const cursor of App.cursors.filter(c => c.container === container && c.predecessor === component)) {
				cursor.moveBefore(component, container);
			}
		}
		else {
			for(const cursor of App.cursors.filter(c => c.container === container && c.nextComponent() === component)) {
				cursor.predecessor = component;
			}
		}
	}
	private static insertRelativeToGroup(component: MathComponent, position: "beginning" | "end", group: MathComponentGroup) {
		LiveRenderer.insertAtIndex(
			component, group,
			(position === "beginning") ? 0 : group.components.length,
		);
		if(position === "beginning") {
			for(const cursor of App.cursors.filter(c => c.container === group && c.predecessor === null)) {
				cursor.predecessor = component;
			}
		}
		else {
			for(const cursor of App.cursors.filter(c => c.container === group && c.predecessor === component)) {
				cursor.moveBefore(component, group);
			}
		}
	}
	private static insertRelativeToCursor(component: MathComponent, position: "before" | "after", cursor: Cursor) {
		if(position === "before") {
			if(cursor.predecessor === null) {
				LiveRenderer.insert(component, "beginning", cursor.container);
			}
			else {
				LiveRenderer.insert(component, "after", cursor.predecessor);
			}
		}
		else {
			const nextComponent = cursor.nextComponent();
			if(nextComponent === null) {
				LiveRenderer.insert(component, "end", cursor.container);
			}
			else {
				LiveRenderer.insert(component, "before", nextComponent);
			}
		}
	}

	static deleteLineBreak(lineBreak: LineBreak) {
		const renderedLine = App.renderingMap.get(lineBreak)!.parentElement!.parentElement!;
		const renderedNextLine = renderedLine.nextElementSibling;
		const previousComponent = App.document.getPreviousComponent(lineBreak);
		const nextComponent = App.document.getPreviousComponent(lineBreak);
		App.renderingMap.get(lineBreak)!.remove();
		App.renderingMap.delete(lineBreak);
		LiveRenderer.disconnectCursors(lineBreak);
		App.document.componentsGroup.components = App.document.componentsGroup.components.filter(c => c !== lineBreak);
		if(renderedNextLine) {
			for(const element of renderedNextLine.children) {
				renderedLine.appendChild(element);
			}
			renderedNextLine.remove();
		}
		if(previousComponent) {
			App.document.componentsGroup.checkWordBreaks(previousComponent, App.renderingMap);
		}
		else if(nextComponent) {
			App.document.componentsGroup.checkWordBreaks(nextComponent, App.renderingMap);
		}
		else {
			const [word1, word2] = renderedLine.children;
			for(const element of word1.children) {
				word2.insertAdjacentElement("afterbegin", element);
			}
			word1.remove();
		}
	}
	static insertLineBreak(lineBreak: LineBreak, index: number) {
		App.document.componentsGroup.components.splice(index, 0, lineBreak);
		LiveRenderer.renderAndInsert(lineBreak);
		const previousLine = App.renderingMap.get(lineBreak)!.parentElement!.parentElement!;
		const newLine = document.createElement("div");
		newLine.classList.add("line");
		previousLine.insertAdjacentElement("afterend", newLine);
		let currentWordInPreviousLine = null;
		let currentWordInNewLine = null;
		for(const component of App.document.componentsGroup.components.slice(index + 1)) {
			const renderedComponent = App.renderingMap.get(component)!;
			if(renderedComponent.parentElement !== currentWordInPreviousLine) {
				currentWordInPreviousLine = renderedComponent.parentElement;
				newLine.appendChild(currentWordInNewLine = MathComponentGroup.createEmptyWord());
			}
			currentWordInNewLine?.appendChild(renderedComponent);
			if(component instanceof LineBreak) { break; }
		}
		if(index >= App.document.componentsGroup.components.length - 1) {
			newLine.appendChild(MathComponentGroup.createEmptyWord());
		}
	}

	static delete(component: MathComponent) {
		if(component instanceof LineBreak) {
			LiveRenderer.deleteLineBreak(component);
		}
		const previousComponent = App.document.getPreviousComponent(component);
		const nextComponent = App.document.getNextComponent(component);

		App.renderingMap.get(component)?.remove();
		App.renderingMap.delete(component);
		if(component instanceof CompositeMathComponent) {
			for(const descendant of [...component.descendants(), ...component.groupDescendants()]) {
				App.renderingMap.delete(descendant);
			}
		}

		LiveRenderer.disconnectCursors(component);

		const container = App.document.containingGroupOf(component);
		container.components = container.components.filter(c => c !== component);

		if(previousComponent != null) {
			container.checkWordBreaks(previousComponent, App.renderingMap);
		}
		if(nextComponent != null) {
			container.checkWordBreaks(nextComponent, App.renderingMap);
		}
	}
	static insertAtIndex(component: MathComponent, container: MathComponentGroup, index: number) {
		if(component instanceof LineBreak) {
			if(container === App.document.componentsGroup) {
				LiveRenderer.insertLineBreak(component, index);
				return;
			}
			else {
				throw new Error("Line breaks can only be inserted in the document's MathComponentGroup.");
			}
		}
		container.components.splice(index, 0, component);
		LiveRenderer.renderAndInsert(component);
		container.checkWordBreaks(component, App.renderingMap);
		for(const cursor of App.cursors.filter(c => c.nextComponent() === component)) {
			cursor.predecessor = component;
		}
	}
	static insert(component: MathComponent, position: "before" | "after", target: MathComponent | Cursor): void;
	static insert(component: MathComponent, position: "beginning" | "end", target: MathComponentGroup): void;
	static insert(component: MathComponent, position: "before" | "after" | "beginning" | "end", target: MathComponent | MathComponentGroup | Cursor) {
		if(target instanceof MathComponentGroup) {
			LiveRenderer.insertRelativeToGroup(component, position as "beginning" | "end", target);
		}
		else if(target instanceof MathComponent) {
			LiveRenderer.insertRelativeToComponent(component, position as "before" | "after", target);
		}
		else {
			LiveRenderer.insertRelativeToCursor(component, position as "before" | "after", target);
		}
		App.updateCursors();
	}

	static addComponentOrReplaceSelection(cursor: Cursor, component: MathComponent) {
		for(const selected of cursor.selectedComponents()) {
			LiveRenderer.delete(selected);
		}
		LiveRenderer.insert(component, "before", cursor);
	}
}
