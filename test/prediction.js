const chai = require("chai");
const {assert, expect} = require("chai");
chai.use(require("chai-as-promised"))
var BN = web3.utils.BN; 

var Prediction = artifacts.require("./Prediction.sol")
var Coin = artifacts.require("./Coin.sol")

contract("Both", accounts => {
    let coinInstance
    let predictionInstance
    beforeEach(async () => {
        coinInstance = await Coin.new()
        predictionInstance = await Prediction.new(coinInstance.address)
    })

    describe("coin constructor", () => {
        it("sets starting balance", async () => {
            assert.equal(await coinInstance.balanceOf(accounts[0]), 100)
        })
    })

    describe("prediction constructor", () => {
        it("sets coin address and oracle", async () => {
            assert.equal(await predictionInstance.coin(), coinInstance.address)
            assert.equal(await predictionInstance.oracle(), accounts[0])
        })
    })

    describe("buy set", () => {
        beforeEach(async () => {
            await coinInstance.approve(predictionInstance.address, 100)
        })
        it("purchases one set", async () => {
            await predictionInstance.buySet(1)
            assert.equal(BN(await predictionInstance.balanceOf(accounts[0], 1)).toNumber(), 1, "balance of 1")
            assert.equal(BN(await predictionInstance.balanceOf(accounts[0], 2)).toNumber(), 1, "balance of 2")
            assert.equal(BN(await coinInstance.balanceOf(accounts[0])).toNumber(), 99, "balance of account 1")
            assert.equal(BN(await coinInstance.balanceOf(predictionInstance.address)).toNumber(), 1, "balance of contract")
        })
    })
})