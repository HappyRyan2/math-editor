import { assert } from "chai";
import { Cursor } from "../Cursor.mjs";
import { MathDocument } from "../MathDocument.mjs";
import { RelativeKeyHandler } from "../RelativeKeyHandler.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { CompositeMathComponentMock } from "./test-utils.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { Fraction } from "../math-components/Fraction.mjs";
import { describe, it } from "mocha";

describe("RelativeKeyHandler.getHandlers", () => {
	it("returns an empty array when there are no relative key handlers", () => {
		const doc = new MathDocument([]);
		const cursor = new Cursor(doc.componentsGroup, null);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.equal(handlers.length, 0);
	});
	it("handles the previous component if the previous component has a `after` handler", () => {
		const component = new MathSymbol("A");
		const handler = new RelativeKeyHandler("a", ["after"]);
		component.relativeKeyHandlers.push(handler);

		const doc = new MathDocument([component]);
		const cursor = new Cursor(doc.componentsGroup, component);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.sameDeepOrderedMembers(handlers[0], [handler, component]);
	});
	it("handles the next element if the next component has a `before` handler", () => {
		const component = new MathSymbol("A");
		const handler = new RelativeKeyHandler("a", ["before"]);
		component.relativeKeyHandlers.push(handler);

		const doc = new MathDocument([component]);
		const cursor = new Cursor(doc.componentsGroup, null);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.sameDeepOrderedMembers(handlers[0], [handler, component]);
	});
	it("handles any ancestors that have `inside` handlers on the correct group, in reverse order of depth", () => {
		let container2, container3;
		const container1 = new CompositeMathComponentMock([
			container2 = new Fraction(
				new MathComponentGroup([container3 = new CompositeMathComponentMock([])]),
				new MathComponentGroup([]),
			),
		]);
		let handler1, handler3;
		container1.relativeKeyHandlers = [handler1 = new RelativeKeyHandler("a", [["inside", 0]])];
		container2.relativeKeyHandlers = [new RelativeKeyHandler("a", [["inside", 1]])];
		container3.relativeKeyHandlers = [handler3 = new RelativeKeyHandler("a", [["inside", 0]])];

		const doc = new MathDocument([container1]);
		const cursor = new Cursor(container3.componentsGroup, null);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.sameDeepOrderedMembers(handlers, [[handler3, container3], [handler1, container1]]);
	});
	it("returns the `before` and `after` handlers before the `inside` handlers", () => {
		let component;
		const container = new CompositeMathComponentMock([
			component = new MathSymbol("A"),
		]);
		let insideHandler, afterHandler;
		container.relativeKeyHandlers.push(insideHandler = new RelativeKeyHandler("a", [["inside", 0]]));
		component.relativeKeyHandlers.push(afterHandler = new RelativeKeyHandler("a", ["after"]));

		const doc = new MathDocument([container]);
		const cursor = new Cursor(container.componentsGroup, component);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.sameDeepOrderedMembers(handlers, [[afterHandler, component], [insideHandler, container]]);
	});
	it("returns all applicable handlers if there are multiple handlers on the same object", () => {
		const component = new MathSymbol("A");
		let afterHandler1, afterHandler2;
		component.relativeKeyHandlers.push(afterHandler1 = new RelativeKeyHandler("a", ["after"]));
		component.relativeKeyHandlers.push(afterHandler2 = new RelativeKeyHandler("a", ["after"]));
		component.relativeKeyHandlers.push(new RelativeKeyHandler("a", ["before"]));

		const doc = new MathDocument([component]);
		const cursor = new Cursor(doc.componentsGroup, component);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc);
		assert.sameDeepOrderedMembers(handlers, [[afterHandler1, component], [afterHandler2, component]]);
	});
	it("returns only the handlers matching `key` if `key` is provided", () => {
		const component = new MathSymbol("A");
		let handler;
		component.relativeKeyHandlers.push(handler = new RelativeKeyHandler("a", ["after"]));
		component.relativeKeyHandlers.push(new RelativeKeyHandler("b", ["after"]));

		const doc = new MathDocument([component]);
		const cursor = new Cursor(doc.componentsGroup, component);
		const handlers = RelativeKeyHandler.getHandlers(cursor, doc, "a");
		assert.sameDeepOrderedMembers(handlers, [[handler, component]]);
	});
});
