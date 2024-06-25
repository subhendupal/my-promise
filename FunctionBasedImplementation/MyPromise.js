const STATE = {
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
    PENDING: "pending",
}

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

    try {
        executor(resolve, reject)
    } catch (error) {
        reject(error)
    }

    this.then = (onFulfilled, onRejected) => {
        onFulfilled = (typeof onFulfilled === 'function') ? onFulfilled : value => value
        onRejected = (typeof onRejected === 'function') ? onRejected : reason => { throw reason }
    
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

    this.catch = function (onRejected) {
        return this.then(null, onRejected)
    }
    
    this.finally = function (callback) {
        return this.then(
            value => MyPromise.resolve(callback()).then(() => value),
            reason => MyPromise.resolve(callback()).then(() => { throw reason })
        )
    }

}

MyPromise.resolve = function (value) {
    if (value instanceof MyPromise) {
        return value
    }

    return new MyPromise(resolve => resolve(value))
}

MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => reject(reason))
}

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

MyPromise.race = function (promises) {
    return new MyPromise((resolve, reject) => {
        promises.forEach(promise => {
            MyPromise.resolve(promise).then(resolve, reject)
        })
    })
}

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

module.exports = MyPromise
