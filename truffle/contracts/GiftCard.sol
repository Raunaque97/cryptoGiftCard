// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Verifier as GiftVerifier} from "./giftVerifier.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract GiftCard is AccessControl {
    IERC20 public erc20;
    mapping(uint256 => bool) public nullifiers;

    constructor(address _erc20Address) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        erc20 = IERC20(_erc20Address);
    }

    function redeem(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[3] calldata input // [beneficiary, nullifier, amount]
    ) external {
        require(!nullifiers[input[1]], "nullifier already used");
        require(
            (new GiftVerifier()).verifyProof(a, b, c, input),
            "invalid proof"
        );
        nullifiers[input[1]] = true;
        erc20.transfer(address(uint160(input[0])), input[2]);
    }
}
