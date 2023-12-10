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

  // Overswap OverswapMumbai
  const OverswapMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );

  // Mock OverswapMumbai
  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    ERC721_MUMBAI as string,
    signerMumbai
  );
  const tokenId = 400;
  await MockERC721.mintTo(signerMumbai.address, tokenId);
  await MockERC721.connect(signerMumbai).approve(
    OverswapMumbai.address,
    tokenId
  );

  // Create a swap
  const bidingAddr = [ERC721_MUMBAI];
  const bidingAmountOrId = [tokenId];

  const askingAddr = [ERC721_BNB];
  const askingAmountOrId = [1];

  const swap: Swap = await composeSwap(
    OverswapMumbai,
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
  const simulateFee = await OverswapMumbai.connect(signerMumbai).simulateFees(
    swap
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
  await Link.connect(signerMumbai).approve(OverswapMumbai.address, fee);
  console.log(
    "Approved %s LINK and to the contract %s",
    fee,
    OverswapMumbai.address
  );

  // Create a Swap
  const tx = await OverswapMumbai.connect(signerMumbai).createSwap(swap, {
    gasLimit: 3000000,
    maxPriorityFeePerGas: 20001002003,
    maxFeePerGas: 20001002003,
  });

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);

  // Claim dust in the contract
  await OverswapMumbai.redeem();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
