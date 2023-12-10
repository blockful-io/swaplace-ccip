import { ethers } from "hardhat";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link);
  await Contract.deployed();
  console.log(
    "\nContract Overswap \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();

  // Router Address
  const router = "0x0bf3de8c5d3e8a2b34d2beeb17abfcebaf363a59"; // Sepolia

  // $LINK Address
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia

  // Destination Chain
  const destinationChain = "12532609583862916517"; // Mumbai
  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  const Contract = await deploy(signer, router, link);
  await Contract.allowlistDestinationChain(destinationChain, true);
  await Contract.allowlistSourceChain(destinationChain, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
