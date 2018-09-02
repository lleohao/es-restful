import p from '../lib/params';
import { ReqParams, StatusCode } from '../src';

describe('ReqParse', () => {
  describe('API', () => {
    let parser: ReqParams;

    beforeEach(() => {
      parser = new ReqParams();
    });

    it('add test', () => {
      parser.add('name');
      parser.add('age', { type: 'number' });

      expect(parser.getParams()).toEqual({
        name: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        age: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null,
          type: 'number'
        }
      });
      expect(() => {
        parser.add('name');
      }).toThrow(/The parameter name: name already exists\./);
      expect(() => {
        parser.add('zh-name', { dset: 'name' });
      },).toThrow(/The parameter name: zh-name, dtet: name already exists./);
    });

    it('remove test', () => {
      parser.add('name');
      parser.add('age', { type: 'number' });
      parser.add('address');

      parser.remove('name');
      expect(parser.getParams()).toEqual({
        address: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        age: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null,
          type: 'number'
        }
      });

      parser.remove(['age', 'address', 'no']);
      expect(parser.getParams()).toEqual({});
    });

    it('inherit test', () => {
      const baseParser = new ReqParams();
      baseParser.add('username');
      baseParser.add('password');

      const childrenParser = new ReqParams();
      childrenParser.inherit(baseParser);
      childrenParser.add('operate');

      expect(childrenParser.getParams()).toEqual({
        username: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        password: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        operate: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        }
      });

      expect(() => {
        childrenParser.add('username');
      }).toThrow(/The parameter name: username already exists\./);

      childrenParser.remove('username');
      expect(childrenParser.getParams()).toEqual({
        password: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        operate: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        }
      });
      expect(baseParser.getParams()).toEqual({
        username: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        },
        password: {
          defaultVal: undefined,
          nullabled: true,
          required: false,
          type: 'any',
          choices: null,
          caseSensitive: false,
          trim: false,
          coveration: null,
          dset: null
        }
      });
    });
  });

  describe('Validation', () => {
    let parser: ReqParams;

    beforeEach(() => {
      parser = new ReqParams();
    });

    const cases = [
      { c: { name: '*', o: {} }, i: { a: 1, b: 2 }, e: { a: 1, b: 2 } },
      { c: { name: 'no-options', o: {} }, i: {}, e: {} },
      { c: { name: 'no-options', o: {} }, i: { a: 'b', c: 1 }, e: {} },
      { c: { name: 'no-options', o: {} }, i: { 'no-options': 'b' }, e: { 'no-options': 'b' } },
      { c: { name: 'defaultVal', o: { defaultVal: 'a' } }, i: {}, e: { defaultVal: 'a' } },
      { c: { name: 'defaultVal', o: { defaultVal: 'b' } }, i: { defaultVal: 'b' }, e: { defaultVal: 'b' } },
      {
        c: { name: 'required', o: { required: true } },
        i: {},
        err: { code: StatusCode.REQUIRED_ERROR, message: 'The "required" are required.' }
      },
      { c: { name: 'required', o: { required: true } }, i: { required: 'r' }, e: { required: 'r' } },
      {
        c: { name: 'type-number', o: { type: 'number' } },
        i: {},
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-number: undefined} type is not "number".' }
      },
      {
        c: { name: 'type-number', o: { type: 'number' } },
        i: { 'type-number': '1' },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-number: "1"} type is not "number".' }
      },
      { c: { name: 'type-number', o: { type: 'number' } }, i: { 'type-number': 1 }, e: { 'type-number': 1 } },
      {
        c: { name: 'type-string', o: { type: 'string' } },
        i: {},
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-string: undefined} type is not "string".' }
      },
      {
        c: { name: 'type-string', o: { type: 'string' } },
        i: { 'type-string': 1 },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-string: 1} type is not "string".' }
      },
      { c: { name: 'type-string', o: { type: 'string' } }, i: { 'type-string': '1' }, e: { 'type-string': '1' } },
      {
        c: { name: 'type-boolean', o: { type: 'boolean' } },
        i: {},
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-boolean: undefined} type is not "boolean".' }
      },
      {
        c: { name: 'type-boolean', o: { type: 'boolean' } },
        i: { 'type-boolean': 'false' },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-boolean: "false"} type is not "boolean".' }
      },
      {
        c: { name: 'type-boolean', o: { type: 'boolean' } },
        i: { 'type-boolean': '' },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-boolean: ""} type is not "boolean".' }
      },
      { c: { name: 'type-boolean', o: { type: 'boolean' } }, i: { 'type-boolean': true }, e: { 'type-boolean': true } },
      {
        c: { name: 'type-object', o: { type: 'object' } },
        i: {},
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-object: undefined} type is not "object".' }
      },
      {
        c: { name: 'type-object', o: { type: 'object' } },
        i: { 'type-object': 'false' },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-object: "false"} type is not "object".' }
      },
      {
        c: { name: 'type-object', o: { type: 'object' } },
        i: { 'type-object': [1, 2] },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-object: [1,2]} type is not "object".' }
      },
      {
        c: { name: 'type-object', o: { type: 'object' } },
        i: { 'type-object': { a: 'a' } },
        e: { 'type-object': { a: 'a' } }
      },
      {
        c: { name: 'type-array', o: { type: 'array' } },
        i: {},
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-array: undefined} type is not "array".' }
      },
      {
        c: { name: 'type-array', o: { type: 'array' } },
        i: { 'type-array': 'false' },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-array: "false"} type is not "array".' }
      },
      {
        c: { name: 'type-array', o: { type: 'array' } },
        i: { 'type-array': { a: '2' } },
        err: { code: StatusCode.TYPE_ERROR, message: 'The {type-array: [object Object]} type is not "array".' }
      },
      { c: { name: 'type-array', o: { type: 'array' } }, i: { 'type-array': [1, 2] }, e: { 'type-array': [1, 2] } },
      { c: { name: 'dset', o: { dset: 'dset2' } }, i: { dset: '1' }, e: { dset2: '1' } },
      { c: { name: 'trim', o: { trim: true } }, i: { trim: '      1        ' }, e: { trim: '1' } },
      { c: { name: 'trim', o: { trim: true } }, i: { trim: 1 }, e: { trim: 1 } },
      {
        c: { name: 'caseSensitive', o: { caseSensitive: true } },
        i: { caseSensitive: 'ABC' },
        e: { caseSensitive: 'abc' }
      },
      { c: { name: 'caseSensitive', o: { caseSensitive: true } }, i: { caseSensitive: 1 }, e: { caseSensitive: 1 } },
      {
        c: { name: 'choices', o: { choices: [1, 2, 3] } },
        i: { choices: '1' },
        err: { code: StatusCode.CHOICES_ERROR, message: 'The {choices: "1"} is not in [1,2,3].' }
      },
      {
        c: { name: 'choices', o: { choices: [1, 2, 3] } },
        i: { choices: 11 },
        err: { code: StatusCode.CHOICES_ERROR, message: 'The {choices: 11} is not in [1,2,3].' }
      },
      {
        c: {
          name: 'choices',
          o: {
            choices: function(input) {
              return [1, 2, 3].indexOf(input) !== -1;
            }
          }
        },
        i: { choices: '1' },
        err: { code: StatusCode.CHOICES_ERROR, message: 'The choices function check {choices: "1"} is false.' }
      },
      {
        c: {
          name: 'choices',
          o: {
            choices: function(input) {
              return [1, 2, 3].indexOf(input) !== -1;
            }
          }
        },
        i: { choices: 11 },
        err: { code: StatusCode.CHOICES_ERROR, message: 'The choices function check {choices: 11} is false.' }
      },
      { c: { name: 'choices', o: { choices: [1, 2, 3] } }, i: { choices: 1 }, e: { choices: 1 } },
      {
        c: {
          name: 'choices',
          o: {
            choices: function(input) {
              return [1, 2, 3].indexOf(input) !== -1;
            }
          }
        },
        i: { choices: 1 },
        e: { choices: 1 }
      },
      {
        c: {
          name: 'choices',
          o: {
            choices: function() {
              throw new Error('error');
            }
          }
        },
        i: { choices: 1 },
        err: {
          code: StatusCode.CHOICES_RUN_ERROR,
          message: 'Choises function processing {choices: 1} throws an error: error.'
        }
      },
      {
        c: {
          name: 'coveration',
          o: {
            coveration: function(input) {
              return input.join('-');
            }
          }
        },
        i: { coveration: '11' },
        err: {
          code: StatusCode.COVER_ERROR,
          message:
            'Corveration function processing {coveration: "11"} throws an error: input.join is not a function.'
        }
      },
      {
        c: {
          name: 'coveration',
          o: {
            coveration: function(input) {
              return input.join('-');
            }
          }
        },
        i: { coveration: [1, 2, 3] },
        e: { coveration: '1-2-3' }
      }
    ];

    cases.forEach(_case => {
      it(_case.c.name, () => {
        parser.add(_case.c.name, _case.c.o);

        if (_case['err']) {
          expect(() => {
            p.validation(parser.getParams(), _case.i);
          }, ).toThrow(_case['err'].message);
        } else {
          expect(p.validation(parser.getParams(), _case.i)).toEqual(_case['e']);
        }
      });
    });
  });
});
