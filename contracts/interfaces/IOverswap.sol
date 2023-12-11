// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IOverswap {
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

  /**
   * @dev The Swap struct is the heart of a Swap.
   *
   * It is composed of:
   * - `owner` of the Swap.
   * - `allowed` address to accept the Swap.
   * - `expiry` date of the Swap.
   * - `biding` assets that are being bided by the owner.
   * - `asking` assets that are being asked by the owner.
   *
   * NOTE: When `allowed` address is the zero address, anyone can accept the Swap.
   */
  struct Swap {
    address owner;
    uint256 config;
    Asset[] biding;
    Asset[] asking;
  }

  /**
   * @dev Displayed when the caller is not the owner of the swap.
   */
  error InvalidAddress(address caller);

  /**
   * @dev Displayed when the amount of {ISwap-Asset} has a length of zero.
   *
   * NOTE: The `biding` or `asking` array must not be empty to avoid mistakes
   * when creating a swap. Assuming one side of the swap is empty, the
   * correct approach should be the usage of {transferFrom} and we reinforce
   * this behavior by requiring the length of the array to be bigger than zero.
   */
  error InvalidAssetsLength();

  /**
   * @dev Displayed when the `expiry` date is in the past.
   */
  error InvalidExpiration(uint256 timestamp);

  /**
   * @dev Emitted when a new Swap is created.
   */
  event SwapCreated(
    uint256 indexed swapId,
    bytes32 indexed proof,
    address indexed owner,
    uint256 expiration
  );

  /**
   * @dev Emitted when a Swap is accepted.
   */
  event SwapAccepted(
    uint256 indexed swapId,
    bytes32 indexed proof,
    address indexed acceptee
  );

  /**
   * @dev Emitted when a Swap content is withdrawn.
   */
  event Withdraw(bytes32 indexed proof, address indexed acceptee);
}
