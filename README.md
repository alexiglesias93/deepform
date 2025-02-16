# dform

`dform` is a tiny wrapper around [dset](https://github.com/lukeed/dset) to parse `FormData` or `URLSearchParams` into a deeply nested object.

## Features

- Tiny (`339B` minified and gzipped)
- Parses `FormData` or `URLSearchParams` into deeply nested objects.
- Type casting for numbers and booleans.
- Supports arrays of values.

## Installation

Install from [npm](https://www.npmjs.com/package/dform):

```sh
npm install dform
```

## Usage

```ts
import { dform } from 'dform';

const data = new FormData();

data.append('a', '0');
data.append('b.c[]', '1');
data.append('+b.c[]', '2');
data.append('&b.d', 'on');
data.append('e.0', '3');
data.append('e.1', '4');

const result = dform(data);
// {
//   a: '0',
//   b: {
//     c: ['1', 2],
//     d: true,
//   },
//   e: ['3', '4'],
// };
```

## Type casting

`dform` will attempt to cast values based on the prefix of the key:

- `+` prefix will cast the value to a number.
- `&` prefix will cast the value to a boolean. The following values will be cast to `true`:
  - `'on'`
  - `'true'`
  - `'1'` (or any other non-zero number)

```ts
import { dform } from 'dform';

const data = new FormData();

data.append('+number', '42');
data.append('checkbox', 'on');

const result = dform(data);
// {
//   number: 42,
//   checkbox: true,
// };
```

This is useful when parsing numeric inputs or checkboxes:

```jsx
import { dform } from 'dform';

const MyForm = () => {
  const handleSubmit = (e) => {
    const formData = new FormData(e.target);
    const parsedData = dform(formData);
    // {
    //   text: 'Hello, World!',
    //   number: 42,
    //   checkbox: true,
    // }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Text:
        <input type="text" name="text" />
      </label>

      <label>
        Number:
        <input type="number" name="+number" />
      </label>

      <label>
        Checkbox:
        <input type="checkbox" name="&checkbox" />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
```

## Array values

`dform` supports arrays of values by using the `[]` suffix in the key:

```ts
import { dform } from 'dform';

const data = new FormData();

data.append('a[]', '1');
data.append('a[]', '2');
data.append('a[]', '3');

const result = dform(data);
// {
//   a: ['1', '2', '3'],
// };
```

This is useful when parsing multiple values from a single input or multiple inputs with the same name:

```jsx
import { dform } from 'dform';

const MyForm = () => {
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

  const handleSubmit = (e) => {
    const formData = new FormData(e.target);
    const parsedData = dform(formData);
    // {
    //   fruits: ['Apple', 'Cherry', 'Date'],
    // }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>What fruits do you like?</label>

      {fruits.map((fruit, index) => (
        <label key={index}>
          <input type="checkbox" name="fruits[]" value={fruit} />
          {fruit}
        </label>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
};
```

## Options

### omitEmptyStrings

- Type: `boolean`
- Default: `false`

When `true`, `dform` will omit empty string values from the result object.

```ts
import { dform } from 'dform';

const data = new FormData();

data.append('a', '');
data.append('b', 'foo');

const result = dform(data);
// {
//   a: '',
//   b: 'foo',
// };

const result2 = dform(data, { omitEmptyStrings: true });
// {
//   b: 'foo',
// };
```

## Related

- [dset](https://github.com/lukeed/dset) - safely write into deep properties
- [dlv](https://github.com/developit/dlv) - safely read from deep properties
- [parse-nested-form-data](https://github.com/milamer/parse-nested-form-data) - the original inspiration for this package

## License

See [LICENSE](https://github.com/alexiglesias93/dform/blob/main/LICENSE).
