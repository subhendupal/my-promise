# My Promise

A simple implementation of Promises specification in JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)

## Introduction

My Promise is a lightweight, educational implementation of Promises specification in JavaScript. It provides an easy-to-understand implementation of Promises, allowing developers to understand the core concepts and inner workings of JavaScript promises.

## Features

- **Promise States**: Implements `PENDING`, `FULFILLED`, and `REJECTED` states.
- **Chaining**: Supports method chaining with `then`, `catch`, and `finally` methods.
- **Static Methods**: Includes `Promise.resolve`, `Promise.reject`, `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`.
- **Error Handling**: Handles both synchronous and asynchronous errors properly.
- **Custom Error Handling**: Provides a custom `UncaughtPromiseError` class for unhandled promise rejections.
- **Asynchronous Execution**: Uses `setTimeout` for asynchronous behavior.
