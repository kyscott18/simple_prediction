// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './interfaces/ICoin.sol';

contract Coin is ICoin{
    mapping (address => uint) override public balances;

    constructor (uint initialBalance) {
        balances[tx.origin] = initialBalance; 
    }

    function sendToken(address receiver, uint amount) override public returns (bool successful) {
		if (balances[tx.origin] < amount) return false;
		balances[tx.origin] -= amount;
		balances[receiver] += amount;
		return false;
	}
}