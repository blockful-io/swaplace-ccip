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
  const router = "0x1035cabc275068e0f4b745a29cedf38e13af41b1"; // Mumbai

  // $LINK Address
  const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Destination Chain
  const destinationChain = "16015286601757825753"; // Sepolia

  // Deploy a new contract instead, and allowlist the destination chain in sequence (setup)
  const Contract = await deploy(signer, router, link);
  await Contract.allowlistDestinationChain(destinationChain, true);
  await Contract.allowlistSourceChain(destinationChain, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
