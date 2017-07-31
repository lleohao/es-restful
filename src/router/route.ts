/**
 * Parse dynamic path
 */
function getRuleReg(path: string) {
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

export class Route {
    private rule: RegExp;
    private params: string[];

    constructor(path: string) {
        let { rule, params } = getRuleReg(path);

        this.rule = rule;
        this.params = params;
    }

    parse(pathname: string) {
        // 可以在这个地方报错
        this.rule.lastIndex = 0;
        let _params = this.rule.exec(pathname);
        let params = {};

        if (_params !== null) {
            this.params.forEach((key, index) => {
                params[key] = _params[index + 1]
            });

            return params;
        }

        return null;
    }
}

