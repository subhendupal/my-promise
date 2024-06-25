# My Promise

A simple implementation of Promises specification in JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)

## Introduction

My Promise is a lightweight, educational implementation of Promises specification in JavaScript. It provides an easy-to-understand implementation of Promises, allowing developers to understand the core concepts and inner workings of JavaScript promises.

## Features

- **Promise States**: Implements `PENDING`, `FULFILLED`, and `REJECTED` states.
- **Chaining**: Supports method chaining with `then`, `catch`, and `finally` methods.
- **Static Methods**: Includes `Promise.resolve`, `Promise.reject`, `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.
- **Error Handling**: Handles both synchronous and asynchronous errors properly.
- **Custom Error Handling**: Provides a custom `UncaughtPromiseError` class for unhandled promise rejections.
- **Asynchronous Execution**: Uses `setTimeout` for asynchronous behavior.

## Installation

You can install My Promise via npm:

```bash
npm install my-promise-js
```

Or yarn:

```bash
yarn add my-promise-js
```

## Usage

Import the `MyPromise` class and use it just like native JavaScript promises:

```javascript
const MyPromise = require('my-promise-js');

const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
    // or reject(new Error('Failed!'));
  }, 1000);
});

promise
  .then(result => {
    console.log(result); // Output: Success!
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('Promise completed.');
  });
```

## Examples

### Resolving Multiple Promises with `Promise.all`

```javascript
const promise1 = MyPromise.resolve(1);
const promise2 = MyPromise.resolve(2);
const promise3 = MyPromise.resolve(3);

MyPromise.all([promise1, promise2, promise3]).then(values => {
  console.log(values); // Output: [1, 2, 3]
});
```

### Handling Multiple Promises with `Promise.any`

```javascript
const promise1 = MyPromise.reject('Error 1');
const promise2 = MyPromise.resolve('Success');
const promise3 = MyPromise.reject('Error 3');

MyPromise.any([promise1, promise2, promise3]).then(value => {
  console.log(value); // Output: Success
}).catch(error => {
  console.error(error); // This block will not execute
});
```
