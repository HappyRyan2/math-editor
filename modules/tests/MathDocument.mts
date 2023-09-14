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
});
