// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/SafeMath.sol";
import "./libraries/PredictionLibrary.sol"; 

contract Prediction is ERC1155("FREE") {

    using SafeMath for uint; 

    address public coin;
    address public oracle; 
    bytes32 public identifier;

    //maps from pool to items in pool C, R
    mapping(uint => uint[2]) contents;
    uint public b;
    uint public mints; 

    uint[2] initialRatioNumerator;
    uint initialRatioDenominator;

    uint winner;

    constructor (address _coin) {
        coin = _coin;
        oracle = msg.sender;  
        identifier = keccak256(abi.encodePacked(oracle, "Heads or Tails", uint(2)));
        initialRatioNumerator = [1, 1];
        initialRatioDenominator = 2; 
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
        b = b.add(_amount); 
        mints = mints.add(_amount); 
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
        b = b.sub(_amount); 
        mints = mints.sub(_amount);  
    }

    function getState(uint _id) public view returns (uint _contractAmount, uint _reserveAmount) {
        return (contents[_id][0], contents[_id][1]);
    }

    function _buyRaw(uint _amount, uint _id) private {
        uint reserveIn = PredictionLibrary.getReserveIn(_amount, contents[_id][0], contents[_id][1]);
        require(IERC20(coin).transferFrom(msg.sender, address(this), reserveIn), "unable to receive reserve");
        _mint(msg.sender, _id, _amount, "");
        _buyRawState(_amount, _id, reserveIn);
    }

    function _sellRaw(uint _amount, uint _id) private {
        uint reserveOut = PredictionLibrary.getReserveOut(_amount, contents[_id][0], contents[_id][1]);
        _burn(msg.sender, _id, _amount); 
        require(IERC20(coin).transfer(msg.sender, reserveOut), "could not transfer reserve");
        _sellRawState(_amount, _id, reserveOut); 
    }

    function _buyRawState(uint _amount, uint _id, uint reserveIn) private {
        contents[_id][0] = contents[_id][0].sub(_amount); 
        contents[_id][1] = contents[_id][1].add(reserveIn); 
    }

    function _sellRawState(uint _amount, uint _id, uint reserveOut) private {
        contents[_id][0] = contents[_id][0].add(_amount); 
        contents[_id][1] = contents[_id][1].sub(reserveOut); 
    }

    // function buyContract(uint _amount, uint _id) public {
    //     _buyRaw(_amount, _id);
    // }

    // function sellContract(uint _amount, uint _id) public {
    //     _sellRaw(_amount, _id); 
    // }

    function buyContract(uint _amount, uint _id, uint _y) public {
        uint kept; 
        //buy raw
        uint reserveIn = PredictionLibrary.getReserveIn(_amount, contents[_id][0], contents[_id][1]);
        _buyRawState(_amount, _id, reserveIn);

        //sell set as raw
        for (uint i = 0; i < uint(2); ++i) {
            uint reserveOut = PredictionLibrary.getReserveOut(_y, contents[i+1][0], contents[i+1][1]); 
            _sellRawState(_y, i+1, reserveOut);
            kept = kept.add(reserveOut); 
        }

        kept = kept.sub(reserveIn); 

        // mints = mints.add(_y); 
        b = b.add(_y).add(kept); 

        require(IERC20(coin).transferFrom(msg.sender, address(this), _y), "unable to receive reserve");
        _mint(msg.sender, _id, _amount, "");
    }

    function sellContract(uint _amount, uint _id, uint _y) public {
        uint kept; 
        //sell raw
        uint reserveOut = PredictionLibrary.getReserveOut(_amount, contents[_id][0], contents[_id][1]);
        _sellRawState(_amount, _id, reserveOut);
        kept = kept.add(reserveOut); 

        //buy set as raw
        for (uint i = 0; i < uint(2); ++i) {
            uint reserveIn = PredictionLibrary.getReserveIn(_y, contents[i+1][0], contents[i+1][1]); 
            _buyRawState(_y, i+1, reserveIn);
            kept = kept.sub(reserveIn); 
        }

        // mints = mints.sub(_y); 
        b = b.sub(_y).add(kept); 

        _burn(msg.sender, _id, _amount); 
        require(IERC20(coin).transfer(msg.sender, _y), "could not transfer reserve");
    }

    function addLiquidity(uint _amount) public {
        // require(_amount <= 2**112-1, "overflow"); 
        require(IERC20(coin).transferFrom(msg.sender, address(this), uint(_amount)), "unable to receive reserve");
        if (initialRatioDenominator != 0) {
            for (uint i = 0; i < uint(2); ++i) {
                //TODO: adjust for fixed point decimals
                contents[i+1][1] = contents[i+1][1].add(_amount.mul(initialRatioNumerator[i]) / initialRatioDenominator);
                contents[i+1][0] = contents[i+1][0].add(_amount);
            }
            initialRatioDenominator = 0; 
        } else {
            for (uint i = 0; i < uint(2); ++i) {
                //TODO: adjust for fixed point decimals
                contents[i+1][1] = contents[i+1][1].add(_amount.mul(contents[i+1][1]) / contents[i+1][0]);
                contents[i+1][0] = contents[i+1][0].add(_amount);
            }
        }
        _mint(msg.sender, 0, _amount, "");
        mints = mints.add(_amount); 
    }

    function removeLiquidity(uint _amount) public {
        require(balanceOf(msg.sender, 0) > 0, "not enough liquidity tokens to redeem");
        for (uint i = 0; i < uint(2); ++i) {
            contents[i+1][0] = contents[i+1][0].mul(mints.sub(_amount)) / mints;
            contents[i+1][1] = contents[i+1][1].mul(mints.sub(_amount)) / mints;
        }
        b = b.mul(mints.sub(_amount)) / mints; 
        require(IERC20(coin).transfer(msg.sender, _amount), "could not transfer collateral tokens");
        _burn(msg.sender, 0, _amount); 
        mints = mints.sub(_amount); 
    }

    // function validate(uint _id) public {
    //     require(msg.sender == oracle, "Non-oracle called validate");
    //     winner = _id; 
    // }

    // // function redeem(uint _amount, uint _id) public {
    // //     require(_id == winner)
    // // }
}