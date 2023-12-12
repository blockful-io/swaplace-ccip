import { ethers } from "hardhat";
import { saveContractAddress } from "../utils";
import { destinationChainSepolia, routerMumbai, linkMumbai } from "../utils";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link, {
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  console.log(
    "\nContract Overswap on MUMBAI \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  await Contract.deployed();
  saveContractAddress("OVERSWAP_MUMBAI", Contract.address);
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();
  // Destination Chain
  const destinationChain = "13264668187771770619"; // BNB

  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  const Contract = await deploy(signer, routerMumbai, linkMumbai);
  var tx = await Contract.allowlistDestinationChain(
    destinationChainSepolia,
    true
  );
  await tx.wait();
  var tx = await Contract.allowlistSourceChain(destinationChainSepolia, true);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
