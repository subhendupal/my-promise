# my-promise
Classed Based Polyfill for JavaScript Promise

Certainly! Let's go through the `MyPromise` class step-by-step to understand how it works and what each part does:

### `STATE` Object

```javascript
const STATE = {
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
    PENDING: "pending",
}
```

This constant `STATE` is used to define the possible states of a promise: `PENDING`, `FULFILLED`, and `REJECTED`.

### `MyPromise` Class

```javascript
class MyPromise {
    #thenCallBacks = []
    #catchCallBacks = []
    #state = STATE.PENDING
    #value
    #onSuccessBind = this.#onSuccess.bind(this)
    #onFailBind = this.#onFail.bind(this)

    constructor(callBack) {
        try {
            callBack(this.#onSuccessBind, this.#onFailBind)
        } catch (error) {
            this.#onFail(error)
        }
    }
```

#### Constructor

- **Properties:**
  - `#thenCallBacks`: Array to store `then` callback functions.
  - `#catchCallBacks`: Array to store `catch` callback functions.
  - `#state`: Private variable to track the state (`PENDING`, `FULFILLED`, or `REJECTED`).
  - `#value`: Private variable to store the resolved or rejected value.
  - `#onSuccessBind`, `#onFailBind`: Bound versions of `#onSuccess` and `#onFail` methods.

- **Executor Function (`callBack`):**
  - Accepts `#onSuccessBind` and `#onFailBind` as arguments.
  - Executes the provided `callBack` function asynchronously.
  - Catches any synchronous errors thrown during execution and calls `#onFail` to handle them.

#### Private Methods

```javascript
    #runCallBacks() {
        if (this.#state === STATE.FULFILLED) {
            this.#thenCallBacks.forEach(callBack => {
                callBack(this.#value)
            })
            this.#thenCallBacks = []
        }

        if (this.#state === STATE.REJECTED) {
            this.#catchCallBacks.forEach(callBack => {
                callBack(this.#value)
            })
            this.#catchCallBacks = []
        }
    }

    #onSuccess(value) {
        setTimeout(() => {
            if (this.#state !== STATE.PENDING) return

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind)
                return
            }

            this.#value = value
            this.#state = STATE.FULFILLED
            this.#runCallBacks()
        })
    }

    #onFail(value) {
        setTimeout(() => {
            if (this.#state !== STATE.PENDING) return

            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBind, this.#onFailBind)
                return
            }

            if (this.#catchCallBacks.length === 0) {
                throw new UncaughtPromiseError(value)
            }

            this.#value = value
            this.#state = STATE.REJECTED
            this.#runCallBacks()
        })
    }
```

- **`#runCallBacks()` Method:**
  - Executes all `then` callbacks if the promise is fulfilled (`STATE.FULFILLED`).
  - Executes all `catch` callbacks if the promise is rejected (`STATE.REJECTED`).
  - Clears the respective callback arrays after execution.

- **`#onSuccess(value)` Method:**
  - Handles the resolution (`FULFILLED`) state of the promise.
  - If `value` is a promise, chains its resolution or rejection.
  - Sets `#value` to the resolved value and changes `#state` to `FULFILLED`.
  - Executes `#runCallBacks()` to handle queued callbacks.

- **`#onFail(value)` Method:**
  - Handles the rejection (`REJECTED`) state of the promise.
  - If `value` is a promise, chains its resolution or rejection.
  - Throws an `UncaughtPromiseError` if there are no `catch` handlers registered.
  - Sets `#value` to the rejection reason and changes `#state` to `REJECTED`.
  - Executes `#runCallBacks()` to handle queued callbacks.

#### Public Methods (`then`, `catch`, `finally`)

```javascript
    then(thenCallBack, catchCallBack) {
        return new MyPromise((resolve, reject) => {
            this.#thenCallBacks.push(result => {
                if (thenCallBack == null) {
                    resolve(result)
                    return
                }

                try {
                    resolve(thenCallBack(result))
                } catch (error) {
                    reject(error)
                }
            })

            this.#catchCallBacks.push(result => {
                if (catchCallBack == null) {
                    reject(result)
                    return
                }

                try {
                    resolve(catchCallBack(result))
                } catch (error) {
                    reject(error)
                }
            })

            this.#runCallBacks()
        })
    }

    catch(callBack) {
        return this.then(undefined, callBack)
    }

    finally(callBack) {
        return this.then(
            result => {
                callBack()
                return result
            },
            reason => {
                callBack()
                throw reason
            }
        )
    }
```

- **`then(thenCallBack, catchCallBack)` Method:**
  - Registers `then` and `catch` callback functions.
  - Returns a new `MyPromise` instance that resolves or rejects based on the callbacks.
  - Queues callbacks using `#thenCallBacks` and `#catchCallBacks` arrays.
  - Executes `#runCallBacks()` to process already resolved/rejected promises.

- **`catch(callBack)` Method:**
  - Alias for `then(undefined, callBack)`.
  - Registers a `catch` callback for handling promise rejection.

- **`finally(callBack)` Method:**
  - Executes a callback function regardless of the promise's outcome.
  - Returns a promise that resolves with the original result or rejects with the original reason after executing the `finally` callback.

#### Static Methods (`resolve`, `reject`, `all`, `allSettled`, `race`, `any`)

- **`resolve(value)` and `reject(value)`**
  - Return a new `MyPromise` resolved or rejected with the provided value.

- **`all(promises)` Method:**
  - Returns a promise that resolves when all input promises have resolved, or rejects if any promise rejects.
  - Resolves with an array of resolved values in the same order as the input promises.

- **`allSettled(promises)` Method:**
  - Returns a promise that resolves after all input promises have settled (either resolved or rejected).
  - Resolves with an array of objects describing the outcome (`fulfilled` or `rejected`) of each promise.

- **`race(promises)` Method:**
  - Returns a promise that resolves or rejects as soon as one of the input promises resolves or rejects.
  - Resolves with the value/reason of the first resolved/rejected promise.

- **`any(promises)` Method:**
  - Returns a promise that resolves as soon as one of the input promises resolves.
  - If all promises are rejected, rejects with an `AggregateError` containing all rejection reasons.

### `UncaughtPromiseError` Class

```javascript
class UncaughtPromiseError extends Error {
    constructor(error) {
        super(error)
        this.stack = `(Uncaught error in promise) ${error.stack}`
    }
}
```

- Extends `Error` to create a custom error class for uncaught promise errors.
- Modifies the `stack` trace to indicate the error originated from an unhandled promise rejection.

### Summary

The `MyPromise` class is an implementation of the Promise/A+ specification. It handles asynchronous operations and callbacks, supports chaining, and provides methods for handling resolved and rejected states (`then`, `catch`, `finally`). Static methods (`resolve`, `reject`, `all`, `allSettled`, `race`, `any`) manage collections of promises and provide utility functions for working with promises. This implementation ensures proper handling of synchronous and asynchronous errors, adhering closely to the behavior and requirements of native JavaScript promises.