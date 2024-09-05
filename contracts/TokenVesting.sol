// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVesting is Ownable {
    IERC20 public token;
    address public operator;

    struct Beneficiary {
        uint256 amount;
        uint256 releaseTime;
        bool claimed;
    }

    mapping(address => Beneficiary) public beneficiaries;

    event TokensClaimed(address indexed beneficiary, uint256 amount);
    event OperatorChanged(address indexed previousOperator, address indexed newOperator);

    constructor(IERC20 _token, address _operator) Ownable(msg.sender) {
        require(_operator != address(0), 'Invalid operator address');

        token = _token;
        operator = _operator;
    }

    function newOperator(address _operator) public onlyOwner {
        require(_operator != address(0), "Invalid operator address");
        emit OperatorChanged(operator, _operator); 
        operator = _operator;
    }


    function addBeneficiary(address _beneficiary, uint256 _amount, uint256 _releaseTime) public onlyOwner {
        require(_beneficiary != address(0), "Invalid address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_releaseTime > block.timestamp, "Release time must be in the future");

        beneficiaries[_beneficiary] = Beneficiary({
            amount: _amount,
            releaseTime: _releaseTime,
            claimed: false
        });
    }

    function claim(address _beneficiary) external {
        Beneficiary storage beneficiary = beneficiaries[_beneficiary];
        
        require(beneficiary.amount > 0, "No tokens to claim");
        require(block.timestamp >= beneficiary.releaseTime, "Tokens are not yet releasable");
        require(!beneficiary.claimed, "Tokens already claimed");
        require(_beneficiary == msg.sender || msg.sender == operator, "Not authorized to claim tokens");

        beneficiary.claimed = true;
        require(token.transfer(_beneficiary, beneficiary.amount), "Token transfer failed");

        emit TokensClaimed(_beneficiary, beneficiary.amount);
    }

    function distributeTokens(address[] memory _beneficiaries, uint256[] memory _amounts, uint256[] memory _releaseTimes) external onlyOwner {
        require(_beneficiaries.length == _amounts.length && _amounts.length == _releaseTimes.length, "Array lengths must match");

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            addBeneficiary(_beneficiaries[i], _amounts[i], _releaseTimes[i]);
        }
    }
}
