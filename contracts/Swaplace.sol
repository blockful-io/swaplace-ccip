// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {CCIP} from "./CCIP.sol";
import {ISwaplace} from "./interfaces/ISwaplace.sol";

contract Swaplace is CCIP, ISwaplace {
  uint256 private _totalSwaps;

  mapping(uint256 => Swap) private _swaps;
  mapping(uint256 => uint256) private _refunds;

  constructor(address _router, address _link) CCIP(_router, _link) {}

  function executeSwap(Swap calldata swap) external payable returns (uint256) {
    (, uint64 destinationChainSelector, uint32 expiration) = parseData(
      swap.config
    );

    if (swap.owner != msg.sender) revert InvalidAddress(msg.sender);

    if (expiration < block.timestamp) revert InvalidExpiration(expiration);

    if (swap.biding.length == 0 || swap.asking.length == 0)
      revert InvalidAssetsLength();

    bytes memory data = abi.encode(swap, 1);

    _sendMessagePayLINK(
      destinationChainSelector,
      allowlistSenders(destinationChainSelector),
      msg.sender,
      data
    );

    // _transferFrom(msg.sender, address(this), swap.biding);

    unchecked {
      assembly {
        sstore(_totalSwaps.slot, add(sload(_totalSwaps.slot), 1))
      }
    }

    uint256 swapId = _totalSwaps;
    _swaps[swapId] = swap;

    // Enough time for the funds to be executed by CCIP
    unchecked {
      _refunds[swapId] = block.timestamp + 1 days;
    }

    emit SwapCreated(swapId, msg.sender, expiration);

    return swapId;
  }

  function cancelSwap(uint256 swapId) external {
    Swap memory swap = _swaps[swapId];

    if (swap.owner != msg.sender) revert InvalidAddress(msg.sender);

    if (_refunds[swapId] > block.timestamp)
      revert InvalidExpiration(_refunds[swapId]);

    _transferFrom(address(this), msg.sender, swap.biding);
    _withdrawLink(msg.sender);

    emit SwapCanceled(swapId, msg.sender);
  }

  function totalSwaps() public view returns (uint256) {
    return _totalSwaps;
  }

  function getSwap(uint256 swapId) public view returns (Swap memory) {
    return _swaps[swapId];
  }
}
