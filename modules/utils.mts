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
	return maxItem(array, (t) => -callback(t));
};
export const lastItem = function<T>(array: T[]) {
	return array[array.length - 1];
};
