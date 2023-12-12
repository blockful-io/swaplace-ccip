import { ethers } from "hardhat";

export interface Asset {
  addr: string;
  amountOrId: bigint;
}

export interface Swap {
  owner: string;
  config: any;
  biding: Asset[];
  asking: Asset[];
}

export async function makeConfig(
  Contract: any,
  allowed: any,
  destinationChainSelector: any,
  expiration: any
) {
  const config = await Contract.packData(
    allowed,
    destinationChainSelector,
    expiration
  );
  return config;
}

export async function makeAsset(
  addr: string,
  amountOrId: number | bigint
): Promise<Asset> {
  if (!ethers.utils.isAddress(addr)) {
    throw new Error("InvalidAddressFormat");
  }

  if (amountOrId < 0) {
    throw new Error("AmountOrIdCannotBeNegative");
  }

  const asset: Asset = {
    addr: addr,
    amountOrId: typeof amountOrId == "number" ? BigInt(amountOrId) : amountOrId,
  };

  return asset;
}

export async function makeSwap(
  Contract: any,
  owner: any,
  allowed: any,
  destinationChainSelector: any,
  expiration: any,
  biding: Asset[],
  asking: Asset[]
) {
  const timestamp = (await ethers.provider.getBlock("latest")).timestamp;
  if (expiration < timestamp) {
    throw new Error("InvalidExpiry");
  }

  if (biding.length == 0 || asking.length == 0) {
    throw new Error("InvalidAssetsLength");
  }

  const config = await makeConfig(
    Contract,
    allowed,
    destinationChainSelector,
    expiration
  );

  const swap: Swap = {
    owner: owner,
    config: config,
    biding: biding,
    asking: asking,
  };

  return swap;
}

export async function composeSwap(
  Contract: any,
  owner: any,
  allowed: any,
  destinationChainSelector: any,
  expiration: any,
  bidingAddr: any[],
  bidingAmountOrId: any[],
  askingAddr: any[],
  askingAmountOrId: any[]
) {
  if (
    bidingAddr.length != bidingAmountOrId.length ||
    askingAddr.length != askingAmountOrId.length
  ) {
    throw new Error("InvalidAssetsLength");
  }

  const biding: any[] = [];
  bidingAddr.forEach(async (addr, index) => {
    biding.push(await makeAsset(addr, bidingAmountOrId[index]));
  });

  const asking: any[] = [];
  askingAddr.forEach(async (addr, index) => {
    asking.push(await makeAsset(addr, askingAmountOrId[index]));
  });

  return await makeSwap(
    Contract,
    owner,
    allowed,
    destinationChainSelector,
    expiration,
    biding,
    asking
  );
}
