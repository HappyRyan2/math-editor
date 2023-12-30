import { MathComponent } from "./MathComponent.mjs";
import { MathComponentGroup } from "./MathComponentGroup.mjs";
import { CompositeMathComponent } from "./CompositeMathComponent.mjs";
import { Selection } from "./Selection.mjs";
import { MathDocument } from "./MathDocument.mjs";
import { App } from "./App.mjs";
import { invertMap, lastItem, maxItem, minItem, rectContains } from "./utils/utils.mjs";
import { LineBreak } from "./math-components/LineBreak.mjs";
import { Autocomplete } from "./Autocomplete.mjs";
import { MathSymbol } from "./math-components/MathSymbol.mjs";

export class Cursor {
	container: MathComponentGroup;
	predecessor: MathComponent | null;
	selection: Selection | null;

	constructor(container: MathComponentGroup, predecessor: MathComponent | null, selection?: Selection) {
		this.container = container;
		this.predecessor = predecessor;
		this.selection = selection ?? null;
	}
	static createAdjacent(component: MathComponent, whichSide: "left" | "right", container: MathComponentGroup) {
		const cursor = new Cursor(container, null);
		if(whichSide === "left") {
			cursor.moveBefore(component, container);
		}
		else {
			cursor.moveAfter(component, container);
		}
		return cursor;
	}
	moveTo(cursor: Cursor) {
		this.container = cursor.container;
		this.predecessor = cursor.predecessor;
		this.selection = null;
	}
	moveToStart(container: MathComponentGroup) {
		this.container = container;
		this.predecessor = null;
	}
	moveToEnd(container: MathComponentGroup) {
		this.container = container;
		this.predecessor = container.components[container.components.length - 1];
	}

	addComponent(component: MathComponent) {
		this.container.components.splice(this.position(), 0, component);
		this.predecessor = component;
	}
	replaceSelectionWith(...components: MathComponent[]) {
		if(!this.selection) {
			throw new Error("Cannot call replaceSelectionWith on a cursor with an empty selection.");
		}
		const previousComponent = this.container.components[this.container.components.indexOf(this.selection.start) - 1] ?? null;
		this.container.components.splice(
			this.container.components.indexOf(this.selection.start),
			this.numSelected(),
			...components,
		);
		this.predecessor = components[components.length - 1] ?? previousComponent;
		this.selection = null;
	}
	position() {
		return (this.predecessor == null) ? 0 : (this.container.components.indexOf(this.predecessor) + 1);
	}
	nextComponent(): MathComponent | null {
		return this.container.components[this.position()] ?? null;
	}
	moveBefore(component: MathComponent, container: MathComponentGroup) {
		const index = container.components.indexOf(component);
		this.predecessor = container.components[index - 1] ?? null;
		this.container = container;
	}
	moveAfter(component: MathComponent, container: MathComponentGroup) {
		this.predecessor = component;
		this.container = container;
	}

	static isWordBoundary(component: MathComponent | null) {
		return (
			(component == null)
			|| (component instanceof MathSymbol && (component.symbol === " " || MathSymbol.OPERATORS.includes(component.symbol)))
			|| (component instanceof LineBreak)
		);
	}
	static movePastWord(move: () => void, getNextComponent: () => MathComponent | null) {
		while(true) {
			const nextComponent = getNextComponent();
			move();
			if(nextComponent == null || !Cursor.isWordBoundary(nextComponent)) { break; }
		}
		while(true) {
			const nextComponent = getNextComponent();
			if(Cursor.isWordBoundary(nextComponent)) { break; }
			move();
		}
	}
	moveWordRight(doc: MathDocument) {
		Cursor.movePastWord(
			() => this.moveRight(doc, true),
			() => this.nextComponent(),
		);
	}
	moveWordLeft(doc: MathDocument) {
		Cursor.movePastWord(
			() => this.moveLeft(doc, true),
			() => this.predecessor,
		);
	}
	selectWordRight(doc: MathDocument) {
		Cursor.movePastWord(
			() => this.selectRight(doc),
			() => this.nextComponent(),
		);
	}
	selectWordLeft(doc: MathDocument) {
		Cursor.movePastWord(
			() => this.selectLeft(doc),
			() => this.predecessor,
		);
	}
	deleteWord(doc: MathDocument) {
		Cursor.movePastWord(
			() => this.deletePrevious(doc, true),
			() => this.predecessor,
		);
	}

	render() {
		const span = document.createElement("span");
		span.innerHTML = "&ZeroWidthSpace;";
		span.classList.add("cursor");
		if(Cursor.cursorsBlinkOn) {
			span.classList.add("blink-on");
		}
		if(Autocomplete.autocomplete?.cursor === this) {
			span.appendChild(Autocomplete.autocomplete.render());
		}
		return span;
	}

