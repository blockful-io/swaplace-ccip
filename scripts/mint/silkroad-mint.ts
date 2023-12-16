import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { ethers } from "hardhat";
import { getMockData } from "../utils";

async function mint(receiver: any, tokenId: any, signer: any) {
  // Get contract address from .env
  const mock = await getMockData();

  // Create contract instance
  const Contract = new ethers.Contract(mock.address, abi, signer);

  // Mint to receiver
  const tx = await Contract.mintTo(receiver, tokenId);
  await tx.wait();

  console.log(
    "Minted 1 NFT of ID %s to %s in chain %s",
    tokenId,
    receiver,
    mock.chainId
  );

  return tx;
}

ethers.getSigners().then((signers) => {
  mint(signers[0].address, 1, signers[0]).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
