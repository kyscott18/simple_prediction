// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Interfaces/ICoin.sol";

contract Prediction is ERC1155("k") {
    address coin;
    bytes32 identifier;  
    uint amount;
    constructor (address _coin) {
        coin = _coin; 
    }
    function buySet(uint _amount) public {
        amount = _amount; 
        coin = address(0);
    }
}