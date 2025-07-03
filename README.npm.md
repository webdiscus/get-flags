<h1 align="center">
  <img width="400" src="docs/logo.png" alt="Flaget">
</h1>

Minimal, fast CLI flag parser for Node.js.
Supports all standard CLI flag formats.

## Features

- Short boolean flag: `-f`
- Short flag with value: `-f value`
- Grouped short flags: `-abc` (equivalent to `-a` `-b` `-c`)
- Long boolean flag: `--flag`
- Long flag with value: `--key=value` or `--key value`
- Dashed long flag: `--foo-bar` (available as both `flags['foo-bar']` and `flags.fooBar`)
- Multi-value keys: `--files a.js b.js`
- Short-to-long aliases: `-f` = `--files`
- Positional arguments and `--` terminator: `cmd -a --key=foo file1.txt -- file2.txt`
- Default values for flags

See [full documentation](https://github.com/webdiscus/flaget).