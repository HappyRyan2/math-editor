import { MathDocument } from "./MathDocument.mjs";
import { Cursor } from "./Cursor.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";
import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { RelativeKeyHandler } from "./RelativeKeyHandler.mjs";
import { Autocomplete } from "./Autocomplete.mjs";
import { Selection } from "./Selection.mjs";
import { EditorTab } from "./EditorTab.mjs";

export class App {
	document: MathDocument;
	cursors: Cursor[];

	lastMouseDownEvent: MouseEvent | null = null;
	isMousePressed: boolean = false;

	keyHandlers: ({ key: string, altKey?: boolean, ctrlKey?: boolean, shiftKey?: boolean, handler: (event: KeyboardEvent, stopPropagation: () => void) => void })[] = [
		{
			key: "Enter",
			handler: (event, stopPropagation) => {
				this.cursors.forEach(cursor => LineBreak.addLineBreak(cursor, this.document));
				Autocomplete.close();
				stopPropagation();
			},
		},
		{
			key: "Backspace",
			handler: (event, stopPropagation) => {
				this.cursors.forEach(cursor => cursor.deletePrevious(this.document));
				Autocomplete.update(this.cursors[this.cursors.length - 1]);
				stopPropagation();
			},
		},
		{
			key: "ArrowLeft",
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.moveLeft(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowRight",
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.moveRight(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowLeft",
			shiftKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.selectLeft(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowRight",
			shiftKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.selectRight(this.document));
				stopPropagation();
			},
		},
		{
			key: "Tab",
			handler: (event, stopPropagation) => {
				if(Autocomplete.autocomplete) {
					Autocomplete.autocomplete.activateSelected();
					stopPropagation();
				}
			},
		},
		{
			key: "ArrowUp",
			handler: (event, stopPropagation) => {
				if(Autocomplete.autocomplete) {
					Autocomplete.autocomplete.selectPrevious?.();
					stopPropagation();
				}
			},
		},
		{
			key: "ArrowDown",
			handler: (event, stopPropagation) => {
				if(Autocomplete.autocomplete) {
					Autocomplete.autocomplete?.selectNext?.();
					stopPropagation();
				}
			},
		},
		{
			key: "ArrowRight",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.moveWordRight(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowLeft",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.moveWordLeft(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowRight",
			ctrlKey: true,
			shiftKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.selectWordRight(this.document));
				stopPropagation();
			},
		},
		{
			key: "ArrowLeft",
			ctrlKey: true,
			shiftKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.selectWordLeft(this.document));
				stopPropagation();
			},
		},
		{
			key: "Backspace",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				this.cursors.forEach(c => c.deleteWord(this.document));
				stopPropagation();
			},
		},
		{
			key: "a",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				Autocomplete.close();
				const components = app.document.componentsGroup.components;
				app.cursors = [new Cursor(
					app.document.componentsGroup,
					components[components.length - 1] ?? null,
					new Selection(components[0], components[components.length - 1]),
				)];
				stopPropagation();
			},
		},
		{
			key: "s",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				const string = JSON.stringify(this.document);
				const filePath = this.document.filePath;
				if(filePath == null) {
					electronAPI.sendSaveWithDialog(string, [{ name: "Math Document", extensions: ["mathdoc"] }]);
				}
				else {
					electronAPI.sendSave(string, filePath);
				}
				stopPropagation();
			},
		},
		{
			key: "o",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				electronAPI.openWithDialog([{ name: "Math Document", extensions: ["mathdoc"] }]).then((resolved) => {
					const [[filePath, fileContents]] = resolved;
					app.document = MathDocument.parse(fileContents);
					app.document.filePath = filePath;
					app.cursors = [new Cursor(app.document.componentsGroup, null)];
					app.renderAndUpdate();
				});
				stopPropagation();
			},
		},
	];
	renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();

	editorTabs: EditorTab[];
	activeTab: EditorTab;

	constructor() {
		const document = new MathDocument([]);
		this.editorTabs = [new EditorTab(
			document,
			[new Cursor(document.componentsGroup, null)],
		)];
		this.activeTab = this.editorTabs[0];
		this.document = document;
		this.cursors = this.editorTabs[0].cursors;
	}

	initialize() {
		this.renderAndUpdate();
		this.initializeListeners();
		Cursor.initialize();
	}

	render(renderedDoc = this.document.render(this)) {
		const div = document.createElement("div");
		div.id = "document-container";
		div.appendChild(renderedDoc);
		return div;
	}
	initializeListeners() {
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
		document.addEventListener("mousedown", (event) => this.handleMouseDown(event));
		document.addEventListener("mouseup", () => this.handleMouseUp());
		document.addEventListener("mousemove", (event) => this.handleMouseMove(event));
	}
	renderAndUpdate() {
		const [div, map] = this.renderWithMapping();
		const oldDiv = document.getElementById("document-container")!;
		oldDiv.insertAdjacentElement("afterend", div);
		oldDiv.remove();
		this.renderingMap = map;
		return [div, map];
	}
	renderWithMapping(): [HTMLDivElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const [renderedDoc, map] = this.document.renderWithMapping(this);
		return [this.render(renderedDoc), map];
	}
	updateCursors() {
		for(const [component, element] of this.renderingMap) {
			if(component instanceof MathComponent) {
				if(component.isSelected(this.cursors)) {
					element.classList.add("selected");
				}
				else {
					element.classList.remove("selected");
				}
			}
		}
		for(const cursorElement of document.getElementsByClassName("cursor")) {
			cursorElement.remove();
		}
		for(const cursor of this.cursors) {
			const containerElement = this.renderingMap.get(cursor.container) ?? document.querySelector(".line")!;
			if(cursor.predecessor == null) {
				containerElement.insertBefore(cursor.render(), containerElement.firstChild);
			}
			else {
				const predecessorElement = this.renderingMap.get(cursor.predecessor)!;
				if(predecessorElement.classList.contains("line-break")) {
					const nextLine = predecessorElement.parentElement!.nextElementSibling;
					nextLine?.insertAdjacentElement("afterbegin", cursor.render());
				}
				else {
					predecessorElement.insertAdjacentElement("afterend", cursor.render());
				}
			}
		}
	}

	handleKeyDown(event: KeyboardEvent) {
		const handled = this.handleSpecialKeys(event);
		if(!handled) {
			this.checkRelativeKeyHandlers(event);
			this.handleCharacterKeys(event);
		}
		this.renderAndUpdate();
	}
	handleCharacterKeys(event: KeyboardEvent) {
		for(const cursor of this.cursors) {
			if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
				cursor.addComponent(new MathSymbol(event.key));
			}
		}
		if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
			Cursor.resetCursorBlink();
			const lastCursor = this.cursors[this.cursors.length - 1];
			Autocomplete.open(lastCursor);
		}
	}
	handleSpecialKeys(event: KeyboardEvent) {
		let handled = false;
		const stopPropagation = () => (handled = true);
		for(const { key, ctrlKey, altKey, shiftKey, handler } of this.keyHandlers) {
			if(
				event.key === key &&
				(event.ctrlKey === !!ctrlKey === true) &&
				(event.altKey === !!altKey === true) &&
				(event.shiftKey === !!shiftKey === true)
			) {
				handler(event, stopPropagation);
				if(handled) {
					return true;
				}
			}
		}
		return false;
	}
	checkRelativeKeyHandlers(event: KeyboardEvent) {
		for(const cursor of this.cursors) {
			const handlers = RelativeKeyHandler.getHandlers(cursor, this.document, event.key);
			if(handlers.length !== 0) {
				const [handler, component] = handlers[0];
				handler.callback(cursor, component, this);
			}
		}
	}

	handleMouseUp() {
		this.isMousePressed = false;
	}
	handleMouseDown(event: MouseEvent) {
		this.lastMouseDownEvent = event;
		this.isMousePressed = true;

		this.cursors = [Cursor.fromClick(this, event)];
		Cursor.resetCursorBlink();
		Autocomplete.close();
		this.renderAndUpdate();
	}
	handleMouseMove(event: MouseEvent) {
		if(this.isMousePressed) {
			this.cursors = [Cursor.fromDrag(this, this.lastMouseDownEvent!, event)];
			Cursor.resetCursorBlink();
			this.updateCursors();
		}
	}
}

const app = new App();
export { app };
