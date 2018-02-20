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