import { BrowserRunner } from '@typhonjs-build-test/node-browser';

// Empty / copy test fixtures to web server root if necessary (import fs-extra above)
// fs.ensureDirSync('./test/public/fixture');
// fs.emptyDirSync('./test/public/fixture');
// fs.copySync('./test/fixture', './test/public/fixture');

/**
 * Provides the main async execution function
 *
 * @returns {Promise<void>} A Promise
 */
async function main()
{
   await BrowserRunner.runServerAndTestSuite({
      reportDir: './coverage-browser',
      // keepAlive: true   // Uncomment to keep HTTP server alive / useful for testing other browsers.
   });
}

main().catch((err) =>
{
   console.log(err);
   process.exit(1);
});
