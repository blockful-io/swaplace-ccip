import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { ethers } from "hardhat";
import { getMockData } from "../utils";

async function mint(receiver?: any, tokenId?: any, signer?: any) {
  // Get contract address from .env
  const mock = await getMockData();

  // Create contract instance
  const ContractMock = new ethers.Contract(mock.address, abi, signer);

  // Mint to user
  const tx = await ContractMock.mintTo(
    receiver ? receiver : signer.address,
    tokenId ? tokenId : 1
  );
  await tx.wait();

  console.log(
    "Minted 1 NFTs of ID %s to %s in chain %s",
    tokenId ? tokenId : 1,
    receiver ? receiver : signer.address,
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
