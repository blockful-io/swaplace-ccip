import { abi } from "../artifacts/contracts/Swaplace.sol/Swaplace.json";
import { ethers } from "hardhat";
import { getChainData } from "./utils";

export async function contractConfiguration(
  signer: any,
  destinationChain: any,
  destinationContract: any
) {
  // Get contract address from .env
  const chainData = await getChainData();

  // Get contract instance
  const Swaplace = new ethers.Contract(chainData.address, abi, signer);

  // Set the chain selector and contract that are allowed to interact with this Swaplace
  var tx = await Swaplace.allowlistSender(
    destinationChain,
    destinationContract,
    {
      gasLimit: 4000000,
    }
  );
  await tx.wait();

  console.log(
    "\nAllowed contract %s in chain %s to interact with Swaplace",
    destinationContract,
    destinationChain
  );
}
