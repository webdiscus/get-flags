/**
 * Splits a CLI string into an array of arguments, similar to process.argv.
 *
 * Quoted strings are preserved as single arguments, and `--key="value"` is kept as one token.
 * Handles both single `'` and double `"` quotes, and merges `--key=` with the following quoted value if split.
 *
 * @param {string} str The CLI string to parse.
 * @returns {string[]} An array of CLI arguments, ready to use like `argv`.
 *
 * @example
 * const input = `--key1 'foo bar' --key2="foo bar"`;
 * splitCliString(input);
 * // Outputs: [ '--key1', 'foo bar', '--key2=foo bar' ]
 */
function splitCli(str) {
  const result = [];
  let i = 0;
  const len = str.length;

  while (i < len) {
    while (str[i] === ' ') i++;
    if (i >= len) break;

    let token = '';
    let quote = null;

    while (i < len) {
      const char = str[i];

      if (quote) {
        if (char === quote) {
          quote = null;
          i++;
          continue;
        }
        token += char;
        i++;
        continue;
      }

      if (char === '"' || char === "'") {
        quote = char;
        i++;
        continue;
      }

      if (char === ' ') {
        break;
      }

      token += char;
      i++;
    }

    result.push(token);
  }

  // merge --key= and value if split
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].endsWith('=') && !result[i + 1].startsWith('-')) {
      result.splice(i, 2, result[i] + result[i + 1]);
    }
  }

  return result;
}

export {
  splitCli,
}
