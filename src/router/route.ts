import { Resource } from '../resource';
import { createError, RestfulErrorType } from '../utils';

export interface CustomResource extends Resource {}

const RULE_RE = /([^<]*)<(?:([a-zA-Z_][a-zA-Z0-9_]*):)?([a-zA-Z_][a-zA-Z0-9_]*)>/g;

enum RuleResultIndex {
  staticPart = 1,
  argType,
  argName
}

function* _parseRule(rule: string, ctx: any) {
  let pos = 0;
  const end = rule.length;
  const usedNames = new Set();

  RULE_RE.lastIndex = 0;
  while (pos < end) {
    const result = RULE_RE.exec(rule);

    if (result === null) {
      break;
    }
    if (result[RuleResultIndex.staticPart]) {
      yield [null, result[RuleResultIndex.staticPart]];
    }

    const variable = result[3];
    const converter = result[2] || 'default';
    if (usedNames.has(variable)) {
      throw createError(
        {
          message: `Url variable name: "${variable}" used twice.`,
          type: RestfulErrorType.ROUTE
        },
        ctx.addRoute
      );
    }
    usedNames.add(variable);
    yield [converter, variable];
    pos = RULE_RE.lastIndex;
  }

  if (pos < end) {
    const remaining = rule.substr(pos);
    if (remaining.indexOf('>') !== -1 || remaining.indexOf('<') !== -1) {
      throw createError(
        {
          message: `Malformed url rule: ${rule} .`,
          type: RestfulErrorType.ROUTE
        },
        ctx.addRoute
      );
    }
    yield [null, remaining];
  }
}

function _getConverter(type: string, ctx: any): { regex: string; weight: number } {
  const converterTypes = ['str', 'int', 'float', 'path', 'default'];
  if (converterTypes.indexOf(type) === -1) {
    throw createError(
      {
        message: `Converter type: '${type}' is undefined.`,
        type: RestfulErrorType.ROUTE
      },
      ctx.addRoute
    );
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
  private ctx: any;
  private regex: RegExp;
  private variables: string[] = [];
  public weight: number = 0;

  constructor(private rule: string, public resource: CustomResource, ctx: any) {
    this.ctx = ctx;
    this.compile();
  }

  public compile() {
    const self = this;
    const regexParts: string[] = [];

    function _buildRegex(rule: string) {
      for (const [converter, variable] of _parseRule(rule, self.ctx)) {
        if (converter === null) {
          // staticPart part
          regexParts.push(variable);
          self.weight += variable.length;
        } else {
          // dynamic part
          const type = _getConverter(converter, self.ctx);
          self.variables.push(variable);
          regexParts.push(type.regex);
          self.weight += type.weight;
        }
      }
    }

    _buildRegex(this.rule);

    const regex = '^' + regexParts.join('') + '$';
    this.regex = new RegExp(regex, 'g');
  }

  public match(pathname: string) {
    const result = {};
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
