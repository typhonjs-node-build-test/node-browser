import path          from 'path';

// The deploy path for the distribution for browser & Node.
const s_DIST_PATH_BROWSER = './dist/browser';
const s_DIST_PATH_NODE = './dist/node';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: ['src/index.js'],
         output: [{
            file: `${s_DIST_PATH_NODE}${path.sep}DemoModule.js`,
            format: 'es',
            preferConst: true,
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
            // resolve(),    // If you had @rollup/plugin-node-resolve involved you add it here.
         ]
      },

      // This bundle is for the browser distribution.
      {
         input: ['src/index.js'],
         output: [{
            file: `${s_DIST_PATH_BROWSER}${path.sep}DemoModule.js`,
            format: 'es',
            preferConst: true,
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
           // resolve({ browser: true }),  // @rollup/plugin-node-resolve involved you add it here w/ `browser: true`
         ]
      }
   ];
};
