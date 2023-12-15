import { ethers } from "hardhat";
import { getChainData, saveContractAddress } from "../utils";

async function deploySwaplace(signer: any) {
  // Get .env and hardcoded data
  const mock = await getChainData();

  // Deploy contract and save address to .env
  const Factory = await ethers.getContractFactory("Swaplace", signer);
  const Contract = await Factory.deploy(mock.routerAddress, mock.linkAddress, {
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  await Contract.deployed();
  saveContractAddress(mock.envName, Contract.address);

  console.log(
    "\nContract Swaplace \nDeployed to %s \nAt Tx %s",
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
