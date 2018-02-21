"use strict"

const chai = require("chai")
const expect = chai.expect

const {PNGArrays} = require("../dev/index.js")
const {testDataRaw} = require("../testDataRaw.js")
const {testDataHalfway} = require("../testDataHalfway.js")

// TODO, more tests

describe("MNIST Example", () => {
    it("Converts the data to hex correctly", () => {
        const converted = PNGArrays.prepareExportData(testDataRaw)
        const expected = new Uint8ClampedArray(testDataHalfway)
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