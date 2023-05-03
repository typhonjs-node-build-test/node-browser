import { TestsuiteRunner } from '@typhonjs-build-test/testsuite-runner';

import * as APIErrors      from './tests/APIErrors.js';
import * as DemoModule     from './tests/DemoModule.js';

import demoFunctionResult from '../../fixture/demoFunctionResult.js';

// Include any data that could be useful for evaluating in test suite.
const data = {
   name: 'DemoModule',

   demoFunctionResult,

   addTwo: [
      {
         a: 1,
         b: 1,
         result: 2
      },
      {
         a: 2,
         b: 2,
         result: 4
      }
   ]
};

export default new TestsuiteRunner({
   APIErrors,
   DemoModule
}, data);
