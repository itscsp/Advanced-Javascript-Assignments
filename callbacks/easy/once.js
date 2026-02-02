// Problem Description – once(fn)

// You are required to implement a wrapper function named once that accepts an asynchronous function fn.
// The wrapper should ensure that fn is executed only on the first call.
// Any subsequent calls must not re-execute fn and should instead return the same Promise or resolved result from the first invocation.
function once(fn) {
    let called = false;
    let result;

    return function(...arg) {
        if(!called) {
            called = true;
            result = fn(...arg)
        }

        return result;
    };
}

module.exports = once;
