// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {ICCIP} from "./interfaces/ICCIP.sol";
import {ISwap} from "./interfaces/ISwap.sol";
import {ITransfer} from "./interfaces/ITransfer.sol";

abstract contract CCIP is CCIPReceiver, OwnerIsCreator, ICCIP, ISwap {
  bytes32 public lastReceivedMessageId;

  IERC20 private _linkToken;
  IRouterClient private _router;

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
    bytes memory _data
  ) internal returns (bytes32) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      _receiver,
      _data,
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
      address(_linkToken),
      fees
    );

    return messageId;
  }

  function _buildCCIPMessage(
    address _receiver,
    bytes memory _data,
    address _feeTokenAddress
  ) internal pure returns (Client.EVM2AnyMessage memory) {
    return
      Client.EVM2AnyMessage({
        receiver: abi.encode(_receiver),
        data: _data,
        tokenAmounts: new Client.EVMTokenAmount[](0),
        extraArgs: Client._argsToBytes(
          Client.EVMExtraArgsV1({gasLimit: 3_000_000, strict: false})
        ),
        feeToken: _feeTokenAddress
      });
  }

  function _ccipReceive(
    Client.Any2EVMMessage memory any2EvmMessage
  ) internal override {
    address sender = abi.decode(any2EvmMessage.sender, (address));

    if (sender != _allowlistedSenders[any2EvmMessage.sourceChainSelector])
      revert SenderNotAllowlisted(sender);

    (Swap memory swap, uint256 stage) = abi.decode(
      any2EvmMessage.data,
      (Swap, uint256)
    );

    (address allowed, , ) = parseData(swap.config);

    if (stage == 1) {
      // Get asking assets from allowed
      _transferFrom(allowed, address(this), swap.asking);

      _sendMessagePayLINK(
        any2EvmMessage.sourceChainSelector,
        sender,
        abi.encode(swap, 2)
      );
    } else if (stage == 2) {
      // Send biding assets to allowed
      // TODO: will need a try catch here to make sure it is approved, otherwise return the funds
      _transferFrom(address(this), allowed, swap.biding);

      _sendMessagePayLINK(
        any2EvmMessage.sourceChainSelector,
        sender,
        abi.encode(swap, 3)
      );
    } else if (stage == 3) {
      // Send asking assets to owner
      _transferFrom(address(this), swap.owner, swap.asking);
    }

    emit MessageReceived(
      any2EvmMessage.messageId,
      any2EvmMessage.sourceChainSelector,
      address(this),
      stage
    );
  }

  function _transferFrom(
    address from,
    address to,
    Asset[] memory assets
  ) internal {
    for (uint256 i = 0; i < assets.length; ) {
      ITransfer(assets[i].addr).transferFrom(from, to, assets[i].amountOrId);
      unchecked {
        i++;
      }
    }
  }

  function simulateFees(
    Swap calldata swap,
    uint64 destinationChainSelector
  ) public view returns (uint256 fees) {
    Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
      allowlistSenders(destinationChainSelector),
      abi.encode(swap, 1),
      address(_linkToken)
    );

    fees = _router.getFee(destinationChainSelector, evm2AnyMessage);
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

  function getLinkToken() public view returns (IERC20) {
    return _linkToken;
  }

  function allowlistSenders(
    uint64 _sourceChainSelector
  ) public view returns (address) {
    return _allowlistedSenders[_sourceChainSelector];
  }

  receive() external payable {}
}
