// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {ICCIP} from "./interfaces/ICCIP.sol";

abstract contract CCIP is CCIPReceiver, OwnerIsCreator, ICCIP {
  bytes32 public lastReceivedMessageId;

  IERC20 private _linkToken;
  IRouterClient private _router;

  mapping(bytes32 => uint16) private _unlockSteps;
  mapping(uint64 => address) private _allowlistedSenders;

  constructor(address _router_, address _link) CCIPReceiver(_router_) {
    _linkToken = IERC20(_link);
    _router = IRouterClient(_router_);
  }

  function allowlistSender(
    uint64 _sourceChainSelector,
    address _sender
  ) external onlyOwner {
    _allowlistedSenders[_sourceChainSelector] = _sender;
  }

  function _sendMessagePayLINK(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof
  ) internal returns (bytes32) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(_linkToken)
    );

    uint256 fees = _router.getFee(_destinationChainSelector, evm2AnyMessage);

    _linkToken.transferFrom(msg.sender, address(this), fees);

    if (fees > _linkToken.balanceOf(address(this)))
      revert NotEnoughBalance(_linkToken.balanceOf(address(this)), fees);

    _linkToken.approve(address(_router), fees);

    bytes32 messageId = _router.ccipSend(
      _destinationChainSelector,
      evm2AnyMessage
    );

    emit MessageSent(
      messageId,
      _destinationChainSelector,
      _receiver,
      _proof,
      address(_linkToken),
      fees
    );

    return messageId;
  }

  function _sendMessagePayNative(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof,
    uint256 _value
  ) internal returns (bytes32) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(0)
    );

    uint256 fees = _router.getFee(_destinationChainSelector, evm2AnyMessage);

    if (fees > _value) {
      revert NotEnoughBalance(_value, fees);
    }

    bytes32 messageId = _router.ccipSend{value: fees}(
      _destinationChainSelector,
      evm2AnyMessage
    );

    if (_value > fees) {
      payable(msg.sender).transfer(_value - fees);
    }

    emit MessageSent(
      messageId,
      _destinationChainSelector,
      _receiver,
      _proof,
      address(0),
      fees
    );

    return messageId;
  }

  function _buildCCIPMessage(
    address _receiver,
    bytes32 proof,
    address _feeTokenAddress
  ) internal pure returns (Client.EVM2AnyMessage memory) {
    return
      Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver),
        data: abi.encode(proof),
        tokenAmounts: new Client.EVMTokenAmount[](0),
        extraArgs: Client._argsToBytes(
          Client.EVMExtraArgsV1({gasLimit: 1_000_000, strict: false})
        ),
        feeToken: _feeTokenAddress
      });
  }

  function _ccipReceive(
    Client.Any2EVMMessage memory any2EvmMessage
  ) internal override {
    if (
      abi.decode(any2EvmMessage.sender, (address)) !=
      _allowlistedSenders[any2EvmMessage.sourceChainSelector]
    ) revert SenderNotAllowlisted(abi.decode(any2EvmMessage.sender, (address)));

    lastReceivedMessageId = any2EvmMessage.messageId; // fetch the messageId

    bytes32 proof = abi.decode(any2EvmMessage.data, (bytes32));
    _increaseUnlockSteps(proof);

    emit MessageReceived(
      any2EvmMessage.messageId,
      any2EvmMessage.sourceChainSelector,
      address(this),
      proof
    );
  }

  function _increaseUnlockSteps(bytes32 _proof) internal {
    _unlockSteps[_proof] += 1;
  }

  function _simulateFees(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof
  ) internal view returns (uint256 fees) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(_linkToken)
    );

    fees = _router.getFee(_destinationChainSelector, evm2AnyMessage);
  }

  function getLinkToken() public view returns (IERC20) {
    return _linkToken;
  }

  function getUnlockSteps(bytes32 proof) public view returns (uint16 steps) {
    return _unlockSteps[proof];
  }

  function allowlistSenders(
    uint64 _sourceChainSelector
  ) public view returns (address) {
    return _allowlistedSenders[_sourceChainSelector];
  }

  receive() external payable {}
}
