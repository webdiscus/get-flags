import { describe, test, expect } from 'vitest';
import { splitCli } from './utils/helpers.js';

//import flaget from 'flaget'; // test local installed package
import flaget from '../src/index.js'; // test source file for test coverage

describe('examples', () => {
  test('basic, without config', () => {
    const cli = 'report daily -xz --foo-bar baz --keys foo bar --start=5 -l 20 -- one --two';
    const cliParams = flaget({
      raw: cli.split(' '),
    });

    expect(cliParams).toEqual({
      args: {},
      flags: {
        x: true,
        z: true,
        'foo-bar': 'baz',
        fooBar: 'baz',
        keys: 'foo',
        start: 5,
        l: 20,
      },
      _: ['report', 'daily', 'bar'],
      _tail: ['one', '--two']
    });
  });

  test('basic with config', () => {
    const cli = 'report daily -xz --foo-bar baz --keys foo bar --start=5 -l 20 -- one --two';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', 'period'],
      alias: { l: 'limit' },
      array: ['keys'],
      default: { start: 0, limit: 10, verbose: false }
    });

    expect(cliParams).toEqual({
      args: {
        command: 'report',
        period: 'daily',
      },
      flags: {
        x: true,
        z: true,
        'foo-bar': 'baz',
        fooBar: 'baz',
        keys: ['foo', 'bar'],
        start: 5,
        limit: 20,
        verbose: false,
      },
      _: ['report', 'daily'],
      _tail: ['one', '--two']
    });
  });

  test('named positional arguments with variadic', () => {
    const cli = 'mp3 --bitrate 128 file1.wav file2.wav';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['format', '...files'],
    });

    expect(cliParams).toEqual({
        args: { format: 'mp3', files: ['file1.wav', 'file2.wav'] },
        flags: { bitrate: 128 },
        _: ['mp3', 'file1.wav', 'file2.wav'],
        _tail: []
      }
    );
  });

  test('mixed flags, positional args, and tail', () => {
    const cli = 'push --verbose origin main -- --dry-run --no-cache';
    const cliParams = flaget({
      raw: cli.split(' '),
      args: ['command', '...targets'],
      boolean: ['verbose'],
    });

    expect(cliParams).toEqual({
        args: {
          command: 'push',
          targets: ['origin', 'main']
        },
        flags: {
          verbose: true
        },
        _: ['push', 'origin', 'main'],
        _tail: ['--dry-run', '--no-cache']
      }
    );
  });
})
