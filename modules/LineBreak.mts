import { MathComponent } from "./MathComponent.mjs";

export class LineBreak extends MathComponent {
	render() {
		const result = document.createElement("span");
		result.classList.add("line-break");
		result.innerHTML = " ";
		return result;
	}
}
