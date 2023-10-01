import { Cursor } from "./Cursor.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { Search } from "./Search.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class Autocomplete {
	static autocompletions: {name: string, callback: (cursor: Cursor) => void}[] = [];
	static autocomplete: Autocomplete | null = null;

	searchTerm: string;
	cursor: Cursor;
	selectedIndex: number = 0;

	constructor(searchTerm: string, cursor: Cursor) {
		this.searchTerm = searchTerm;
		this.cursor = cursor;
	}

	render() {
		const rendered = document.createElement("div");
		rendered.id = "autocomplete";

		const search = Autocomplete.getSearch();
		for(const [index, result] of search.getResults(this.searchTerm).entries()) {
			rendered.appendChild(this.renderResult(result, index === this.selectedIndex));
		}
		return rendered;
	}
	renderResult(result: { value: string }, selected: boolean) {
		const matchedText = document.createElement("span");
		matchedText.classList.add("matched-text");
		matchedText.innerHTML += this.searchTerm;

		const resultDiv = document.createElement("div");
		resultDiv.innerHTML += result.value.slice(0, result.value.indexOf(this.searchTerm));
		resultDiv.appendChild(matchedText);
		resultDiv.innerHTML += result.value.slice(result.value.indexOf(this.searchTerm) + this.searchTerm.length);

		if(selected) {
			resultDiv.classList.add("selected-result");
		}
		return resultDiv;
	}
	static getSearch() {
		return new Search(Autocomplete.autocompletions.map(({ name, callback }) => ({ value: name, callback: callback })));
	}

	static getPreviousCharacters(cursor: Cursor): MathSymbol[] {
		const result = [];
		for(let i = cursor.position() - 1; i >= 0; i --) {
			const component = cursor.container.components[i];
			if(!(component instanceof MathSymbol) || !(/[A-Za-z]/g.test(component.symbol))) {
				break;
			}
			result.push(component);
		}
		return result.reverse();
	}
	static update(cursor: Cursor) {
		if(Autocomplete.autocomplete?.cursor !== cursor) {
			return;
		}
		Autocomplete.open(cursor);
	}
	static open(cursor: Cursor) {
		const previouscharacters = Autocomplete.getPreviousCharacters(cursor);
		if(previouscharacters.length === 0) {
			Autocomplete.autocomplete = null;
			return;
		}
		const autocomplete = new Autocomplete(previouscharacters.map(c => c.symbol).join(""), cursor);
		if(Autocomplete.getSearch().getResults(autocomplete.searchTerm).length === 0) {
			Autocomplete.autocomplete = null;
			return;
		}
		Autocomplete.autocomplete = autocomplete;
	}
	static close() {
		Autocomplete.autocomplete = null;
	}

	selectNext() {
		const numResults = Autocomplete.getSearch().getResults(this.searchTerm).length;
		if(this.selectedIndex >= numResults - 1) {
			this.selectedIndex = 0;
		}
		else {
			this.selectedIndex ++;
		}
	}
	selectPrevious() {
		if(this.selectedIndex <= 0) {
			const numResults = Autocomplete.getSearch().getResults(this.searchTerm).length;
			this.selectedIndex = numResults - 1;
		}
		else {
			this.selectedIndex --;
		}
	}
	activateSelected() {
		const results = Autocomplete.getSearch().getResults(this.searchTerm);
		const selected = results[this.selectedIndex];
		selected.callback(this.cursor);
		Autocomplete.close();
	}
	replaceCompletedWith(...components: MathComponent[]) {
		this.cursor.container.components.splice(this.cursor.position() - this.searchTerm.length, this.searchTerm.length, ...components);
		this.cursor.moveAfter(components[components.length - 1], this.cursor.container);
	}
}
