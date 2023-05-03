## @typhonjs-utils/build-test-browser

[![NPM](https://img.shields.io/npm/v/@typhonjs-utils/build-test-browser.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-utils/build-test-browser)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-utils/build-test-browser/blob/main/LICENSE)

Provides a single module collecting all build / test resources for Node & browser testing TyphonJS modules. This tooling assists 
in making dual browser / Node ESM packages.

In addition to providing the necessary dependencies this module also has browser test runner code which streamlines 
testing including:

- Run the same testsuite on Node and in the browser.
- Streamlined execution setup for the common use cases.  
- Connecting Mocha in the browser using the default spec reporter to output results in Node console just like if the
  tests were being executed locally in Node itself.
- Ability to send messages from the browser testsuite to Node context / useful w/ Snowpack and HMR testing, etc.  
- `polka` and `sirv` provide a minimal dependency static web server.
- `nyc` and `rollup-plugin-istanbul` to instrument and create coverage reports w/ source maps.
- `puppeteer-core` to control headless Chrome / Chromium.

More details and full API overview on the way shortly.

There are two examples located in `./examples`
- `polka-sirv` is the standard static code example.
- `snowpack` provides an HMR update example controlled by the testsuite executing in the browser.

Clone the repo and run `npm install` in either example directory. 
- `npm run test-node` to run the testsuite on Node.
- `npm run test-browser` to run the testsuite in the browser. 

In each example directory there is an `env` directory w/ `puppeteer.env`. You must set 
`PUPPETEER_BIN` to the Chrome executable for your system. Right now the default is set for MacOS.

-----

Add this module as a `devDependency` and the following modules are added:

- [@rollup/plugin-node-resolve@13.0.0](https://www.npmjs.com/package/@rollup/plugin-node-resolve) 
- [@typhonjs-build-test/testsuite-runner@0.0.4](https://www.npmjs.com/package/@typhonjs-build-test/testsuite-runner) 
- [@typhonjs-utils/build-test@0.1.4](https://www.npmjs.com/package/@typhonjs-utils/build-test) 
- [nyc@15.1.0](https://www.npmjs.com/package/nyc)
- [polka@0.5.2](https://www.npmjs.com/package/polka)
- [puppeteer-core@8.0.0](https://www.npmjs.com/package/puppeteer-core)
- [rollup-plugin-istanbul@3.0.0](https://www.npmjs.com/package/sirv)
- [sirv@1.0.11](https://www.npmjs.com/package/sirv)
