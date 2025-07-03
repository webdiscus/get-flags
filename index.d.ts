/**
 * Parses CLI arguments into a flags object.
 *
 * @param options
 * @param options.argv The arguments to parse (defaults to process.argv.slice(2)).
 * @param options.aliases Map of short keys to long keys, e.g. { f: 'files' }.
 * @param options.arrays Keys that should collect multiple values.
 * @param options.defaults Map of default values.
 * @returns Parsed flags object.
 */
declare function getFlags(options?: {
  argv?: string[];
  aliases?: Record<string, string>;
  arrays?: string[];
  defaults?: Record<string, unknown>;
}): {
  [key: string]: string | number | boolean | Array<string | number | boolean> | undefined;
  _: string[];
};

export = getFlags;
