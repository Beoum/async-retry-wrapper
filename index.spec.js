const { it, describe } = require('@jest/globals');
const retryWrapper = require('./index');

const DEFAULT_FUNCTIONS = {
    logAndThrow: async () => {
        console.log('hello world!!');
        throw new Error('Occur error');
    },
};
Object.freeze(DEFAULT_FUNCTIONS);

const DEFAULT_FUNCTIONS_KEYS = Object.keys(DEFAULT_FUNCTIONS);

describe('Parameter', () => {
    describe('functions', () => {
        it('If it is not an object, it will fail', () => {
            const functions = [];

            expect(() => {
                retryWrapper(functions);
            }).toThrowError();
        });

        it('If a function other than async is included, it fails', () => {
            const functions = {
                ...DEFAULT_FUNCTIONS,
                notAsyncFunc: () => {
                    console.log('hey~!');
                },
            };

            expect(() => {
                retryWrapper(functions);
            }).toThrowError();
        });

        it('If the object is empty, it will fail', () => {
            const functions = {};

            expect(() => {
                retryWrapper(functions);
            }).toThrowError();
        });
    });

    describe('options', () => {
       it('If the option exists and is not an object, it fails', () => {
           const options = [];

           expect(() => {
               retryWrapper(DEFAULT_FUNCTIONS, options);
           }).toThrowError();
       });

       it('If count is not a number, it fails', () => {
            const options = {
                count: 'test'
            };

            expect(() => {
                retryWrapper(DEFAULT_FUNCTIONS, options);
            }).toThrowError();
       });

       it('If interval is not a number, it fails', () => {
           const options = {
               interval: 'test'
           };

           expect(() => {
               retryWrapper(DEFAULT_FUNCTIONS, options);
           }).toThrowError();
       });

        it('If errorLogger is not a function, it fails', () => {
           const options = {
               errorLogger: 'test'
           };

           expect(() => {
               retryWrapper(DEFAULT_FUNCTIONS, options);
           }).not.toThrowError();
       });

        it('If rule is not a function, it fails', () => {
           const options = {
               rule: 'test'
           };

           expect(() => {
               retryWrapper(DEFAULT_FUNCTIONS, options);
           }).toThrowError();
       });
    });
});

describe('Function', () => {
   it('A function must be generated as many as the number of input functions', () => {
       const wrapped = retryWrapper(DEFAULT_FUNCTIONS);

       expect(DEFAULT_FUNCTIONS_KEYS.length).toEqual(Object.keys(wrapped).length);
   });

   it('The input and output names must be the same', () => {
       const wrapped = retryWrapper(DEFAULT_FUNCTIONS);

       const sameKeys = DEFAULT_FUNCTIONS_KEYS
           .every((key, index) => key === Object.keys(wrapped)[index]);

       expect(sameKeys).toEqual(true);
   });

   it('The default number of retries is 1', async () => {
        const functions = {
            throwFunc: async () =>{
                throw new Error('Occur error');
            },
        };

        const wrapped = retryWrapper(functions);

       let retryCount = 0;
       await wrapped['throwFunc']().catch(() => retryCount++);

       expect(retryCount).toBe(1);
   });

    it('Retry as many times as the number of options', async () => {
        const count = 3;
        let retryCount = -1;
        const functions = {
            throwFunc: async () =>{
                retryCount++;
                throw new Error('Occur error');
            },
        };
        const options = {
            count,
        };

        const wrapped = retryWrapper(functions, options);

        await expect(async () => {
            await wrapped['throwFunc']();
        }).rejects.toThrowError();
        expect(count).toBe(retryCount);
    });

   it('If the skip rule applies, stop requesting again', async () => {
       const errMessage = 'testError!';

       let retryCount = 0;
       const functions = {
           throwFunc: async () => {
               retryCount++;
               throw new Error(errMessage);
           },
       };
       const options = {
           count: 100,
           rule: (err) => err.message === errMessage,
       };
       const wrapped = retryWrapper(functions, options);

       await expect(async () => {
           await wrapped['throwFunc']();
       }).rejects.toThrowError();
       expect(retryCount).toBe(1);
   });
});