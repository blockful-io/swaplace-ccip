import { abi } from "../../artifacts/contracts/MockERC721.sol/MockERC721.json";
import { ethers } from "hardhat";
import { getMockData, getSwaplaceData } from "../utils";

export async function approveMock(
  spender: any,
  tokenId: any,
  chainSelector: any
) {
  // Get contract address from .env
  const mock = await getMockData(chainSelector);

  // Get the signer based on the chain selector
  const RPC = new ethers.providers.JsonRpcProvider(mock.rpcUrl);
  const signer = new ethers.Wallet(`${process.env.DEPLOYER_PRIVATE_KEY}`, RPC);

  // Create contract instance
  const Contract = new ethers.Contract(mock.address, abi, signer);

  // Approve token ID to spender
  const tx = await Contract.approve(spender, tokenId);
  await tx.wait();

  console.log(
    "Approved NFT of ID %s to %s in chain %s\n",
    tokenId,
    spender,
    mock.envName
  );
  return tx;
}

export async function approveLINK(
  spender: any,
  amount: any,
  chainSelector: any
) {
  // Get contract address from .env
  const Swaplace = await getSwaplaceData(chainSelector);

  // Get the signer based on the chain selector
  const RPC = new ethers.providers.JsonRpcProvider(Swaplace.rpcUrl);
  const signer = new ethers.Wallet(`${process.env.DEPLOYER_PRIVATE_KEY}`, RPC);

  // Create contract instance
  const Contract = new ethers.Contract(
    Swaplace.linkAddress,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );

  // Approve token ID to spender
  const tx = await Contract.approve(spender, amount);
  await tx.wait();

  console.log(
    "Approved %s tokens to %s in chain %s\n",
    ethers.utils.formatEther(amount),
    spender,
    Swaplace.envName
  );
  return tx;
}
