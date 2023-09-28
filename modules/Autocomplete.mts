import { Cursor } from "./Cursor.mjs";
import { Search } from "./Search.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class Autocomplete {
	static autocompletions: {name: string, callback: (cursor: Cursor) => void}[] = [];
	static autocomplete: Autocomplete | null = null;

	searchTerm: string;
	cursor: Cursor;

	constructor(searchTerm: string, cursor: Cursor) {
		this.searchTerm = searchTerm;
		this.cursor = cursor;
	}

	render() {
		const rendered = document.createElement("div");
		rendered.id = "autocomplete";

		const search = Autocomplete.getSearch();
		for(const result of search.getResults(this.searchTerm)) {
			const resultDiv = document.createElement("div");
			resultDiv.innerHTML = result.value;
			rendered.appendChild(resultDiv);
		}
		return rendered;
	}
	static getSearch() {
		return new Search(Autocomplete.autocompletions.map(({ name, callback }) => ({ value: name, callback: callback })));
	}

	static getPreviousCharacters(cursor: Cursor): MathSymbol[] {
		const result = [];
		for(let i = cursor.position() - 1; i >= 0; i --) {
			const component = cursor.container.components[i];
			if(!(component instanceof MathSymbol) || MathSymbol.OPERATORS.includes(component.symbol)) {
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
}
