// scripts/deploy.ts
import hre from "hardhat";
import { defineChain } from "viem";

const DIDLAB_CHAIN = defineChain({
  id: 252501,
  name: "DID Lab",
  network: "didlab",
  nativeCurrency: { name: "Trust", symbol: "TT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL ?? "https://eth.didlab.org"] },
    public: { http: [process.env.RPC_URL ?? "https://eth.didlab.org"] },
  },
  blockExplorers: {
    default: { name: "DIDLab Explorer", url: "https://explorer.didlab.org" },
  },
});

async function main() {
  const connection = await hre.network.connect({ network: "didlab" });
  const { viem } = connection;

  const publicClient = await viem.getPublicClient({ chain: DIDLAB_CHAIN });
  const [walletClient] = await viem.getWalletClients({ chain: DIDLAB_CHAIN });

  const badge = await viem.deployContract(
    "DidLabBadge",
    [walletClient.account.address],
    {
      client: { public: publicClient, wallet: walletClient },
      gas: 3_000_000n,
      gasPrice: 30n * 10n ** 9n,
    },
  );

  console.log("DidLabBadge:", badge.address);
  await connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
