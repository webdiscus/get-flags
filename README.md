[![npm](https://img.shields.io/npm/v/flaget?logo=npm&color=brightgreen "npm package")](https://www.npmjs.com/package/ansis "download npm package")
[![node](https://img.shields.io/node/v/flaget)](https://nodejs.org)
[![Test](https://github.com/webdiscus/flaget/actions/workflows/test.yml/badge.svg)](https://github.com/webdiscus/flaget/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/webdiscus/flaget/graph/badge.svg?token=ETZKAUG7D3)](https://codecov.io/gh/webdiscus/flaget)
[![install size](https://packagephobia.com/badge?p=flaget)](https://packagephobia.com/result?p=flaget)

<h1 align="center">
  <img width="400" src="docs/logo.png" alt="Flaget">
</h1>

A lightweight CLI argument parser for Node.js.
Supports all standard CLI flag formats.

## Features

- Short boolean flag: `-f`
- Short flag with value: `-f value`
- Grouped short flags: `-abc` (equivalent to `-a` `-b` `-c`)
- Long boolean flag: `--flag`
- Long flag with value: `--key=value` or `--key value`
- Dashed long flag: `--foo-bar` (available as both `flags['foo-bar']` and `flags.fooBar`)
- Multi-values: `--files a.js b.js`
- Short-to-long alias: `-f` = `--files`
- Positional arguments and `--` terminator: `cmd -a --key=foo file1.txt -- file2.txt`
- Default values for flags

## Install

```bash
npm i flaget
```

## Usage

Example command-line with flags:
```bash
> cmd report -abc --type=json --foo-bar value -l 20 -f a.js b.js --files c.js d.js -- out.json
```

### Basic

```js
const getFlags = require('flaget');
// or, in ESM:
// import getFlags from 'flaget';

const flags = getFlags();
console.log(flags);
```

### With Options

```js
const flags = getFlags({
  // argv: process.argv.slice(2), // parses by default
  alias: { f: 'files', l: 'limit' }, // -f = --files, -l = --limit
  array: ['files'], // collect multiple values for --files and -f
  default: { type: 'yaml', verbose: false } // default values if not set in CLI
});

console.log(flags);
```

Result:

```json5
{
  "a": true,
  "b": true,
  "c": true,
  "type": "json",
  "limit": 20,
  "foo-bar": "value",
  "fooBar": "value",
  "files": [
    "a.js",
    "b.js",
    "c.js",
    "d.js"
  ],
  "verbose": false,
  "_": [
    "report",
    "out.json"
  ]
}
```

---

## Options

| Option     | Type       | Default                  | Description                                                  |
|------------|------------| ------------------------ |--------------------------------------------------------------|
| `argv`     | string[]   | `process.argv.slice(2)`  | Array of CLI arguments to parse                              |
| `alias`    | Object     | `{}`                     | Map of short keys to long keys.<br>Example: `{ f: 'files' }` |
| `array`    | string[]   | `[]`                     | Keys that should collect multiple values as array            |
| `default`  | Object     | `{}`                     | Default values for flags, if not set on the CLI              |

**Notes**

- All dashed keys are also available as camelCase (e.g. `--foo-bar` sets both `foo-bar` and `fooBar`).
- Use the `alias` option to map short flags to long names.
- Specify keys in `array` to collect an array of multi-values.
- Use the `default` option for fallback values.


## Examples

| CLI Input Example                | Parsed Output Example                          | Notes                                       |
|----------------------------------|------------------------------------------------|---------------------------------------------|
| `-a`                             | `{ a: true }`                                  | Single short flag                           |
| `-abc`                           | `{ a: true, b: true, c: true }`                | Grouped short flags                         |
| `--flag`                         | `{ flag: true }`                               | Long flag (boolean)                         |
| `--key=value`                    | `{ key: 'value' }`                             | Long flag with value                        |
| `--key value`                    | `{ key: 'value' }`                             | Long flag, value in next argument           |
| `-f value`                       | `{ f: 'value' }`                               | Short flag with value                       |
| `--number 42`                    | `{ number: 42 }`                               | Auto-casts numbers                          |
| `--bool false`                   | `{ bool: false }`                              | Auto-casts booleans                         |
| `-f a.js b.js`<br>`--files c.js` | `{ f: ['a.js', 'b.js'], files: ['c.js'] }`     | Multi-value keys: groups following values   |
| `--dash-flag=value`              | `{ 'dash-flag': 'value', dashFlag: 'value' }`  | Kebab-case key, also available as camelCase |
| `--files a.js b.js -- out.json`  | `{ files: ['a.js', 'b.js'], _: ['out.json'] }` | Arguments after -- are positional           |
| `input.txt`                      | `{ _: ['input.txt'] }`                         | Positional argument                         |
| `-f a.js --files b.js`           | `{ files: ['a.js', 'b.js'] }`                  | Aliases resolved                            |

## License

[ISC](https://github.com/webdiscus/flaget/blob/master/LICENSE)