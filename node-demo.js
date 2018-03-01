"use strict"

const {IMGArrays} = require("./dev/index.js")
const {rawData} = require("./benchmarks data/medium/rawData.js")

console.log("Converting data to IMG...")

IMGArrays.toIMG(rawData, {file: "./node-demo.png", width: 500})
.then(() => {
    console.log("done.")

    console.log("reading data from IMG...")

    IMGArrays.fromIMG("./node-demo.IMG")
    .then(console.log)
    .catch(e => console.log("nope", e))

})
.catch(e => console.log("nope", e))
