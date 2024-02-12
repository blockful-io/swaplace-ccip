// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @dev Interface for the Swap Struct, used in the {Swaplace} implementation.
 */
interface ISwap {
  /**
   * @dev Assets can be ERC20 or ERC721.
   *
   * It is composed of:
   * - `addr` of the asset.
   * - `amountOrId` of the asset based on the standard.
   *
   * NOTE: `amountOrId` is the `amount` of ERC20 or the `tokenId` of ERC721.
   */
  struct Asset {
    address addr;
    uint256 amountOrId;
  }

  struct Swap {
    address owner;
    uint256 config;
    Asset[] biding;
    Asset[] asking;
  }
}
