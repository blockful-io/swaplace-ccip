import { ethers } from "hardhat";
import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import dotenv from "dotenv";
dotenv.config();

const { ERC721_BNB, ERC721_MUMBAI, ERC721_SEPOLIA } = process.env;

async function main() {
  // Prepare Signers
  const [signer] = await ethers.getSigners();

  // Last deployed contract address
  const ContractMock = new ethers.Contract(
    ERC721_MUMBAI as string,
    abi,
    signer
  );

  // Get the current chain ID
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("Current chain ID:", chainId);

  if (chainId == 11155111) {
    console.log("Sepolia - Ethereum Testnet");
  } else if (chainId == 97) {
    console.log("BSC Testnet");
  } else if (chainId == 80001) {
    console.log("Mumbai - Polygon Testnet");
  } else if (chainId == 43113) {
    console.log("Fuji - Avax Testnet");
  } else if (chainId == 84531) {
    console.log("Base Testnet");
  } else if (chainId == 420) {
    console.log("Optimism Testnet");
  } else {
    console.log("Invalid chain ID");
  }

  // Mint to user
  // const tokenId = 2054;
  // await ContractMock.mintTo(
  //   "0xFCB751Ad42b20a8C6f312D857A37Fb3CB5E08bb0",
  //   tokenId
  // );
  // console.log(
  //   "Minted 1 NFTs of ID %s to %s in chain %s",
  //   tokenId,
  //   ContractMock.address
  // );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
