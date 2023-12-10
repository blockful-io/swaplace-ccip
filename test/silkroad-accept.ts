import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  OVERSWAP_MUMBAI,
  OVERSWAP_BNB,
  ERC721_BNB,
} = process.env;

async function main() {
  // Prepare Signers
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  var signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  var signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  // Getting the Swap Struct from another chain
  const ContractMumbai = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_MUMBAI as string,
    signerMumbai
  );
  const lastSwap = await ContractMumbai.totalSwaps();
  const swap = await ContractMumbai.getSwap(lastSwap);
  console.log("Last Swap %s", lastSwap);

  // Overswap OverswapBNB
  const ContractBNB = await ethers.getContractAt(
    "Overswap",
    OVERSWAP_BNB as string,
    signerBNB
  );

  // Mock ERC721
  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    ERC721_BNB as string,
    signerBNB
  );
  const tokenId = swap.asking[0].addr;
  console.log("Minting Token ID %s", tokenId);
  await MockERC721.connect(signerBNB).mintTo(signerBNB.address, tokenId);
  await MockERC721.connect(signerBNB).approve(ContractBNB.address, tokenId);
  console.log(
    "Approved Token ID %s to contract %s",
    tokenId,
    MockERC721.address
  );

  // Simulate fees
  const simulateFee = await ContractBNB.connect(signerBNB).simulateFees(swap);
  const fee = simulateFee[0];
  const proof = simulateFee[1];
  console.log("Fee %s", ethers.utils.formatEther(fee));
  console.log("Proof %s", proof);

  // Approve usage of link and NFTs
  const link = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06"; // BNB
  const Link = new ethers.Contract(
    link,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signerBNB
  );
  await Link.connect(signerBNB).approve(
    ContractBNB.address,
    ethers.utils.parseEther(fee)
  );
  console.log(
    "Approved %s LINK to contract %s",
    ethers.utils.parseEther(fee),
    Link.address
  );

  // Accept a Swap
  const tx = await ContractBNB.connect(signerBNB).acceptSwap(swap, {
    gasLimit: 3000000,
    maxPriorityFeePerGas: 20001002003,
    maxFeePerGas: 20001002003,
  });

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
