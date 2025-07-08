[![npm](https://img.shields.io/npm/v/flaget?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/ansis "download npm package")
[![node](https://img.shields.io/node/v/flaget)](https://nodejs.org)
[![Test](https://github.com/webdiscus/flaget/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/flaget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/flaget/graph/badge.svg?token=ETZKAUG7D3)](https://codecov.io/gh/webdiscus/flaget)
[![install size](https://packagephobia.com/badge?p=flaget)](https://packagephobia.com/result?p=flaget)

<h1 align="center">
  <img width="400" src="docs/logo.png" alt="Flaget">
</h1>

A lightweight CLI flag/argument parser for Node.js.\
Supports all standard CLI flag formats and named positional arguments.

## Features

- Short `-f` and long `--flag` flags
- Grouped short boolean flags `-xyz`
- Values via `--key=value` or `--key value`
- Multi-value flags via `array` option
- Boolean-only flags via `boolean` option
- Named and variadic (`...rest`) positional arguments via `args` option
- Short-to-long mapping via `alias` option
- Auto-casts numbers and booleans from values
- Default values via `default` option
- Dashed keys also available as camelCase
- Captures arguments before and after `--` terminator

## Install

```bash
npm i flaget
```

## Usage

Example command-line with flags and positional arguments:
```bash
$ cli.js report daily -xz --foo-bar baz --keys foo bar --start=5 -l 20 -- one --two
```

### Basic

```js
const flaget = require('flaget');
// or, in ESM:
// import flaget from 'flaget';

const cliParams = flaget();
console.log(cliParams);
```

### With options

```js
const cliParams = flaget({
  // raw: process.argv.slice(2), // raw argument values (parses by default)
  args: ['command', 'period'], // named positional arguments
  alias: { l: 'limit' }, // -l = --limit
  array: ['keys'], // collect multiple values for --keys
  default: { limit: 10, verbose: false } // default values if not set in CLI
});

console.log(cliParams);
```

Result:

```json5
{
  args: { command: 'report', period: 'daily', }, // named positional arguments
  flags: {
    x: true,
    z: true,
    'foo-bar': 'baz',
    fooBar: 'baz',
    keys: ['foo', 'bar'], // collected multiple values
    start: 5,
    limit: 20, // long alias to short 'l'
    verbose: false,
  },
  _: ['report', 'daily'], // positional arguments before "--"
  _tail: ['one', '--two'] // everything after "--"
}
```

---

## Flag parsing

Flags can behave as booleans, accept a single value, or collect multiple values.
Their behavior depends on syntax, position, and parser options like `boolean` and `array`.

| Input              | Output                           | Condition                                                   |
|--------------------|----------------------------------|-------------------------------------------------------------|
| `--flag` or `-f`   | `{ flag: true }`                 | Next token is absent or starts with `-`                     |
| `--flag=value`     | `{ flag: 'value' }`              | Always treated as key=value                                 |
| `--flag value`     | `{ flag: 'value' }`              | Next token is a value and `flag` is not in `boolean` option |
| `--flag arg`       | `{ flag: true }, _: ['arg']`     | `flag` is in `boolean` option                            |
| `-xyz`             | `{ x: true, y: true, z: true }`  | Grouped short flags, always booleans                        |
| `--flag val1 val2` | `{ flag: ['val1', 'val2'] }`     | `flag` is in `array` option                              |


## Options

The function accepts an optional configuration object to customize the parsing behavior. These options control how flags, positional arguments, aliases, arrays, and defaults are handled.

| Option     | Type       | Default                 | Description                                                                                                                                                                                                            |
|------------|------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `raw`      | string[]   | `process.argv.slice(2)` | The input raw CLI argument array to parse.<br>Defaults passed as `process.argv.slice(2)`.                                                                                                                              |
| `args`     | string[]   | `[]`                    | List of named positional arguments. Values are assigned in order. Supports a variadic last argument with the `...name` syntax to collect all remaining positional arguments into a single key, before terminator `--`. |
| `alias`    | Object     | `{}`                    | Mapping of short flag keys to long keys. For example, `{ f: 'files' }` will map `-f` to `--files`.                                                                                                                     |
| `array`    | string[]   | `[]`                    | List of flag keys that should collect multiple values into arrays. Values are collected until the next flag, terminator `--` or the end of input.                                                                      |
| `boolean`  | string[]   | `[]`                    | List of flag keys that should always be parsed as booleans. These flags never consume a value, even if the next argument looks like one.                                                                               |
| `default`  | Object     | `{}`                    | Map of default values for flags that are not provided on the CLI.                                                                                                                                                      |


## Return

The function returns an object containing the parsed command-line arguments, separated into flags,
positional arguments, and any arguments following a `--` terminator.
Named positional arguments are mapped into the `args` object.

| Property  | Type     | Description                                                               |
|-----------|----------|---------------------------------------------------------------------------|
| `args`    | Object   | Object with named positional arguments based on `args` option.            |
| `flags`   | Object   | Object containing all parsed flags, including aliases and camelCase keys. |
| `_`       | string[] | Positional arguments before the `--` terminator.                          |
| `_tail`   | string[] | Arguments after the `--` terminator (unparsed, passed as-is).             |


## Examples

### Option `args`

Named positional arguments with variadic `...files`.

```bash
$ convert.js mp3 --bitrate 128 file1.wav file2.wav
```

```js
const cliParams = flaget({
  args: ['format', '...files'],
});

console.log(cliParams);
```

Output:

```json5
{
  args: { format: 'mp3', files: ['file1.wav', 'file2.wav'] },
  flags: { bitrate: 128 },
  _: ['mp3', 'file1.wav', 'file2.wav'],
  _tail: []
}
```

### Option `alias`

Short to long flag mapping.

```bash
$ cli.js -f log.txt
```

```js
const cliParams = flaget({
  alias: { f: 'file' }
});

console.log(cliParams);
```

Output:

```json5
{
  args: {},
  flags: { file: 'log.txt' },
  _: [],
  _tail: []
}
```

### Option `array`

Collect multiple values.

```bash
$ cli.js --keys x y z
```

```js
const cliParams = flaget({
  array: ['keys']
});

console.log(cliParams);
```

Output:

```json5
{
  args: {},
  flags: { keys: ['x', 'y', 'z'] },
  _: [],
  _tail: []
}
```

### Option `boolean`

Prevent consuming next value.

```bash
$ cli.js --debug input.txt
```

```js
const cliParams = flaget({
  boolean: ['debug']
});

console.log(cliParams);
```

Output:

```json5
{
  args: {},
  flags: { debug: true },
  _: ['input.txt'],
  _tail: []
}

```

### Option `default`

Set fallback values for missing flags.

```bash
$ cli.js
```

```js
const cliParams = flaget({
  default: { verbose: false, port: 8080 }
});

console.log(cliParams);
```

Output:

```json5
{
  args: {},
  flags: { verbose: false, port: 8080 },
  _: [],
  _tail: []
}
```

### Mixed flags, positional args, and tail

```bash
$ cli.js push --verbose origin main -- --dry-run --no-cache
```

```js
const cliParams = flaget({
  args: ['command', '...targets'],
  boolean: ['verbose'],
});

console.log(cliParams);
```

Output:

```json5
{
  args: {
    command: 'push',
    targets: ['origin', 'main'],
  },
  flags: {
    verbose: true
  },
  _: ['push', 'origin', 'main'],
  _tail: ['--dry-run', '--no-cache']
}
```


## License

[ISC](https://github.com/webdiscus/flaget/blob/master/LICENSE)