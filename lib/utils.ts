/**
 * 全局变量
 */
export enum errorCode {
    REQUEST_ERROR = 1,
    REQUIRED_ERROR = 2,
    CONVER_ERROR = 3,
    CHOICES_ERROR = 4,
    NULL_ERROR = 5
};

export const errorMessages = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
};


/**
 * 简单的路由参数处理
 */
export function getRuleRegx(path: string) {
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
