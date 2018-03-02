"use strict"

const chai = require("chai")
const expect = chai.expect

const {IMGArrays} = require("../dev/index.js")
const {rawData} = require("../benchmarks data/medium/rawData.js")
const {halfwayData} = require("../benchmarks data/medium/halfwayData.js")

// Sanity tests and edge cases
describe("numToHex", () => {
    // Capacity 1
    it("Example 1", () => expect(IMGArrays.numToHex(0.6153689003735051)).to.equal("F8003266688d960e1b"))
    it("Example 2", () => expect(IMGArrays.numToHex(-0.6153651)).to.equal("F000818486"))
    it("Example 2.5", () => expect(IMGArrays.numToHex(0.6153651)).to.equal("F800818486"))
    it("Example 3", () => expect(IMGArrays.numToHex(10)).to.equal("F80a"))
    it("Example 4", () => expect(IMGArrays.numToHex(5000000)).to.equal("Fd068b735"))
    it("Example 5", () => expect(IMGArrays.numToHex(50000000)).to.equal("Fe045c9c35"))
    it("Example 6", () => expect(IMGArrays.numToHex(99999999)).to.equal("Fe08ba4969"))
    // Capacity 0
    it("Example 7", () => expect(IMGArrays.numToHex(0.6153651, 0)).to.equal("F0818486"))
    it("Example 8", () => expect(IMGArrays.numToHex(0.6153689003735051, 0)).to.equal("F03266688d960e1b"))
    // Capacity 2
    it("Example 9", () => expect(IMGArrays.numToHex(170859374.1, 2)).to.equal("F7d0eeeeeee1"))
    it("Example 10", () => expect(IMGArrays.numToHex(50000000, 2)).to.equal("F7d045c9c35"))
    it("Example 11", () => expect(IMGArrays.numToHex(2562890624, 2)).to.equal("F7e0eeeeeeee"))
    it("Example 12", () => expect(IMGArrays.numToHex(999999999999, 2)).to.equal("F8201b02b766469"))
    it("Example 13", () => expect(IMGArrays.numToHex(999999999999999, 2)).to.equal("F8407a924652eb469"))
    it("Example 14", () => expect(IMGArrays.numToHex(999999.123, 2)).to.equal("F7c014b46983"))
    it("Example 15", () => expect(IMGArrays.numToHex(9999999.123, 2)).to.equal("F7c0d27e6983"))

    it("Example 16", () => expect(IMGArrays.numToHex(-1430.01623, 1)).to.equal("F21655733"))
    // leading dec capacity
    it("Example 17", () => expect(IMGArrays.numToHex(10.123, 1, false)).to.equal("F8a83"))
    it("Example 18", () => expect(IMGArrays.numToHex(10.123, 1, true)).to.equal("F80a83"))
    it("Example 19", () => expect(IMGArrays.numToHex(-101010.0123, 1, true)).to.equal("F411ede083"))
    it("Example 20", () => expect(IMGArrays.numToHex(1.000000000000001, 1, true)).to.equal("F8e11"))

    it("Example 21", () => expect(IMGArrays.numToHex(0.123, 0)).to.equal("F083"))
})

