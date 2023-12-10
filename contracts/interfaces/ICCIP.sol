// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface ICCIP {
  error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
  error NothingToWithdraw();
  error FailedToWithdrawEth(address owner, address target, uint256 value);
  error DestinationChainNotAllowlisted(uint64 destinationChainSelector);
  error SourceChainNotAllowlisted(uint64 sourceChainSelector);
  error SenderNotAllowlisted(address sender);

  event MessageSent(
    bytes32 indexed messageId,
    uint64 indexed destinationChainSelector,
    address receiver,
    bytes32 _proof,
    address feeToken,
    uint256 fees
  );

  event MessageReceived(
    bytes32 indexed messageId,
    uint64 indexed sourceChainSelector,
    address sender,
    bytes32 proof
  );
}
