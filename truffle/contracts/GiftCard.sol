// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Verifier as GiftVerifier} from "./giftVerifier.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract GiftCard is AccessControl {
    IERC20 public erc20;
    // eddsa public key
    uint256 public Ax;
    uint256 public Ay;
    mapping(uint256 => bool) public nullifiers;

    constructor(address _erc20Address, uint256 _Ax, uint256 _Ay) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        erc20 = IERC20(_erc20Address);
        Ax = _Ax;
        Ay = _Ay;
    }

    function redeem(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[5] calldata input // [beneficiary, nullifier, amount, Ax, Ay]
    ) external {
        require(!nullifiers[input[1]], "already redeemed");
        require(input[3] == Ax && input[4] == Ay, "invalid pubKey");
        require(
            (new GiftVerifier()).verifyProof(a, b, c, input),
            "invalid proof"
        );
        nullifiers[input[1]] = true;
        erc20.transfer(address(uint160(input[0])), input[2]);
    }

    // setters
    function setPublicKey(uint256 _Ax, uint256 _Ay) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "not allowed");
        Ax = _Ax;
        Ay = _Ay;
    }
}
