# Mastering Asynchronous JavaScript: From Callbacks to Promises

## Introduction

Asynchronous programming is the backbone of modern JavaScript. Whether you're fetching data from APIs, reading files, or managing timers, understanding async patterns is crucial. This blog explores fundamental async concepts through practical examples from real-world assignments.

---

## Part 1: Understanding Promises

### What is a Promise?

A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value. It's a cleaner alternative to traditional callbacks.

A Promise has three states:
- **Pending**: Initial state, operation hasn't completed yet
- **Resolved**: Operation completed successfully
- **Rejected**: Operation failed

### Concept 1: Creating Simple Delays with `delay(ms, value)`

**The Problem:**
```javascript
function delay(ms, value) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}
```

**What We Learn:**
- **Promise Constructor**: Takes a function with `resolve` and `reject` parameters
- **setTimeout Integration**: Combining timers with Promises
- **Delayed Execution**: How to pause and resume code flow

**Real-World Use:**
```javascript
// Wait 2 seconds, then log a message
delay(2000, "Hello!").then(msg => console.log(msg));
```

**Key Takeaway**: Promises wrap asynchronous operations (like timers) into a manageable interface.

---

### Concept 2: Promise Timeout Pattern with `fetchWithTimeout(url, ms)`

**The Problem:**
```javascript
function fetchWithTimeout(url, ms) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject("Request Timed Out");
        }, ms);
    });
    
    return Promise.race([fetch(url), timeoutPromise]);
}
```

**What We Learn:**
- **Promise.race()**: Returns the result of whichever Promise settles first
- **Timeout Implementation**: Creating a race condition to enforce time limits
- **Error Handling**: Rejecting with meaningful error messages

**How It Works:**
1. Create a timeout Promise that rejects after `ms` milliseconds
2. Race the actual fetch against the timeout
3. If fetch completes first → success
4. If timeout completes first → rejection with timeout message

**Real-World Use:**
```javascript
fetchWithTimeout('https://api.example.com/data', 5000)
    .then(response => console.log("Data received:", response))
    .catch(error => console.log("Error:", error));
```

**Key Takeaway**: `Promise.race()` is perfect for implementing timeout logic and competitive async operations.

---

### Concept 3: Rejecting Promises with `rejectAfter(ms)`

**The Problem:**
```javascript
function rejectAfter(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error(`Rejected after ${ms}ms`)), ms);
    });
}
```

**What We Learn:**
- **Controlled Rejection**: Purposefully rejecting a Promise with an error
- **Error Messages**: Including context in error objects
- **Promise Lifecycle**: Understanding reject as a first-class operation

**Real-World Use:**
```javascript
rejectAfter(3000)
    .catch(error => console.log("Task failed:", error.message));
    // Output after 3 seconds: "Task failed: Rejected after 3000ms"
```

**Key Takeaway**: Rejection is as important as resolution; always provide meaningful error messages.

---

## Part 2: Higher-Order Functions & Closures

### Concept 4: Executing Functions Once with `once(fn)`

**The Problem:**
```javascript
function once(fn) {
    let called = false;
    let result;

    return function(...arg) {
        if(!called) {
            called = true;
            result = fn(...arg);
        }
        return result;
    };
}
```

**What We Learn:**
- **Higher-Order Functions**: Functions that return other functions
- **Closures**: Inner functions capturing outer scope variables
- **State Preservation**: Maintaining state across multiple calls
- **Memoization Pattern**: Caching results to avoid re-execution

**How It Works:**
1. `once()` returns a new function
2. The returned function uses closure to access `called` and `result`
3. First call: executes `fn`, sets `called = true`, stores result
4. Subsequent calls: returns cached result without re-executing

**Real-World Use:**
```javascript
const fetchData = once(async () => {
    const response = await fetch('/api/data');
    return response.json();
});

fetchData(); // Executes the fetch
fetchData(); // Returns same Promise (no new fetch)
fetchData(); // Returns same Promise (no new fetch)
```

**Key Takeaway**: Higher-order functions and closures enable elegant control flow patterns without global state.

---

### Concept 5: Retrying Failed Operations with `retryOnce(fn)`

**The Problem:**
```javascript
function retryOnce(fn) {
    return async function(...args) {
        try {
            return await fn(...args);
        } catch (error) {
            try {
                return await fn(...args);
            } catch (retryError) {
                throw retryError;
            }
        }
    };
}
```

**What We Learn:**
- **Error Handling**: Nested try-catch blocks for multiple attempts
- **Retry Logic**: Automatic retrying on failure
- **Async/Await**: Cleaner syntax than Promise chains for complex flows
- **Error Propagation**: When to catch vs. when to throw

**How It Works:**
1. First attempt in outer try block
2. If it fails, retry once in nested try block
3. If retry also fails, throw the error
4. If either succeeds, return the result

**Real-World Use:**
```javascript
const unreliableAPI = retryOnce(async () => {
    const response = await fetch('/unreliable-api');
    if (!response.ok) throw new Error('API failed');
    return response.json();
});

unreliableAPI(); // Tries once, retries once if fails
```

**Key Takeaway**: Retry logic is essential for handling transient failures in distributed systems.

---

## Part 3: Callback Pattern Conversion

### Concept 6: Converting Callbacks to Promises with `promisify(fn)`

**The Problem:**
```javascript
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (error, data) => {
                if(error) {
                    reject(error)
                } else {
                    resolve(data);
                }
            })
        })
    }
}
```

