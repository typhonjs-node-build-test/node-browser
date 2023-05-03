export function run({Module, data, chai})
{
   const { expect } = chai;
   const DemoModule = Module.default;

   describe(`API Errors (${data.scopedName})`, () =>
   {
      let demoModule;

      beforeEach(() =>
      {
         demoModule = new DemoModule();
      });

      it(`addTwo - 'a' is not a number`, () =>
      {
         expect(() => demoModule.addTwo(false, 1)).to.throw(TypeError, `'a' is not a number.`);
      });

      it(`addTwo - 'b' is not a number`, () =>
      {
         expect(() => demoModule.addTwo(1, false)).to.throw(TypeError, `'b' is not a number.`);
      });

      it(`addTwoAsync - 'a' is not a number`, async () =>
      {
         await expect(demoModule.addTwoAsync(false, 1)).to.be.rejectedWith(TypeError, `'a' is not a number.`);
      });

      it(`addTwoAsync - 'b' is not a number`, async () =>
      {
         await expect(demoModule.addTwoAsync(1, false)).to.be.rejectedWith(TypeError, `'b' is not a number.`);
      });
   });
}
