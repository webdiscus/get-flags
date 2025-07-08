<h1 align="center">
  <img width="400" src="docs/logo.png" alt="Flaget">
</h1>

Tiny CLI flag/argument parser.
Supports all standard CLI flag formats.

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

See [full documentation](https://github.com/webdiscus/flaget).