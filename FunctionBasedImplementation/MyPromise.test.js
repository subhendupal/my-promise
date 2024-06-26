const MyPromise = require("./MyPromise.js")
// const MyPromise = Promise

const DEFAULT_VALUE = "default"

describe("then", () => {
  it("with no chaining", () => {
    return promise().then(v => expect(v).toEqual(DEFAULT_VALUE))
  })

  it("with multiple thens for same promise", () => {
    const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
    const mainPromise = promise()
    const promise1 = mainPromise.then(checkFunc)
    const promise2 = mainPromise.then(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })

  it("with then and catch", () => {
    const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
    const failFunc = v => expect(1).toEqual(2)
    const resolvePromise = promise().then(checkFunc, failFunc)
    const rejectPromise = promise({ fail: true }).then(failFunc, checkFunc)
    return Promise.allSettled([resolvePromise, rejectPromise])
  })

  it("with chaining", () => {
    return promise({ value: 3 })
      .then(v => v * 4)
      .then(v => expect(v).toEqual(12))
  })
})

describe("catch", () => {
  it("with no chaining", () => {
    return promise({ fail: true }).catch(v => expect(v).toEqual(DEFAULT_VALUE))
  })

  it("with multiple catches for same promise", () => {
    const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
    const mainPromise = promise({ fail: true })
    const promise1 = mainPromise.catch(checkFunc)
    const promise2 = mainPromise.catch(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })

  it("with chaining", () => {
    return promise({ value: 3 })
      .then(v => {
        throw v * 4
      })
      .catch(v => expect(v).toEqual(12))
  })
})

describe("finally", () => {
  it("with no chaining", () => {
    const checkFunc = v => v => expect(v).toBeUndefined()
    const successPromise = promise().finally(checkFunc)
    const failPromise = promise({ fail: true }).finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })

  it("with multiple finally's for same promise", () => {
    const checkFunc = v => expect(v).toBeUndefined()
    const mainPromise = promise()
    const promise1 = mainPromise.finally(checkFunc)
    const promise2 = mainPromise.finally(checkFunc)
    return Promise.allSettled([promise1, promise2])
  })

  it("with chaining", () => {
    const checkFunc = v => v => expect(v).toBeUndefined()
    const successPromise = promise()
      .then(v => v)
      .finally(checkFunc)
    const failPromise = promise({ fail: true })
      .then(v => v)
      .finally(checkFunc)
    return Promise.allSettled([successPromise, failPromise])
  })
})

describe("static methods", () => {
  it("resolve", () => {
    return MyPromise.resolve(DEFAULT_VALUE).then(v =>
      expect(v).toEqual(DEFAULT_VALUE)
    )
  })

  it("reject", () => {
    return MyPromise.reject(DEFAULT_VALUE).catch(v =>
      expect(v).toEqual(DEFAULT_VALUE)
    )
  })

  describe("all", () => {
    it("with success", () => {
      return MyPromise.all([promise({ value: 1 }), promise({ value: 2 })]).then(
        v => expect(v).toEqual([1, 2])
      )
    })

    it("with fail", () => {
      return MyPromise.all([promise(), promise({ fail: true })]).catch(v =>
        expect(v).toEqual(DEFAULT_VALUE)
      )
    })
  })

  it("allSettled", () => {
    return MyPromise.allSettled([promise(), promise({ fail: true })]).then(v =>
      expect(v).toEqual([
        { status: "fulfilled", value: DEFAULT_VALUE },
        { status: "rejected", reason: DEFAULT_VALUE },
      ])
    )
  })

  describe("race", () => {
    it("with success", () => {
      return MyPromise.race([
        promise({ value: 1 }),
        promise({ value: 2 }),
      ]).then(v => expect(v).toEqual(1))
    })

    it("with fail", () => {
      return MyPromise.race([
        promise({ fail: true, value: 1 }),
        promise({ fail: true, value: 2 }),
      ]).catch(v => expect(v).toEqual(1))
    })
  })

  describe("any", () => {
    it("with success", () => {
      return MyPromise.any([promise({ value: 1 }), promise({ value: 2 })]).then(
        v => expect(v).toEqual(1)
      )
    })

    it("with fail", () => {
      return MyPromise.any([
        promise({ fail: true, value: 1 }),
        promise({ value: 2 }),
      ]).catch(e => expect(e.errors).toEqual([1, 2]))
    })
  })
})

function promise({ value = DEFAULT_VALUE, fail = false } = {}) {
  return new MyPromise((resolve, reject) => {
    fail ? reject(value) : resolve(value)
  })
}



test('MyPromise resolves correctly', () => {
  return new MyPromise((resolve) => {
    setTimeout(() => {
      resolve('Resolved!')
    }, 100)
  }).then(data => {
    expect(data).toBe('Resolved!')
  })
})

test('MyPromise rejects correctly', () => {
  return new MyPromise((_, reject) => {
    setTimeout(() => {
      reject('Rejected!')
    }, 100)
  }).catch(error => {
    expect(error).toBe('Rejected!')
  })
})

test('MyPromise handles chaining correctly', () => {
  return new MyPromise((resolve) => {
    resolve(1)
  }).then(data => {
    expect(data).toBe(1)
    return data + 1
  }).then(data => {
    expect(data).toBe(2)
  })
})

test('MyPromise handles errors correctly', () => {
  return new MyPromise((_, reject) => {
    reject('Error!')
  }).then(() => {
    throw new Error('This should not run')
  }).catch(error => {
    expect(error).toBe('Error!')
  })
})

test('MyPromise works with async/await', async () => {
  const data = await new MyPromise((resolve) => {
    setTimeout(() => {
      resolve('Async/Await Resolved!')
    }, 100)
  })
  expect(data).toBe('Async/Await Resolved!')
})

test('MyPromise rejects with async/await', async () => {
  expect.assertions(1)
  try {
    await new MyPromise((_, reject) => {
      setTimeout(() => {
        reject('Async/Await Rejected!')
      }, 100)
    })
  } catch (error) {
    expect(error).toBe('Async/Await Rejected!')
  }
})

test('MyPromise.all resolves correctly', () => {
  return MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.resolve(2),
    MyPromise.resolve(3)
  ]).then(values => {
    expect(values).toEqual([1, 2, 3])
  })
})

test('MyPromise.all rejects if one promise rejects', () => {
  return MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.reject('Error!'),
    MyPromise.resolve(3)
  ]).catch(error => {
    expect(error).toBe('Error!')
  })
})

test('MyPromise.race resolves correctly', () => {
  return MyPromise.race([
    new MyPromise(resolve => setTimeout(() => resolve('First'), 100)),
    new MyPromise(resolve => setTimeout(() => resolve('Second'), 200))
  ]).then(value => {
    expect(value).toBe('First')
  })
})

test('MyPromise.race rejects correctly', () => {
  return MyPromise.race([
    new MyPromise((_, reject) => setTimeout(() => reject('First Error'), 100)),
    new MyPromise((_, reject) => setTimeout(() => reject('Second Error'), 200))
  ]).catch(error => {
    expect(error).toBe('First Error')
  })
})

test('MyPromise.finally works correctly on resolve', () => {
  const mockCallback = jest.fn()
  return MyPromise.resolve('Resolved').finally(mockCallback).then(data => {
    expect(data).toBe('Resolved')
    expect(mockCallback).toHaveBeenCalled()
  })
})

test('MyPromise.finally works correctly on reject', () => {
  const mockCallback = jest.fn()
  return MyPromise.reject('Rejected').finally(mockCallback).catch(error => {
    expect(error).toBe('Rejected')
    expect(mockCallback).toHaveBeenCalled()
  })
})

