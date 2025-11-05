import hre from "hardhat";
import { defineChain } from "viem";

const CHAIN = defineChain({
  id: 252501,
  name: "DIDLab",
  rpcUrls: { default: { http: [process.env.RPC_URL ?? "https://eth.didlab.org"] } },
});

async function main() {
  const nonceToCancel = Number(process.argv[2]);
  if (Number.isNaN(nonceToCancel)) {
    console.error("Usage: node scripts/cancelOne.js <nonce>");
    process.exit(1);
  }

  const conn = await hre.network.connect({ network: "didlab" });
  const { viem } = conn;
  const publicClient = await viem.getPublicClient({ chain: CHAIN });
  const [wallet] = await viem.getWalletClients({ chain: CHAIN });
  const addr = wallet.account.address;

  let gasPrice = 200n * 10n ** 9n; // start high (200 gwei)

  while (true) {
    try {
      console.log(`Sending cancel for nonce ${nonceToCancel} at ${gasPrice / 10n ** 9n} gwei...`);
      const hash = await wallet.sendTransaction({
        to: addr,
        value: 0n,
        gas: 21_000n,
        gasPrice,
        nonce: BigInt(nonceToCancel),
        chain: CHAIN,
      });
      console.log("  sent:", hash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash, timeout: 300_000, pollingInterval: 5_000,
      });
      console.log("✅ mined in block", receipt.blockNumber);
      break;
    } catch (e) {
      const msg = String(e?.shortMessage || e?.message || e);
      if (msg.includes("underpriced") || msg.includes("replacement fee too low")) {
        gasPrice = (gasPrice * 3n) / 2n; // +50%
        if (gasPrice > 1_000n * 10n ** 9n) throw e; // safety cap: 1000 gwei
        console.log("Bumping gas price…");
      } else {
        throw e;
      }
    }
  }

  // Show new nonces
  const latest  = await publicClient.getTransactionCount({ address: addr, blockTag: "latest" });
  const pending = await publicClient.getTransactionCount({ address: addr, blockTag: "pending" });
  console.log({ latest, pending });

  await conn.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
