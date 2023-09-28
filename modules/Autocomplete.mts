import { Cursor } from "./Cursor.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class Autocomplete {
	static autocompletions: {name: string, callback: (cursor: Cursor) => void}[] = [];

	searchTerm: string;

	constructor(searchTerm: string) {
		this.searchTerm = searchTerm;
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
		const autocomplete = new Autocomplete(previouscharacters.map(c => c.symbol).join(""));
		cursor.autocomplete = autocomplete;
	}
}
