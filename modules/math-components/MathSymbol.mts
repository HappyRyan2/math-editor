import { MathComponent } from "../MathComponent.mjs";

export class MathSymbol extends MathComponent {
	symbol: string;

	constructor(symbol: string) {
		super();
		this.symbol = symbol;
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = this.symbol;
		span.classList.add("symbol");
		return span;
	}
}
