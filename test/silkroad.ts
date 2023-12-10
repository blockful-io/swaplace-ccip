import { ethers } from "hardhat";
import { Swap, composeSwap } from "./SwapFactory";
import { blocktimestamp } from "../scripts/utils";

async function main() {
  const [signer] = await ethers.getSigners();

  /////////////////////////////
  // Getting the Swap Struct from another chain
  const s_contract = await ethers.getContractAt(
    "Overswap",
    "0x1Aa55AE747D7AFd62D1b447692C1578E2f10A0aF",
    signer
  );
  const s_swap = await s_contract.getSwaps(
    "0x22bb4ecc59f9d039d365648ea77e4443cbced24b0f3cd70e57e8beae2582c591"
  );
  console.log("Swap %s", s_swap);
  /////////////////////////////

  // $LINK Address
  // const link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia
  // const link = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB"; // Mumbai
  const link = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06"; // BNB

  // Destination Chain
  // const destinationChain = "16015286601757825753"; // Sepolia
  const destinationChain = "12532609583862916517"; // Mumbai
  // const destinationChain = "13264668187771770619"; // BNB

  // Last Mock Deployed
  const mockERC721_sepolia = "0x416AbcB8217721C6a12f776419aaFc27391eA5c3"; // Sepolia
  const mockERC721_mumbai = "0x2De6d72A010c81817544773615923F2765c4C04f"; // Mumbai
  const mockERC721_bnb = "0xB7c49b0d0449796031d197AAF3CFaa2a49c63865"; // BNB

  // Official Deployed
  // const Overswap = "0x5983E90123ccC820b96FAa34153530eF6621a17C"; // Sepolia
  // const Overswap = "0x1Aa55AE747D7AFd62D1b447692C1578E2f10A0aF"; // Mumbai
  const Overswap = "0xEb5937936A252bF76294DeBbf4710400a080B01B"; // BNB

  // Last deployed contract address
  const Contract = await ethers.getContractAt("Overswap", Overswap, signer);

  await Contract.connect(signer).allowlistSender(
    destinationChain,
    "0x1Aa55AE747D7AFd62D1b447692C1578E2f10A0aF"
  );
  console.log("Cross-chain Contract listed");

  const MockERC721 = await ethers.getContractAt(
    "MockERC721",
    mockERC721_bnb,
    signer
  );
  // const tokenId = 200;
  // await MockERC721.mintTo(signer.address, tokenId);

  // Create a swap
  // const bidingAddr = [mockERC721_mumbai];
  // const bidingAmountOrId = [tokenId];

  // const askingAddr = [mockERC721_bnb];
  // const askingAmountOrId = [1];

  // const swap: Swap = await composeSwap(
  //   Contract,
  //   signer.address,
  //   ethers.constants.AddressZero,
  //   destinationChain,
  //   (await blocktimestamp()) * 2,
  //   bidingAddr,
  //   bidingAmountOrId,
  //   askingAddr,
  //   askingAmountOrId
  // );

  // Simulate fees
  // const simulateFee = await Contract.connect(signer).simulateFees(swap);
  const simulateFee = await Contract.connect(signer).simulateFees(s_swap);
  const fee = simulateFee[0];
  console.log("Fee %s", ethers.utils.formatEther(fee));
  const proof = simulateFee[1];
  console.log("Proof %s", proof);

  // // Approve usage of link and NFTs
  const Link = new ethers.Contract(
    link,
    [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ],
    signer
  );
  await Link.connect(signer).approve(Contract.address, fee);
  // await MockERC721.connect(signer).approve(Contract.address, tokenId);
  await MockERC721.connect(signer).approve(Contract.address, 1);
  console.log(
    "Approved %s LINK and Token Id %s to contract %s",
    fee,
    MockERC721.address,
    Contract.address
  );

  // Create a Swap
  // const tx = await Contract.connect(signer).createSwap(swap, {
  //   gasLimit: 3000000,
  //   maxPriorityFeePerGas: 20001002003,
  //   maxFeePerGas: 20001002003,
  // });

  // Accept a Swap
  const tx = await Contract.connect(signer).acceptSwap(s_swap, {
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
