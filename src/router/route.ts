import { Resource } from '../resource';
import { createError, RestfulErrorType } from '../utils';

export interface CustomResource extends Resource { }

const RULE_RE = /([^<]*)<(?:([a-zA-Z_][a-zA-Z0-9_]*):)?([a-zA-Z_][a-zA-Z0-9_]*)>/g;

enum RuleResultIndex {
    staticPart = 1,
    argType,
    argName
}

function* _parseRule(rule: string) {
    let pos = 0;
    let end = rule.length;
    let usedNames = new Set();

    RULE_RE.lastIndex = 0;
    while (pos < end) {
        let result = RULE_RE.exec(rule);

        if (result === null) {
            break;
        }
        if (result[RuleResultIndex.staticPart]) {
            yield [null, result[RuleResultIndex.staticPart]];
        }

        let variable = result[3];
        let converter = result[2] || 'default';
        if (usedNames.has(variable)) {
            throw createError({
                type: RestfulErrorType.ROUTE,
                message: `Variable name: ${variable} used twice.`
            }, Route);
        }
        usedNames.add(variable);
        yield [converter, variable];
        pos = RULE_RE.lastIndex;
    }

    if (pos < end) {
        const remaining = rule.substr(pos);
        if (remaining.indexOf('>') !== -1 || remaining.indexOf('<') !== -1) {
            throw createError({
                type: RestfulErrorType.ROUTE,
                message: `Malformed url rule: ${rule} .`
            }, Route);
        }
        yield [null, remaining];
    }
}

function _getConverter(type: string): { regex: string, weight: number } {
    const converterTypes = ['str', 'int', 'float', 'path', 'default'];
    if (converterTypes.indexOf(type) === -1) {

        throw createError({
            type: 'route',
            message: `Converter type: '${type}' is undefined.`
        }, Route);
    }

    let result = { regex: '', weight: 0 };
    switch (type) {
        case 'path':
            result = { regex: '(.*?)', weight: 200 };
            break;
        case 'int':
            result = { regex: '(\\d+)', weight: 50 };
            break;
        case 'float':
            result = { regex: '(\\d+\\.\\d+)', weight: 50 };
            break;
        case 'str':
        case 'default':
            result = { regex: '(\\w+)', weight: 100 };
            break;
    }

    return result;
}

export class Route {
    private variables: string[] = [];
    private regex: RegExp;
    weight: number = 0;


    constructor(private rule: string, public resource: CustomResource) {
        this.compile();
    }

    compile() {
        const self = this;
        const regexParts: string[] = [];

        function _buildRegex(rule: string) {
            for (let [converter, variable] of _parseRule(rule)) {
                if (converter === null) { // staticPart part
                    regexParts.push(variable);
                    self.weight += variable.length;
                } else {                  // dynamic part
                    let type = _getConverter(converter);
                    self.variables.push(variable);
                    regexParts.push(type.regex);
                    self.weight += type.weight;
                }
            }
        }

        _buildRegex(this.rule);

        let regex = '^' + regexParts.join('') + '$';
        this.regex = new RegExp(regex, 'g');
    }

    match(pathname: string) {
        let result = {};
        this.regex.lastIndex = 0;

        const res = this.regex.exec(pathname);

        if (res === null) {
            return null;
        }

        for (let i = 1, len = res.length - 1; i <= len; i++) {
            result[this.variables[i - 1]] = res[i];
        }

        return result;
    }
}

