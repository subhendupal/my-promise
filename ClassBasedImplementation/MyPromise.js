const STATE = {
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
    PENDING: "pending",
}

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

    then(thenCallBack, catchCallBack) {
        return new MyPromise((resolve, reject) => {
            this.#thenCallBacks.push(result => {
                if (thenCallBack == null) {
                    resolve(result)
                    return
                }

                try {
                    resolve(thenCallBack((result)))
                } catch (error) {
                    reject(error)
                }
            })
            this.#catchCallBacks.push((result) => {
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

        //without chaining
        // if (thenCallBack != null) this.#thenCallBacks.push(thenCallBack)
        // if (catchCallBack != null) this.#catchCallBacks.push(catchCallBack)
        // this.#runCallBacks()

    }

    catch(callBack) {
        return this.then(undefined, callBack)
    }

    finally(callBack) {
        return this.then((result) => {
            callBack()
            return result
        }, (result) => {
            callBack()
            throw result
        })
    }

    static resolve(value) {
        return new MyPromise((resolve) => {
            resolve(value)
        })
    }

    static reject(value) {
        return new MyPromise((reject) => {
            reject(value)
        })
    }

    static all(promises) {
        const results = []
        let completedPromises = 0

        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                const promise = promises[i]
                promise.then((value) => {
                    completedPromises++
                    results[i] = value
                    if (completedPromises === promises.length) {
                        resolve(results)
                    }
                }).catch(reject)
            }
        })
    }

    static allSettled(promises) {
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

    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.forEach((promise) => {
                promise.then(resolve).catch(reject)
            })
        })
    }

    static any(promises) {
        const errors = []
        let rejectedPromises = 0;

        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                const promise = promises[i];
                promise.then(resolve).catch((value) => {
                    rejectedPromises++
                    errors[i] = value
                    if (rejectedPromises === promises.length)
                        reject(new AggregateError(errors, "All promises were rejected."))
                })
            }
        })
    }

}

class UncaughtPromiseError extends Error {
    constructor(error) {
        super(error)

        this.stack = `(Uncaught error in promise) ${error.stack}`
    }
}

module.exports = MyPromise