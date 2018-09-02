import { contentTypeParser } from '../../lib/helper';

describe('contentTypeParser', () => {
  const cases = [
    {
      c: 'text/plain',
      e: {
        type: 'text',
        subType: 'plain',
        params: null
      }
    },
    {
      c: 'text/html',
      e: {
        type: 'text',
        subType: 'html',
        params: null
      }
    },
    {
      c: 'text/xml',
      e: {
        type: 'text',
        subType: 'xml',
        params: null
      }
    },
    {
      c: 'text/html;charset=gbk',
      e: {
        type: 'text',
        subType: 'html',
        params: 'charset=gbk'
      }
    },
    {
      c: 'text/html;  charset=gbk',
      e: {
        type: 'text',
        subType: 'html',
        params: 'charset=gbk'
      }
    },
    {
      c: 'text/html;  charset=gbk; key=value',
      e: {
        type: 'text',
        subType: 'html',
        params: 'charset=gbk;key=value'
      }
    },
    {
      c: 'multipart/form-data',
      e: {
        type: 'multipart',
        subType: 'form-data',
        params: null
      }
    },
    {
      c: 'multipart/form-data; charset=gbk',
      e: {
        type: 'multipart',
        subType: 'form-data',
        params: 'charset=gbk'
      }
    },
    {
      c: 'application/x-www-form-urlencoded',
      e: {
        type: 'application',
        subType: 'x-www-form-urlencoded',
        params: null
      }
    },
    {
      c: 'application/x-www-form-urlencoded;charset=gbk',
      e: {
        type: 'application',
        subType: 'x-www-form-urlencoded',
        params: 'charset=gbk'
      }
    },
    {
      c: 'application/x-www-form-urlencoded; charset=gbk',
      e: {
        type: 'application',
        subType: 'x-www-form-urlencoded',
        params: 'charset=gbk'
      }
    },
    {
      c: 'application/json',
      e: {
        type: 'application',
        subType: 'json',
        params: null
      }
    },
    {
      c: '!231*&*^&^&*^&*/*&^^%$#@!)(; dajklsdjklajdljoiwueadakhdsjkaiguduigasg',
      e: {
        type: '!231*&*^&^&*^&*',
        subType: '*&^^%$#@!)(',
        params: 'dajklsdjklajdljoiwueadakhdsjkaiguduigasg'
      }
    }
  ];

  cases.forEach(_case => {
    it(_case.c, () => {
      expect(contentTypeParser(_case.c)).toEqual(_case.e);
    });
  });
});
