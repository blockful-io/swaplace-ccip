import { ethers } from "hardhat";
import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { getMockFromEnv } from "../utils";

async function mint(receiver?: any, tokenId?: any) {
  // Prepare Signers
  const [signer] = await ethers.getSigners();

  // Get contract address from .env
  const mock = await getMockFromEnv();

  // Create contract instance
  const ContractMock = new ethers.Contract(mock.address, abi, signer);

  // Mint to user
  const tx = await ContractMock.mintTo(
    receiver ? receiver : signer.address,
    tokenId ? tokenId : 1
  );
  await tx.wait();
  return tx;
}

mint().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
