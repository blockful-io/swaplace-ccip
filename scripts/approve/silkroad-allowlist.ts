import { ethers } from "hardhat";
import { getSwaplaceData } from "../utils";

export async function setAllowlistSender(
  sourceChain: any,
  destinationChain: any
) {
  // Get swaplace data from source chain
  const swaplaceSource = await getSwaplaceData(sourceChain);

  // Get contract address from destination chain
  const swaplaceDestination = await getSwaplaceData(destinationChain);

  // Get the signer based on the chain selector
  const RPC = new ethers.providers.JsonRpcProvider(swaplaceSource.rpcUrl);
  const signer = new ethers.Wallet(`${process.env.DEPLOYER_PRIVATE_KEY}`, RPC);

  // Create contract instance
  const ContractSource = await ethers.getContractAt(
    "Swaplace",
    swaplaceSource.address,
    signer
  );

  // Set destination chain selector and contract address as allowed in source chain
  var tx = await ContractSource.setAllowlistSender(
    swaplaceDestination.chainSelector,
    swaplaceDestination.address,
    {
      gasLimit: 3000000,
      maxPriorityFeePerGas: 20001002003,
      maxFeePerGas: 20001002003,
    }
  );
  await tx.wait();

  console.log(
    "Swaplace at source chain %s allowlisted %s in destination chain %s\n",
    swaplaceSource.envName,
    swaplaceDestination.address,
    swaplaceDestination.envName
  );
}
