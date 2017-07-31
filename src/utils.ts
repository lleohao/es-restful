/**
 * Verify that a value exists in the array
 * if value in array will return true
 * 
 * @export
 * @param arr       target objecy array
 * @param key       value key
 * @param value     value
 * @returns {boolean}
 */
export function arrHas(arr: Object[], key: string, value: any): boolean {
    return arr.some((item) => {
        return item.hasOwnProperty(key) && item[key] === value;
    });
}

export function throwError(message: string) {
    throw new Error(message);
}
