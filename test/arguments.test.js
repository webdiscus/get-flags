import { describe, test, expect } from 'vitest';
import { splitCli } from './testHelpers.js'

//import flaget from 'flaget'; // test local installed package
import flaget from '../src/index.js'; // test source file for test coverage

describe('flaget - positional arguments only', () => {
  test('parses named positional arguments with variadic', () => {
    const cli = 'push origin feature -f --depth=3 foo.js bar.js -- one two';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'remote', 'branch', '...files'],
      alias: { f: 'force' }
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        remote: 'origin',
        branch: 'feature',
        files: ['foo.js', 'bar.js']
      },
      flags: { force: true, depth: 3 },
      _: ['push', 'origin', 'feature', 'foo.js', 'bar.js'],
      _tail: ['one', 'two']
    });
  });

  test('handles missing positional args', () => {
    const cli = 'push';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'remote', 'branch']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        remote: undefined,
        branch: undefined
      },
      flags: {},
      _: ['push'],
      _tail: []
    });
  });

  test('handles extra positional args without variadic', () => {
    const cli = 'push origin branch too-much';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'remote', 'branch']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        remote: 'origin',
        branch: 'branch'
      },
      flags: {},
      _: ['push', 'origin', 'branch', 'too-much'],
      _tail: []
    });
  });

  test('captures all extra args into variadic', () => {
    const cli = 'push origin branch a.js b.js';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'remote', 'branch', '...files']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        remote: 'origin',
        branch: 'branch',
        files: ['a.js', 'b.js']
      },
      flags: {},
      _: ['push', 'origin', 'branch', 'a.js', 'b.js'],
      _tail: []
    });
  });

  test('handles missing last non-variadic argument', () => {
    const cli = 'push origin';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'remote', 'branch']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        remote: 'origin',
        branch: undefined
      },
      flags: {},
      _: ['push', 'origin'],
      _tail: []
    });
  });

  test('captures multiple arguments', () => {
    const cli = 'push origin foo bar baz';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
      },
      flags: {},
      _: ['push', 'origin', 'foo', 'bar', 'baz'],
      _tail: [],
    });
  });

  test('captures multiple arguments, terminator', () => {
    const cli = 'push origin foo -- bar baz';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
      },
      flags: {},
      _: ['push', 'origin', 'foo'],
      _tail: ['bar', 'baz']
    });
  });

  test('captures multiple arguments, no arguments after terminator', () => {
    const cli = 'push origin foo --';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
      },
      flags: {},
      _: ['push', 'origin', 'foo'],
      _tail: []
    });
  });

  test('captures multiple arguments into variadic only', () => {
    const cli = 'push origin foo bar baz';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', '...extra']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        extra: ['origin', 'foo', 'bar', 'baz']
      },
      flags: {},
      _: ['push', 'origin', 'foo', 'bar', 'baz'],
      _tail: []
    });
  });

  test('captures multiple arguments into variadic only, terminator', () => {
    const cli = 'push origin foo -- bar baz';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', '...extra']
    });

    expect(cliParams).toEqual({
      args: {
        command: 'push',
        extra: ['origin', 'foo']
      },
      flags: {},
      _: ['push', 'origin', 'foo'],
      _tail: [ 'bar', 'baz']
    });
  });

  test('no variadic: leftover goes to _tail', () => {
    const cli = 'push extra';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command']
    });

    expect(cliParams).toEqual({
      args: { command: 'push' },
      flags: {},
      _: ['push', 'extra'],
      _tail: []
    });
  });

  test('no args option: no named args', () => {
    const cli = 'a b c';
    const cliParams = flaget({
      raw: cli.split(' ')
    });

    expect(cliParams).toEqual({
      args: {},
      flags: {},
      _: ['a', 'b', 'c'],
      _tail: []
    });
  });

  test('respects empty args: []', () => {
    const cli = 'a b c';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: []
    });

    expect(cliParams).toEqual({
      args: {},
      flags: {},
      _: ['a', 'b', 'c'],
      _tail: []
    });
  });

  test('parses mixed positional arguments and flags correctly', () => {
    const cli = 'build ./src ./dist -v --minify --format esm -- --one two';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'input', 'output'],
      alias: { v: 'verbose' }
    });

    expect(cliParams).toEqual({
      args: {
        command: 'build',
        input: './src',
        output: './dist'
      },
      flags: {
        verbose: true,
        minify: true,
        format: 'esm'
      },
      _: ['build', './src', './dist'],
      _tail: ['--one', 'two']
    });
  });

  test('parses variadic, including short aliased flag', () => {
    const cli = 'convert mp3 -v track1.wav track2.wav track3.wav -- one two';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'format', '...files'],
      alias: { v: 'verbose' },
      boolean: ['verbose'],
    });

    expect(cliParams).toEqual({
      args: {
        command: 'convert',
        format: 'mp3',
        files: ['track1.wav', 'track2.wav', 'track3.wav'],
      },
      flags: {
        verbose: true,
      },
      _: ['convert', 'mp3', 'track1.wav', 'track2.wav', 'track3.wav'],
      _tail: ['one', 'two'],
    });
  });

  test('parses variadic, including short and long flag mixed with arguments', () => {
    const cli = 'convert mp3 --verbose track1.wav -q 128 track2.wav track3.wav';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'format', '...files'],
      boolean: ['verbose'],
    });

    expect(cliParams).toEqual({
      args: {
        command: 'convert',
        format: 'mp3',
        files: ['track1.wav', 'track2.wav', 'track3.wav'],
      },
      flags: {
        q: 128,
        verbose: true,
      },
      _: ['convert', 'mp3', 'track1.wav', 'track2.wav', 'track3.wav'],
      _tail: [],
    });
  });
});
