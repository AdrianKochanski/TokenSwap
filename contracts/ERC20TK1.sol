// contracts/Days365.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20TK1 is ERC20 {
    uint256 private price;

    constructor() ERC20("TEST1", "TT1")
    {
        _mint(msg.sender, 100000000000000000000); // 100 * 10^18
    }
}