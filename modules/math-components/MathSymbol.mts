import { MathComponent } from "../MathComponent.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

export class MathSymbol extends MathComponent {
	symbol: string;

	constructor(symbol: string, container?: MathComponentGroup) {
		super(container);
		this.symbol = symbol;
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = this.symbol;
		span.classList.add("symbol");
		return span;
	}
}
