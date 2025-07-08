/**
 * A lightweight CLI flag/argument parser for Node.js
 * Supports all standard CLI flag formats.
 *
 * Note:
 * The code is written to keep a good balance between readability and small size.
 * Naming, structure, and logic are optimized for minimal bundle size.
 *
 * @author webdiscus
 */

/**
 * Check if the next argument exists and is not a flag.
 * @param {Array<string>} raw The raw argv array.
 * @param {number} i Current index.
 * @returns {boolean} True if the next argument is a value (not a flag).
 */
const isArg = (raw, i) => raw[i + 1] != null && raw[i + 1][0] !== '-';

/**
 * Convert a string to boolean or number if possible.
 * @param {string} val The value to convert.
 * @returns {string|boolean|number} The casted value.
 */
const cast = (val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val;
};

/**
 * Assign a flag val to both original and camelCase keys.
 * @param {{flags: Object<string, any>}} res The result object containing the `flags` property.
 * @param {string} key The original flag key.
 * @param {any} val The value to assign to the flag.
 */
const setFlag = (res, key, val) => {
  // transform kebab-case string to camelCase
  let camelKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

  res.flags[key] = val;
  if (camelKey !== key) {
    res.flags[camelKey] = val;
  }
};

/**
 * Collect one or more values for a multi-value key.
 * @param {Array} raw The argv array.
 * @param {number} i The index to start collecting from.
 * @param {string|undefined} val The initial raw value if inline.
 * @returns {{values: Array, offset: number}} The collected values and offset.
 */
const getArray = (raw, i, val) => {
  let values = [];
  let j = i;

  if (val != null) {
    values.push(cast(val));
    return { values, offset: 0 };
  }

  while (isArg(raw, j)) {
    values.push(cast(raw[++j]));
  }

  // offset is difference between current index "j" and start index "i"
  return { values, offset: j - i };
};

/**
 * Parse CLI flags and positional arguments from argv.
 *
 * @param {object} [options] Parsing options.
 * @param {Array} [options.raw=process.argv.slice(2)] The raw arguments to parse.
 * @param {object} [options.args=[]] Named positional arguments.
 *   Use strings to define positional keys, e.g. ['command', 'file'].
 *   A variadic last argument can be declared with a prefix: '...files'.
 * @param {object} [options.alias={}] Mapping of flag aliases to full flag names.
 * @param {Array} [options.array=[]] Flag keys that should be collected into arrays.
 * @param {Array} [options.boolean=[]] Flag keys that should always be parsed as booleans.
 * @param {object} [options.default={}] Default values for missing flags.
 * @returns {{
 *   _: string[],          // Positional arguments before "--"
 *   _tail: string[],      // Raw arguments after "--", unparsed
 *   args: object,         // Named positional arguments
 *   [flag: string]: any   // All flags as top-level properties (excluding reserved keys)
 * }} Parsed result object.
 */
const flaget = (options = {}) => {
  let { raw = process.argv.slice(2), alias = {}, array = [], boolean = [] } = options;
  let res = { _: [], args: {}, flags: {} };

  /**
   * Parse a long flag argument (e.g., --key or --key=value).
   * @param {string} arg The argument to parse.
   * @param {number} i The current argv index.
   * @returns {number} The updated index.
   */
  const parseLong = (arg, i) => {
    let [rawKey, rawVal] = arg.slice(2).split('=');
    let key = alias[rawKey] || rawKey;

    if (array.includes(key)) {
      let { values, offset } = getArray(raw, i, rawVal);
      setFlag(res, key, (res.flags[key] || []).concat(values));
      return i + offset;
    }

    if (boolean.includes(key)) {
      setFlag(res, key, true);
      return i;
    }

    let val = true;
    if (rawVal != null) {
      val = cast(rawVal);
    } else if (isArg(raw, i)) {
      val = cast(raw[++i]);
    }

    setFlag(res, key, val);

    return i;
  };

  /**
   * Parse short CLI flags (-a, -abc, -f value).
   *
   * @param {string} arg The current argument.
   * @param {number} i The current argv index.
   * @returns {number} Updated index.
   */
  const parseShort = (arg, i) => {
    // grouped flags like -abc -> -a -b -c
    if (arg.length > 2) {
      for (let char of arg.slice(1)) {
        let key = alias[char] || char;
        setFlag(res, key, boolean.includes(key) ? true : true);
      }
      return i;
    }

    // single flag like -f [value]
    let key = alias[arg[1]] || arg[1];

    if (array.includes(key)) {
      let values = [];
      let j = i;
      while (isArg(raw, j)) {
        values.push(cast(raw[++j]));
      }
      setFlag(res, key, (res.flags[key] || []).concat(values));
      return j;
    }

    if (boolean.includes(key)) {
      setFlag(res, key, true);
      return i;
    }

    let val = isArg(raw, i) ? cast(raw[i + 1]) : true;
    if (val !== true) i++;
    setFlag(res, key, val);

    return i;
  };

  // parse all flags and positional arguments before "--"
  let i = 0;
  for (; i < raw.length; i++) {
    let arg = raw[i];

    if (arg === '--') break;

    if (arg.startsWith('--')) {
      i = parseLong(arg, i);
    } else if (arg[0] === '-') {
      i = parseShort(arg, i);
    } else {
      res._.push(arg);
    }
  }

  // apply default values for missing flags
  for (let [key, val] of Object.entries(options.default || {})) {
    if (!(key in res.flags)) {
      setFlag(res, key, val);
    }
  }

  // assign named positional args
  let keys = options.args || [];

  for (let j = 0; j < keys.length; j++) {
    let key = keys[j];
    if (key.startsWith('...')) {
      res.args[key.slice(3)] = res._.slice(j);
      break;
    }
    res.args[key] = res._[j];
  }

  // all arguments after "--"
  res._tail = raw.slice(++i);

  return res;
};

module.exports = flaget;
