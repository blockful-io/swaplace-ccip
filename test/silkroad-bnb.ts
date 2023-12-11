import { ethers } from "hardhat";
import { saveContractAddress } from "../scripts/utils";
import { destinationChainMumbai, routerBNB, linkBNB } from "../scripts/utils";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link);
  console.log(
    "\nContract Overswap on BNB \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  await Contract.deployed();
  saveContractAddress("OVERSWAP_BNB", Contract.address);
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();

  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  const Contract = await deploy(signer, routerBNB, linkBNB);
  var tx = await Contract.allowlistDestinationChain(
    destinationChainMumbai,
    true
  );
  await tx.wait();
  var tx = await Contract.allowlistSourceChain(destinationChainMumbai, true);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
