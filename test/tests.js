"use strict"

const chai = require("chai")
const expect = chai.expect

const {PNGArrays} = require("../dev/index.js")
const {rawData} = require("../benchmarks data/medium/rawData.js")
const {halfwayData} = require("../benchmarks data/medium/halfwayData.js")

// TODO, more tests

// Sanity tests and edge cases
describe("numToHex", () => {
    it("Example 1", () => expect(PNGArrays.numToHex(0.6153689003735051)).to.equal("F700003266688d960e1b"))
    it("Example 2", () => expect(PNGArrays.numToHex(-0.6153651)).to.equal("F00000818486"))
    it("Example 3", () => expect(PNGArrays.numToHex(10)).to.equal("F8000a"))
    it("Example 4", () => expect(PNGArrays.numToHex(5000000)).to.equal("Fd0068b735"))
    it("Example 5", () => expect(PNGArrays.numToHex(170859374.1)).to.equal("Fd00eeeeeee1"))
    it("Example 6", () => expect(PNGArrays.numToHex(50000000)).to.equal("Fe00045c9c35"))
    it("Example 7", () => expect(PNGArrays.numToHex(99999999)).to.equal("Fe0008ba4969"))
})

describe("hexToNum", () => {
    it("Example 1", () => expect(PNGArrays.hexToNum("700003266688d960e1b")).to.equal(0.6153689003735051))
    it("Example 2", () => expect(PNGArrays.hexToNum("00000818486")).to.equal(-0.6153651))
    it("Example 3", () => expect(PNGArrays.hexToNum("8000a")).to.equal(10))
    it("Example 4", () => expect(PNGArrays.hexToNum("d0068b735")).to.equal(5000000))
    it("Example 5", () => expect(PNGArrays.hexToNum("d00eeeeeee1")).to.equal(170859374.1))
    it("Example 6", () => expect(PNGArrays.hexToNum("e00045c9c35")).to.equal(50000000))
    it("Example 7", () => expect(PNGArrays.hexToNum("e0008ba4969")).to.equal(99999999))
})

describe("MNIST Example", () => {
    it("Converts the data to hex correctly", () => {
        const converted = PNGArrays.prepareExportData(rawData)
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
        const {minVal, maxVal} = PNGArrays.normalize(data)
        expect(minVal).to.equal(-5)
        expect(maxVal).to.equal(3)
        expect(data).to.deep.equal([0.75, 0.875, 1, 0, 0.675, 0.875])
    })

    it("Example 2 (Handles arrays with equal values correctly)", () => {
        const data = [3, 3, 3, 3]
        const {minVal, maxVal} = PNGArrays.normalize(data)
        expect(minVal).to.equal(3)
        expect(maxVal).to.equal(3)
        expect(data).to.deep.equal([0.5, 0.5, 0.5, 0.5])
    })

    it("Example 3", () => {
        const data = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        const {minVal, maxVal} = PNGArrays.normalize(data)
        expect(minVal).to.equal(5)
        expect(maxVal).to.equal(15)
        expect(data).to.deep.equal([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
    })
})

describe("unnormalize", () => {

    it("Example 1 (Handles negative numbers correctly)", () => {
        const data = [0.75, 0.875, 1, 0, 0.675, 0.875]
        PNGArrays.unnormalize(data, -5, 3)
        expect(data.map(v => parseFloat(v.toFixed(1)))).to.deep.equal([1,2,3,-5,0.4,2])
    })

    it("Example 2 (Handles arrays with equal values correctly)", () => {
        const data = [0.5, 0.5, 0.5, 0.5]
        PNGArrays.unnormalize(data, 3, 3)
        expect(data).to.deep.equal([3, 3, 3, 3])
    })

    it("Example 3", () => {
        const data = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        PNGArrays.unnormalize(data, 5, 15)
        expect(data).to.deep.equal([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    })
})