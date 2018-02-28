"use strict"

/*
    TODO
        - Toggleable use of leadingDecZeroes ? would this help in cases where values are not all tiny ?
        - Toggleable use of normalization, saving min and max values at the start, behind/between a FF delimiter
        - Automatically choose the best capacity size, by parsing all values first, checking for limits
*/

class PNGArrays {

    static toPNG (array, {alpha=false, file=false, width=Math.ceil(Math.sqrt(array.length*(alpha?3:4))), capacity=1}={}) {

        // Convert the array values to Uint8Clamped values (Base 15 with 16th value used as metadata)
        array = array.constructor == Uint8ClampedArray ? array : this.prepareExportData(array, capacity)

        const height = Math.ceil((array.length/(alpha ? 4 : 3)) / width)

        // Write to file
        if (file) {
            return new Promise((resolve, reject) => {

                const PNG = new this.pngjs2({width, height})
                const imgData = new Uint8ClampedArray(array.length/3*4)

                if (alpha) {
                    PNG.data = Buffer.from(array)
                } else {
                    for (let i=0; i<array.length/3; i++) {
                        imgData[i*4]   = array[i*3]
                        imgData[i*4+1] = array[i*3+1]
                        imgData[i*4+2] = array[i*3+2]
                        imgData[i*4+3] = 255
                    }
                    PNG.data = Buffer.from(imgData)
                }

                const opti = new this.optipng(["-o7"])
                const pngStream = PNG.pack()
                const writeStream = this.fs.createWriteStream(file.replace(/\.png$/, "")+".png")

                pngStream.pipe(opti).pipe(writeStream)
                writeStream.on("finish", () => resolve())
            })

        } else {
            // Draw to canvas
            const canvas = document.createElement("canvas")
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext("2d")

            const imgData = context.getImageData(0, 0, canvas.width, canvas.height)

            if (alpha) {
                context.putImageData(array, 0, 0)
            } else {
                for (let i=0; i<array.length/3; i++) {
                    imgData.data[i*4]   = array[i*3]
                    imgData.data[i*4+1] = array[i*3+1]
                    imgData.data[i*4+2] = array[i*3+2]
                    imgData.data[i*4+3] = 255
                }
                context.putImageData(imgData, 0, 0)
            }

            return canvas
        }
    }

    static fromPNG (data, {alpha=false, capacity=1}={}) {

        // Read from file
        if (typeof data == "string") {
            return new Promise((resolve, reject) => {
                const rs = this.fs.createReadStream(data)

                rs.pipe(new this.pngjs2({filterType: 4}))
                .on("parsed", function () {

                    let stringRepresentation = ""

                    for (let i=0; i<this.data.length/4; i++) {

                        let pixelString = ""

                        if (alpha) {
                            for (let c=0; c<4; c++) {
                                pixelString += this.data[i*4+c].toString(16).padStart(2, 0)
                            }
                        } else {
                            for (let c=0; c<3; c++) {
                                pixelString += this.data[i*4+c].toString(16).padStart(2, 0)
                            }
                        }

                        stringRepresentation += pixelString
                    }

                    const values = stringRepresentation.split("f")
                    values.shift()

                    for (let i=0; i<values.length; i++) {
                        values[i] = PNGArrays.hexToNum(values[i], capacity)
                    }

                    resolve(values)
                })
            })
        } else {
            data = data.constructor == Uint8ClampedArray ? data : this.prepareImportData(data)

            let stringRepresentation = ""

            for (let i=0; i<data.length/4; i++) {

                let pixelString = ""

                if (alpha) {
                    for (let c=0; c<4; c++) {
                        pixelString += data[i*4+c].toString(16).padStart(2, 0)
                    }
                } else {
                    for (let c=0; c<3; c++) {
                        pixelString += data[i*4+c].toString(16).padStart(2, 0)
                    }
                }

                stringRepresentation += pixelString
            }

            const values = stringRepresentation.split("f")
            values.shift()

            for (let i=0; i<values.length; i++) {
                values[i] = this.hexToNum(values[i])
            }

            return values
        }
    }


    // Helper functions
    static prepareExportData (array, capacity) {

        const data = []
        let remainder = ""

        for (let i=0; i<array.length; i++) {

            // Convert value to base15
            const base = remainder + this.numToHex(array[i], capacity)
            const parts = base.match(/.{1,2}/g)
            const length = parts.length

            for (let p=0; p<length; p++) {
                if (parts[0].length==2) {
                    data.push(parseInt(`0x${parts.shift()}`))
                }
            }

            remainder = parts[0] || ""
        }

        while (data.length%3) {
            data.push(0)
        }

        return new Uint8ClampedArray(data)
    }

