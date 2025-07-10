import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import { minify } from 'terser';

// Helpers
//
// - Display the size of a directory's content:
//   find ./dist -type f -exec stat -f"%z" {} + | awk '{s+=$1} END {print s}'

const babelOptions = {
  babelHelpers: 'bundled',
  exclude: 'node_modules/**',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '10' },
        modules: false, // handle ES modules in Rollup
        useBuiltIns: false,
      },
    ],
  ],
};

// https://github.com/terser/terser#compress-options
const terserMinifyOptions = (ecma) => ({
  ecma,
  compress: {
    ecma,
    passes: 3,
    inline: true,
    pure_getters: true,
    // use these options to find a potential for optimisations in the code
    //unsafe: true,
    //unsafe_comps: true,
  },
  toplevel: true,
});

const terserPrettyOptions = (ecma) => ({
  compress: false,
  mangle: false, // disables name shortening
  format: {
    comments: false,
    beautify: true, // pretty output (optional, for better readability)
    indent_level: 2, // force 2-space indentation
  },
});

/**
 * Remove comments.
 *
 * @param {string} string
 * @return {*}
 */
function removeComments(string) {
  return string.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, '').trim();
}

/**
 * Replace all leading indentation spaces with tabs in each line of a string.
 * @param {string} input The multi-line string to process.
 * @param {number} spacesPerTab Number of spaces per tab (default 2).
 * @returns {string} The string with indentation spaces replaced by tabs.
 */
function indentSpacesToTabs(input, spacesPerTab = 2) {
  const pattern = new RegExp(`^( {${spacesPerTab}})+`, 'gm');
  return input.replace(pattern, (match) => '\t'.repeat(match.length / spacesPerTab));
}

/**
 * Replace all empty lines in a multi-line string.
 * @param {string} input The input multi-line string.
 * @param {string} replacement The string to replace empty lines with (default is '').
 * @returns {string} The string with empty lines replaced.
 */
function removeEmptyLines(input, replacement = '') {
  return input.replace(/^\s*$/gm, replacement);
}

/**
 * Minifies JavaScript code by removing unnecessary spaces around operators and punctuation,
 * while preserving original indentation, line breaks, and string literals.
 * Assumes all comments have already been removed.
 *
 * Note: If you're debugging the npm package directly in `node_modules`, you can use any IDE
 * to reformat the code and restore all original spacing for easier readability.
 *
 * @param {string} code - The JavaScript source code to minify.
 * @returns {string} - The minified code with preserved structure and formatting.
 */
function minifySpaces(code) {
  let out = '';
  let inString = false;
  let stringChar = '';
  let escape = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const next = code[i + 1];

    // handle strings
    if (inString) {
      out += char;
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    // detect string start
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringChar = char;
      out += char;
      continue;
    }

    // remove spaces before/after these symbols
    const isSpace = char === ' ';
    const isSymbol = /[=+\-*/%<>!?:;,()[\]{}|&^~]/;

    if (isSpace) {
      const prev = out[out.length - 1];
      if (isSymbol.test(prev) || isSymbol.test(next)) {
        continue;
      }
    }

    out += char;
  }

  return out;
}

/**
 * Clean d.ts file content.
 *
 * @param {string} content
 * @return {string}
 */
function clean(content) {
  let out = removeComments(content);
  out = removeEmptyLines(out);
  out = indentSpacesToTabs(out);

  return out;
}

/**
 * Rollup plugin that applies a user transform function to code.
 * @param {(code: string, file: object) => string} transform A function to transform code.
 * @returns {import('rollup').Plugin}
 */
function transform(transform) {
  return {
    name: 'plugin-transform',
    generateBundle(options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && typeof transform === 'function') {
          file.code = transform(file.code, file);
        }
      }
    }
  }
}

function buildConfig({ output, ecma }) {
  return {
    input: 'src/index.js',
    output: {
      file: `${output}/index.cjs`,
      format: 'cjs',
      exports: 'named',
      intro: '',
      strict: false,
      esModule: false,
    },
    plugins: [
      ...(ecma < 2020 ? [babel(babelOptions)] : []),
      terser(terserPrettyOptions(ecma)),
      transform((code) => {
        code = indentSpacesToTabs(code, 2)
          // remove needles destructed variables after terser
          .replaceAll('raw: raw', 'raw')
          .replaceAll('values: values', 'values')
          .replaceAll('alias: alias', 'alias')
          .replaceAll('array: array', 'array')
          .replaceAll('flags: flags', 'flags')
          .replaceAll('offset: offset', 'offset');

        return minifySpaces(code);
      }),
      copy({
        targets: [
          {
            src: 'src/index.mjs',
            dest: `${output}/`,
            transform: async (contents) => (
              await minify(
                // transform the extension of the source file to output .cjs (it will be compiled to CommonJS)
                contents.toString().replace('index.js', 'index.cjs'),
                terserMinifyOptions(ecma)
              )
            ).code,
          },
          {
            src: 'index.d.ts',
            dest: `${output}/`,
            rename: 'index.d.ts',
            transform: (contents) => clean(contents.toString()),
          },
          {
            src: `package.npm.json`,
            dest: `${output}/`,
            rename: 'package.json',
            transform: (contents) => indentSpacesToTabs(contents.toString()),
          },
          { src: `README.npm.md`, dest: `${output}/`, rename: 'README.md' },
          { src: 'LICENSE', dest: `${output}/` },
        ],
      }),
    ],
  };
}

export default [
  buildConfig({ output: 'dist', ecma: 2018 }), // ES9 (ES2018), Node.js 10+
];
