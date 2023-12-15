import { ethers } from "hardhat";
import { getMockFromEnv, saveContractAddress } from "../utils";

async function deployMock(signers: any) {
  // Get contract address from .env
  const mock = await getMockFromEnv();

  // If contract address is already set, do nothing
  if (mock.address.length > 0) {
    console.log("Mock ERC721 already deployed at %s", mock.address);
    return mock.address;
  }

  // Deploy contract and save address to .env
  const Factory = await ethers.getContractFactory("MockERC721", signers[0]);
  const Contract = await Factory.deploy({
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  await Contract.deployed();
  saveContractAddress(mock.envName, Contract.address);

  console.log(
    "\nContract Mock ERC721 \nDeployed to %s \nAt Tx %s",
    Contract.address,
    Contract.deployTransaction.hash
  );

  return Contract.address;
}

ethers.getSigners().then((signers) => {
  deployMock(signers).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
