const chai = require("chai");
const {assert, expect} = require("chai");
chai.use(require("chai-as-promised"))
var BN = web3.utils.BN; 

var Prediction = artifacts.require("./Prediction.sol")
var Coin = artifacts.require("./Coin.sol")

contract("Both", accounts => {
    let coinInstance
    let predictionInstance
    const bn100 = web3.utils.toBN('100000000000000000000')
    const bn20 = web3.utils.toBN('20000000000000000000')
    const bn10 = web3.utils.toBN('10000000000000000000')
    const bn2 = web3.utils.toBN('2000000000000000000')
    const bn0 = web3.utils.toBN('0')
    beforeEach(async () => {
        coinInstance = await Coin.new()
        predictionInstance = await Prediction.new(coinInstance.address)
    })

    describe("coin constructor", () => {
        it("sets starting balance", async () => {
            expect(await coinInstance.balanceOf(accounts[0])).to.eql(bn100)
        })
    })

    describe("prediction constructor", () => {
        it("sets coin address and oracle", async () => {
            assert.equal(await predictionInstance.coin(), coinInstance.address)
            assert.equal(await predictionInstance.oracle(), accounts[0])
            expect((await predictionInstance.getState(1))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn0)
        })
    })

    describe("provide liquidity", () => {
        beforeEach(async () => {
            await coinInstance.approve(predictionInstance.address, bn100.toString())
        })
        it("provides liquidity to an empty set", async () => {
            await predictionInstance.addLiquidity(bn20.toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn20)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn20)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn10)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn10)
        })
    })

    describe("buy contract", () => {
        beforeEach(async () => {
            await coinInstance.approve(predictionInstance.address, bn100.toString())
            await predictionInstance.addLiquidity(bn20.toString())
        })
        it("buys two contract heads", async () => {
            await predictionInstance.buyContract(bn2.toString(), 1)
            // expect((await predictionInstance.getState(1))[0]).to.eql(bn20.sub(bn2))
            assert.equal((await predictionInstance.getState(1))[0], bn20.sub(bn2))
            //expect((await predictionInstance.getState(1))[1]).to.eql(expected)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn20)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn10)
        })
    })

    describe("buy set", () => {
        beforeEach(async () => {
            await coinInstance.approve(predictionInstance.address, bn100.toString())
        })
        it("purchases two sets", async () => {
            await predictionInstance.buySet(bn2.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn2)
            expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn2)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn2)
            // expect(await coinInstance.balanceOf(accounts[0])).to.eql(bn100.sub(bn2))
        })
    })
})