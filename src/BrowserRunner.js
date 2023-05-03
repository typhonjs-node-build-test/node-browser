import path       from 'path';

import fs         from 'fs-extra';
import dotenv     from 'dotenv';
import puppeteer  from 'puppeteer-core';

import polka      from 'polka';
import sirv       from 'sirv';

// console messages from the browser prepended with the below will be forwarded locally.
const s_MOCHA_CONSOLE = '[MOCHA]';

const s_MOCHA_END_STATE = /^\[MOCHA_END/;

const s_MOCHA_PASSED = '[MOCHA_END_PASSED]';

// No default ignore console.
const s_DEFAULT_IGNORE_CONSOLE = [];

export class BrowserRunner
{
   /**
    * Starts `http-server` with a default path of `./test/public` and port 8080. A default URL path of
    * `http://localhost:{port}/` is passed to {@link BrowserRunner#runTestSuite}.
    *
    * @param {RunServerAndTestSuiteOptions}  [opts] - Options to configure http-server and run test suite.
    *
    * @returns {Promise<boolean>}  The testsuite passed state.
    */
   static async runServerAndTestSuite({ root = './test/public', exitOnFail = true, port = 8080, ...options } = {})
   {
      if (typeof root !== 'string') { throw new TypeError(`'root' must be a directory path string.`); }
      if (typeof exitOnFail !== 'boolean') { throw new TypeError(`'exitOnFail' must be a boolean.`); }
      if (!Number.isInteger(port)) { throw new TypeError(`'port' must be an integer.`); }

      // Test suite options are the remaining values. Make sure there is a default url.
      options = Object.assign({ url: `http://localhost:${port}/` }, options);

      // Add any RegExp here to ignore console output from the browser.
      options.ignoreConsole = Array.isArray(options.ignoreConsole) ?
       s_DEFAULT_IGNORE_CONSOLE.concat(options.ignoreConsole) : s_DEFAULT_IGNORE_CONSOLE;

      // Location of your public / server root.
      root = path.resolve(root);

      if (!fs.existsSync(root))
      {
         throw new Error(`Server root path does not exist:\n${root}`);
      }

      // Use Polka & sirv
      const pServer = polka().use(sirv(root)).listen(port, (err) =>
      {
         if (err) { throw err; }
         console.log(`> Ready on localhost:${port}`);
      });

      // Invokes Puppeteer opening a new browser to run the Mocha testsuite outputting the Spec reporter to the console.
      const passed = await BrowserRunner.runTestSuite(options);

      if (pServer.server) { pServer.server.close(); }

      if (exitOnFail && !passed) { process.exit(1); }

      return passed;
   }

   /**
    * Starts Puppeteer and navigates to URL then sets up console monitoring for the output from
    * `./lib/mochaConsoleLog.js`. When it receives `[MOCHA_END_PASSED] or `[MOCHA_END_FAILED]` all resource closing is
    * handled and a Promise resolves with the pass or fail state for the test suite.
    *
    * Please see options available in {@link TestSuiteOptions} to control Puppeteer and the coverage gathering.
    *
    * @param {TestSuiteOptions} options to control Puppeteer and test coverage gathering.
    *
    * @returns {Promise<boolean>} The result of the Mocha test suite execution (pass / fail).
    */
   static async runTestSuite({ url, emptyCoverage = true, headless = true, keepAlive = false, puppeteerOptions = {},
    ignoreConsole = [], onlyMocha = false, coverageGlobal = '__coverage__', reportDir = './coverage',
     pageConsole = void 0 })
   {
      if (typeof url !== 'string') { throw new TypeError(`'url' must be a string.`); }
      if (typeof emptyCoverage !== 'boolean') { throw new TypeError(`'emptyCoverage' must be a boolean.`); }
      if (typeof headless !== 'boolean') { throw new TypeError(`'headless' must be a boolean.`); }
      if (typeof keepAlive !== 'boolean') { throw new TypeError(`'keepAlive' must be a boolean.`); }
      if (typeof puppeteerOptions !== 'object') { throw new TypeError(`'puppeteerOptions' must be an object.`); }
      if (!Array.isArray(ignoreConsole)) { throw new TypeError(`'ignoreConsole' must be an array.`); }
      if (typeof onlyMocha !== 'boolean') { throw new TypeError(`'onlyMocha' must be a boolean.`); }
      if (typeof coverageGlobal !== 'string') { throw new TypeError(`'coverageGlobal' must be a string.`); }
      if (typeof reportDir !== 'string') { throw new TypeError(`'reportDir' must be a string.`); }
      if (pageConsole !== void 0 && typeof pageConsole !== 'function')
      {
         throw new TypeError(`'pageConsole' must be a function.`);
      }

      fs.ensureDirSync('./.nyc_output');
      fs.emptyDirSync('./.nyc_output');

      fs.ensureDirSync(reportDir);

      if (emptyCoverage) { fs.emptyDirSync(reportDir); }

      // Load Puppeteer environment variables from `./env/puppeteer.env`:
      // process.env.PUPPETEER_BIN
      // process.env.PUPPETEER_HEADLESS
      const env = dotenv.config({ path: `.${path.sep}env${path.sep}puppeteer.env` });

      if (env.error)
      {
         throw new Error(`${env.error.message}\nPlease provide a dotenv configuration file: ./env/puppeteer.env`);
      }

      if (typeof process.env.PUPPETEER_BIN !== 'string')
      {
         throw new Error(`Please define 'PUPPETEER_BIN' in dotenv configuration file: ./env/puppeteer.env`);
      }

      const executablePath = process.env.PUPPETEER_BIN;

      if (!fs.existsSync(executablePath))
      {
         throw new Error(`Could not locate Chrome binary path:\n${executablePath}`);
      }

      headless = typeof process.env.PUPPETEER_HEADLESS === 'string' ? process.env.PUPPETEER_HEADLESS === 'true' :
       headless;

      const options = Object.assign({
         executablePath,
         headless
      }, puppeteerOptions);

      const browser = await puppeteer.launch(options);

      const page = await browser.newPage();

      const ignoreConsoleMsg = [s_MOCHA_END_STATE].concat(ignoreConsole);

      // If there is a page console listener function then add it to the page.
      if (pageConsole) { page.on('console', pageConsole); }

      page.on('console', async (msg) =>
      {
         const text = msg.text();

         for (const ignoreMsg of ignoreConsoleMsg)
         {
            if (text.match(ignoreMsg)) { return; }
         }

         // Parse arguments to properly log warnings with string substitution.
         const args = await Promise.all(msg.args().map((arg) => arg.jsonValue()));

         // Only log console output that has arguments.
         if (args.length)
         {
            // If onlyMocha logging is enabled and first arg doesn't match s_MOCHA_CONSOLE then exit early.
            if (onlyMocha && args[0] !== s_MOCHA_CONSOLE) { return; }

            // Remove the mocha console log identifier if any.
            if (args[0] === s_MOCHA_CONSOLE) { args.shift(); }

            const type = msg.type();

            console[type === 'warning' ? 'warn' : type](...args);
         }
      });

      const finishTestSuite = waitForMessage(page, s_MOCHA_END_STATE);

      // Navigate to page
      await page.goto(url, { waitUntil: 'load' });

      const mochaEndState = await finishTestSuite;

      const coverage = await page.evaluate(new Function(`return window.${coverageGlobal}`));

      if (coverage !== void 0)
      {
         fs.writeJsonSync(`./.nyc_output/out.json`, coverage);
      }

      // Potentially await for ctrl-c to be pressed
      if (keepAlive) { await s_STDIN_LATCH(); }

      await browser.close();

      return s_MOCHA_PASSED === mochaEndState;
   }
}

/**
 * Wait for console message from the given Puppeteer page.
 *
 * @param {object}         page - Puppeteer page.
 *
 * @param {string|RegExp}  ack - Text to match to resolve Promise.
 *
 * @param {string|RegExp}  [nak] - Text to match to reject Promise.
 *
 * @returns {Promise<string>} Text matching ack / nak condition.
 */
export async function waitForMessage(page, ack, nak)
{
   return new Promise((resolve, reject) =>
   {
      const handler = (msg) =>
      {
         const text = msg.text();

         const ackMatch = text.match(ack);

         if (ackMatch)
         {
            page.removeListener('console', handler);
            resolve(text);
         }

         if (nak)
         {
            const nakMatch = text.match(nak);

            if (nakMatch)
            {
               page.removeListener('console', handler);
               reject(text);
            }
         }
      };

      page.on('console', handler);
   });
}

/**
 * Adds a process.stdin latch to wait for ctrl-c to be pressed to exit.
 */
const s_STDIN_LATCH = async () =>
{
   process.stdout.write('Hit `ctrl-c` to exit.\n');

   return new Promise((resolve) =>
   {
      const stdin = process.stdin;

      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      const latch = (key) =>
      {
         // ctrl-c ( end of text )
         if (key === '\u0003')
         {
            stdin.off('data', latch);
            stdin.pause();
            resolve();
         }
      };

      stdin.on('data', latch);
   });
};

/**
 * @typedef {object} RunServerAndTestSuiteOptions
 *
 * @property {string}               [root=./test/public] The local server directory root.
 *
 * @property {number}               [port=8080] The port for the server.
 *
 * @property {string}               [url=http://localhost:8080/] URL to load which contains a Mocha test instrumented
 *                                                               with `./lib/mochaConsoleLog.js`.
 *
 * @property {boolean}              [exitOnFail=true] If exitOnFail when a testsuite fails `process.exit(1)` is invoked.
 *
 * @property {boolean}              [emptyCoverage=true] Empties the coverage directories `./.nyc_output` and
 *                                                       `./coverage`.
 *
 * @property {boolean}              [headless=true] Launch the local browser headless.
 *
 * @property {object}               [puppeteerOptions] Options passed onto Puppeteer browser creation.
 *
 * @property {Array<string|RegExp>} [ignoreConsole] An optional array of strings or RegExp to match against console
 *                                                  output from the browser which is then ignored and not output
 *                                                  locally.
 *
 * @property {boolean}              [onlyMocha=false] When true the console output from the browser during test suite
 *                                                    execution will be limited to just Mocha runner statements.
 *
 * @property {string}               [reportDir=./coverage] Where the NYC reportDir is configured.
 *
 * @property {string}               [coverageGlobal=__coverage__] The Istanbul window global variable to attempt to read
 *                                                                and save in `./.nyc_output` after tests have run.
 *
 * @property {Function}             [pageConsole] A function that is attached to the Puppeteer `page` console
 *                                                output. Receive and react to any custom directives from the browser.
 */

/**
 * @typedef {object} TestSuiteOptions
 *
 * @property {string}               url URL to load which contains a Mocha test instrumented with
 *                                      `./lib/mochaConsoleLog.js`.
 *
 * @property {boolean}              [emptyCoverage=true] Empties the coverage directories `./.nyc_output` and
 *                                                       `./coverage`.
 *
 * @property {boolean}              [headless=true] Launch the local browser headless.
 *
 * @property {object}               [puppeteerOptions] Options passed onto Puppeteer browser creation.
 *
 * @property {Array<string|RegExp>} [ignoreConsole] An optional array of strings or RegExp to match against console
 *                                                  output from the browser which is then ignored and not output
 *                                                  locally.
 *
 * @property {boolean}              [onlyMocha=false] When true the console output from the browser during test suite
 *                                                    execution will be limited to just Mocha runner statements.
 *
 * @property {string}               [reportDir=./coverage] Where the NYC reportDir is configured.
 *
 * @property {boolean}              [keepAlive=false] If true a process.stdin latch will be added to wait for `ctrl-c`
 *                                                    pressed to complete the testsuite run finish.
 *
 * @property {string}               [coverageGlobal=__coverage__] The Istanbul window global variable to attempt to read
 *                                                                and save in `./.nyc_output` after tests have run.
 *
 * @property {Function}             [pageConsole] A function that is attached to the Puppeteer `page` console
 *                                                output. Receive and react to any custom directives from the browser.
 */
