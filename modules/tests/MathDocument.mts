import { describe, it } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";
import { Fraction } from "../math-components/Fraction.mjs";
import { Parenthese } from "../math-components/Parenthese.mjs";
import { SuperscriptSubscript } from "../math-components/SuperscriptSubscript.mjs";
import "../math-components/initializers/all-initializers.mjs";

describe("MathDocument.containingComponent", () => {
	it("returns the MathDocument if the component is top-level", () => {
		const component = new MathSymbol("A");
		const doc = new MathDocument([component]);
		assert.equal(doc.containingComponentOf(component), doc);
	});
	it("returns the container if the component is not top-level", () => {
		let container: EnterableComponentMock, component: MathSymbol;
		const doc = new MathDocument([
			container = new EnterableComponentMock(new MathComponentGroup([
				component = new MathSymbol("A"),
			])),
		]);
		assert.equal(doc.containingComponentOf(component), container);
	});
	it("returns the MathDocument if the group is the MathDocument's group", () => {
		const doc = new MathDocument([]);
		assert.equal(doc.containingComponentOf(doc.componentsGroup), doc);
	});
	it("returns the container if the group is not top-level", () => {
		let mock: EnterableComponentMock;
		const doc = new MathDocument([
			mock = new EnterableComponentMock(),
		]);
		assert.equal(doc.containingComponentOf(mock.componentsGroup), mock);
	});
});
describe("MathDocument.parse", () => {
	it("can parse a simple document", () => {
		const doc = new MathDocument([
			new MathSymbol("a"),
		]);
		const stringified = JSON.stringify(doc);
		const result = MathDocument.parse(stringified);
		assert.deepEqual(result, doc);
	});
	it("can parse a complicated document with lots of components", () => {
		const doc = new MathDocument([
			new Parenthese(
				new MathComponentGroup([
					new Fraction(
						new MathComponentGroup([new MathSymbol("a")]),
						new MathComponentGroup([new MathSymbol("b")]),
					),
				]),
				"round",
			),
			new SuperscriptSubscript(
				new MathComponentGroup([new MathSymbol("C")]),
				new MathComponentGroup([new MathSymbol("D")]),
			),
		]);
		const stringified = JSON.stringify(doc);
		const result = MathDocument.parse(stringified);
		for(const component of [...doc.descendants(), ...result.descendants()]) {
			component.relativeKeyHandlers = []; // prevents false positives since Mocha can't check if functions are equal
		}
		assert.deepEqual(result, doc);
	});
});
