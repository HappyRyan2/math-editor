import { App } from "./App.mjs";

export abstract class MathComponent {
	abstract render(app: App): HTMLElement;
}
