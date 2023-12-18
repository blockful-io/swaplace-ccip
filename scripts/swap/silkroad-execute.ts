import { ethers } from "hardhat";
import { Swap, composeSwap } from "../SwapFactory";
import { blocktimestamp, getSwaplaceData, getMockData } from "../utils";
import { mint } from "../mint/silkroad-mint";
import { approveMock, approveLINK } from "../approve/silkroad-approve";
import { setAllowlistSender } from "../approve/silkroad-allowlist";

export async function execute(destinationChain: any) {
  // Prepare signers
  const [signer] = await ethers.getSigners();

  // Get contract address from .env
  const mockSource = await getMockData();

  // Get contract address from .env
  const mockDestination = await getMockData(destinationChain);

  // Get chain data from .env
  const swaplaceSource = await getSwaplaceData();

  // Get chain data from .env
  const swaplaceDestination = await getSwaplaceData(destinationChain);

  // Mint token source chain
  const tokenIdSource = await mint(signer.address, mockSource.chainSelector);

  // Mint token destination chain
  const tokenIdDestination = await mint(
    signer.address,
    mockDestination.chainSelector
  );

  // Approve ERC source chain
  await approveMock(
    swaplaceSource.address,
    tokenIdSource,
    mockSource.chainSelector
  );

  // Approve ERC destination chain
  await approveMock(
    swaplaceDestination.address,
    tokenIdDestination,
    destinationChain
  );

  // Approve LINK source chain
  await approveLINK(
    swaplaceSource.address,
    ethers.constants.MaxUint256,
    mockSource.chainSelector
  );

  // Approve LINK destination chain
  await approveLINK(
    swaplaceDestination.address,
    ethers.constants.MaxUint256,
    destinationChain
  );

  // Swaplace contract source chain
  const ContractSource = await ethers.getContractAt(
    "Swaplace",
    swaplaceSource.address,
    signer
  );

  // Build swap
  const bidingAddr = [mockSource.address];
  const bidingAmountOrId = [tokenIdSource];

  const askingAddr = [mockDestination.address];
  const askingAmountOrId = [tokenIdDestination];

  const swap: Swap = await composeSwap(
    ContractSource, // Contract instance for parsing bitwise
    signer.address, // owner
    signer.address, // allowed
    destinationChain, // destination chain
    (await blocktimestamp()) * 2, // expiration
    bidingAddr, // biding address
    bidingAmountOrId, // biding amount or id
    askingAddr, // asking address
    askingAmountOrId // asking amount or id
  );

  // Allowlists destination chain's Swaplace contract in source chain
  await setAllowlistSender(
    swaplaceSource.chainSelector,
    swaplaceDestination.chainSelector
  );

  // Allowlists source chain's Swaplace contract in destination chain
  await setAllowlistSender(
    swaplaceDestination.chainSelector,
    swaplaceSource.chainSelector
  );

  // Execute Swap
  var tx = await ContractSource.executeSwap(swap, {
    gasLimit: 3000000,
    maxPriorityFeePerGas: 20001002003,
    maxFeePerGas: 20001002003,
  });
  const receipt = await tx.wait();
  console.log(
    "\nSent CCIP Message from %s \nTx %s\n",
    swaplaceSource.envName,
    receipt.transactionHash
  );
}

const bnb_chain_selector = "13264668187771770619";
execute(bnb_chain_selector);
