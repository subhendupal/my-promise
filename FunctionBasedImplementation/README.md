# my-promise
Function Based Polyfill for JavaScript Promise

### Constants

```javascript
const STATE = {
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
    PENDING: "pending",
}
```

This constant `STATE` is used to define the possible states of a promise: `PENDING`, `FULFILLED`, and `REJECTED`.

### MyPromise Constructor

```javascript
function MyPromise(executor) {
    this.state = STATE.PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
        if (this.state === STATE.PENDING) {
            this.state = STATE.FULFILLED
            this.value = value
            this.onFulfilledCallbacks.forEach(callback => callback())
        }
    }

    const reject = (reason) => {
        if (this.state === STATE.PENDING) {
            this.state = STATE.REJECTED
            this.reason = reason
            this.onRejectedCallbacks.forEach(callback => callback())
        }
    }

    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }
}
```

1. **Properties Initialization:**
   - `state`: Initializes the promise state to `PENDING`.
   - `value`: Will hold the resolved value once the promise is fulfilled.
   - `reason`: Will hold the rejection reason once the promise is rejected.
   - `onFulfilledCallbacks`: An array to store `then` callbacks to be executed when the promise is fulfilled.
   - `onRejectedCallbacks`: An array to store `then` callbacks to be executed when the promise is rejected.

2. **`resolve` Function:**
   - If the promise is still in the `PENDING` state, it changes the state to `FULFILLED` and sets the value.
   - Executes all stored `onFulfilledCallbacks`.

3. **`reject` Function:**
   - If the promise is still in the `PENDING` state, it changes the state to `REJECTED` and sets the reason.
   - Executes all stored `onRejectedCallbacks`.

4. **Executor Execution:**
   - The `executor` function (passed to the promise) is immediately invoked with `resolve` and `reject` as arguments.
   - If the executor throws an error, the promise is rejected with that error.

### `resolvePromise` Function

```javascript
const resolvePromise = (promise, x, resolve, reject) => {
    if (promise === x) {
        return reject(new TypeError('Chaining cycle detected for promise'))
    }

    if (x && (typeof x === 'object' || typeof x === 'function')) {
        let used
        try {
            const then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (used) return
                    used = true
                    resolvePromise(promise, y, resolve, reject)
                }, r => {
                    if (used) return
                    used = true
                    reject(r)
                })
            } else {
                if (used) return
                used = true
                resolve(x)
            }
        } catch (e) {
            if (used) return
            used = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}
```

- **Purpose:** Handles the resolution of promises, especially when dealing with nested or returned promises to ensure correct chaining and avoiding circular references.
- **Checks for Cyclic Reference:** If the promise and the resolved value are the same object, it rejects with a `TypeError`.
- **Thenable Check:** If `x` is an object or function, it attempts to use the `then` method of `x`.
  - If `then` is a function, it calls `then` with `x` as its context, recursively resolving if `y` is a promise or value.
  - If an error is thrown, it rejects the promise with the error.

### `then` Method

```javascript
MyPromise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const promise = new MyPromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
            setTimeout(() => {
                try {
                    const x = onFulfilled(this.value)
                    resolvePromise(promise, x, resolve, reject)
                } catch (error) {
                    reject(error)
                }
            })
        } else if (this.state === 'rejected') {
            setTimeout(() => {
                try {
                    const x = onRejected(this.reason)
                    resolvePromise(promise, x, resolve, reject)
                } catch (error) {
                    reject(error)
                }
            })
        } else {
            this.onFulfilledCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value)
                        resolvePromise(promise, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            })
            this.onRejectedCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)
                        resolvePromise(promise, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        }
    })

    return promise
}
```

- **Default Handlers:** If `onFulfilled` or `onRejected` are not functions, default handlers are provided.
- **Promise Creation:** Creates a new `MyPromise` instance, which will be returned by the `then` method to allow chaining.
- **State Handling:**
  - If the promise is `fulfilled`, the `onFulfilled` callback is executed asynchronously using `setTimeout`.
  - If the promise is `rejected`, the `onRejected` callback is executed asynchronously using `setTimeout`.
  - If the promise is still `pending`, the callbacks are stored in `onFulfilledCallbacks` or `onRejectedCallbacks` arrays to be executed when the state changes.

### `catch` Method

```javascript
MyPromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
}
```

- This method is a shortcut for `.then(null, onRejected)`, allowing handling of rejected promises without handling the fulfilled state.

### `finally` Method

```javascript
MyPromise.prototype.finally = function (callback) {
    return this.then(
        value => MyPromise.resolve(callback()).then(() => value),
        reason => MyPromise.resolve(callback()).then(() => { throw reason })
    )
}
```

- The `finally` method allows execution of a callback regardless of the promise's outcome.
- The callback is executed, and the original value or reason is passed through.

### Static Methods

#### `resolve`

```javascript
MyPromise.resolve = function (value) {
    if (value instanceof MyPromise) {
        return value
    }
    return new MyPromise(resolve => resolve(value))
}
```

- Returns a `MyPromise` that is resolved with the given value.
- If the value is already a `MyPromise`, it returns the value itself.

#### `reject`

```javascript
MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => reject(reason))
}
```

- Returns a `MyPromise` that is rejected with the given reason.

#### `all`

```javascript
MyPromise.all = function (promises) {
    return new MyPromise((resolve, reject) => {
        let resolvedCounter = 0
        const resolvedValues = []

        promises.forEach((promise, index) => {
            MyPromise.resolve(promise).then(value => {
                resolvedCounter++
                resolvedValues[index] = value
                if (resolvedCounter === promises.length) {
                    resolve(resolvedValues)
                }
            }, reject)
        })
    })
}
```

- Returns a `MyPromise` that resolves when all of the promises in the iterable have resolved, or rejects if any of the promises reject.
- Resolves with an array of the resolved values in the same order as the input promises.

#### `allSettled`

```javascript
MyPromise.allSettled = (promises) => {
    const results = []
    let completedPromises = 0

    return new MyPromise((resolve) => {
        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            promise.then((value) => {
                results[i] = { status: STATE.FULFILLED, value }
            }).catch((reason) => {
                results[i] = { status: STATE.REJECTED, reason }
            }).finally(() => {
                completedPromises++
                if (completedPromises === promises.length)
                    resolve(results)
            })
        }
    })
}
```

- Returns a `MyPromise` that resolves after all of the given promises have either resolved or rejected, with an array of objects describing the outcome of each promise.

#### `race`

```javascript
MyPromise.race = function (promises) {
    return new MyPromise((resolve, reject) => {
        promises.forEach(promise => {
            MyPromise.resolve(promise).then(resolve, reject)
        })
    })
}
```

- Returns a `MyPromise` that resolves or rejects as soon as one of the promises in the iterable resolves or rejects.

#### `any`

```javascript
MyPromise.any = (promises) => {
    const errors = []
    let rejectedPromises = 0

    return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            const promise = promises[i]
            promise.then(resolve).catch((value) => {
                rejectedPromises++
                errors[i] = value
                if (rejectedPromises === promises.length)
                    reject(new AggregateError(errors, "All promises were rejected."))
            })
        }
    })
}
```

- Returns a new `MyPromise` which resolves as soon as one of the input promises resolves, or rejects if all input promises are rejected.


