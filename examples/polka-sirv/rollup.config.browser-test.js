import path       from 'path';

// If your project pulls in other NPM modules use `@rollup/plugin-node-resolve`
// If your project needs Babel then include it as well `@rollup/plugin-babel`

import resolve     from '@rollup/plugin-node-resolve'; // To pull in @typhonjs-build-test/testsuite-runner
import istanbul    from 'rollup-plugin-istanbul';      // Adds Istanbul instrumentation.

// The test browser distribution is bundled to `./test/public`.
const s_TEST_BROWSER_PATH = './test/public';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

const relativeTestBrowserPath = path.relative(`${s_TEST_BROWSER_PATH}`, '.');

export default () =>
{
   return [{ // This bundle is for the Istanbul instrumented browser test.
         input: 'src/index.js',
         output: [{
            file: `${s_TEST_BROWSER_PATH}/DemoModule.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: s_SOURCEMAP,
            sourcemapPathTransform: (sourcePath) => sourcePath.replace(relativeTestBrowserPath, `.`)
         }],
         plugins: [
            istanbul()
         ]
      },

      // This bundle is the test suite
      {
         input: ['test/src/runner/TestsuiteRunner.js'],
         output: [{
            file: `${s_TEST_BROWSER_PATH}/TestsuiteRunner.js`,
            format: 'es',
            generatedCode: { constBindings: true },
         }],
         plugins: [
            resolve({ browser: true })
         ]
      }
   ];
};
