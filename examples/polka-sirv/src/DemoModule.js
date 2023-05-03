/**
 * Provides a trivial demo example of a class.
 */
export default class DemoModule
{
   /**
    * Trivial example of adding two variables.
    *
    * @param {number}   a - First number
    * @param {number}   b - Second number
    *
    * @returns {number} A + B
    */
   addTwo(a, b)
   {
      if (typeof a !== 'number') { throw new TypeError(`'a' is not a number.`); }
      if (typeof b !== 'number') { throw new TypeError(`'b' is not a number.`); }

      return a + b;
   }

   /**
    * Trivial example of adding two variables via a synthetic async / Promise w/ artificial delay.
    * Used to demonstrate `chai-as-promised`.
    *
    * @param {number}   a - First number
    * @param {number}   b - Second number
    *
    * @returns {number} A + B
    */
   async addTwoAsync(a, b)
   {
      if (typeof a !== 'number') { throw new TypeError(`'a' is not a number.`); }
      if (typeof b !== 'number') { throw new TypeError(`'b' is not a number.`); }

      // Artificial delay of 500ms.
      await new Promise((resolve) => setTimeout(resolve, 500));

      return a + b;
   }
}
