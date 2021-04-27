// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SafeMath.sol";

library PredictionLibrary {

    using SafeMath for uint; 

    //taken from uniswap
    function getReserveIn(uint _contractOut, uint _contractAmount, uint _reserveAmount) internal pure returns (uint _reserveIn) {
        require(_contractOut > 0, 'UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT');
        require(_reserveAmount > 0 && _contractAmount > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        uint numerator = _reserveAmount.mul(_contractOut);
        uint denominator = _contractAmount.sub(_contractOut);
        _reserveIn = (numerator / denominator).add(1);
    }

    //taken from uniswap
    function getReserveOut(uint _contractIn, uint _contractAmount, uint _reserveAmount) internal pure returns (uint _reserveOut) {
        require(_contractIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
        require(_reserveAmount > 0 && _contractAmount > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
        uint numerator = _contractIn.mul(_reserveAmount);
        uint denominator = _contractAmount.add(_contractIn);
        _reserveOut = numerator / denominator;
    }

}