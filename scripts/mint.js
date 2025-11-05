import 'dotenv/config'
import hre from 'hardhat'
import { defineChain } from 'viem'

const DIDLAB = defineChain({
  id: 252501,
  name: 'DIDLab',
  rpcUrls: { default: { http: [process.env.RPC_URL || 'https://eth.didlab.org'] } },
})

const ABI = [{
  inputs: [{name:'to',type:'address'},{name:'uri',type:'string'}],
  name:'mintTo', outputs:[{name:'tokenId',type:'uint256'}],
  stateMutability:'nonpayable', type:'function'
}]

async function main () {
  const BADGE = process.env.BADGE_ADDRESS
  const URI   = process.env.TOKEN_URI
  if (!BADGE || !URI) throw new Error('Set BADGE_ADDRESS and TOKEN_URI')

  const conn = await hre.network.connect({ network: 'didlab' })
  const { viem } = conn
  const [wallet] = await viem.getWalletClients({ chain: DIDLAB })
  const pc = await viem.getPublicClient({ chain: DIDLAB })

  const hash = await wallet.writeContract({
    address: BADGE,
    abi: ABI,
    functionName: 'mintTo',
    args: [wallet.account.address, URI],
    gas: 200_000n,
    gasPrice: 200n * 10n ** 9n,     // legacy gas chain; bump if needed
  })
  console.log('tx:', hash)

  const r = await pc.waitForTransactionReceipt({ hash, timeout: 300_000 })
  console.log('✅ minted token in block', r.blockNumber)

  await conn.close()
}
main().catch((e)=>{ console.error(e); process.exit(1) })
