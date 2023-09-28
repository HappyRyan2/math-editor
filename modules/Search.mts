export type SearchResult = { value: string };

export class Search {
	results: SearchResult[];

	constructor(results: SearchResult[]) {
		this.results = results;
	}

	static evaluate(query: string, result: SearchResult) {
		if(result.value === query) { return "exact-match"; }
		if(result.value.startsWith(query)) { return "string-initial"; }
		const index = result.value.indexOf(query);
		if(index > 0 && /\W/g.test(result.value[index - 1])) { return "word-initial"; }
		if(index > 0) { return "substring"; }
		return "no-match";
	}
	static compare(query: string, result1: SearchResult, result2: SearchResult) {
		const matchTypes = ["exact-match", "string-initial", "word-initial", "substring", "no-match"] as const;
		const score1 = matchTypes.indexOf(Search.evaluate(query, result1));
		const score2 = matchTypes.indexOf(Search.evaluate(query, result2));
		if(score1 === score2) {
			return result1.value.localeCompare(result2.value);
		}
		return score1 - score2;
	}

	getResults(query: string) {
		if(query === "") { return []; }
		return (this.results
			.filter(result => Search.evaluate(query, result) !== "no-match")
			.sort((a, b) => Search.compare(query, a, b))
		);
	}
}