describe("hexToNum", () => {
    // Capacity 1
    it("Example 1", () => expect(IMGArrays.hexToNum("8003266688d960e1b")).to.equal(0.6153689003735051))
    it("Example 2", () => expect(IMGArrays.hexToNum("000818486")).to.equal(-0.6153651))
    it("Example 2.5", () => expect(IMGArrays.hexToNum("800818486")).to.equal(0.6153651))
    it("Example 3", () => expect(IMGArrays.hexToNum("80a")).to.equal(10))
    it("Example 4", () => expect(IMGArrays.hexToNum("d068b735")).to.equal(5000000))
    it("Example 5", () => expect(IMGArrays.hexToNum("e045c9c35")).to.equal(50000000))
    it("Example 6", () => expect(IMGArrays.hexToNum("e08ba4969")).to.equal(99999999))
    // Capacity 0
    it("Example 7", () => expect(IMGArrays.hexToNum("0818486", 0)).to.equal(0.6153651))
    it("Example 8", () => expect(IMGArrays.hexToNum("03266688d960e1b", 0)).to.equal(0.6153689003735051))
    // Capacity 2
    it("Example 9", () => expect(IMGArrays.hexToNum("7d0eeeeeee1", 2)).to.equal(170859374.1))
    it("Example 10", () => expect(IMGArrays.hexToNum("7d045c9c35", 2)).to.equal(50000000))
    it("Example 11", () => expect(IMGArrays.hexToNum("7e0eeeeeeee", 2)).to.equal(2562890624))
    it("Example 12", () => expect(IMGArrays.hexToNum("8201b02b766469", 2)).to.equal(999999999999))
    it("Example 13", () => expect(IMGArrays.hexToNum("8407a924652eb469", 2)).to.equal(999999999999999))
    it("Example 14", () => expect(IMGArrays.hexToNum("7c014b46983", 2)).to.equal(999999.123))
    it("Example 15", () => expect(IMGArrays.hexToNum("7c0d27e6983", 2)).to.equal(9999999.123))

    it("Example 16", () => expect(IMGArrays.hexToNum("21655733", 1)).to.equal(-1430.01623))
    // leading dec capacity
    it("Example 17", () => expect(IMGArrays.hexToNum("8a83", 1, false)).to.equal(10.123))
    it("Example 18", () => expect(IMGArrays.hexToNum("80a83", 1, true)).to.equal(10.123))
    it("Example 19", () => expect(IMGArrays.hexToNum("411ede083", 1, true)).to.equal(-101010.0123))
    it("Example 20", () => expect(IMGArrays.hexToNum("8e11", 1, true)).to.equal(1.000000000000001))

    it("Example 21", () => expect(IMGArrays.hexToNum("083", 0)).to.equal(0.123))
})

describe("MNIST Example", () => {
    it("Converts the data to hex correctly", () => {
        const converted = IMGArrays.prepareExportData(rawData)
        const expected = new Uint8ClampedArray(halfwayData)
        // expect(converted).to.deep.equal(expected) // This freezes, for some reason

        for (let i=0; i<expected.length; i++) {
            if (expected[i]!=converted[i]) {
                expect(converted[i]).to.equal([expected[i], i])
            }
        }
    })
})

describe("normalize", () => {

    it("Example 1 (Handles negative numbers correctly)", () => {
        const data = [1,2,3,-5,0.4,2]
        const {minVal, maxVal} = IMGArrays.normalize(data)
        expect(minVal).to.equal(-5)
        expect(maxVal).to.equal(3)
        expect(data).to.deep.equal([0.75, 0.875, 1, 0, 0.675, 0.875])
    })

    it("Example 2 (Handles arrays with equal values correctly)", () => {
        const data = [3, 3, 3, 3]
        const {minVal, maxVal} = IMGArrays.normalize(data)
        expect(minVal).to.equal(3)
        expect(maxVal).to.equal(3)
        expect(data).to.deep.equal([0.5, 0.5, 0.5, 0.5])
    })

    it("Example 3", () => {
        const data = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const {minVal, maxVal} = IMGArrays.normalize(data)
        expect(minVal).to.equal(5)
        expect(maxVal).to.equal(15)
        expect(data).to.deep.equal([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
    })
})

describe("unnormalize", () => {

    it("Example 1 (Handles negative numbers correctly)", () => {
        const data = [0.75, 0.875, 1, 0, 0.675, 0.875]
        IMGArrays.unnormalize(data, -5, 3)
        expect(data.map(v => parseFloat(v.toFixed(1)))).to.deep.equal([1,2,3,-5,0.4,2])
    })

    it("Example 2 (Handles arrays with equal values correctly)", () => {
        const data = [0.5, 0.5, 0.5, 0.5]
        IMGArrays.unnormalize(data, 3, 3)
        expect(data).to.deep.equal([3, 3, 3, 3])
    })

    it("Example 3", () => {
        const data = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        IMGArrays.unnormalize(data, 5, 15)
        expect(data).to.deep.equal([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })
})