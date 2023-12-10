// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {CCIP} from "./CCIP.sol";
import {IOverswap} from "./interfaces/IOverswap.sol";
import {ITransfer} from "./interfaces/ITransfer.sol";

contract Overswap is CCIP, IOverswap {
  uint256 private _totalSwaps;

  mapping(uint256 => Swap) private _swaps;

  constructor(address _router, address _link) CCIP(_router, _link) {}

  function createSwap(Swap calldata swap) external payable returns (uint256) {
    if (swap.owner != msg.sender) {
      revert InvalidAddress(msg.sender);
    }

    (, uint64 destinationChainSelector, uint32 expiration) = _parseData(
      swap.config
    );

    if (expiration < block.timestamp) {
      revert InvalidExpiry(expiration);
    }

    if (swap.biding.length == 0 || swap.asking.length == 0) {
      revert InvalidAssetsLength();
    }

    unchecked {
      assembly {
        sstore(_totalSwaps.slot, add(sload(_totalSwaps.slot), 1))
      }
    }

    uint256 swapId = _totalSwaps;
    bytes32 proof = keccak256(abi.encode(swapId, swap));

    if (msg.value > 0) {
      _sendMessagePayNative(destinationChainSelector, msg.sender, proof);
    } else {
      _sendMessagePayLINK(destinationChainSelector, msg.sender, proof);
    }

    _transferFrom(msg.sender, address(this), swap.biding);

    _unlockSteps[proof] = 1;
    _swaps[swapId] = swap;

    emit SwapCreated(swapId, msg.sender, expiration);

    return swapId;
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
}
