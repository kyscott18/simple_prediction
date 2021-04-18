const Coin = artifacts.require("Coin");
const Prediction = artifacts.require("Prediction");


module.exports = function(deployer) {

    deployer.then(async () => {
        await deployer.deploy(Coin);
        await deployer.deploy(Prediction, Coin.address);
    });
};