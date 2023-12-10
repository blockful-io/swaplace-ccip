import { ethers } from "hardhat";
import { abi } from "../artifacts/contracts/MockERC721.sol/MockERC721.json";

async function main() {
  const [signer] = await ethers.getSigners();

  // Last Mock Deployed
  // const mockERC721 = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // sepolia
  const mockERC721 = "0x2De6d72A010c81817544773615923F2765c4C04f"; // mumbai

  // Last deployed contract address
  const Mock = new ethers.Contract(mockERC721, abi, signer);

  // Mint to user
  await Mock.mintTo(signer.address, 1);

  console.log("Minted 1 NFTs of ID 2 to %s in each chain", signer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
