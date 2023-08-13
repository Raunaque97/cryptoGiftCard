// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Test_USDC is ERC20 {
    constructor() ERC20("Test_USDC", "USDC") {
        _mint(msg.sender, 1e24);
    }

    // create a mint function which anyone can call and get 10 TST
    function mint() public {
        _mint(msg.sender, 1e18);
    }
}
