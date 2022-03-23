// contracts/Days365.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    ERC20 private token1;
    ERC20 private token2;
    uint public price;

    constructor(ERC20 _token1, ERC20 _token2, uint _price)
    {
        token1 = _token1;
        token2 = _token2;
        price = _price;
    }

    function updatePrice(uint _price) public onlyOwner
    {
        price = _price;
    }

    function deposit(ERC20 _token, uint amount) public onlyOwner 
    {
        require(address(token1) != address(_token) || address(token2) != address(_token), "Deposit not allowed!");
        require(_token.allowance(msg.sender, address(this)) >= amount, "ERC20 allowance too low!");

        _token.transferFrom(msg.sender, address(this), amount);
    }

    function exchange(ERC20 _token, uint amount) public 
    {
        require(amount > 0, "Swap amount too low!");
        require(address(token1) != address(_token) || address(token2) != address(_token), "Exchange not allowed!");
        require(_token.allowance(msg.sender, address(this)) >= amount, "ERC20 allowance too low!");
        _token.transferFrom(msg.sender, address(this), amount);

        (ERC20 tokenOutput, uint outputAmount) = getSwapAmount(_token, amount);
        require(tokenOutput.balanceOf(address(this)) >= outputAmount, "ERC20 balance too low!");
        require(outputAmount > 0, "Swap amount too low!");

        tokenOutput.transfer(msg.sender, outputAmount);
    }

    function getSwapAmount(ERC20 _token, uint inputAmount) internal view returns(ERC20 tokenOutput, uint outputAmount)
    {
        if(address(token1) == address(_token)) {
            tokenOutput = token2;
            outputAmount = inputAmount * 10**_token.decimals() / price;
        }
        else if (address(token2) == address(_token)) {
            tokenOutput = token1;
            outputAmount = inputAmount * price / 10**_token.decimals();
        }

        return (
            tokenOutput,
            outputAmount
        );
    }
}