	selectionPosition() {
		if(this.selection == null) { return null; }
		if(this.nextComponent() === this.selection.start) { return "start"; }
		return "end";
	}
	numSelected() {
		if(this.selection == null) { return 0; }
		const startIndex = this.container.components.indexOf(this.selection.start);
		const endIndex = this.container.components.indexOf(this.selection.end);
		return (endIndex - startIndex + 1);
	}
	selectedComponents() {
		if(this.selection == null) { return []; }
		const startIndex = this.container.components.indexOf(this.selection.start);
		const endIndex = this.container.components.indexOf(this.selection.end);
		return this.container.components.slice(startIndex, endIndex + 1);
	}

	moveRight(doc: MathDocument, skipCompositeComponents: boolean = false) {
		if(this.selection != null) {
			this.moveAfter(this.selection.end, this.container);
			this.selection = null;
			return;
		}
		const nextComponent = this.nextComponent();
		if(nextComponent && nextComponent instanceof CompositeMathComponent && !skipCompositeComponents) {
			nextComponent.enterFromLeft(this);
		}
		else if(nextComponent) {
			this.predecessor = nextComponent;
		}
		else {
			const containingComponent = doc.containingComponentOf(this.container);
			if(containingComponent instanceof CompositeMathComponent) {
				this.predecessor = containingComponent;
				this.container = doc.containingGroupOf(containingComponent);
			}
		}
	}
	moveLeft(doc: MathDocument, skipCompositeComponents: boolean = false) {
		if(this.selection != null) {
			this.moveBefore(this.selection.start, this.container);
			this.selection = null;
			return;
		}
		if(this.predecessor && this.predecessor instanceof CompositeMathComponent && !skipCompositeComponents) {
			this.predecessor.enterFromRight(this);
		}
		else if(this.predecessor) {
			this.predecessor = this.container.components[this.position() - 2] ?? null;
		}
		else {
			const containingComponent = doc.containingComponentOf(this.container);
			if(containingComponent instanceof CompositeMathComponent) {
				const containingGroup = doc.containingGroupOf(containingComponent);
				const index = containingGroup.components.indexOf(containingComponent);
				this.predecessor = containingGroup.components[index - 1] ?? null;
				this.container = containingGroup;
			}
		}
	}
	selectRight(doc: MathDocument) {
		const nextComponent = this.nextComponent();
		if(!nextComponent) {
			const containingObject = doc.containingComponentOf(this.container);
			if(containingObject instanceof CompositeMathComponent) {
				this.moveAfter(containingObject, doc.containingGroupOf(containingObject));
				this.selection = new Selection(containingObject, containingObject);
			}
		}
		else if(this.selectionPosition() === "start") {
			if(this.selection!.start === this.selection!.end) {
				this.selection = null;
			}
			else {
				this.selection!.start = this.container.components[this.position() + 1];
			}
			this.moveAfter(nextComponent, this.container);
		}
		else if(this.selectionPosition() === "end") {
			this.selection!.end = nextComponent;
			this.moveAfter(nextComponent, this.container);
		}
		else {
			this.selection = new Selection(nextComponent, nextComponent);
			this.moveAfter(nextComponent, this.container);
		}
	}
	selectLeft(doc: MathDocument) {
		if(!this.predecessor) {
			const containingObject = doc.containingComponentOf(this.container);
			if(containingObject instanceof CompositeMathComponent) {
				this.moveBefore(containingObject, doc.containingGroupOf(containingObject));
				this.selection = new Selection(containingObject, containingObject);
			}
		}
		else if(this.selectionPosition() === "start") {
			this.selection!.start = this.predecessor;
			this.moveBefore(this.predecessor, this.container);
		}
		else if(this.selectionPosition() === "end") {
			if(this.selection!.start === this.selection!.end) {
				this.selection = null;
			}
			else {
				this.selection!.end = this.container.components[this.container.components.indexOf(this.predecessor) - 1];
			}
			this.moveBefore(this.predecessor, this.container);
		}
		else {
			this.selection = new Selection(this.predecessor, this.predecessor);
			this.moveBefore(this.predecessor, this.container);
		}
	}

