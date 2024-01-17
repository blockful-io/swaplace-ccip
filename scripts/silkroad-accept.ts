import { ethers } from "hardhat";
import { mumbai_chain_selector } from "../scripts/utils";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  BSCTESTNET_RPC_URL,
  SWAPLACE_MUMBAI,
  SWAPLACE_BNB,
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
    "Swaplace",
    SWAPLACE_MUMBAI as string,
    signerMumbai
  );
  const lastSwap = await ContractMumbai.totalSwaps();
  const swap = await ContractMumbai.getSwap(lastSwap);
  console.log("Last Swap ID: %s", lastSwap);

  // Swaplace SwaplaceBNB
  const ContractBNB = await ethers.getContractAt(
    "Swaplace",
    SWAPLACE_BNB as string,
    signerBNB
  );

  // Mock ERC721
  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    ERC721_BNB as string,
    signerBNB
  );

  // Mint ERC721
  const tokenId = swap.asking[0].amountOrId;
  try {
    await MockERC721.ownerOf(tokenId);
    console.log("Token ID %s already minted", tokenId);
  } catch (error) {
    var tx = await MockERC721.connect(signerBNB).mintTo(
      signerBNB.address,
      tokenId
    );
    await tx.wait();
    console.log("Minted Token ID %s", tokenId);
  }

  // Approve ERC721
  var tx = await MockERC721.connect(signerBNB).approve(
    ContractBNB.address,
    tokenId
  );
  await tx.wait();
  console.log(
    "Approved Token ID %s to contract %s",
    tokenId,
    MockERC721.address
  );

  // Simulate fees
  const simulateFee = await ContractBNB.connect(signerBNB).simulateFees(
    swap,
    mumbai_chain_selector
  );
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
    ethers.utils.parseEther(ethers.utils.formatEther(fee))
  );
  console.log("Approved %s LINK to contract %s", fee, Link.address);

  // Accept a Swap
  var tx = await ContractBNB.connect(signerBNB).acceptSwap(
    swap,
    mumbai_chain_selector,
    {
      gasLimit: 3000000,
      maxPriorityFeePerGas: 20001002003,
      maxFeePerGas: 20001002003,
    }
  );

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message From BNB\nTx %s\n", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
