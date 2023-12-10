// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {CCIP} from "./CCIP.sol";
import {IOverswap} from "./interfaces/IOverswap.sol";
import {ITransfer} from "./interfaces/ITransfer.sol";

contract Overswap is CCIP, IOverswap {
  uint256 private _totalSwaps;

  mapping(uint256 => Swap) private _swaps;

  constructor(address _router, address _link) CCIP(_router, _link) {}

  function createSwap(Swap calldata swap) external payable returns (bytes32) {
    (, uint64 destinationChainSelector, uint32 expiration) = parseData(
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

    bytes32 proof = keccak256(abi.encode(swap));

    if (msg.value > 0) {
      _sendMessagePayNative(
        destinationChainSelector,
        allowlistSenders(destinationChainSelector),
        msg.value,
        proof
      );
    } else {
      _sendMessagePayLINK(
        destinationChainSelector,
        allowlistSenders(destinationChainSelector),
        proof
      );
    }

    unchecked {
      assembly {
        sstore(_totalSwaps.slot, add(sload(_totalSwaps.slot), 1))
      }
    }
    _transferFrom(msg.sender, address(this), swap.biding);
    _increaseUnlockSteps(proof);

    _swaps[_totalSwaps] = swap;

    emit SwapCreated(proof, msg.sender, expiration);

    return proof;
  }

  function acceptSwap(Swap calldata swap) public payable {
    (
      address allowed,
      uint64 destinationChainSelector,
      uint32 expiration
    ) = parseData(swap.config);

    if (allowed != address(0) && allowed != msg.sender) {
      revert InvalidAddress(msg.sender);
    }

    if (expiration < block.timestamp) {
      revert InvalidExpiration(expiration);
    }

    bytes32 proof = keccak256(abi.encode(swap));

    if (msg.value > 0) {
      _sendMessagePayNative(
        destinationChainSelector,
        msg.sender,
        msg.value,
        proof
      );
    } else {
      _sendMessagePayLINK(destinationChainSelector, msg.sender, proof);
    }

    _increaseUnlockSteps(proof);
    _transferFrom(msg.sender, address(this), swap.asking);
  }

  function withdraw(bytes32 proof) public {
    address receiver = getReceiver(proof);
    Swap memory swap = getSwaps(proof);

    if (getUnlockSteps(proof) < 2) {
      revert NothingToWithdraw();
    }

    if (receiver != msg.sender) {
      revert InvalidAddress(msg.sender);
    }

    for (uint256 i = 0; i < swap.asking.length; ) {
      ITransfer(swap.asking[i].addr).approve(
        address(this),
        swap.asking[i].amountOrId
      ); // try to remove to see if it works
      ITransfer(swap.asking[i].addr).transferFrom(
        address(this),
        receiver,
        swap.asking[i].amountOrId
      );
      unchecked {
        i++;
      }
    }
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

  function packData(
    address allowed,
    uint64 destinationChainSelector,
    uint32 expiration
  ) public pure returns (uint256) {
    return
      uint160(allowed) |
      (uint256(destinationChainSelector) << 160) |
      (uint256(expiration) << (160 + 64));
  }

  function parseData(
    uint256 validationData
  ) public pure returns (address, uint64, uint32) {
    return (
      address(uint160(validationData)),
      uint64(validationData >> 160),
      uint32(validationData >> 224)
    );
  }

  function simulateFees(
    Swap calldata swap
  ) public view returns (uint256 fees, bytes32 proof) {
    (, uint64 destinationChainSelector, ) = parseData(swap.config);
    proof = keccak256(abi.encode(swap));
    fees = _simulateFees(destinationChainSelector, swap.owner, proof);
  }

  function getSwaps(bytes32 proof) public view returns (Swap memory) {
    return _swaps[proof];
  }

  function redeem() public payable onlyOwner {
    payable(address(msg.sender)).transfer(address(this).balance);
  }
}
