import { ethers } from "hardhat";
import { saveContractAddress } from "../scripts/utils";
import {
  destinationChainSepolia,
  routerMumbai,
  linkMumbai,
} from "../scripts/utils";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link);
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
  var tx = await Contract.allowlistDestinationChain(destinationChain, true);
  await tx.wait();
  var tx = await Contract.allowlistSourceChain(destinationChain, true);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
