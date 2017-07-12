/**
 * 简单的路由参数处理
 */
export function getRuleReg(path: string) {
    let ruleRe = /([^<]*)<([a-zA-Z_][a-zA-Z0-9_]*)>/g;
    let params = [];
    let length = path.length;
    let index = 0;

    while (index < length) {
        // 获取参数名称
        let result: RegExpExecArray = ruleRe.exec(path);
        if (result !== null) {
            params.push(result[2]);
            index = ruleRe.lastIndex;
        } else {
            break;
        }
    }

    params.forEach((name) => {
        path = path.replace(`<${name}>`, '(\\w+)');
    });
    path = '^' + path + '$';

    return {
        rule: new RegExp(path, 'g'),
        params: params
    };
}


/**
 * 判断对象数组中是否存在指定值
 */
export function arrHas(arr: Object[], key: string, value: any) {
    return arr.some((item) => {
        return item[key] === value;
    });
}

export function throwError(message: string) {
    throw new Error(message);
}