	static cursorsBlinkOn: boolean = true;
	static BLINKS_PER_SECOND = 2;
	static updateCursors() {
		for(const cursor of document.getElementsByClassName("cursor")) {
			if(Cursor.cursorsBlinkOn) {
				cursor.classList.add("blink-on");
			}
			else {
				cursor.classList.remove("blink-on");
			}
		}
	}
	static toggleBlinking() {
		Cursor.cursorsBlinkOn = !Cursor.cursorsBlinkOn;
		Cursor.updateCursors();
	}
	static initialize() {
		Cursor.intervalID = window.setInterval(() => {
			Cursor.toggleBlinking();
		}, 1000 / Cursor.BLINKS_PER_SECOND);
	}
	static intervalID: number;
	static resetCursorBlink() {
		Cursor.cursorsBlinkOn = true;
		Cursor.updateCursors();
		window.clearInterval(Cursor.intervalID);
		Cursor.initialize();
	}

	selectionContains(component: MathComponent) {
		if(!this.container.components.includes(component)) {
			return false;
		}
		if(this.selection == null) {
			return false;
		}
		const startIndex = this.container.components.indexOf(this.selection.start);
		const endIndex = this.container.components.indexOf(this.selection.end);
		const index = this.container.components.indexOf(component);
		return (startIndex <= index && index <= endIndex);
	}

	deleteContainer(doc: MathDocument) {
		const containingComponent = doc.containingComponentOf(this.container) as CompositeMathComponent;
		const containingGroup = doc.containingGroupOf(containingComponent);
		const groupIndex = containingComponent.groups().indexOf(this.container);
		const previousComponent = (
				lastItem(containingComponent.groups().find((group, index) =>
					group.components.length !== 0 &&
					index < groupIndex &&
					containingComponent.groups().every((g, i) => i <= index || i >= groupIndex || g.components.length === 0),
				)?.components ?? [])
				?? containingGroup.components[containingGroup.components.indexOf(containingComponent) - 1]
				?? null
			) as MathComponent | null;
		const replacingComponents = [...containingComponent];
		containingGroup.components.splice(containingGroup.components.indexOf(containingComponent), 1, ...replacingComponents);
		if(previousComponent == null) {
			this.moveToStart(containingGroup);
		}
		else {
			this.moveAfter(previousComponent, containingGroup);
		}
	}
	deletePrevious(doc: MathDocument, forceDeletion: boolean = false) {
		if(this.selection != null) {
			this.replaceSelectionWith(...[]);
		}
		else if(this.predecessor != null) {
			let shouldDelete = true;
			if(!forceDeletion) {
				const preventDeletion = () => shouldDelete = false;
				this.predecessor.onDeletion(preventDeletion, doc, this);
			}
			if(shouldDelete && this.predecessor instanceof CompositeMathComponent && !this.predecessor.isEmpty() && !forceDeletion) {
				this.predecessor.enterFromRight(this);
			}
			else if(shouldDelete) {
				const newPredecessor = this.container.components[this.position() - 2];
				this.container.components.splice(this.container.components.indexOf(this.predecessor), 1);
				this.predecessor = newPredecessor;
			}
		}
		else if(
			this.container != doc.componentsGroup && (this.container.components.length === 0 ||
			(doc.containingComponentOf(this.container) as CompositeMathComponent).deleteAtStart !== "only-when-empty")
		) {
			this.deleteContainer(doc);
		}
		else if(this.container != doc.componentsGroup) {
			this.moveLeft(doc);
		}
	}

