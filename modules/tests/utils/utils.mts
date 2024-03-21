import { assert, expect } from "chai";
import { describe, it } from "mocha";
import { memoize, partitionArray } from "../../utils/utils.mjs";

describe("partitionArray", () => {
	it("partitions the array into equivalence classes of the provided equivalence relation", () => {
		const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const partition = partitionArray(numbers, (a, b) => a % 2 === b % 2);
		assert.sameDeepOrderedMembers(partition, [
			[1, 3, 5, 7, 9],
			[2, 4, 6, 8, 10],
		]);
	});
});
describe("memoize", () => {
	it("returns a memoized version of the function", () => {
		let timesRun = 0;
		const increment = memoize((num: number) => {
			timesRun ++;
			return num + 1;
		});

		expect(increment(1)).to.equal(2);
		expect(increment(1)).to.equal(2);
		expect(increment(1)).to.equal(2);
		expect(timesRun).to.equal(1);

		expect(increment(2)).to.equal(3);
		expect(increment(2)).to.equal(3);
		expect(increment(2)).to.equal(3);
		expect(timesRun).to.equal(2);
	});
});
