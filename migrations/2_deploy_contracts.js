const Coin = artifacts.require("Coin");
const Prediction = artifacts.require("Prediction");


module.exports = function(deployer) {

    deployer.then(async () => {
        await deployer.deploy(Coin, 100**18);
        await deployer.deploy(Prediction, Coin.address);
    });
};