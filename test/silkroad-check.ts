import { ethers } from "hardhat";
import { Swap, composeSwap } from "./SwapFactory";
import { blocktimestamp } from "../scripts/utils";

async function main() {
  const [signer] = await ethers.getSigners();

  // $LINK Address
  // const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
  const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai
  // const link = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06"; // BNB

  // Destination Chain
  // const destinationChain = "16015286601757825753"; // Sepolia
  // const destinationChain = "12532609583862916517"; // Mumbai
  const destinationChain = "13264668187771770619"; // BNB

  // Last Mock Deployed
  const mockERC721_sepolia = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // Sepolia
  const mockERC721_mumbai = "0x2De6d72A010c81817544773615923F2765c4C04f"; // Mumbai
  const mockERC721_bnb = "0xB7c49b0d0449796031d197AAF3CFaa2a49c63865"; // BNB

  // Official Deployed
  // const Overswap = "0x5983E90123ccC820b96FAa34153530eF6621a17C"; // Sepolia
  const Overswap = "0x654008B3b8FE0A715D03Ca63299aE69086a5dab3"; // Mumbai
  //   const Overswap = "0x2627d6b68Eddc70A9A255bC46c0277433e87E8A2"; // BNB

  // Last deployed contract address
  const Contract = await ethers.getContractAt("Overswap", Overswap, signer);

  // Check
  const response = await Contract.lastReceivedMessageId();
  console.log(response);
  console.log("aloo");

  await Contract.redeem();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
