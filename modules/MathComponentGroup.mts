import { MathComponent } from "./MathComponent.mjs";
import { Cursor } from "./Cursor.mjs";
import { App } from "./App.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";

export class MathComponentGroup {
	components: MathComponent[];

	constructor(components: MathComponent[]) {
		this.components = components;
	}

	getWordGroups(): MathComponent[][] {
		const getType = (component: MathComponent) => (
			(component instanceof MathSymbol && (component.symbol === " " || MathSymbol.OPERATORS.includes(component.symbol))) ? "word-boundary" :
				(component instanceof MathSymbol) ? "non-word-boundary-character" :
					(component instanceof LineBreak) ? "line-break" :
						"non-math-symbol"
		);

		const wordGroups: MathComponent[][] = [[]];
		for(const [index, component] of this.components.entries()) {
			if(index !== 0 && getType(component) !== getType(this.components[index - 1])) {
				wordGroups.push([]);
			}
			wordGroups[wordGroups.length - 1].push(component);
		}
		return wordGroups;
	}

	render(app: App) {
		const span = document.createElement("span");
		span.classList.add("math-component-group");
		for(const component of this.componentsAndCursors(app.cursors)) {
			const renderedComponent = component.render(app);
			span.appendChild(renderedComponent);
			if(component instanceof MathComponent && component.isSelected(app.cursors)) {
				renderedComponent.classList.add("selected");
			}
		}
		return span;
	}
	renderWithMapping(app: App): [HTMLElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const resultMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();
		const result = document.createElement("span");
		resultMap.set(this, result);
		result.classList.add("math-component-group");
		for(const component of this.componentsAndCursors(app.cursors)) {
			let renderedComponent: HTMLElement;
			if(component instanceof CompositeMathComponent) {
				let map: Map<MathComponent | MathComponentGroup, HTMLElement>;
				[renderedComponent, map] = component.renderWithMapping(app);
				for(const [key, value] of map.entries()) {
					resultMap.set(key, value);
				}
			}
			else {
				renderedComponent = component.render(app);
			}
			result.appendChild(renderedComponent);
			if(component instanceof MathComponent && component.isSelected(app.cursors)) {
				renderedComponent.classList.add("selected");
			}
			if(component instanceof MathComponent) {
				resultMap.set(component, renderedComponent);
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
}
