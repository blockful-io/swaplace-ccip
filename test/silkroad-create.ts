import { ethers } from "hardhat";
import { Swap, composeSwap } from "./SwapFactory";
import { blocktimestamp } from "../scripts/utils";
import dotenv from "dotenv";

async function main() {
  const [signer] = await ethers.getSigners();

  // $LINK Address
  const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai

  // Destination Chain
  const destinationChain = "13264668187771770619"; // BNB

  // Last Mock Deployed
  const mockERC721_mumbai = "0x2De6d72A010c81817544773615923F2765c4C04f"; // Mumbai
  const mockERC721_bnb = "0xB7c49b0d0449796031d197AAF3CFaa2a49c63865"; // BNB

  // Official Deployed
  const Overswap = "0x654008B3b8FE0A715D03Ca63299aE69086a5dab3"; // Mumbai

  // Last deployed contract address
  const Contract = await ethers.getContractAt("Overswap", Overswap, signer);

  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    mockERC721_mumbai,
    signer
  );
  const tokenId = 302;
  await MockERC721.mintTo(signer.address, tokenId);

  // Create a swap
  const bidingAddr = [mockERC721_mumbai];
  const bidingAmountOrId = [301];

  const askingAddr = [mockERC721_bnb];
  const askingAmountOrId = [1];

  const swap: Swap = await composeSwap(
    Contract,
    signer.address,
    ethers.constants.AddressZero,
    destinationChain,
    (await blocktimestamp()) * 2,
    bidingAddr,
    bidingAmountOrId,
    askingAddr,
    askingAmountOrId
  );

  // Simulate fees
  const simulateFee = await Contract.connect(signer).simulateFees(swap);
  const fee = simulateFee[0];
  const proof = simulateFee[1];
  console.log("Fee %s", ethers.utils.formatEther(fee));
  console.log("Proof %s", proof);

  // Approve usage of link and NFTs
  const Link = new ethers.Contract(
    link,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );
  await Link.connect(signer).approve(Contract.address, fee);
  await MockERC721.connect(signer).approve(Contract.address, tokenId);
  console.log(
    "Approved %s LINK and Token Id %s to contract %s",
    fee,
    MockERC721.address,
    Contract.address
  );

  // Create a Swap
  const tx = await Contract.connect(signer).createSwap(swap, {
    gasLimit: 3000000,
    maxPriorityFeePerGas: 20001002003,
    maxFeePerGas: 20001002003,
  });

  const receipt = await tx.wait();
  console.log("\nSent CCIP Message \nTx %s\n", receipt.transactionHash);

  await Contract.redeem();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
