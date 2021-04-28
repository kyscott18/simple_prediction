const chai = require("chai");
const {assert, expect} = require("chai");
chai.use(require("chai-as-promised"))
var BN = web3.utils.BN; 

var Prediction = artifacts.require("./Prediction.sol")
var Coin = artifacts.require("./Coin.sol")


contract("Both", accounts => {
    let coinInstance
    let predictionInstance
    const bn100c = web3.utils.toBN('100000000000000000000')
    const bn20c = web3.utils.toBN('20000000000000000000')
    const bn10c = web3.utils.toBN('10000000000000000000')
    const bn5c = web3.utils.toBN('5000000000000000000')
    const bn2c = web3.utils.toBN('2000000000000000000')
    const ybc = web3.utils.toBN('1074600000000000000')
    const ysc = web3.utils.toBN('925386700000000000')
    const bn1c = web3.utils.toBN('1000000000000000000')
    const bn1 = web3.utils.toBN('1')
    const bn0 = web3.utils.toBN('0')

    function priceOfIn(C, R, x) {
        const num = R.mul(x)
        const denom = C.sub(x)
        const px = (num.div(denom)).add(bn1)
        return px
    }

    function priceOfOut(C, R, x) {
        const num = R.mul(x)
        const denom = C.add(x)
        const px = num.div(denom)
        return px
    }

    beforeEach(async () => {
        coinInstance = await Coin.new()
        predictionInstance = await Prediction.new(coinInstance.address)
        await coinInstance.approve(predictionInstance.address, bn100c.toString())
    })

    describe("coin constructor", () => {
        it("sets starting balance", async () => {
            expect(await coinInstance.balanceOf(accounts[0])).to.eql(bn100c)
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

    describe("buy set", () => {
        it("purchases two sets", async () => {
            await predictionInstance.buySet(bn2c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn2c)
            expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn2c)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn2c)
            assert.equal(await coinInstance.balanceOf(accounts[0]), (bn100c.sub(bn2c)).toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn0)
            expect(await predictionInstance.b()).to.eql(bn2c)
        })
    })

    describe("sell set", () => {
        it("purchases two sets then sells one set", async () => {
            await predictionInstance.buySet(bn2c.toString())
            await predictionInstance.sellSet(bn1c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn1c)
            expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn1c)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn1c)
            assert.equal(await coinInstance.balanceOf(accounts[0]), (bn100c.sub(bn1c)).toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn0)
            expect(await predictionInstance.b()).to.eql(bn1c)
        })
    })

    describe("add liquidity", () => {
        it("adds liquidity to an empty set", async () => {
            await predictionInstance.addLiquidity(bn20c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 0)).to.eql(bn20c)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn20c)
            assert.equal(await coinInstance.balanceOf(accounts[0]), (bn100c.sub(bn20c)).toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn20c)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn20c)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn10c)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn10c)
            expect(await predictionInstance.b()).to.eql(bn0)
        })

        it("adds liquidity to a existing set", async () => {
            await predictionInstance.addLiquidity(bn10c.toString())
            await predictionInstance.addLiquidity(bn10c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 0)).to.eql(bn20c)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn20c)
            assert.equal(await coinInstance.balanceOf(accounts[0]), (bn100c.sub(bn20c)).toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn20c)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn20c)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn10c)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn10c)
            expect(await predictionInstance.b()).to.eql(bn0)
        })
    })

    describe("remove liquidity", () => {
        it("adds then removes liquidity", async () => {
            await predictionInstance.addLiquidity(bn20c.toString())
            await predictionInstance.removeLiquidity(bn20c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 0)).to.eql(bn0)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn0)
            assert.equal(await coinInstance.balanceOf(accounts[0]), bn100c.toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn0)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn0)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn0)
            expect(await predictionInstance.b()).to.eql(bn0)
        })

        it("adds then removes partial liquidity", async () => {
            await predictionInstance.addLiquidity(bn20c.toString())
            await predictionInstance.removeLiquidity(bn10c.toString())
            expect(await predictionInstance.balanceOf(accounts[0], 0)).to.eql(bn10c)
            expect(await coinInstance.balanceOf(predictionInstance.address)).to.eql(bn10c)
            assert.equal(await coinInstance.balanceOf(accounts[0]), (bn100c.sub(bn10c)).toString())
            expect((await predictionInstance.getState(1))[0]).to.eql(bn10c)
            expect((await predictionInstance.getState(2))[0]).to.eql(bn10c)
            expect((await predictionInstance.getState(1))[1]).to.eql(bn5c)
            expect((await predictionInstance.getState(2))[1]).to.eql(bn5c)
            expect(await predictionInstance.b()).to.eql(bn0)
        })
    })

    // describe("buy contract", () => {
    //     beforeEach(async () => {
    //         await predictionInstance.addLiquidity(bn20c.toString())
    //     })
    //     it("buys two contract heads", async () => {
    //         await predictionInstance.buyContract(bn2c.toString(), 1)
    //         expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn2c)
    //         expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn0)
    //         assert.equal((await predictionInstance.getState(1))[0].toString(), (bn20c.sub(bn2c)).toString())
    //         const num = bn10c.mul(bn2c)
    //         const denom = bn20c.sub(bn2c)
    //         const px = (num.div(denom)).add(bn1)
    //         assert.equal((await coinInstance.balanceOf(predictionInstance.address)).toString(), (bn20c.add(px)).toString())
    //         assert.equal((await coinInstance.balanceOf(accounts[0])).toString(), (bn100c.sub(bn20c).sub(px)).toString())
    //         assert.equal((await predictionInstance.getState(1))[1].toString(), (bn10c.add(px)).toString())
    //         expect((await predictionInstance.getState(2))[0]).to.eql(bn20c)
    //         expect((await predictionInstance.getState(2))[1]).to.eql(bn10c)
    //         expect(await predictionInstance.b()).to.eql(bn0)
    //     })
    // })

    // describe("sell contract", () => {
    //     beforeEach(async () => {
    //         await predictionInstance.addLiquidity(bn20c.toString())
    //     })
    //     it("buys two sets then sells two heads", async () => {
    //         await predictionInstance.buySet(bn2c.toString())
    //         await predictionInstance.sellContract(bn2c.toString(), 1)
    //         expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn0)
    //         expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn2c)
    //         assert.equal((await predictionInstance.getState(1))[0].toString(), (bn20c.add(bn2c)).toString())
    //         const num = bn10c.mul(bn2c)
    //         const denom = bn20c.add(bn2c)
    //         const px = num.div(denom)
    //         assert.equal((await coinInstance.balanceOf(predictionInstance.address)).toString(), (bn20c.add(bn2c).sub(px)).toString())
    //         assert.equal((await coinInstance.balanceOf(accounts[0])).toString(), (bn100c.sub(bn20c).sub(bn2c).add(px)).toString())
    //         assert.equal((await predictionInstance.getState(1))[1].toString(), (bn10c.sub(px)).toString())
    //         expect((await predictionInstance.getState(2))[0]).to.eql(bn20c)
    //         expect((await predictionInstance.getState(2))[1]).to.eql(bn10c)
    //         expect(await predictionInstance.b()).to.eql(bn2c)
    //     })
    // })

    describe("buy contract", () => {
        beforeEach(async () => {
            await predictionInstance.addLiquidity(bn20c.toString())
        })
        it("buys two contract heads", async () => {
            await predictionInstance.buyContract(bn2c.toString(), 1, ybc.toString())

            const p0 = priceOfIn(bn20c, bn10c, bn2c); 
            const p1 = priceOfOut(bn20c.sub(bn2c), bn10c.add(p0), ybc)
            const p2 = priceOfOut(bn20c, bn10c, ybc)

            expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn2c)
            expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn0)
            assert.equal((await predictionInstance.getState(1))[0].toString(), (bn20c.sub(bn2c).add(ybc)).toString())
            assert.equal((await predictionInstance.getState(1))[1].toString(), (bn10c.add(p0).sub(p1)).toString())
            assert.equal((await predictionInstance.getState(2))[0].toString(), (bn20c.add(ybc)).toString())
            assert.equal((await predictionInstance.getState(2))[1].toString(), (bn10c.sub(p2)).toString())
            assert.equal((await coinInstance.balanceOf(predictionInstance.address)).toString(), (bn20c.add(ybc)).toString())
            assert.equal((await coinInstance.balanceOf(accounts[0])).toString(), (bn100c.sub(bn20c).sub(ybc)).toString())

            assert.equal((await predictionInstance.b()).toString(), (p1.add(p2).sub(p0).add(ybc)).toString())
        })
    })

    describe("sell contract", () => {
        beforeEach(async () => {
            await predictionInstance.addLiquidity(bn20c.toString())
        })
        it("buys two contract heads", async () => {
            await predictionInstance.buySet(bn2c.toString())
            await predictionInstance.sellContract(bn2c.toString(), 1, ysc.toString())

            const p0 = priceOfOut(bn20c, bn10c, bn2c); 
            const p1 = priceOfIn(bn20c.add(bn2c), bn10c.sub(p0), ysc)
            const p2 = priceOfIn(bn20c, bn10c, ysc)

            expect(await predictionInstance.balanceOf(accounts[0], 1)).to.eql(bn0)
            expect(await predictionInstance.balanceOf(accounts[0], 2)).to.eql(bn2c)
            assert.equal((await predictionInstance.getState(1))[0].toString(), (bn20c.add(bn2c).sub(ysc)).toString())
            assert.equal((await predictionInstance.getState(1))[1].toString(), (bn10c.sub(p0).add(p1)).toString())
            assert.equal((await predictionInstance.getState(2))[0].toString(), (bn20c.sub(ysc)).toString())
            assert.equal((await predictionInstance.getState(2))[1].toString(), (bn10c.add(p2)).toString())
            assert.equal((await coinInstance.balanceOf(predictionInstance.address)).toString(), (bn20c.add(bn2c).sub(ysc)).toString())
            assert.equal((await coinInstance.balanceOf(accounts[0])).toString(), (bn100c.sub(bn20c).sub(bn2c).add(ysc)).toString())

            assert.equal((await predictionInstance.b()).toString(), (bn2c.add(p0).sub(p1).sub(p2).sub(ysc)).toString())
        })
    })
})