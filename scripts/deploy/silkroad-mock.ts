import { ethers } from "hardhat";
import { getMockData, saveContractAddress } from "../utils";

async function deployMock(signer: any) {
  // Get contract address from .env
  const mock = await getMockData();

  // Deploy contract and save address to .env
  const Factory = await ethers.getContractFactory("MockERC721", signer);
  const Contract = await Factory.deploy({
    gasLimit: 5000000,
    maxPriorityFeePerGas: 2001002003,
    maxFeePerGas: 2010002003,
  });
  await Contract.deployed();
  saveContractAddress(mock.envName, Contract.address);

  console.log(
    "Contract Mock ERC721 Deployed to %s \nAt Tx %s\n",
    Contract.address,
    Contract.deployTransaction.hash
  );

  return Contract.address;
}

ethers.getSigners().then((signers) => {
  deployMock(signers[0]).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});
