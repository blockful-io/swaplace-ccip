import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // Last Mock Deployed
  const mockERC721 = "0x86429c298e86BC6a04f3b31F27e637ca769AaC55"; // sepolia
  // const mockERC721 = " 0xa421Df2dc83fEE5afda1fAB244bfF56566ba83F4"; // mumbai

  // Last deployed contract address
  const Mock = await ethers.getContractAt("MockERC721", mockERC721, signer);

  // Mint to user
  await Mock.mintTo(signer.address, 2);

  console.log("Minted 1 NFTs of ID 2 to %s in each chain", signer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
