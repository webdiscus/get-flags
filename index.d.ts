/**
 * Parses CLI flags and arguments into a structured object.
 *
 * @param options
 * @param options.raw The raw arguments to parse. (default is process.argv.slice(2)).
 * @param options.args Named positional arguments. Supports variadic last argument (e.g. '...files').
 * @param options.alias Map of short keys to long keys, e.g. { f: 'files' }.
 * @param options.array Keys that should collect multiple values into arrays.
 * @param options.boolean Keys that should always be parsed as boolean flags.
 * @param options.default Default values for missing flags.
 * @returns Parsed CLI parameters including flags, positional arguments, and rest arguments.
 */
declare function flaget(options?: {
  raw?: string[];
  args?: string[];
  alias?: Record<string, string>;
  array?: string[];
  boolean?: string[];
  default?: Record<string, unknown>;
}): {
  args: Record<string, string | undefined | Array<string>>;
  flags: Record<string, string | number | boolean | Array<string | number | boolean>>;
  _: string[];
  _tail: string[];
};

export = flaget;
