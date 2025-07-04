/**
 * Parses CLI arguments into a flags object.
 *
 * @param options
 * @param options.argv The arguments to parse (defaults is process.argv.slice(2)).
 * @param options.alias Map of short keys to long keys, e.g. { f: 'files' }.
 * @param options.array Keys that should collect multiple values.
 * @param options.default Map of default values.
 * @returns Parsed flags object.
 */
declare function getFlags(options?: {
  argv?: string[];
  alias?: Record<string, string>;
  array?: string[];
  default?: Record<string, unknown>;
}): {
  [key: string]: string | number | boolean | Array<string | number | boolean> | undefined;
  _: string[];
};

export = getFlags;
