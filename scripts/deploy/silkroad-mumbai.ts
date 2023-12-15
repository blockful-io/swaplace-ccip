import { ethers } from "hardhat";
import { saveContractAddress } from "../utils";
import { sepolia_chain_selector, mumbai_router, mumbai_link } from "../utils";

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
  const Contract = await deploy(signer, mumbai_router, mumbai_link);
  var tx = await Contract.allowlistDestinationChain(
    sepolia_chain_selector,
    true
  );
  await tx.wait();
  var tx = await Contract.allowlistSourceChain(sepolia_chain_selector, true);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
