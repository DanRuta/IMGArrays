"use strict"

const {PNGArrays} = require("./dev/index.js")
const {testDataRaw} = require("./testDataRaw.js")
const {testDataHalfway} = require("./testDataHalfway.js")

// console.log("Converting data to PNG...")

// PNGArrays.toPNG(testDataRaw, {file: "./node-demo.png"})
// .then(() => console.log("done."))
// .catch(e => console.log("nope", e))

console.log("reading data from PNG...")

PNGArrays.fromPNG("./node-demo.png")
.then(console.log)
.catch(e => console.log("nope", e))