**What We Learn:**
- **Callback Pattern**: Understanding error-first callbacks (Node.js convention)
- **Promise Wrapper**: Converting callback-based APIs to Promises
- **Error-First Convention**: Why Node.js uses `(err, data)` callback signature
- **Bridge Pattern**: Adapting old code to new patterns

**How It Works:**
1. Takes a callback-based function
2. Returns a function that wraps it in a Promise
3. Calls the original function with a custom callback
4. If callback receives error → reject the Promise
5. If callback receives data → resolve the Promise

**Real-World Use:**
```javascript
// Old callback style (Node.js file system)
fs.readFile('file.txt', (error, data) => {
    if (error) console.error(error);
    else console.log(data);
});

// Convert to Promise
const readFilePromise = promisify(fs.readFile);
readFilePromise('file.txt')
    .then(data => console.log(data))
    .catch(error => console.error(error));
```

**Key Takeaway**: Promisification is essential for modernizing legacy callback-based codebases.

---

## Part 4: Ensuring Async Behavior

### Concept 7: Guaranteeing Promises with `ensureAsync(fn)`

**The Problem:**
```javascript
function ensureAsync(fn) {
    return async (...args) => {
        return await fn(...args);
    };
}
```

**What We Learn:**
- **Async Functions**: Always return Promises, even with synchronous code
- **Mixed Function Types**: Handling both sync and async functions uniformly
- **Error Wrapping**: Synchronous errors become rejected Promises
- **Consistency**: Providing a uniform interface regardless of function type

**How It Works:**
1. Wraps any function in an async function
2. Async functions always return Promises
3. If `fn` is sync and returns value → Promise resolves with value
4. If `fn` is sync and throws → Promise rejects with error
5. If `fn` is async → Promise returns as-is

**Real-World Use:**
```javascript
const syncFn = (x) => x * 2;
const asyncFn = async (x) => x * 2;

const wrappedSync = ensureAsync(syncFn);
const wrappedAsync = ensureAsync(asyncFn);

wrappedSync(5).then(result => console.log(result)); // Promise: 10
wrappedAsync(5).then(result => console.log(result)); // Promise: 10
```

**Key Takeaway**: `ensureAsync` normalizes functions, ensuring they always return Promises for consistent handling.

---

## Part 5: Simple Timer Functions

### Concept 8: Pausing Execution with `sleep(ms)`

**The Problem:**
```javascript
function sleep(millis) {
    return new Promise((resolve) => {
        setTimeout(resolve, millis);
    });
}
```

**What We Learn:**
- **Promise Resolution**: Using Promise to return control after delay
- **Event Loop**: How `setTimeout` and Promises interact
- **Async Sequencing**: Controlling execution order with delays

**Real-World Use:**
```javascript
async function delayedSequence() {
    console.log("Starting...");
    await sleep(2000);
    console.log("2 seconds later!");
    await sleep(1000);
    console.log("1 more second!");
}
```

**Key Takeaway**: `sleep()` with async/await is cleaner than nested callbacks for sequential delays.

---

## Key Concepts Summary

| Concept | Purpose | Pattern |
|---------|---------|---------|
| **Promises** | Manage async operations | Constructor, .then(), .catch() |
| **Promise.race()** | First to settle wins | Timeout implementation |
| **Higher-Order Functions** | Functions returning functions | `once()`, `retry()` |
| **Closures** | Capture outer scope | State preservation |
| **Promisification** | Convert callbacks → Promises | Bridge old/new code |
| **Async/Await** | Cleaner Promise syntax | Try-catch error handling |
| **Error Handling** | Manage failures | Try-catch, .catch() chains |

---

## Best Practices

1. **Always Handle Errors**: Every Promise should have error handling
```javascript
promise.catch(error => console.error("Error:", error));
```

2. **Use Async/Await Over .then()**: More readable for sequential operations
```javascript
// Good
const result = await fetch(url);

// Avoid
fetch(url).then(r => doSomething(r));
```

3. **Create Meaningful Error Messages**: Help with debugging
```javascript
reject(new Error(`Failed after ${attempts} attempts`));
```

4. **Don't Mix Paradigms**: Choose either async/await OR Promise chains consistently
```javascript
// Avoid mixing
async function bad() {
    return await promise.then(x => x).catch(e => e);
}
```

5. **Understand When to Use Promise.race() vs Promise.all()**:
- `race()`: First to settle
- `all()`: All must succeed

---

## Conclusion

Mastering asynchronous JavaScript is a journey through multiple concepts:
- Understanding **Promises** for controlling async flow
- Using **higher-order functions** and **closures** for elegant patterns
- Converting **callbacks to Promises** for modernization
- Combining **error handling** with **retry logic** for robustness
- Leveraging **async/await** for readable code

These assignments form the foundation for building reliable, scalable JavaScript applications. Each concept builds upon the previous, creating a comprehensive understanding of modern async patterns.

---

## Practice Projects

To solidify these concepts:

1. **Build a Request Queue**: Use `PromisePool` to limit concurrent requests
2. **Create a Retry Mechanism**: Implement exponential backoff with `retryWithJitter`
3. **Implement a Cache**: Use closure to store results with `AsyncCache`
4. **Build a Task Scheduler**: Manage priority with `DynamicPriorityQueue`

Happy coding! 🚀
