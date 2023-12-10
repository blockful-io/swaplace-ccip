// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {CCIP} from "./CCIP.sol";
import {IOverswap} from "./interfaces/IOverswap.sol";
import {ITransfer} from "./interfaces/ITransfer.sol";

contract Overswap is CCIP, IOverswap {
  mapping(bytes32 => Swap) private _swaps;

  constructor(address _router, address _link) CCIP(_router, _link) {}

  function createSwap(Swap calldata swap) external payable returns (bytes32) {
    (, uint64 destinationChainSelector, uint32 expiration) = _parseData(
      swap.config
    );

    if (swap.owner != msg.sender) {
      revert InvalidAddress(msg.sender);
    }

    if (expiration < block.timestamp) {
      revert InvalidExpiration(expiration);
    }

    if (swap.biding.length == 0 || swap.asking.length == 0) {
      revert InvalidAssetsLength();
    }

    bytes32 messageId;
    bytes32 proof = keccak256(abi.encode(swap));

    if (msg.value > 0) {
      messageId = _sendMessagePayNative(
        destinationChainSelector,
        msg.sender,
        proof
      );
    } else {
      messageId = _sendMessagePayLINK(
        destinationChainSelector,
        msg.sender,
        proof
      );
    }

    _transferFrom(msg.sender, address(this), swap.biding);
    _increaseUnlockSteps(proof);

    _swaps[messageId] = swap;

    emit SwapCreated(messageId, msg.sender, expiration);

    return messageId;
  }

  function acceptSwap(Swap calldata swap) public {
    (
      address allowed,
      uint64 destinationChainSelector,
      uint32 expiration
    ) = _parseData(swap.config);

    if (allowed != address(0) && allowed != msg.sender) {
      revert InvalidAddress(msg.sender);
    }

    if (expiration < block.timestamp) {
      revert InvalidExpiration(expiration);
    }

    bytes32 proof = keccak256(abi.encode(swap));
  }

  function _packData(
    address allowed,
    uint64 destinationChainSelector,
    uint32 expiration
  ) public pure returns (uint256) {
    return
      uint160(allowed) |
      (destinationChainSelector << 160) |
      (expiration << 224);
  }

  function _parseData(
    uint256 validationData
  ) public pure returns (address, uint64, uint32) {
    return (
      address(uint160(validationData)),
      uint64(validationData >> 160),
      uint32(validationData >> 224)
    );
  }

  function _transferFrom(
    address from,
    address to,
    Asset[] calldata assets
  ) internal {
    for (uint256 i = 0; i < assets.length; ) {
      ITransfer(assets[i].addr).transferFrom(from, to, assets[i].amountOrId);
      unchecked {
        i++;
      }
    }
  }

  function simulateFees(Swap calldata swap) public view returns (uint256 fees) {
    (, uint64 destinationChainSelector, ) = _parseData(swap.config);
    bytes32 proof = keccak256(abi.encode(swap));
    fees = _simulateFees(destinationChainSelector, swap.owner, proof);
  }

  function getSwaps(bytes32 messageId) public view returns (Swap memory) {
    return _swaps[messageId];
  }
}
