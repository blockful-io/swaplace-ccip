import { ethers } from "hardhat";

async function deploy(signer: any) {
  const Factory = await ethers.getContractFactory("MockERC721", signer);
  const Contract = await Factory.deploy({
    gasLimit: 3000000,
    maxPriorityFeePerGas: 201002003,
    maxFeePerGas: 201002003,
  });
  await Contract.deployed();
  console.log(
    "\nContract Mock ERC721 \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
  return Contract;
}

async function main() {
  const [signer] = await ethers.getSigners();
  const Contract = await deploy(signer);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
