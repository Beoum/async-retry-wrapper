'use strict';

/**
 * @private check function type
 *
 * @param {Function} func function
 */
const _isAsyncFunction = func => func.constructor.name === 'AsyncFunction';

/**
 * @private check object type
 *
 * @param {Object} obj object
 */
const _isObject = obj => typeof obj === 'object' && !Array.isArray(obj);
const _isNotObject = obj => !_isObject(obj);

/**
 * @private check function
 *
 * @param {Function} func function
 */
const _isFunction = func => typeof func === 'function';
const _isNotFunction = func => !_isFunction(func);

/**
 * @private make logger when error occur
 *
 * @param {String} functionName
 * @param {Number} retryCount
 */
const _makeRetryLogger = (functionName, retryCount) => {
    return (currentCount, err) => {
        return console.error(`Retry Max#${retryCount} Current#${currentCount} #${functionName} after ${err}`);
    };
};

/**
 * @private retry delay rule
 *
 * @param {Number} delay time, milliseconds
 */
const _delay = delay => new Promise(resolve => {
    setTimeout(resolve, delay);
});

/**
 * @private default retry skip rule
 *
 * @param {Error} err
 */
const _makeDefaultRetrySkipRule = err => !(err instanceof Error);

/**
 * @private make retry option with validation
 *
 * @param {Object} options
 * @param {Number} options.count retry count
 * @param {Number} options.interval retry interval
 * @param {Function} options.rule retry skip rule
 * @param {Function} options.errorLogger retry error logger
 */
const _makeValidRetryOption = (options) => {
    const { rule, count, errorLogger, interval } = options;

    if (_isNotFunction(rule)) {
        throw new Error('rule is must be function');
    }
    if (!Number.isInteger(count) || count < 1) {
        throw new Error('count is must be greater 0');
    }
    if (_isNotFunction(errorLogger)) {
        throw new Error('errorLogger is must be function');
    }
    if (!Number.isInteger(interval)) {
        throw new Error('interval is must be integer');
    }

    return {
        rule,
        count,
        interval,
        errorLogger,
    };
};

/**
 * set default option
 *
 * @param {Object} [options]
 * @param {Number} [options.count] retry count
 * @param {Number} [options.interval] retry interval
 * @param {Function} [options.rule] retry skip rule
 * @param {Function} [options.errorLogger] retry logger
 * @param {String} name function name
 */
const _makeDefaultOptions = (options, name) => {
    const count = options?.count ?? 1;
    return {
        count,
        interval: options?.interval ?? 0,
        rule: options?.rule ?? _makeDefaultRetrySkipRule,
        errorLogger: _makeRetryLogger(name, count),
    };
};

/**
 * @private functions validator
 *
 * @param {Object} functions
 */
const _validFunctions = (functions) => {
    if (_isNotObject(functions)) {
        throw new Error('functions is must be object');
    }

    const targetFunctions = Object.values(functions);
    if (!targetFunctions.every(_isAsyncFunction)) {
        throw new Error('function is must be async');
    }
    if (targetFunctions.length === 0) {
        throw new Error('functions is not must be empty');
    }
};

/**
 * @private functions validator
 *
 * @param {Object} options
 */
const _validOptions = (options) => {
    if (!!options && _isNotObject(options)) {
        throw new Error('options is must be object');
    }
};

/**
 * @private function wrapping
 *
 * @param {Function} func the function want to call
 * @param {Number} currentCount current retry count
 * @param {Object} option retry option
 */
const _call = async (func, currentCount, option) => {
    return func()
        .catch((err) => {
            currentCount++;

            if (option.rule(err) || currentCount > option.count) {
                throw err;
            }

            option.errorLogger(currentCount, err);

            return _delay(option.interval)
                .then(() => _call(func, currentCount, option));
        });
};

/**
 * function retry wrapper
 *
 * @param {Object} functions
 * @param {Object} [options]
 * @param {Number} [options.count] additional retry count, default: 1
 * @param {Number} [options.interval] retry interval, default: 0 ms
 * @param {Function} [options.rule] retry skip rule, default: occur error
 */
const retryWrapper = (functions, options) => {
    _validFunctions(functions);
    _validOptions(options);

    return Object.keys(functions)
        .reduce((result, name) => {
            const func = functions[name];
            const setOptions = _makeDefaultOptions(options, name);
            const option = _makeValidRetryOption(setOptions);

            result[name] = async (...args) => {
                return _call(func.bind(null, ...args), 0, option);
            };

            return result;
        }, {});
};

module.exports = retryWrapper;