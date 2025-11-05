import hre from "hardhat";
import { defineChain } from "viem";

const CHAIN = defineChain({
  id: 252501,
  name: "DIDLab",
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://eth.didlab.org"] } },
});

async function getNonces(publicClient, addr) {
  const latest  = await publicClient.getTransactionCount({ address: addr, blockTag: "latest" });
  const pending = await publicClient.getTransactionCount({ address: addr, blockTag: "pending" });
  return { latest, pending };
}

async function main() {
  const conn = await hre.network.connect({ network: "didlab" });
  const { viem } = conn;
  const publicClient = await viem.getPublicClient({ chain: CHAIN });
  const [wallet] = await viem.getWalletClients({ chain: CHAIN });
  const addr = wallet.account.address;

  let { latest, pending } = await getNonces(publicClient, addr);
  console.log("Starting nonces:", { latest, pending });

  // Cancel from the LOWEST pending nonce upward.
  while (pending > latest) {
    const nonceToCancel = latest; // first pending nonce
    console.log(`Cancelling nonce ${nonceToCancel}...`);

    const hash = await wallet.sendTransaction({
      to: addr,
      value: 0n,
      gas: 21_000n,
      gasPrice: 100n * 10n ** 9n, // 100 gwei to outbid any old tx
      nonce: nonceToCancel,
      chain: CHAIN,
    });
    console.log("  sent:", hash);

    // Wait for mining of this cancel tx before moving to the next nonce.
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 300_000,          // 5 min
      pollingInterval: 5_000,
    });
    console.log("  mined in block", receipt.blockNumber);

    // Refresh nonces after each success
    ({ latest, pending } = await getNonces(publicClient, addr));
    console.log("Now:", { latest, pending });
  }

  console.log("✅ All pending nonces cleared.");
  await conn.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
