import { ethers } from "hardhat";
import { Swap, composeSwap } from "./SwapFactory";
import { blocktimestamp } from "../scripts/utils";

async function main() {
  const [signer] = await ethers.getSigners();

  // $LINK Address
  const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
  // const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Destination Chain
  const destinationChain = "12532609583862916517"; // Mumbai
  // const destinationChain = "16015286601757825753"; // Sepolia

  // Last Mock Deployed
  const mockERC721_sepolia = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // sepolia
  const mockERC721_mumbai = "0x2De6d72A010c81817544773615923F2765c4C04f"; // mumbai

  // Official Deployed
  const Overswap = "0x5983E90123ccC820b96FAa34153530eF6621a17C"; // sepolia
  // const Overswap = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // mumbai

  // Last deployed contract address
  const Contract = await ethers.getContractAt("Overswap", Overswap, signer);

  // Last deployed mock address
  // const MockContract = await ethers.getContractAt(
  //   "MockERC721",
  //   mockERC721_sepolia,
  //   signer
  // );

  // Create a trade
  const bidingAddr = [mockERC721_sepolia];
  const bidingAmountOrId = [1];

  const askingAddr = [mockERC721_mumbai];
  const askingAmountOrId = [2];

  const swap: Swap = await composeSwap(
    Contract,
    destinationChain,
    signer.address,
    ethers.constants.AddressZero,
    (await blocktimestamp()) * 2,
    bidingAddr,
    bidingAmountOrId,
    askingAddr,
    askingAmountOrId
  );
  console.log("Created a swap:", swap);

  // // Approve usage of link
  // const Link = new ethers.Contract(
  //   link,
  //   [
  //     "function approve(address spender, uint256 amount) external returns (bool)",
  //   ],
  //   signer
  // );
  // await Link.connect(signer).approve(
  //   Contract.address,
  //   ethers.utils.parseEther("0.1")
  // );
  // console.log("Approved 0.1 LINK to contract %s", Contract.address);

  // // Send CCIP Message
  // const tx = await Contract.connect(signer).sendMessagePayLINK(
  //   destinationChain,
  //   Contract.address,
  //   "Hello Mumbai!",
  //   {
  //     gasLimit: 1000000,
  //   }
  // );

  // const receipt = await tx.wait();
  // console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
