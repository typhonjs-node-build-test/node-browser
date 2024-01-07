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
declare function waitForMessage(page: object, ack: string | RegExp, nak?: string | RegExp): Promise<string>;
declare class BrowserRunner {
    /**
     * Starts `http-server` with a default path of `./test/public` and port 8080. A default URL path of
     * `http://localhost:{port}/` is passed to {@link BrowserRunner#runTestSuite}.
     *
     * @param {RunServerAndTestSuiteOptions}  [opts] - Options to configure http-server and run test suite.
     *
     * @returns {Promise<boolean>}  The testsuite passed state.
     */
    static runServerAndTestSuite({ root, exitOnFail, port, ...options }?: RunServerAndTestSuiteOptions): Promise<boolean>;
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
    static runTestSuite({ url, emptyCoverage, headless, keepAlive, puppeteerOptions, ignoreConsole, onlyMocha, coverageGlobal, reportDir, pageConsole }: TestSuiteOptions): Promise<boolean>;
}
type RunServerAndTestSuiteOptions = {
    /**
     * The local server directory root.
     */
    root?: string;
    /**
     * The port for the server.
     */
    port?: number;
    /**
     * ://localhost:8080/] URL to load which contains a Mocha test instrumented
     *                     with `./lib/mochaConsoleLog.js`.
     */
    url?: string;
    /**
     * If exitOnFail when a testsuite fails `process.exit(1)` is invoked.
     */
    exitOnFail?: boolean;
    /**
     * Empties the coverage directories `./.nyc_output` and
     *  `./coverage`.
     */
    emptyCoverage?: boolean;
    /**
     * Launch the local browser headless.
     */
    headless?: boolean;
    /**
     * Options passed onto Puppeteer browser creation.
     */
    puppeteerOptions?: object;
    /**
     * An optional array of strings or RegExp to match against console
     *  output from the browser which is then ignored and not output
     *  locally.
     */
    ignoreConsole?: Array<string | RegExp>;
    /**
     * When true the console output from the browser during test suite
     *  execution will be limited to just Mocha runner statements.
     */
    onlyMocha?: boolean;
    /**
     * Where the NYC reportDir is configured.
     */
    reportDir?: string;
    /**
     * The Istanbul window global variable to attempt to read
     *  and save in `./.nyc_output` after tests have run.
     */
    coverageGlobal?: string;
    /**
     * A function that is attached to the Puppeteer `page` console
     *  output. Receive and react to any custom directives from the browser.
     */
    pageConsole?: Function;
};
type TestSuiteOptions = {
    /**
     * URL to load which contains a Mocha test instrumented with
     * `./lib/mochaConsoleLog.js`.
     */
    url: string;
    /**
     * Empties the coverage directories `./.nyc_output` and
     *  `./coverage`.
     */
    emptyCoverage?: boolean;
    /**
     * Launch the local browser headless.
     */
    headless?: boolean;
    /**
     * Options passed onto Puppeteer browser creation.
     */
    puppeteerOptions?: object;
    /**
     * An optional array of strings or RegExp to match against console
     *  output from the browser which is then ignored and not output
     *  locally.
     */
    ignoreConsole?: Array<string | RegExp>;
    /**
     * When true the console output from the browser during test suite
     *  execution will be limited to just Mocha runner statements.
     */
    onlyMocha?: boolean;
    /**
     * Where the NYC reportDir is configured.
     */
    reportDir?: string;
    /**
     * If true a process.stdin latch will be added to wait for `ctrl-c`
     *  pressed to complete the testsuite run finish.
     */
    keepAlive?: boolean;
    /**
     * The Istanbul window global variable to attempt to read
     *  and save in `./.nyc_output` after tests have run.
     */
    coverageGlobal?: string;
    /**
     * A function that is attached to the Puppeteer `page` console
     *  output. Receive and react to any custom directives from the browser.
     */
    pageConsole?: Function;
};

export { BrowserRunner, type RunServerAndTestSuiteOptions, type TestSuiteOptions, waitForMessage };
