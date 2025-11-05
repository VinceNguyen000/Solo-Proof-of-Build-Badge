import hre from "hardhat";
import { defineChain } from "viem";

const CHAIN = defineChain({
  id: 252501, name: "DIDLab",
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://eth.didlab.org"] } },
});

async function main() {
  const { viem } = await hre.network.connect({ network: "didlab" });
  const publicClient = await viem.getPublicClient({ chain: CHAIN });
  const [wallet] = await viem.getWalletClients({ chain: CHAIN });
  const addr = wallet.account.address;

  const latest  = await publicClient.getTransactionCount({ address: addr, blockTag: "latest" });
  const pending = await publicClient.getTransactionCount({ address: addr, blockTag: "pending" });

  console.log({ address: addr, latest, pending, note: "use `pending` to replace/cancel" });
}
main().catch(console.error);
