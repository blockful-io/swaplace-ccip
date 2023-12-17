import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { ethers } from "hardhat";
import { getMockData } from "../utils";

export async function mint(receiver: any, chainSelector: any) {
  // Get contract address from .env
  const mock = await getMockData(chainSelector);

  // Get the signer based on the chain selector
  const RPC = new ethers.providers.JsonRpcProvider(mock.rpcUrl);
  const signer = new ethers.Wallet(`${process.env.DEPLOYER_PRIVATE_KEY}`, RPC);

  // Create contract instance
  const Contract = new ethers.Contract(mock.address, abi, signer);

  // Mint to receiver a new token ID
  const totalSupply = await Contract.totalSupply();
  const lastTokenId = Number(totalSupply) + 1;
  const tx = await Contract.mintTo(receiver, lastTokenId);
  await tx.wait();

  console.log(
    "Minted 1 NFT of ID %s to %s in chain %s\n",
    lastTokenId,
    receiver,
    mock.chainId
  );

  return lastTokenId;
}
