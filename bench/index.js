const { Suite } = require('benchmark');

console.log('Load Times:');

console.time('nopt');
const nopt = require('nopt');
console.timeEnd('nopt');

console.time('yargs-parser');
const yargs = require('yargs-parser');
console.timeEnd('yargs-parser');

console.time('minimist');
const minimist = require('minimist');
console.timeEnd('minimist');

console.time('mri');
const mri = require('mri');
console.timeEnd('mri');

console.time('flaget');
const flaget = require('flaget2');
console.timeEnd('flaget');

console.log('\nBenchmark:');
const bench = new Suite();
const args = ['-b', '--bool', '--no-meep', '--multi=baz'];

bench.
  add('mri          ', () => mri(args)).
  add('flaget       ', () => flaget({ raw: args })).
  add('nopt         ', () => nopt(args)).
  add('minimist     ', () => minimist(args)).
  add('yargs-parser ', () => yargs(args)).
  on('cycle', e => console.log(String(e.target))).
  run();
