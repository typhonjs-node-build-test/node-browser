export function run({Module, data, chai})
{
   const { assert } = chai;
   const DemoModule = Module.default;
   const demoFunction = Module.demoFunction;

   describe(`DemoModule (${data.scopedName})`, () =>
   {
      let demoModule;

      beforeEach(() =>
      {
         demoModule = new DemoModule();
      });

      for (const addTwoData of data.addTwo)
      {
         it(`addTwo - ${addTwoData.a} + ${addTwoData.b}`, () =>
         {
            const result = demoModule.addTwo(addTwoData.a, addTwoData.b);

            assert.strictEqual(result, addTwoData.result);
         });

         it(`addTwoAsync - ${addTwoData.a} + ${addTwoData.b}`, async () =>
         {
            const result = await demoModule.addTwoAsync(addTwoData.a, addTwoData.b);

            assert.strictEqual(result, addTwoData.result);
         });
      }
   });

   describe(`demoFunction`, () =>
   {
      it(`result is true`, () =>
      {
         const result = demoFunction();

         assert.isBoolean(result);
         assert.strictEqual(result, data.demoFunctionResult);
      });
   });
}
