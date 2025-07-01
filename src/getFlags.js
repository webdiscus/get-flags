/**
 * Parses CLI arguments with:
 * - Grouped short flags (-abc)
 * - Long flags (--key=value or --key value)
 * - Short-to-long aliases (-f = --files)
 * - Multi-value keys (--files a.js b.js)
 * - Default values
 * - Terminator `--` (rest are positional)
 *
 * @author webdiscus
 *
 * @param {object} options
 * @param {string[]} [options.argv=process.argv.slice(2)] The arguments to parse.
 * @param {object} [options.aliases] Map of short keys to long keys, e.g. { f: 'files' }.
 * @param {string[]} [options.arrays] Keys that should collect multiple values.
 * @param {object} [options.defaults] Map of default values.
 * @returns {object} Parsed flags
 *
 * @example
 * [bash]
 * node cli.js build -abc --mode=production --dash-flag=value -f a.js b.js c.js --files d.js -- input.txt
 *
 * [js]
 * const flags = parseFlags(process.argv.slice(2), {
 *   aliases: { f: 'files', m: 'mode' }, // -f = --file, -m = --mode
 *   arrays: ['files'], // group multiple values
 *   defaults: { mode: 'dev', verbose: false }, // specify default values
 * });
 *
 * [json]
 * {
 *   "a": true,
 *   "b": true,
 *   "c": true,
 *   "mode": "production",
 *   "dash-flag": "value",
 *   "dashFlag": "value",
 *   "files": ["a.js", "b.js", "c.js"],
 *   "_": ["build", "input.txt"]
 * }
 */
const getFlags = ({
  argv = process.argv.slice(2),
  aliases = {},
  arrays = [],
  defaults = {},
} = {}) => {
  const flags = { _: [] };

  // check if the argument is a flag (starts with -)
  const isFlag = (val) => typeof val === 'string' && val.startsWith('-');

  // assign a flag to both original and camelCase keys
  const setFlag = (key, value) => {
    const camelKey = toCamelCase(key);
    flags[key] = value;
    if (camelKey !== key) {
      flags[camelKey] = value;
    }
  };

  // map alias to full key name
  const getKey = (key) => aliases[key] || key;

  // convert string to boolean or number
  const castValue = (val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
    return val;
  };

  // transform kebab-case into camelCase
  const toCamelCase = (str) => str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

  // gather one or more values for a multi-value key
  const readMultiValues = (startIndex, rawVal) => {
    const values = [];
    let i = startIndex;

    if (rawVal != null) {
      values.push(castValue(rawVal));
      return { values, argOffset: 0 };
    }

    while (argv[i + 1] && !isFlag(argv[i + 1])) {
      values.push(castValue(argv[++i]));
    }

    return { values, argOffset: i - startIndex };
  };

  // handle long flags: --key=value or --key value
  const processLongFlag = (arg, index) => {
    const [rawKey, rawVal] = arg.includes('=')
      ? arg.slice(2).split('=')
      : [arg.slice(2)];
    const key = getKey(rawKey);

    if (arrays.includes(key)) {
      const { values, argOffset } = readMultiValues(index, rawVal);
      setFlag(key, (flags[key] || []).concat(values));
      return index + argOffset;
    }

    let value;
    if (rawVal != null) {
      value = castValue(rawVal);
    } else if (!isFlag(argv[index + 1]) && argv[index + 1] != null) {
      value = castValue(argv[++index]);
    } else {
      value = true;
    }

    setFlag(key, value);

    return index;
  };

  // handle grouped short flags: -abc -> -a -b -c
  const processShortGroup = (arg) => {
    for (const char of arg.slice(1)) {
      const key = getKey(char);
      setFlag(key, true);
    }
  };

  // handle single short flag: -f or -f value
  const processShortFlag = (arg, index) => {
    const short = arg[1];
    const key = getKey(short);
    const next = argv[index + 1];
    const nextIsValue = next && !isFlag(next);

    if (arrays.includes(key)) {
      const values = [];
      let i = index;
      while (argv[i + 1] && !isFlag(argv[i + 1])) {
        values.push(castValue(argv[++i]));
      }
      setFlag(key, (flags[key] || []).concat(values));
      return i;
    }

    const val = nextIsValue ? castValue(argv[++index]) : true;
    setFlag(key, val);

    return index;
  };

  // main parsing loop
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // treat all remaining values after "--" as positional
    if (arg === '--') {
      flags._.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      i = processLongFlag(arg, i);
      continue;
    }

    if (arg.startsWith('-')) {
      if (arg.length > 2) {
        processShortGroup(arg);
      } else if (arg.length === 2) {
        i = processShortFlag(arg, i);
      } else {
        // treats '-' as positional argument
        flags._.push(arg);
      }
      continue;
    }

    // positional argument
    flags._.push(arg);
  }

  // apply default values for missing flags
  for (const [key, val] of Object.entries(defaults)) {
    if (!(key in flags)) {
      setFlag(key, val);
    }
  }

  return flags;
};

module.exports = getFlags;
