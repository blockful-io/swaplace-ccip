import { ethers } from "hardhat";

async function deploy(signer: any, router: string, link: string) {
  const Factory = await ethers.getContractFactory("Overswap", signer);
  const Contract = await Factory.deploy(router, link);
  console.log(
    "\nContract Overswap \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  await Contract.deployed();
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();

  // Router Address
  const router = "0xe1053ae1857476f36a3c62580ff9b016e8ee8f6f"; // BNB

  // $LINK Address
  const link = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06"; // Mumbai

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
