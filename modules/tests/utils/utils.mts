import { assert } from "chai";
import { describe, it } from "mocha";
import { partitionArray } from "../../utils/utils.mjs";

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
