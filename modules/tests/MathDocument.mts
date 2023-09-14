import { describe, it } from "mocha";
import { assert } from "chai";
import { MathDocument } from "../MathDocument.mjs";
import { MathSymbol } from "../math-components/MathSymbol.mjs";
import { EnterableComponentMock } from "./EnterableComponentMock.mjs";
import { MathComponentGroup } from "../MathComponentGroup.mjs";

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
