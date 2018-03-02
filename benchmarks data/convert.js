"use strict"

const args = process.argv.slice(2, 12)
const {IMGArrays} = require("../dev/index.js")

let dataPath
let capacity = 1
let useAlpha = false
let doAllBenchmarks = false

for (let a=0; a<args.length; a++) {
    switch (args[a]) {

        case "-in":
            dataPath = args[a+1]
            a++
            break

        case "-a":
            useAlpha = args[a+1].trim().toLowerCase()==="y"
            a++
            break

        case "-c":
            capacity = parseInt(args[a+1])
            a++
            break

        case "-b":
            doAllBenchmarks = args[a+1].trim().toLowerCase()==="y"
            a++
            break
    }
}

if (!dataPath && !doAllBenchmarks) {
    console.log("Please specify which folder the rawData.js file is in using: -in 'folder'")
    return
}


// Cache read data
const data = {}

const convert = (file, useAlpha, capacity, folder) => {

    if (!data[folder]) {
        console.log(`Reading ./${folder}/rawData.js`)
        data[folder] = require(`./${folder}/rawData.js`).rawData
    }

    console.log(`Converting ${folder} Capacity: ${capacity} Alpha: ${useAlpha}...`)

    IMGArrays.toIMG(data[folder], {
        alpha: useAlpha,
        capacity: capacity,
        file: file
    })
    .then(() => console.log(`done ${folder} Capacity: ${capacity} Alpha: ${useAlpha}`))
    .catch(e => console.log(`failed ${folder} Capacity: ${capacity} Alpha: ${useAlpha}`, e))
}

if (doAllBenchmarks) {

    ["small", "medium", "large"].forEach(folder => convert(`./${folder}/node.png`, false, 1, folder))

} else {
    convert(`./${dataPath}/node-${capacity}${useAlpha ? "-alpha" : ""}.png`, useAlpha, capacity, dataPath)
}