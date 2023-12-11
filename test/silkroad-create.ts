import { ethers } from "hardhat";
import { Swap, composeSwap } from "./SwapFactory";
import { blocktimestamp, destinationChainBNB } from "../scripts/utils";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  OVERSWAP_MUMBAI,
  ERC721_BNB,
  ERC721_MUMBAI,
} = process.env;

async function main() {
  // Prepare Signers
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);

  // $LINK Address
  const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Overswap ContractMumbai
  const ContractMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  // Mock ContractMumbai
  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    ERC721_MUMBAI as string,
    signerMumbai
  );
  const totalSupply = await MockERC721.totalSupply();
  const tokenId = 1000 + Number(totalSupply);
  console.log("Using Token ID:", tokenId);

  // Mint ERC721
  var tx = await MockERC721.connect(signerMumbai).mintTo(
    signerMumbai.address,
    tokenId
  );
  await tx.wait();
  console.log("Minted Token ID %s", tokenId);

  // Approve ERC721
  var tx = await MockERC721.connect(signerMumbai).approve(
    ContractMumbai.address,
    tokenId
  );
  await tx.wait();
  console.log(
    "Approved Token ID %s to contract %s",
    tokenId,
    MockERC721.address
  );

  // Create a swap
  const bidingAddr = [ERC721_MUMBAI];
  const bidingAmountOrId = [tokenId];

  const askingAddr = [ERC721_BNB];
  const askingAmountOrId = [tokenId];

  const swap: Swap = await composeSwap(
    ContractMumbai,
    signerMumbai.address,
    ethers.constants.AddressZero,
    destinationChainBNB,
    (await blocktimestamp()) * 2,
    bidingAddr,
    bidingAmountOrId,
    askingAddr,
    askingAmountOrId
  );

  // Simulate fees
  const simulateFee = await ContractMumbai.connect(signerMumbai).simulateFees(
    swap,
    destinationChainBNB
  );
  const fee = simulateFee[0];
  const proof = simulateFee[1];
  console.log("Fee %s", ethers.utils.formatEther(fee));
  console.log("Proof %s", proof);

  // Approve usage of link and NFTs
  const Link = new ethers.Contract(
    link,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signerMumbai
  );
  await Link.connect(signerMumbai).approve(ContractMumbai.address, fee);
  console.log(
    "Approved %s LINK and to the contract %s",
    fee,
    ContractMumbai.address
  );

  // Create a Swap
  var tx = await ContractMumbai.connect(signerMumbai).createSwap(swap, {
    gasLimit: 3000000,
    maxPriorityFeePerGas: 20001002003,
    maxFeePerGas: 20001002003,
  });

  const receipt = await tx.wait();
  console.log(
    "\nSent CCIP Message from Mumbai \nTx %s\n",
    receipt.transactionHash
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