    static prepareImportData (img) {
        const canvas = document.createElement("canvas")
        canvas.height = img.height
        canvas.width = img.width
        const context = canvas.getContext("2d")
        context.drawImage(img, 0, 0)
        return context.getImageData(0, 0, canvas.width, canvas.height).data
    }

    static hexToNum (hex, capacity=1) {

        if (hex=="00000") {
            return 0
        }

        if (hex===undefined) {
            return 0
        }

        const positive = capacity==2 ? (parseInt(hex.slice(0, 2), 15) >= 112) : (parseInt(hex[0], 16) >= 7)
        const metaOffset = capacity+2

        const meta = hex.slice(0, metaOffset)
        hex = hex.replace(meta, "")

        let valuesIn

        if (capacity==2) {
            valuesIn = parseInt(meta.slice(0, 2), 15) - ((positive ? 112 : 0) - 1)
        } else {
            valuesIn = parseInt(meta[0], 15) - (positive ? 6 : -1)
        }

        let right = ""
        const left = hex.slice(0, valuesIn) || "0"
        const leadingDecZeroes = parseInt(meta.slice(capacity, metaOffset), 15)

        // Return just the decimal part
        if (capacity==0) {
            return parseFloat("0."+"0".repeat(leadingDecZeroes) + parseInt(hex.slice(valuesIn, hex.length), 15))
        }

        // If the left side's length is smaller than total length (aka a decimal value)
        if (left.length < hex.length) {
            right = "."+"0".repeat(leadingDecZeroes) + parseInt(hex.slice(valuesIn, hex.length), 15)
        }

        return (positive ? 1 : -1) * parseFloat(parseInt(left, 15)+right)
    }

    static numToHex (num, capacity=1) {

        let sign
        let leadingDecZeroes = "00"

        if (capacity==2) {
            sign = num > 0 ? 112 : 0
        } else {
            sign = num > 0 ? 7 : 0
        }

        // Number is not an integer
        if (!Number.isInteger(num)) {

            // Discard values below 17 decimal places and return 0
            if (/\.0{17}$/.test(num.toFixed(17))) {
                return "F"+sign.toString(15)+"0000"
            }

            // The left part is capped to the biggest number that can be represented with 8 base15 characters
            let left
            if (capacity==2) {
                left = parseInt(num).toString(15)
            } else {
                const cap = 2562890624 // Math.pow(15, 8)-1
                left = Math.min(parseInt(num), cap).toString(15)
            }

            const rightString = num.toString().split(".")[1]

            leadingDecZeroes = Math.min(/^0*/.exec(rightString)[0].length, 15).toString(15).padStart(2, 0)
            const right = parseInt(rightString).toString(15)

            sign += left.length-1

            const meta = "F" + (capacity==0 ? "" : sign.toString(15).padStart(capacity, 0)) + leadingDecZeroes
            return meta + left+right
        }

        sign += num.toString().length-1

        const meta = "F" + (capacity==0 ? "" : sign.toString(15).padStart(capacity, 0)) + leadingDecZeroes
        return meta + num.toString(15)
    }

    static normalize (data) {
        let minVal = Infinity
        let maxVal = -Infinity

        for (let i=0; i<data.length; i++) {
            if (data[i] < minVal) {
                minVal = data[i]
            }
            if (data[i] > maxVal) {
                maxVal = data[i]
            }
        }

        if ((-1*minVal + maxVal) != 0) {
            for (let i=0; i<data.length; i++) {
                data[i] = (data[i] + -1*minVal) / (-1*minVal + maxVal)
            }
        } else {
            for (let i=0; i<data.length; i++) {
                data[i] = 0.5
            }
        }

        return {minVal, maxVal}
    }

    static unnormalize (data, minVal, maxVal) {

        if (maxVal-minVal == 0) {
            for (let i=0; i<data.length; i++) {
                data[i] = (data[i] + 0.5) * minVal
            }
        }

        for (let i=0; i<data.length; i++) {
            data[i] = data[i] * (-1*minVal + maxVal) - -1*minVal
        }
    }

    static downloadImage (canvas, {name="image"}) {
        const link = document.createElement("a")
        link.download = `${name}.png`

        canvas.toBlob(blob => {
            link.href = URL.createObjectURL(blob)
            link.click()
        }, `image/png`, 1)
    }
}


// https://github.com/DanRuta/jsNet/issues/33
/* istanbul ignore next */
if (typeof window != "undefined") {
    window.exports = window.exports || {}
    window.PNGArrays = PNGArrays
} else {
    PNGArrays.fs = require("fs")
    PNGArrays.pngjs2 = require("pngjs2").PNG
    PNGArrays.optipng = require("optipng")
}
exports.PNGArrays = PNGArrays