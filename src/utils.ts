export function throwError(message: string) {
    throw new Error(message);
}

export function isType(v: any, t: string) {
    let type: string = Object.prototype.toString.call(v);

    return type.match(/\[object (\w+)\]/)[1].toLowerCase() === t;
}
