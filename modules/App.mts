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
import { LiveRenderer } from "./LiveRenderer.mjs";

export class App {
	static lastMouseDownEvent: MouseEvent | null = null;
	static isMousePressed: boolean = false;

	keyHandlers: ({ key: string, altKey?: boolean, ctrlKey?: boolean, shiftKey?: boolean, handler: (event: KeyboardEvent, stopPropagation: () => void, preventDefault: () => void) => void })[] = [
		{
			key: "Enter",
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
				this.cursors.forEach(cursor => LineBreak.addLineBreak(cursor, this.document));
				Autocomplete.close();
				stopPropagation();
			},
		},
		{
			key: "Backspace",
			handler: (event, stopPropagation) => {
				Cursor.resetCursorBlink();
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
					Cursor.resetCursorBlink();
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
				const components = App.activeTab.document.componentsGroup.components;
				App.activeTab.cursors = [new Cursor(
					App.activeTab.document.componentsGroup,
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
					electronAPI.sendSaveWithDialog(string, [{ name: "Math Document", extensions: ["mathdoc"] }]).then((savedFilePath) => {
						this.document.filePath = savedFilePath;
						app.renderAndUpdate();
					});
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
					if(resolved.length === 0) {
						return; // open dialog was closed
					}
					const [[filePath, fileContents]] = resolved;
					const doc = MathDocument.parse(fileContents);
					doc.filePath = filePath;
					App.editorTabs.push(new EditorTab(
						doc,
						[new Cursor(doc.componentsGroup, null)],
					));
					App.activeTab = App.editorTabs[App.editorTabs.length - 1];
					app.renderAndUpdate();
				});
				stopPropagation();
			},
		},
		{
			key: "w",
			ctrlKey: true,
			handler: (event, stopPropagation, preventDefault) => {
				this.closeTab();
				app.renderAndUpdate();
				stopPropagation();
				preventDefault();
			},
		},
		{
			key: "n",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				App.editorTabs.push(EditorTab.createEmpty());
				App.activeTab = App.editorTabs[App.editorTabs.length - 1];
				stopPropagation();
			},
		},
		{
			key: "Tab",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				const index = App.editorTabs.indexOf(App.activeTab);
				App.activeTab = App.editorTabs[index + 1] ?? App.editorTabs[0];
				stopPropagation();
			},
		},
		{
			key: "Tab",
			ctrlKey: true,
			shiftKey: true,
			handler: (event, stopPropagation) => {
				const index = App.editorTabs.indexOf(App.activeTab);
				App.activeTab = App.editorTabs[index - 1] ?? App.editorTabs[App.editorTabs.length - 1];
				stopPropagation();
			},
		},
		{
			key: "d",
			ctrlKey: true,
			handler: (event, stopPropagation) => {
				const cursor = this.cursors[this.cursors.length - 1];
				const newCursor = cursor.createCursorFromSelection(this.document);
				if(newCursor != null && !this.cursors.some(c => c.hasSamePosition(newCursor))) {
					this.cursors.push(newCursor);
				}
				stopPropagation();
				Cursor.resetCursorBlink();
			},
		},
		{
			key: "Escape",
			handler: () => {
				App.activeTab.cursors = [this.cursors[0]];
				Cursor.resetCursorBlink();
			},
		},
	];
	renderingMap: Map<MathComponent | MathComponentGroup, HTMLElement> = new Map();

	static editorTabs: EditorTab[];
	static activeTab: EditorTab;

	get document() {
		return App.activeTab.document;
	}
	get cursors() {
		return App.activeTab.cursors;
	}

	constructor(document: MathDocument = new MathDocument([])) {
		// TEMPORARY - TODO: Remove this! (All properties of the app will be static, not instance properties)
		App.editorTabs = [new EditorTab(
			document,
			[new Cursor(document.componentsGroup, null)],
		)];
		App.activeTab = App.editorTabs[0];
	}

	initialize() {
		const doc = new MathDocument([]);
		App.activeTab = new EditorTab(
			doc,
			[new Cursor(doc.componentsGroup, null)],
		);

		this.renderAndUpdate();
		this.initializeListeners();
		Cursor.initialize();
	}

	initializeListeners() {
		document.addEventListener("keydown", (event) => this.handleKeyDown(event));
		document.addEventListener("mouseup", () => this.handleMouseUp());
		document.addEventListener("mousemove", (event) => this.handleMouseMove(event));
		this.initializeMathDocumentListeners(document.getElementById("math-document")!);
	}
	initializeMathDocumentListeners(element: HTMLElement) {
		element.addEventListener("mousedown", (event) => this.handleMouseDown(event));
	}
	renderAndUpdate() {
		const [div, map] = this.renderWithMapping();
		const oldDiv = document.getElementById("math-document")!;
		oldDiv.replaceWith(div);
		this.renderingMap = map;

		document.getElementById("tabs-container")!.replaceWith(this.renderTabs());
		this.initializeMathDocumentListeners(div);
		return [div, map];
	}
	renderWithMapping(): [HTMLDivElement, Map<MathComponent | MathComponentGroup, HTMLElement>] {
		const [renderedDoc, map] = this.document.renderWithMapping(this);
		return [renderedDoc, map];
	}
	renderTabs() {
		const result = document.createElement("div");
		for(const tab of App.editorTabs) {
			const renderedTab = tab.document.renderTab(this);
			result.appendChild(renderedTab);
			renderedTab.addEventListener("click", () => {
				App.activeTab = tab;
				this.renderAndUpdate();
			});
			if(tab === App.activeTab) {
				renderedTab.id = "active-tab";
			}
		}
		result.id = "tabs-container";
		return result;
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
				const firstWord = containerElement.firstElementChild!;
				firstWord.insertAdjacentElement("afterbegin", cursor.render());
			}
			else {
				const predecessorElement = this.renderingMap.get(cursor.predecessor)!;
				if(predecessorElement.classList.contains("line-break")) {
					const nextLine = predecessorElement.parentElement!.parentElement!.nextElementSibling!;
					const firstWord = nextLine.firstElementChild!;
					firstWord.insertAdjacentElement("afterbegin", cursor.render());
				}
				else {
					predecessorElement.insertAdjacentElement("afterend", cursor.render());
				}
			}
		}
	}

	handleKeyDown(event: KeyboardEvent) {
		const didSpecialKeyHandlers = this.handleSpecialKeys(event);
		let didRelativeKeyHandlers = false;
		if(!didSpecialKeyHandlers) {
			didRelativeKeyHandlers = this.checkRelativeKeyHandlers(event);
			this.handleCharacterKeys(event);
		}
		App.activeTab.removeDuplicateCursors();
		if(didSpecialKeyHandlers || didRelativeKeyHandlers) {
			app.renderAndUpdate();
		}
	}
	handleCharacterKeys(event: KeyboardEvent) {
		for(const cursor of this.cursors) {
			if(event.key.length === 1 && !event.ctrlKey && !event.altKey) {
				const symbol = new MathSymbol(event.key);
				LiveRenderer.addComponentOrReplaceSelection(cursor, symbol, this);
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
				handler(event, stopPropagation, () => event.preventDefault());
				if(handled) {
					return true;
				}
			}
		}
		return false;
	}
	checkRelativeKeyHandlers(event: KeyboardEvent): boolean {
		let handled = false;
		for(const cursor of this.cursors) {
			const handlers = RelativeKeyHandler.getHandlers(cursor, this.document, event.key);
			if(handlers.length !== 0) {
				const [handler, component] = handlers[0];
				handled = true;
				handler.callback(cursor, component, this);
			}
		}
		return handled;
	}

	handleMouseUp() {
		App.isMousePressed = false;
	}
	handleMouseDown(event: MouseEvent) {
		App.lastMouseDownEvent = event;
		App.isMousePressed = true;

		App.activeTab.cursors = [Cursor.fromClick(this, event)];
		Cursor.resetCursorBlink();
		Autocomplete.close();
		this.renderAndUpdate();
	}
	handleMouseMove(event: MouseEvent) {
		if(App.isMousePressed) {
			App.activeTab.cursors = [Cursor.fromDrag(this, App.lastMouseDownEvent!, event)];
			Cursor.resetCursorBlink();
			this.updateCursors();
		}
	}

	closeTab() {
		if(App.editorTabs.length === 1) { return; }
		const index = App.editorTabs.indexOf(App.activeTab);
		if(index === -1) { throw new Error("Did not find the active tab in the list of tabs."); }
		App.editorTabs.splice(index, 1);
		App.activeTab = App.editorTabs[index] ?? App.editorTabs[index - 1];
	}
}

const app = new App();
export { app };
