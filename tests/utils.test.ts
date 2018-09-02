import * as should from 'should';
import { isType } from '../lib/utils';

describe('utils.ts test', () => {
  const cases = [
    { v: 'string', type: 'string', e: true },
    { v: 1, type: 'string', e: false },
    { v: true, type: 'string', e: false },
    { v: [1, 2, 3], type: 'string', e: false },
    { v: { a: '1' }, type: 'string', e: false },

    { v: 'string', type: 'number', e: false },
    { v: 1, type: 'number', e: true },
    { v: true, type: 'number', e: false },
    { v: [1, 2, 3], type: 'number', e: false },
    { v: { a: '1' }, type: 'number', e: false },

    { v: 'string', type: 'boolean', e: false },
    { v: 1, type: 'boolean', e: false },
    { v: true, type: 'boolean', e: true },
    { v: [1, 2, 3], type: 'boolean', e: false },
    { v: { a: '1' }, type: 'boolean', e: false },

    { v: 'string', type: 'array', e: false },
    { v: 1, type: 'array', e: false },
    { v: true, type: 'array', e: false },
    { v: [1, 2, 3], type: 'array', e: true },
    { v: { a: '1' }, type: 'array', e: false },

    { v: 'string', type: 'object', e: false },
    { v: 1, type: 'object', e: false },
    { v: true, type: 'object', e: false },
    { v: [1, 2, 3], type: 'object', e: false },
    { v: { a: '1' }, type: 'object', e: true }
  ];

  cases.forEach(_case => {
    it(_case.v + ': ' + _case.type, () => {
      should(isType(_case.v, _case.type)).be.eql(_case.e);
    });
  });
});
