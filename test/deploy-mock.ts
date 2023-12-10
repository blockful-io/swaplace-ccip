import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("MockERC721", signer);
  const Contract = await Factory.deploy({
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  // await Contract.deployed();
  console.log(
    "\nContract Mock ERC721 \nDeployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
