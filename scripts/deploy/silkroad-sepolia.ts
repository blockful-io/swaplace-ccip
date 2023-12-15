import { ethers } from "hardhat";
import {
  mumbai_chain_selector,
  sepolia_router,
  sepolia_link,
  saveContractAddress,
} from "../utils";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link, {
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  console.log(
    "\nContract Overswap \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  await Contract.deployed();
  saveContractAddress("OVERSWAP_SEPOLIA", Contract.address);
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();

  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  const Contract = await deploy(signer, sepolia_router, sepolia_link);
  var tx = await Contract.allowlistDestinationChain(
    mumbai_chain_selector,
    true
  );
  await tx.wait();
  var tx = await Contract.allowlistSourceChain(mumbai_chain_selector, true);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});