	static fromClick(app: App, event: MouseEvent) {
		const rendered = document.getElementById("math-document")!;
		const mapping = app.renderingMap;
		const inverseMap = invertMap(mapping);
		const groupElements = rendered.querySelectorAll(".line, .math-component-group");
		const elementsClicked = [...groupElements].filter(e => rectContains(e.getBoundingClientRect(), event.clientX, event.clientY)) as HTMLElement[];
		if(elementsClicked.length === 0) {
			const lines = [...rendered.getElementsByClassName("line")];
			const closestLine = minItem(lines, (line) => {
				const box = line.getBoundingClientRect();
				return Math.abs((box.top + box.bottom) / 2 - event.clientY);
			});
			elementsClicked.push(closestLine as HTMLElement);
		}
		const deepestComponent = maxItem(elementsClicked, (element: HTMLElement) => {
			if(element.classList.contains("line")) { return -1; }
			return app.document.depth(app.document.containingComponentOf(inverseMap.get(element) as MathComponentGroup) as MathComponent);
		});
		if(!deepestComponent.querySelector(":not(.cursor, .word)")) {
			if(deepestComponent.classList.contains("math-component-group")) {
				return new Cursor(inverseMap.get(deepestComponent) as MathComponentGroup, null);
			}
			else {
				return new Cursor(
					app.document.componentsGroup,
					app.document.componentsGroup.components[app.document.componentsGroup.components.length - 1],
				);
			}
		}
		return Cursor.fromClosest([...deepestComponent.children].map(c => [...c.children]).flat(1) as HTMLElement[], event.clientX, app);
	}
	static fromDrag(app: App, dragStart: MouseEvent, dragEnd: MouseEvent) {
		const cursor1 = Cursor.fromClick(app, dragEnd);
		const cursor2 = Cursor.fromClick(app, dragStart);
		return Cursor.selectBetween(cursor1, cursor2, app.document);
	}
	static lastCommonAncestor(cursor1: Cursor, cursor2: Cursor, container: MathComponentGroup): [MathComponentGroup, Cursor | CompositeMathComponent, Cursor | CompositeMathComponent] {
		const index1 = container.components.findIndex(c => c instanceof CompositeMathComponent && [...c.groupDescendants()].includes(cursor1.container));
		const index2 = container.components.findIndex(c => c instanceof CompositeMathComponent && [...c.groupDescendants()].includes(cursor2.container));
		const groups = (container.components[index1] as CompositeMathComponent | undefined)?.groups() ?? [];
		const groupIndex1 = groups.findIndex(g => [g, ...g.groupDescendants()].includes(cursor1.container));
		const groupIndex2 = groups.findIndex(g => [g, ...g.groupDescendants()].includes(cursor2.container));
		if(index1 === -1 || index2 === -1 || index1 !== index2 || groupIndex1 !== groupIndex2) {
			return [
				container,
				(container.components[index1] as CompositeMathComponent | undefined) ?? cursor1,
				(container.components[index2] as CompositeMathComponent | undefined) ?? cursor2,
			];
		}
		return Cursor.lastCommonAncestor(cursor1, cursor2, groups[groupIndex1]);
	}
	static selectBetween(cursor1: Cursor, cursor2: Cursor, doc: MathDocument): Cursor {
		if(cursor1.predecessor === cursor2.predecessor && cursor1.container === cursor2.container) {
			return new Cursor(cursor1.container, cursor1.predecessor);
		}
		const [ancestor, child1, child2] = Cursor.lastCommonAncestor(cursor1, cursor2, doc.componentsGroup);
		const componentsAndCursors = ancestor.componentsAndCursors([cursor1, cursor2]);
		const index1 = componentsAndCursors.indexOf(child1);
		const index2 = componentsAndCursors.indexOf(child2);
		const selection = (index1 < index2) ? new Selection(
			child1 instanceof CompositeMathComponent ? child1 : cursor1.nextComponent()!,
			child2 instanceof CompositeMathComponent ? child2 : cursor2.predecessor!,
		) : new Selection(
			child2 instanceof CompositeMathComponent ? child2 : cursor2.nextComponent()!,
			child1 instanceof CompositeMathComponent ? child1 : cursor1.predecessor!,
		);
		const result = new Cursor(ancestor, null, selection);
		if(child1 instanceof Cursor) {
			result.predecessor = cursor1.predecessor;
		}
		else if(index1 < index2) {
			result.moveBefore(child1, doc.containingGroupOf(child1));
		}
		else {
			result.moveAfter(child1, doc.containingGroupOf(child1));
		}
		return result;
	}
	static fromClosest(elements: HTMLElement[], xCoord: number, app: App) {
		const inverseMap = invertMap(app.renderingMap);
		const [closestElement, whichSide] = minItem(
			elements
				.filter(e => inverseMap.get(e as HTMLElement))
				.map(e => [[e, "left"], [e, "right"]] as [HTMLElement, "left" | "right"][]).flat(1)
				.filter(([e, whichSide]) => !(e.classList.contains("line-break") && whichSide === "right")),
			([element, whichSide]: [HTMLElement, "left" | "right"]) => Math.abs(element.getBoundingClientRect()[whichSide] - xCoord),
		);
		const closestComponent = inverseMap.get(closestElement) as MathComponent;
		return Cursor.createAdjacent(closestComponent, whichSide, app.document.containingGroupOf(closestComponent));
	}
	renderedPosition(app: App) {
		if(this.predecessor instanceof LineBreak || (!this.predecessor && this.container === app.document.componentsGroup)) {
			return 0;
		}
		else if(this.predecessor) {
			return app.renderingMap.get(this.predecessor)!.getBoundingClientRect().right;
		}
		return app.renderingMap.get(this.container)!.getBoundingClientRect().left;
	}
	moveToClosest(components: MathComponent[], app: App, group?: MathComponentGroup) {
		if(components.length === 0) {
			if(group) {
				this.moveToStart(group);
				return;
			}
			else {
				throw new Error("Cannot move cursor to closest component: components list was empty and no containing group was provided.");
			}
		}
		this.moveTo(Cursor.fromClosest(
			components.map(c => app.renderingMap.get(c)!),
			this.renderedPosition(app),
			app,
		));
	}
}
