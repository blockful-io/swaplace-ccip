import { ethers } from "hardhat";
import { getSwaplaceData, saveContractAddress } from "../utils";

async function deploySwaplace(signer: any) {
  // Get .env and hardcoded data
  const chainData = await getSwaplaceData();

  // Deploy contract and save address to .env
  const Factory = await ethers.getContractFactory("Swaplace", signer);
  const Contract = await Factory.deploy(
    chainData.routerAddress,
    chainData.linkAddress,
    {
      gasLimit: 5000000,
      maxPriorityFeePerGas: 2001002003,
      maxFeePerGas: 2010002003,
    }
  );
  await Contract.deployed();
  saveContractAddress(chainData.envName, Contract.address);

  console.log(
    "Contract Swaplace Deployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );

  return Contract.address;
}

ethers.getSigners().then((signers) => {
  deploySwaplace(signers[0]).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
