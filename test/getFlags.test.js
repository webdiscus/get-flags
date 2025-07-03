import { describe, test, expect } from 'vitest';

import getFlags from 'flaget'; // test local installed package
// import getFlags from '../src/getFlags.js'; // test source file only

describe('getFlags', () => {
  test('parse long flag with value', () => {
    // example: cmd --name value
    const result = getFlags({ argv: ['--name', 'value'] });
    expect(result).toEqual({ name: 'value', _: [] });
  });

  test('parse long flag with equals', () => {
    // example: cmd --port=8080 --my-port=8080
    const result = getFlags({ argv: ['--port=8080', '--my-port=8080'] });
    expect(result).toEqual({ port: 8080, 'my-port': 8080, myPort: 8080, _: [] });
  });

  test('parse boolean true/false values', () => {
    // example: cmd --debug=true --verbose=false
    const result = getFlags({ argv: ['--debug=true', '--verbose=false'] });
    expect(result).toEqual({ debug: true, verbose: false, _: [] });
  });

  test('parse flag without value as true', () => {
    // example: cmd --name value --try-draft -v
    const result = getFlags({ argv: ['--name', 'value', '--try-draft', '-v'] });
    expect(result).toEqual({
      name: 'value',
      'try-draft': true,
      tryDraft: true,
      v: true,
      _: [],
    });
  });

  test('parse last flag without value as true', () => {
    // example: cmd --name value --try-draft
    const result = getFlags({ argv: ['--name', 'value', '--try-draft'] });
    expect(result).toEqual({
      name: 'value',
      'try-draft': true,
      tryDraft: true,
      _: [],
    });
  });

  test('parse values with spaces', () => {
    // example: cmd --key1 "foo bar" --key2="foo bar"
    const result = getFlags({
      argv: ['--key1', 'foo bar', '--key2=foo bar'],
    });
    expect(result).toEqual({
      key1: 'foo bar',
      key2: 'foo bar',
      _: [],
    });
  });

  test('parse numeric values', () => {
    // example: cmd --num 42 --pi 3.14
    const result = getFlags({ argv: ['--num', '42', '--pi', '3.14'] });
    expect(result).toEqual({ num: 42, pi: 3.14, _: [] });
  });

  test('parse short flags grouped', () => {
    // example: cmd -abc
    const result = getFlags({ argv: ['-abc'] });
    expect(result).toEqual({ a: true, b: true, c: true, _: [] });
  });

  test('parse short flag with value', () => {
    // example: cmd -n 123
    const result = getFlags({ argv: ['-n', '123'] });
    expect(result).toEqual({ n: 123, _: [] });
  });

  test('parse multi-value flags', () => {
    // example: cmd --tag a b --tag=c
    const result = getFlags({
      argv: ['--tag', 'a', 'b', '--tag=c'],
      arrays: ['tag'],
    });
    expect(result).toEqual({ tag: ['a', 'b', 'c'], _: [] });
  });

  test('parse positional args', () => {
    // example: cmd pos1 --flag val pos2
    const result = getFlags({
      argv: ['pos1', '--flag', 'val', 'pos2'],
    });
    expect(result).toEqual({ flag: 'val', _: ['pos1', 'pos2'] });
  });

  test('stop parsing at --', () => {
    // example: cmd --flag val -- --not-a-flag other
    const result = getFlags({
      argv: ['--flag', 'val', '--', '--not-a-flag', 'other'],
    });
    expect(result).toEqual({
      flag: 'val',
      _: ['--not-a-flag', 'other'],
    });
  });

  test('use alias', () => {
    // example: cmd --f val  (alias: f => foo)
    const result = getFlags({
      argv: ['--f', 'val'],
      aliases: { f: 'foo' },
    });
    expect(result).toEqual({ foo: 'val', _: [] });
  });

  test('use short and long', () => {
    // example: cmd --f a.js --file b.js
    const result = getFlags({
      argv: ['-f', 'a.js', '--file', 'b.js'],
    });
    expect(result).toEqual({ 'f': 'a.js', 'file': 'b.js', _: [] });
  });

  test('use short and alias', () => {
    // example: cmd --f a.js --file b.js  (alias: f => file), will be parsed latest value
    const result = getFlags({
      argv: ['-f', 'a.js', '--file', 'b.js'],
      aliases: { f: 'file' },
    });
    expect(result).toEqual({ 'file': 'b.js', _: [] });
  });

  test('use short and alias with multi values', () => {
    // example: cmd --f a.js --files b.js  (alias: f => files), collects all values
    const result = getFlags({
      argv: ['-f', 'a.js', '--files', 'b.js'],
      aliases: { f: 'files' },
      arrays: ['files'],
    });
    expect(result).toEqual({ 'files': ['a.js', 'b.js'], _: [] });
  });

  test('use all options', () => {
    // example: cmd --f a.js --file b.js  (alias: f => file), will be parsed latest value
    const result = getFlags({
      argv: ['report', '-abc', '--type=json', '--dash-flag', 'value', '--force', '--cached=false', '-l', '20', '-f', 'a.js', 'b.js', '--files', 'c.js', 'd.js', '--', 'out.json'],
      aliases: { f: 'files', l: 'limit' },
      arrays: ['files'],
      defaults: { type: 'yaml', verbose: false },
    });
    expect(result).toEqual({
      'a': true,
      'b': true,
      'c': true,
      'type': 'json',
      'limit': 20,
      'dash-flag': 'value',
      'dashFlag': 'value',
      'cached': false,
      'force': true,
      'files': [
        'a.js',
        'b.js',
        'c.js',
        'd.js',
      ],
      'verbose': false,
      '_': [
        'report',
        'out.json',
      ],
    });
  });

  test('apply defaults', () => {
    // example: cmd  (env=production by default)
    const result = getFlags({
      argv: [],
      defaults: { env: 'production' },
    });
    expect(result).toEqual({ env: 'production', _: [] });
  });
});
