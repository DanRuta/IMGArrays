"use strict"

class PNGArrays {

    /*
        TODO

        - test the alpha functionality (and add more tests, in general)

        - short/big numbers optimization, to allow storing larger numbers
            - normal: limit of 7 digits on the left hand side of the decimal place
            - long: limit of 127 digits (by using an additional character for storing metadata)
    */

    static toPNG (array, {alpha=false, file=false}={}) {

        // Convert the array values to Uint8Clamped values (Base 15 with 16th value used as metadata)
        array = array.constructor == Uint8ClampedArray ? array : this.prepareExportData(array)

        const width = 1000 // TODO, calculate or configure value for this
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

                PNG.pack().pipe(opti).pipe(this.fs.createWriteStream(file.replace(/\.png$/, "")+".png"))

                resolve()
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

    static fromPNG (data, {alpha=false}={}) {

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
                        values[i] = PNGArrays.hexToNum(values[i])
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
    static prepareExportData (array) {

        const data = []
        let remainder = ""

        for (let i=0; i<array.length; i++) {

            // Convert value to base15
            const base = remainder + this.numToHex(array[i])
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

    static hexToNum (hex) {

        if (hex=="00000") {
            return 0
        }

        if (hex===undefined) {
            return 0
        }

        const positive = parseInt(hex[0], 16) >= 7
        const valuesIn = parseInt(hex[0], 15) - (positive ? 6 : -1)
        const leadingDecZeroes = parseInt(hex.slice(1, 3), 15)
        const left = hex.slice(3, 3+valuesIn)
        let right = ""

        if (left.length+3 < hex.length) {
            right = "."+"0".repeat(leadingDecZeroes)+parseInt(hex.slice(3+valuesIn, hex.length), 15)
        }

        return (positive ? 1 : -1) * parseFloat(parseInt(left, 15)+right)
    }

    static numToHex (num) {

        const positive = num > 0
        let sign = num > 0 ? 7 : 0
        let leadingDecZeroes = "00"

        // Number is not an integer
        if (num !== parseInt(num)) {

            // Discard values below 17 decimal places
            if (/\.0{17}$/.test(num.toFixed(17))) {
                return "F"+sign.toString(15)+"0000"
            }

            // The left part is capped
            const cap = 2562890624
            const left = Math.min(parseInt(num), cap).toString(15)
            const rightString = num.toString().split(".")[1]

            leadingDecZeroes = Math.min(/^0*/.exec(rightString)[0].length, 15).toString(15).padStart(2, 0)
            const right = parseInt(rightString).toString(15)


            sign += left.length-1

            let final = "F"+sign.toString(15)+leadingDecZeroes+left+right

            if (final.length%2!=0) {
                final = "F"+sign.toString(15)+leadingDecZeroes+"0"+left+right
            }

            return final
        }

        sign += num.toString().length
        let final = "F"+sign.toString(15)+leadingDecZeroes+num.toString(15)

        if (final.length%2!=0) {
            final = "F"+sign.toString(15)+leadingDecZeroes+"0"+num.toString(15)
        }

        return final
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