import { App } from "./App.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";

export abstract class MathComponent {
	container?: MathComponentGroup;
	abstract render(app: App): HTMLElement;
}
