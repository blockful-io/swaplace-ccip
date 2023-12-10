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
    expiry: any
) {
    const config = await Contract.packData(
        allowed,
        destinationChainSelector,
        expiry
    );
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
        amountOrId:
            typeof amountOrId == "number" ? BigInt(amountOrId) : amountOrId,
    };

    return asset;
}

export async function makeSwap(
    owner: any,
    allowed: any,
    expiry: any,
    biding: Asset[],
    asking: Asset[]
) {
    const timestamp = (await ethers.provider.getBlock("latest")).timestamp;
    if (expiry < timestamp) {
        throw new Error("InvalidExpiry");
    }

    if (biding.length == 0 || asking.length == 0) {
        throw new Error("InvalidAssetsLength");
    }

    const swap: Swap = {
        owner: owner,
        allowed: allowed,
        expiry: expiry,
        biding: biding,
        asking: asking,
    };

    return swap;
}

export async function composeSwap(
    owner: any,
    allowed: any,
    expiry: any,
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

    return await makeSwap(owner, allowed, expiry, biding, asking);
}
