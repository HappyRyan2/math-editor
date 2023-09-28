import { Cursor } from "./Cursor.mjs";
import { Search } from "./Search.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class Autocomplete {
	static autocompletions: {name: string, callback: (cursor: Cursor) => void}[] = [];

	searchTerm: string;

	constructor(searchTerm: string) {
		this.searchTerm = searchTerm;
	}

	render() {
		const rendered = document.createElement("div");
		rendered.id = "autocomplete";

		const search = new Search(Autocomplete.autocompletions.map(({ name, callback }) => ({ value: name, callback: callback })));
		for(const result of search.getResults(this.searchTerm)) {
			const resultDiv = document.createElement("div");
			resultDiv.innerHTML = result.value;
			rendered.appendChild(resultDiv);
		}
		return rendered;
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
		const previouscharacters = Autocomplete.getPreviousCharacters(cursor);
		if(previouscharacters.length === 0) {
			cursor.autocomplete = null;
			return;
		}
		const autocomplete = new Autocomplete(previouscharacters.map(c => c.symbol).join(""));
		cursor.autocomplete = autocomplete;
	}
}
