import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseFormData } from './index.ts';

describe('deepform', () => {
  describe('basic assignments', () => {
    it('top level assignments', () => {
      const data = new FormData();

      data.append('a', '1');
      data.append('b', '2');
      data.append('c', '3');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: '1',
        b: '2',
        c: '3',
      });
    });

    it('nested assignments', () => {
      const data = new FormData();

      data.append('a.b', '1');
      data.append('a.c', '2');
      data.append('a.d.0', '0');
      data.append('a.d.1', '1');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: {
          b: '1',
          c: '2',
          d: ['0', '1'],
        },
      });
    });

    it('array assignments', () => {
      const data = new FormData();

      data.append('a[]', '1');
      data.append('a[]', '2');
      data.append('a[]', '3');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: ['1', '2', '3'],
      });
    });

    it('nested array assignments', () => {
      const data = new FormData();

      data.append('a.b[]', '1');
      data.append('a.b[]', '2');
      data.append('a.b[]', '3');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: {
          b: ['1', '2', '3'],
        },
      });
    });

    it('nested array assignments with mixed keys', () => {
      const data = new FormData();

      data.append('a.b[]', '1');
      data.append('a.b[]', '2');
      data.append('a.c', '3');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: {
          b: ['1', '2'],
          c: '3',
        },
      });
    });
  });

  describe('type casting', () => {
    it('number', () => {
      const data = new FormData();

      data.append('+a', '1');
      data.append('+b', '2.2');
      data.append('+c', '3.33');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: 1,
        b: 2.2,
        c: 3.33,
      });
    });

    it('boolean', () => {
      const data = new FormData();

      data.append('&a', '1');
      data.append('&b', 'true');
      data.append('&c', 'on');
      data.append('&d', '0');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: true,
        b: true,
        c: true,
        d: false,
      });
    });
  });

  describe('casted assignments', () => {
    it('mixed assignments', () => {
      const data = new FormData();

      data.append('a', '1');
      data.append('+b', '2');
      data.append('&c', 'true');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: '1',
        b: 2,
        c: true,
      });
    });

    it('nested mixed assignments', () => {
      const data = new FormData();

      data.append('a.b', '1');
      data.append('+a.c', '2');
      data.append('&a.d', 'true');
      data.append('a.e.0', '0');
      data.append('&a.e.1', '1');
      data.append('+a.e.2', '2');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: {
          b: '1',
          c: 2,
          d: true,
          e: ['0', true, 2],
        },
      });
    });

    it('array mixed assignments', () => {
      const data = new FormData();

      data.append('a[]', '1');
      data.append('+a[]', '2');
      data.append('&a[]', 'true');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: ['1', 2, true],
      });
    });

    it('nested array mixed assignments', () => {
      const data = new FormData();

      data.append('a.b[]', '1');
      data.append('+a.b[]', '2');
      data.append('&a.b[]', 'true');
      data.append('a.c.0[]', 'foo');
      data.append('a.c.0[]', 'bar');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: {
          b: ['1', 2, true],
          c: [['foo', 'bar']],
        },
      });
    });

    it('nested array mixed assignments with mixed keys', () => {
      const data = new FormData();

      data.append('a', '0');
      data.append('b.c[]', '1');
      data.append('+b.c[]', '2');
      data.append('&b.d', 'on');
      data.append('e.0', '3');
      data.append('e.1', '4');

      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: '0',
        b: {
          c: ['1', 2],
          d: true,
        },
        e: ['3', '4'],
      });
    });
  });

  describe('options', () => {
    it('removeEmptyString', () => {
      const data = new FormData();

      data.append('a', '1');
      data.append('b', '');
      data.append('c', '3');

      const result = parseFormData(data, { omitEmptyStrings: true });

      assert.deepEqual(result, {
        a: '1',
        c: '3',
      });
    });
  });

  describe('URLSearchParams', () => {
    it('can parse URLSearchParams', () => {
      const data = new URLSearchParams('a=1&b=2&c=3');
      const result = parseFormData(data);

      assert.deepEqual(result, {
        a: '1',
        b: '2',
        c: '3',
      });
    });
  });
});
