import { ethers } from "hardhat";
import { getChainData, saveContractAddress } from "../utils";

async function deploySwaplace(signers: any) {
  // Get contract address from .env
  const mock = await getChainData();

  // Deploy contract and save address to .env
  const Factory = await ethers.getContractFactory("Swaplace", signers[0]);
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
  deploySwaplace(signers).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
