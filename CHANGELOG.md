# Changelog

## 2.1.0 (20225-07-11)

- feat: add support negated flags with prefix `--no-`, e.g. `--no-color` -> `{ color: false }`
- feat: add support both CommonJS and ESM
- feat: add support TypeScript
- feat: add support TSC, compatible with `module: "Node16"`
- feat: reduce unpacked package size

## 2.0.0 (20225-07-08)

- feat(BREAKING CHANGE): optimized structure of return object with parsed elements\
  Example: `cli --verbose file.txt -- one two`\
  Return:\
  **Old v1.x**:
  ```json5
  {
    verbose: true,
    _: ['file.txt', 'one', 'two'],
  }
  ```
  **New v2.x**:
  ```json5
  {
    args: {},
    flags: { verbose: true },
    _: ['file.txt'],
    _tail: ['one', 'two'],
  }
  ```
- feat: added `args` option for named positional arguments
- feat: added support for variadic arguments (e.g. `...files`) to collect last arguments into array
- feat: added `boolean` option to treat flags as booleans without consuming values
- feat: return property `_` now contains only positional arguments before `--`
- feat: added return property `_tail` to capture all arguments after `--`
- refactor: removed internal helpers and flattened implementation to keep compact code
- test: added tests for named positional arguments
- docs: improved README, added usage examples

## 1.1.0 (2025-07-04) First stable release

- feat: rename options for compatibility to yargs-parser options
- feat: optimize npm package for smaller size: 12kB -> ~5kB
- feat: add d.ts file
- refactor: refactor code, add more comments
- chore: add rollup to build clean npm package
- test: add CI workflow via GitHub actions
- docs: improve readme

## 1.0.0 (2025-07-04) UNPUBLISHED as not ready for release

### Features:

- Short boolean flag: `-f`
- Short flag with value: `-f value`
- Grouped short flags: `-xyz` (equivalent to `-x` `-y` `-z`)
- Long boolean flag: `--flag`
- Long flag with value: `--flag=value` or `--flag value`
- Dashed long flag: `--foo-bar` (available as `flags['foo-bar']` and `flags.fooBar`)
- Multi-values: `--keys foo bar`
- Short-to-long alias: `-f` = `--files`
- Default values for flags


## 0.0.2 (2025-07-02) experimental working version

- fix: resolving files in package.json for CommonJS

## 0.0.1 (2025-07-01) UNPUBLISHED as not working experimental version

- chore(experimental): create small and fast CLI flag parser as lightweight alternative to yargs-parser
