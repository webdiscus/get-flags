/**
 * Minimal CLI flag parser for Node.js.
 * Supports all standard CLI flag formats.
 *
 * @author webdiscus
 */

/**
 * Check if the given argument is a CLI flag (starts with '-').
 * @param {string} val The argument to check.
 * @returns {boolean} True if the argument is a flag.
 */
const isFlag = (val) => typeof val === 'string' && val.startsWith('-');

/**
 * Transform kebab-case string to camelCase.
 * @param {string} str The string to convert.
 * @returns {string} The camelCase string.
 */
const toCamelCase = (str) => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

/**
 * Convert a string to boolean or number if possible.
 * @param {string} val The value to convert.
 * @returns {string|boolean|number} The casted value.
 */
const castValue = (val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
};

/**
 * Assign a flag value to both original and camelCase keys.
 * @param {object} flags The flags object to assign to.
 * @param {string} key The key to assign.
 * @param {any} value The value to assign.
 */
const setFlag = (flags, key, value) => {
  const camelKey = toCamelCase(key);
  flags[key] = value;
  if (camelKey !== key) {
    flags[camelKey] = value;
  }
};

/**
 * Map an alias to its full key name if defined.
 * @param {string} key The key or alias to resolve.
 * @param {object} alias The alias mapping object.
 * @returns {string} The resolved key.
 */
const getKey = (key, alias) => (
  alias[key] || key
);

/**
 * Collect one or more values for a multi-value key.
 * @param {Array} argv The full argv array.
 * @param {number} startIndex The index to start collecting from.
 * @param {string|undefined} rawVal The initial raw value if inline.
 * @returns {{values: Array, argOffset: number}} The collected values and offset.
 */
const readMultiValues = (argv, startIndex, rawVal) => {
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

/**
 * Parse a long flag argument (e.g., --key or --key=value).
 * @param {string} arg The argument to parse.
 * @param {number} index The current argv index.
 * @param {object} context Parsing context (argv, alias, array, flags).
 * @returns {number} The updated index.
 */
const parseLongFlag = (arg, index, context) => {
  const { argv, alias, array, flags } = context;
  const [rawKey, rawVal] = arg.includes('=')
    ? arg.slice(2).split('=')
    : [arg.slice(2)];
  const key = getKey(rawKey, alias);

  if (array.includes(key)) {
    const { values, argOffset } = readMultiValues(argv, index, rawVal);
    setFlag(flags, key, (flags[key] || []).concat(values));
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

  setFlag(flags, key, value);
  return index;
};

/**
 * Parse grouped short flags (e.g., -abc -> -a -b -c).
 * @param {string} arg The argument to parse.
 * @param {object} context Parsing context (alias, flags).
 */
const parseShortGroup = (arg, context) => {
  const { alias, flags } = context;
  for (const char of arg.slice(1)) {
    const key = getKey(char, alias);
    setFlag(flags, key, true);
  }
};

/**
 * Parse a single short flag (e.g., -f or -f value).
 * @param {string} arg The argument to parse.
 * @param {number} index The current argv index.
 * @param {object} context Parsing context (argv, alias, array, flags).
 * @returns {number} The updated index.
 */
const parseShortFlag = (arg, index, context) => {
  const { argv, alias, array, flags } = context;
  const short = arg[1];
  const key = getKey(short, alias);
  const next = argv[index + 1];
  const isNextValue = next && !isFlag(next);

  if (array.includes(key)) {
    const values = [];
    let i = index;
    while (argv[i + 1] && !isFlag(argv[i + 1])) {
      values.push(castValue(argv[++i]));
    }
    setFlag(flags, key, (flags[key] || []).concat(values));
    return i;
  }

  const val = isNextValue ? castValue(argv[++index]) : true;
  setFlag(flags, key, val);

  return index;
};

/**
 * Parse CLI flags from argv.
 *
 * @param {object} [options] Parsing options.
 * @param {Array} [options.argv=process.argv.slice(2)] The argv array to parse.
 * @param {object} [options.alias={}] Mapping of flag alias.
 * @param {Array} [options.array=[]] Keys that should always produce array.
 * @param {object} [options.default={}] Default values for missing flags.
 * @returns {object} Parsed flags object.
 */
const getFlags = (options = {}) => {
  const { argv= process.argv.slice(2), alias= {}, array = []} = options;
  const flags = { _: [] };
  const context = { argv, alias, array, flags };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // treat all remaining values after "--" as positional
    if (arg === '--') {
      flags._.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      i = parseLongFlag(arg, i, context);
      continue;
    }

    if (arg.startsWith('-')) {
      if (arg.length > 2) {
        parseShortGroup(arg, context);
      } else if (arg.length === 2) {
        i = parseShortFlag(arg, i, context);
      } else {
        flags._.push(arg);
      }
      continue;
    }

    flags._.push(arg);
  }

  // apply default values for missing flags
  for (const [key, val] of Object.entries(options.default || {})) {
    if (!(key in flags)) {
      setFlag(flags, key, val);
    }
  }

  return flags;
};

module.exports = getFlags;
