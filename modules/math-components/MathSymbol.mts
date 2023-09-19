import { MathComponent } from "../MathComponent.mjs";

export class MathSymbol extends MathComponent {
	static OPERATORS = ["+", "-", "*", "=", ">", "<", "⋅"];
	symbol: string;

	constructor(symbol: string) {
		super();
		this.symbol = symbol;
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = this.symbol;
		span.classList.add("symbol");
		if(this.symbol === " ") {
			span.innerHTML = "&nbsp";
		}
		if(MathSymbol.OPERATORS.includes(this.symbol)) {
			span.classList.add("binary-operator");
		}
		return span;
	}
}
