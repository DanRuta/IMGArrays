"use strict"

const args = process.argv.slice(2, 12)
const {PNGArrays} = require("../dev/index.js")

let dataPath

for (let a=0; a<args.length; a++) {
    switch (args[a]) {

        case "-in":
            dataPath = args[a+1]
            a++
            break
    }
}

if (!dataPath) {
    console.log("Please specify which folder the rawData.js file is in using: -in 'folder'")
    return
}

console.log(`Reading ./${dataPath}/rawData.js`)

const {rawData} = require(`./${dataPath}/rawData.js`)

console.log("Converting...")

PNGArrays.toPNG(rawData, {file: `./${dataPath}/node.png`})
.then(() => console.log("done."))
.catch(e => console.log("nope", e))