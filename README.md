# async-retry-wrapper

## Documentation
Retry wrapper for async function.

## Installation
```sh
$ npm install async-retry-wrapper
```

### Javascript
```js
const retryWrapper = require('async-retry-wrapper');
```

### Typescript
```ts
import * as retryWrapper from 'async-retry-wrapper';
```

## Usage
### functions
An object consisting of an async function may be used.
If it is not an async function, an error occurs.
```javascript
const retryWrapper = require('async-retry-wrapper');

const functions = {
    logger: async () => {
        console.log('hello world!!');
    },
};

const wrappedFunctions = retryWrapper(functions);
```

### option
You can also change the retry settings if you want(If there is no parameter, it operates as Default).

There are a total of three options.
* options
  * count : How many times are you going to try again?
    * default: 1
  * interval: How often will you try again?, 0 means as quickly as possible.
    * default: 0 (milliseconds)
  * rule: When are you gonna stop trying again?, Only one parameter is error.
    * default: Retry if an error occurs
  * logging: Do you need a log for retries?
    * default: false

The example is an option to retry twice more at 100 ms intervals when the response status is not 500.
```javascript
const retryWrapper = require('async-retry-wrapper');

const options = {
    count: 2,
    interval: 100, 
    // If the response status code is not 500, the retry will be stopped
    rule: err => err.status !== 500,
    logging: true,
};

const wrappedFunctions = retryWrapper(someFunObject, options);
```

### Demo
```javascript
// import library
const retryWrapper = require('async-retry-wrapper');

// test object to be wrapped
const testFunctions = {
    logAndThrow: async () => {
        console.log('welcome');
        throw new Error('with occur error!');
    },
    log: async () => {
        console.log('hello world!');
    },
};

// wrapping object
const wrappedFunctions = retryWrapper(testFunctions);

// now you can see the function retries
wrappedFunctions['logAndThrow']();
```


## License

[MIT License](https://andreasonny.mit-license.org/2019)
