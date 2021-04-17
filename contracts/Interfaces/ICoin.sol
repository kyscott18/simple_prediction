// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICoin {
    function balances(address owner) external returns (uint); 
    function sendToken(address receiver, uint amount) external returns (bool successful);
}