export const rectContains = function(rect: { left: number, right: number, top: number, bottom: number}, x: number, y: number) {
	return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
};
export const invertMap = function<K, V>(map: Map<K, V>) {
	const result = new Map<V, K>();
	for(const [key, value] of map) {
		if(result.has(value)) {
			throw new Error("Cannot invert map: found two keys with the same value.");
		}
		result.set(value, key);
	}
	return result;
};
export const maxItem = function<T>(array: T[], callback: (t: T) => number) {
	if(array.length === 0) {
		throw new Error("Cannot get the highest item of an empty array.");
	}
	let maxValue = -Infinity;
	let maxItem = array[0];
	for(const item of array) {
		const value = callback(item);
		if(value > maxValue) {
			maxValue = value;
			maxItem = item;
		}
	}
	return maxItem;
};
export const minItem = function<T>(array: T[], callback: (t: T) => number) {
	if(array.length === 0) {
		throw new Error("Cannot get the lowest item of an empty array.");
	}
	return maxItem(array, (t) => -callback(t));
};
export const lastItem = function<T>(array: T[]) {
	return array[array.length - 1];
};
export const partitionArray = function<T>(array: T[], callback: (t1: T, t2: T) => boolean, alreadyGrouped: boolean = false) {
	array = [...array];
	const partition: T[][] = [];
	for(let i = 0; i < array.length; i ++) {
		const value = array[i];
		partition.push([value]);
		for(let j = i + 1; j < array.length; j ++) {
			const value2 = array[j];
			if(callback(value, value2)) {
				array.splice(j, 1);
				j --;
				partition[partition.length - 1].push(value2);
			}
			else if(alreadyGrouped) { break; }
		}
	}
	return partition;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = function<ArgType, ReturnType>(func: (arg: ArgType) => ReturnType): (arg: ArgType) => ReturnType {
	// Note: this currently only supports 1-argument functions.
	const cache = new Map<ArgType, ReturnType>();
	return function(arg: ArgType) {
		if(cache.has(arg)) {
			return cache.get(arg) as ReturnType;
		}
		cache.set(arg, func(arg));
		return cache.get(arg) as ReturnType;
	};
};
