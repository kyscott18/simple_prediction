// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Prediction is ERC1155("FREE") {
    address public coin;
    address public oracle; 
    bytes32 public identifier;  


    constructor (address _coin) {
        coin = _coin;
        oracle = msg.sender;  
        identifier = keccak256(abi.encodePacked(oracle, "Heads or Tails", uint(2)));
    }

    function buySet(uint _amount) public {
        uint[] memory positionIds = new uint[](uint(2));
        uint[] memory amounts = new uint[](uint(2));

        for (uint i = 0; i < uint(2); ++i) {
            positionIds[i] = i+1; 
            amounts[i] = _amount;
        }

        require(IERC20(coin).transferFrom(msg.sender, address(this), _amount), "could not receive collateral tokens");
        _mintBatch(
            msg.sender,
            positionIds,
            amounts,
            ""
        );
    }

    function sellSet(uint _amount) public {
        uint[] memory positionIds = new uint[](uint(2));
        uint[] memory amounts = new uint[](uint(2));

        for (uint i = 0; i < uint(2); ++i) {
            positionIds[i] = i+1; 
            amounts[i] = _amount;
        }

        _burnBatch(
            msg.sender,
            positionIds,
            amounts
        );
        require(IERC20(coin).transfer(msg.sender, _amount), "could not transfer collateral tokens");
    }
}