// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {CCIP} from "./CCIP.sol";
import {ISwaplace} from "./interfaces/ISwaplace.sol";

contract Swaplace is CCIP, ISwaplace {
  uint256 private _totalSwaps;

  mapping(uint256 => Swap) private _swaps;

  constructor(address _router, address _link) CCIP(_router, _link) {}

  function createSwap(Swap calldata swap) external payable returns (uint256) {
    (, uint64 destinationChainSelector, uint32 expiration) = parseData(
      swap.config
    );

    if (swap.owner != msg.sender) revert InvalidAddress(msg.sender);

    if (expiration < block.timestamp) revert InvalidExpiration(expiration);

    if (swap.biding.length == 0 || swap.asking.length == 0)
      revert InvalidAssetsLength();

    bytes memory data = abi.encode(swap);

    if (msg.value > 0) {
      _sendMessagePayNative(
        destinationChainSelector,
        allowlistSenders(destinationChainSelector),
        data,
        msg.value
      );
    } else {
      _sendMessagePayLINK(
        destinationChainSelector,
        allowlistSenders(destinationChainSelector),
        data
      );
    }

    _transferFrom(msg.sender, address(this), swap.biding);

    unchecked {
      assembly {
        sstore(_totalSwaps.slot, add(sload(_totalSwaps.slot), 1))
      }
    }

    uint256 swapId = _totalSwaps;
    _swaps[swapId] = swap;

    emit SwapCreated(swapId, msg.sender, expiration);

    return swapId;
  }

  function simulateFees(
    Swap calldata swap,
    uint64 destinationChainSelector,
    bool native
  ) public view returns (uint256 fees) {
    fees = _simulateFees(
      destinationChainSelector,
      allowlistSenders(destinationChainSelector),
      abi.encode(swap),
      native
    );
  }

  function totalSwaps() public view returns (uint256) {
    return _totalSwaps;
  }

  function getSwap(uint256 swapId) public view returns (Swap memory) {
    return _swaps[swapId];
  }

  function redeem() public payable onlyOwner {
    payable(address(msg.sender)).transfer(address(this).balance);
  }
}
