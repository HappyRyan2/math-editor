import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { App } from "./App.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { lastItem } from "./utils/utils.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";

export class MathComponentGroup {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		this.components = components;
	}

	getWordGroups(): MathComponent[][] {
		const words: MathComponent[][] = [];
		if(this.components.length === 0) { return [[]]; }
		let index = this.components.length - 1;
		while(index >= 0) {
			words.unshift([]);
			Cursor.movePastWord(
				() => {
					words[0].unshift(this.components[index]);
					index --;
				},
				() => this.components[index] ?? null,
			);
		}
		if(lastItem(lastItem(words)) instanceof LineBreak) {
			words.push([]);
		}
		return words;
	}

	render() {
		const [rendered] = this.renderWithMapping();
		return rendered;
	}
	renderWithMapping(): [HTMLElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		let resultMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();
		const result = document.createElement("span");
		resultMap.set(this, result);
		result.classList.add("math-component-group");
		const words = this.getWordGroups();
		for(const [wordIndex, word] of words.entries()) {
			const cursors = App.cursors.filter(cursor => cursor.container === this && (
				(cursor.nextComponent() == null && wordIndex === words.length - 1) ||
				(cursor.nextComponent() != null && word.includes(cursor.nextComponent() as MathComponent))
			));
			const [renderedWord, map] = MathComponentGroup.renderWordWithMapping(word, cursors);
			result.appendChild(renderedWord);
			resultMap = new Map([...resultMap, ...map]);
		}
		return [result, resultMap];
	}
	static createEmptyWord() {
		const result = document.createElement("span");
		result.classList.add("word");
		return result;
	}
	static renderWordWithMapping(word: MathComponent[], cursors: Cursor[]): [HTMLSpanElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		let resultMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();
		const result = MathComponentGroup.createEmptyWord();
		for(const component of MathComponentGroup.componentsAndCursors(word, cursors)) {
			if(component instanceof MathComponent) {
				const [renderedComponent, map] = component.renderWithMapping();
				result.appendChild(renderedComponent);
				resultMap = new Map([...resultMap, ...map]);

				if(component.isSelected(App.cursors)) {
					renderedComponent.classList.add("selected");
				}
			}
			else {
				result.appendChild(component.render());
			}
		}
		return [result, resultMap];
	}
	componentsAndCursors(cursors: Cursor[]) {
		cursors = cursors.filter(c => c.container === this).sort((a, b) => a.position() - b.position());
		return [
			...cursors.filter(c => c.predecessor == null),
			...this.components.map(component => [component, ...cursors.filter(c => c.predecessor === component)]),
		].flat();
	}
	static componentsAndCursors(components: MathComponent[], cursors: Cursor[]) {
		cursors = cursors.sort((a, b) => a.position() - b.position());
		return [
			...cursors.filter(c => c.predecessor == null || !components.includes(c.predecessor)),
			...components.map(component => [component, ...cursors.filter(c => c.predecessor === component)]),
		].flat();
	}

	*descendants() {
		for(const component of this.components) {
			yield component;
			if(component instanceof CompositeMathComponent) {
				yield* component.descendants();
			}
		}
	}
	*groupDescendants() {
		for(const component of this.components) {
			if(component instanceof CompositeMathComponent) {
				yield* component.groupDescendants();
			}
		}
	}

	insertAfter(component: MathComponent, componentsToInsert: MathComponent[]) {
		const index = this.components.indexOf(component);
		this.components.splice(index + 1, 0, ...componentsToInsert);
	}

	toJSON() {
		return { ...this, constructorName: "MathComponentGroup" };
	}

	static parse(input: object) {
		if("components" in input && Array.isArray(input.components)) {
			return new MathComponentGroup(input.components.map(c => MathComponent.parseObject(c)));
		}
		else {
			throw new Error("Serialized MathComponentGroup did not have a valid `components` property.");
		}
	}

	matches(group: MathComponentGroup) {
		return this.components.length === group.components.length && this.components.every((component, index) => component.matches(group.components[index]));
	}

	static addWordBreakAfter(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const word = renderingMap.get(component)!.parentElement!;
		const indexInWord = [...word.childNodes].indexOf(renderingMap.get(component)!);
		const componentsAfter = [...word.childNodes].slice(indexInWord + 1);
		if(componentsAfter.length !== 0) {
			const newWord = MathComponentGroup.createEmptyWord();
			newWord.append(...componentsAfter);
			word.insertAdjacentElement("afterend", newWord);
		}
	}
	addWordBreakBefore(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const previous = this.components[this.components.indexOf(component) - 1];
		if(previous) {
			MathComponentGroup.addWordBreakAfter(previous, renderingMap);
		}
	}
	static removeWordBreakAfter(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const word = renderingMap.get(component)!.parentElement!;
		const wordItems = ([...word.childNodes] as HTMLElement[]).filter(v => !v.classList.contains("cursor"));
		if(wordItems.indexOf(renderingMap.get(component)!) === wordItems.length - 1) {
			const nextWord = word.nextElementSibling;
			if(nextWord) {
				nextWord.remove();
				word.append(...nextWord.childNodes);
			}
		}
	}
	removeWordBreakBefore(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const previous = this.components[this.components.indexOf(component) - 1];
		if(previous) {
			MathComponentGroup.removeWordBreakAfter(previous, renderingMap);
		}
	}
	isWordBreakAfter(component: MathComponent) {
		const nextComponent = this.components[this.components.indexOf(component) + 1];
		if(!nextComponent) { return false; }
		return Cursor.isWordBoundary(component) && !Cursor.isWordBoundary(nextComponent);
	}
	isWordBreakBefore(component: MathComponent) {
		const previous = this.components[this.components.indexOf(component) - 1];
		if(previous) {
			return this.isWordBreakAfter(previous);
		}
		else { return false; }
	}
	deleteEmptyWords(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		const word = renderingMap.get(component)!.parentElement!;
		for(const adjacentWord of [word.previousElementSibling, word.nextElementSibling]) {
			if(adjacentWord && [...adjacentWord.children].every(c => c.classList.contains("cursor"))) {
				for(const cursor of adjacentWord.children) {
					word.insertAdjacentElement((adjacentWord === word.previousElementSibling) ? "afterbegin" : "beforeend", cursor);
				}
				adjacentWord.remove();
			}
		}
	}
	checkWordBreaks(component: MathComponent, renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement>) {
		if(this.isWordBreakAfter(component)) {
			MathComponentGroup.addWordBreakAfter(component, renderingMap);
		}
		else {
			MathComponentGroup.removeWordBreakAfter(component, renderingMap);
		}

		if(this.isWordBreakBefore(component)) {
			this.addWordBreakBefore(component, renderingMap);
		}
		else {
			this.removeWordBreakBefore(component, renderingMap);
		}
		this.deleteEmptyWords(component, renderingMap);
	}
}
