"use strict"

/*
    TODO
        - Toggleable use of normalization, saving min and max values at the start, behind/between a FF delimiter
        - Automatically choose the best capacity size, by parsing all values first, checking for limits
*/

class IMGArrays {

    static toIMG (array, {alpha=false, file=false, lDecZeroes=true, width=Math.ceil(Math.sqrt(array.length*(alpha?3:4))), capacity=1}={}) {

        // Convert the array values to Uint8Clamped values (Base 15 with 16th value used as metadata)
        array = array.constructor == Uint8ClampedArray ? array : this.prepareExportData(array, capacity, lDecZeroes)

        const height = Math.ceil((array.length/(alpha ? 4 : 3)) / width)

        // Write to file
        if (file) {
            return new Promise((resolve, reject) => {

                const canvas = new this.canvas(width, height)
                const context = canvas.getContext("2d")
                const imgData = context.getImageData(0, 0, canvas.width, canvas.height)

                if (alpha) {
                    for (let i=0; i<array.length; i++) {
                        imgData.data[i] = array[i]
                    }
                    context.putImageData(imgData, 0, 0)
                } else {
                    for (let i=0; i<array.length/3; i++) {
                        imgData.data[i*4]   = array[i*3]
                        imgData.data[i*4+1] = array[i*3+1]
                        imgData.data[i*4+2] = array[i*3+2]
                        imgData.data[i*4+3] = 255
                    }
                    context.putImageData(imgData, 0, 0)
                }

                canvas.toBuffer((err, buf) => {
                    const writeStream = this.fs.createWriteStream(file)
                    writeStream.write(buf)
                    resolve()
                    // writeStream.on("finish", () => resolve())
                })
            })

        } else {
            // Draw to canvas
            const canvas = document.createElement("canvas")
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext("2d")
            const imgData = context.getImageData(0, 0, canvas.width, canvas.height)

            if (alpha) {
                for (let i=0; i<array.length; i++) {
                    imgData.data[i] = array[i]
                }
                context.putImageData(imgData, 0, 0)
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

    static fromIMG (data, {alpha=false, capacity=1, lDecZeroes=true}={}) {

        // Read from file
        if (typeof data == "string") {
            return new Promise((resolve, reject) => {

                this.fs.readFile(data, (err, buf) => {
                    const base64 = buf.toString("base64")
                    const img = new this.canvas.Image
                    img.src = `data:image/${data.split(".").reverse()[0]};base64,` + base64

                    const canvas = new this.canvas(img.width, img.height)
                    const context = canvas.getContext("2d")

                    context.drawImage(img, 0, 0)
                    const imgData = context.getImageData(0, 0, canvas.width, canvas.height).data

                    let stringRepresentation = ""

                    for (let i=0; i<imgData.length/4; i++) {

                        let pixelString = ""

                        if (alpha) {
                            for (let c=0; c<4; c++) {
                                pixelString += imgData[i*4+c].toString(16).padStart(2, 0)
                            }
                        } else {
                            for (let c=0; c<3; c++) {
                                pixelString += imgData[i*4+c].toString(16).padStart(2, 0)
                            }
                        }

                        stringRepresentation += pixelString
                    }

                    const values = stringRepresentation.split("f")
                    values.shift()

                    for (let i=0; i<values.length; i++) {
                        values[i] = this.hexToNum(values[i], capacity, lDecZeroes)
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
                values[i] = this.hexToNum(values[i], capacity, lDecZeroes)
            }

            return values
        }
    }


    // Helper functions
    static prepareExportData (array, capacity, lDecZeroes=true) {

        const data = []
        let remainder = ""

        for (let i=0; i<array.length; i++) {

            // Convert value to base15
            const base = remainder + this.numToHex(array[i], capacity, lDecZeroes)
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

    static hexToNum (hex, capacity=1, lDecZeroes=true) {

        if (hex=="00000") {
            return 0
        }

        if (hex===undefined) {
            return 0
        }

        const positive = capacity==2 ? (parseInt(hex.slice(0, 2), 15) >= 112) : (parseInt(hex[0], 16) >= 8)
        const metaOffset = capacity + (lDecZeroes ? 1 : 0)

        const meta = hex.slice(0, metaOffset)
        hex = hex.replace(meta, "")

        let valuesIn

        if (capacity==2) {
            valuesIn = parseInt(meta.slice(0, 2), 15) - ((positive ? 112 : 0) - 1)
        } else {
            valuesIn = parseInt(meta[0], 15) - (positive ? 8 : 0) + 1
        }

        if (capacity==0) {
            valuesIn--
        }

        let right = ""
        const left = hex.slice(0, valuesIn) || "0"
        const leadingDecZeroes = lDecZeroes ? parseInt(meta.slice(capacity, metaOffset), 15) : 0

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

    static numToHex (num, capacity=1, lDecZeroes=true) {

        let sign
        let leadingDecZeroes = "0"

        if (capacity==2) {
            sign = num > 0 ? 112 : 0
        } else {
            sign = num > 0 ? 8 : 0
        }

        num = Math.abs(num)

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

            leadingDecZeroes = Math.min(/^0*/.exec(rightString)[0].length, 15).toString(15).padStart((lDecZeroes ? 1 : 0), 0)
            const right = parseInt(rightString).toString(15)

            sign += left.length-1

            let meta = "F" + (capacity==0 ? "" : sign.toString(15).padStart(capacity, 0))

            if (lDecZeroes) {
                meta += leadingDecZeroes
            }

            if (capacity==0) {
                return meta + right
            }

            return meta + left + right
        }

        sign += num.toString(15).length-1

        let meta = "F" + (capacity==0 ? "" : sign.toString(15).padStart(capacity, 0))

        if (lDecZeroes) {
            meta += leadingDecZeroes
        }

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

    static downloadImage (canvas, {name="image", format="webp"}={}) {
        const link = document.createElement("a")
        link.download = `${name}.${format}`

        canvas.toBlob(blob => {
            link.href = URL.createObjectURL(blob)
            link.click()
        }, `image/${format}`, 1)
    }
}

// https://github.com/DanRuta/jsNet/issues/33
/* istanbul ignore next */
if (typeof window != "undefined") {
    window.exports = window.exports || {}
    window.IMGArrays = IMGArrays
} else {
    IMGArrays.fs = require("fs")
    IMGArrays.canvas = require("canvas-prebuilt")
}
exports.IMGArrays = IMGArrays