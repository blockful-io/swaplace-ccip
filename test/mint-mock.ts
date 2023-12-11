import { ethers } from "hardhat";
import { abi } from "../artifacts/contracts/MockERC721.sol/MockERC721.json";
import dotenv from "dotenv";
dotenv.config();

const {
  DEPLOYER_PRIVATE_KEY,
  MUMBAI_RPC_URL,
  SEPOLIA_RPC_URL,
  BSCTESTNET_RPC_URL,
  ERC721_BNB,
  ERC721_MUMBAI,
  ERC721_SEPOLIA,
} = process.env;

async function main() {
  // Prepare Signers
  const rpcMumbai = new ethers.providers.JsonRpcProvider(MUMBAI_RPC_URL);
  const rpcSepolia = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const rpcBNB = new ethers.providers.JsonRpcProvider(BSCTESTNET_RPC_URL);

  const signerMumbai = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcMumbai);
  const signerSepolia = new ethers.Wallet(
    `${DEPLOYER_PRIVATE_KEY}`,
    rpcSepolia
  );
  const signerBNB = new ethers.Wallet(`${DEPLOYER_PRIVATE_KEY}`, rpcBNB);

  // Last deployed contract address
  const MockMumbai = new ethers.Contract(
    ERC721_MUMBAI as string,
    abi,
    signerMumbai
  );
  const MockSepolia = new ethers.Contract(
    ERC721_SEPOLIA as string,
    abi,
    signerSepolia
  );
  const MockBNB = new ethers.Contract(ERC721_BNB as string, abi, signerBNB);

  // Mint to user
  const tokenId = 2032;
  await MockMumbai.mintTo(
    "0xFD9eE68000Dc92aa6c67F8f6EB5d9d1a24086fAd",
    tokenId
  );
  await MockSepolia.mintTo(
    "0xFD9eE68000Dc92aa6c67F8f6EB5d9d1a24086fAd",
    tokenId
  );
  // await MockBNB.mintTo(signerBNB.address, tokenId);
  console.log(
    "Minted 1 NFTs of ID %s to %s in each chain",
    tokenId,
    signerBNB.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
