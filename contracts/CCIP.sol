// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {IMessenger} from "./interfaces/IMessenger.sol";

abstract contract CCIP is CCIPReceiver, OwnerIsCreator, IMessenger {
  mapping(bytes32 => bytes32) private _receivedProof;

  mapping(bytes32 => uint16) private _unlockSteps;

  IERC20 private _linkToken;

  mapping(uint64 => bool) private _allowlistedDestinationChains;

  mapping(uint64 => bool) private _allowlistedSourceChains;

  // mapping(uint64 => address) private _allowlistedSenders;

  constructor(address _router, address _link) CCIPReceiver(_router) {
    _linkToken = IERC20(_link);
  }

  modifier onlyAllowlisted(uint64 _sourceChainSelector, address _sender) {
    if (!_allowlistedSourceChains[_sourceChainSelector])
      revert SourceChainNotAllowlisted(_sourceChainSelector);
    // if (_allowlistedSenders[_sourceChainSelector] != _sender)
    //   revert SenderNotAllowlisted(_sender);
    _;
  }

  function allowlistDestinationChain(
    uint64 _destinationChainSelector,
    bool allowed
  ) external onlyOwner {
    _allowlistedDestinationChains[_destinationChainSelector] = allowed;
  }

  function allowlistSourceChain(
    uint64 _sourceChainSelector,
    bool allowed
  ) external onlyOwner {
    _allowlistedSourceChains[_sourceChainSelector] = allowed;
  }

  // function allowlistSender(
  //   uint64 _sourceChainSelector,
  //   address _sender
  // ) external onlyOwner {
  //   _allowlistedSenders[_sourceChainSelector] = _sender;
  // }

  function _sendMessagePayLINK(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof
  ) internal {
    if (!_allowlistedDestinationChains[_destinationChainSelector]) {
      revert DestinationChainNotAllowlisted(_destinationChainSelector);
    }

    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(_linkToken)
    );

    IRouterClient router = IRouterClient(this.getRouter());

    uint256 fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

    _linkToken.transferFrom(msg.sender, address(this), fees);

    if (fees > _linkToken.balanceOf(address(this)))
      revert NotEnoughBalance(_linkToken.balanceOf(address(this)), fees);

    _linkToken.approve(address(router), fees);

    bytes32 messageId = router.ccipSend(
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
  }

  function _sendMessagePayNative(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof
  ) internal returns (uint256 fees) {
    if (!_allowlistedDestinationChains[_destinationChainSelector]) {
      revert DestinationChainNotAllowlisted(_destinationChainSelector);
    }

    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(0)
    );

    IRouterClient router = IRouterClient(this.getRouter());

    fees = router.getFee(_destinationChainSelector, evm2AnyMessage);

    if (fees > msg.value) {
      revert NotEnoughBalance(msg.value, fees);
    }

    bytes32 messageId = router.ccipSend{value: fees}(
      _destinationChainSelector,
      evm2AnyMessage
    );

    if (msg.value > fees) {
      payable(msg.sender).transfer(msg.value - fees);
    }

    emit MessageSent(
      messageId,
      _destinationChainSelector,
      _receiver,
      _proof,
      address(0),
      fees
    );
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
  )
    internal
    override
    onlyAllowlisted(
      any2EvmMessage.sourceChainSelector,
      abi.decode(any2EvmMessage.sender, (address))
    )
  {
    bytes32 proof = abi.decode(any2EvmMessage.data, (bytes32));
    _unlockSteps[proof] += 1;

    emit MessageReceived(
      any2EvmMessage.messageId,
      any2EvmMessage.sourceChainSelector,
      abi.decode(any2EvmMessage.sender, (address)),
      abi.decode(any2EvmMessage.data, (bytes32))
    );
  }

  function simulateFees(
    uint64 _destinationChainSelector,
    address _receiver,
    bytes32 _proof
  ) public view returns (uint256 fees) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _proof,
      address(_linkToken)
    );

    IRouterClient router = IRouterClient(this.getRouter());

    fees = router.getFee(_destinationChainSelector, evm2AnyMessage);
  }

  function getProofFrom(bytes32 messageId) public view returns (bytes32 proof) {
    return _receivedProof[messageId];
  }

  function getLinkToken() public view returns (IERC20) {
    return _linkToken;
  }

  function allowedDestinationChains(
    uint64 _destinationChainSelector
  ) public view returns (bool) {
    return _allowlistedDestinationChains[_destinationChainSelector];
  }

  function allowedSourceChains(
    uint64 _sourceChainSelector
  ) public view returns (bool) {
    return _allowlistedSourceChains[_sourceChainSelector];
  }

  // function allowedSenders(
  //   uint64 _sourceChainSelector
  // ) public view returns (address) {
  //   address sender = _allowlistedSenders[_sourceChainSelector];
  //   if (sender == address(0)) {
  //     revert SenderNotAllowlisted(_allowlistedSenders[_sourceChainSelector]);
  //   }
  //   return sender;
  // }

  receive() external payable {}
}
