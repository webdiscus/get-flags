const usePackage = 'TEST_PACKAGE' in process.env;

if (usePackage) console.log(':: Test built package');
else console.log(':: Test source');

const modulePath = usePackage
  ? 'flaget' // compiled build
  : '../src/index.js'; // source for coverage

export default (await import(modulePath)).default;
