import { dset } from 'dset';

export type Options = {
  /**
   * Exclude empty string values from the result.
   * @default false
   */
  omitEmptyStrings?: boolean;
};

type ParsedValue = string | File | number | boolean;
type Result = {
  [key: string]: ParsedValue | ParsedValue[] | Result | Result[];
};

/**
 * Parses {@link FormData} or {@link URLSearchParams} into a nested object.
 * It uses {@link https://github.com/lukeed/dset dset} to set nested properties, so you can use dot notation to set nested values.
 *
 * @example
 * ```ts
 * const data = new FormData();
 * data.append('a', '0');
 * data.append('b.c[]', '1');
 * data.append('+b.c[]', '2');
 * data.append('&b.d', 'on');
 * data.append('e.0', '3');
 * data.append('e.1', '4');
 *
 * // => { a: '0', b: { c: ['1', 2], d: true }, e: ['3', '4'] }
 * ```
 *
 * @param data - The data to parse. It can be a {@link FormData}, a {@link URLSearchParams} or an iterable of key-value pairs.
 * @param options - Options for parsing the data:
 * - `omitEmptyStrings` - Exclude empty string values from the result.
 */
export const dform = (
  data: Iterable<[string, string | File]>,
  { omitEmptyStrings }: Options = {}
) => {
  const result: Result = {};
  const arrays = new Map<string, Array<ParsedValue>>();

  for (const [key, value] of data) {
    if (omitEmptyStrings && value === '') continue;

    let path = key;
    let parsedValue: ParsedValue = value;

    const isArray = path.endsWith('[]');
    if (isArray) {
      path = path.slice(0, -2);
    }

    if (path.startsWith('+')) {
      path = path.slice(1);
      parsedValue = Number(parsedValue);
    } else if (path.startsWith('&')) {
      path = path.slice(1);
      parsedValue = parsedValue === 'on' || parsedValue === 'true' || Boolean(Number(parsedValue));
    }

    if (isArray) {
      const array = arrays.get(path) || [];

      array.push(parsedValue);
      arrays.set(path, array);

      dset(result, path, array);
    } else {
      dset(result, path, parsedValue);
    }
  }

  return result;
};
