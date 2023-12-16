import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { ethers } from "hardhat";
import { getMockData } from "../utils";

async function approve(spender?: any, tokenId?: any, signer?: any) {
  // Get contract address from .env
  const mock = await getMockData();

  // Create contract instance
  const Contract = new ethers.Contract(mock.address, abi, signer);

  // Approve token ID to user
  const tx = await Contract.approve(spender, tokenId);
  await tx.wait();

  console.log(
    "Approved NFT of ID %s to %s in chain %s",
    tokenId,
    spender,
    mock.chainId
  );
  return tx;
}
