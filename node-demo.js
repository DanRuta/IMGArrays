"use strict"

const {PNGArrays} = require("./dev/index.js")
const {rawData} = require("./benchmarks data/medium/rawData.js")

console.log("Converting data to PNG...")

PNGArrays.toPNG(rawData, {file: "./node-demo.png"})
.then(() => {
    console.log("done.")

    console.log("reading data from PNG...")

    PNGArrays.fromPNG("./node-demo.png")
    .then(console.log)
    .catch(e => console.log("nope", e))

})
.catch(e => console.log("nope", e))

