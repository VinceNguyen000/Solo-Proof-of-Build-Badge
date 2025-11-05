// scripts/sign.js
import 'dotenv/config'
import { Wallet } from 'ethers'

const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY
if (!PRIVATE_KEY_RAW) throw new Error('Missing PRIVATE_KEY in .env')
const PRIVATE_KEY = PRIVATE_KEY_RAW.startsWith('0x') ? PRIVATE_KEY_RAW : `0x${PRIVATE_KEY_RAW}`

const ADDRESS = (process.env.ADDRESS || '').trim() || null
const DOMAIN  = process.env.SIWE_DOMAIN || 'blockchain.didlab.org'
const URI     = process.env.SIWE_URI    || 'https://blockchain.didlab.org'
const CHAINID = Number(process.env.SIWE_CHAIN_ID || 252501)

const wallet  = new Wallet(PRIVATE_KEY)
const address = ADDRESS || (await wallet.getAddress())

async function prepare() {
  const res = await fetch('https://api.didlab.org/v1/siwe/prepare', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      address: address,      // checksummed is fine
      domain:  DOMAIN,
      uri:     URI,
      chainId: CHAINID,
      // (do NOT add issuedAt/nonce yourself; server will include them)
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.message) {
    throw new Error(`prepare failed: ${res.status} ${JSON.stringify(data)}`)
  }
  return data.message
}

async function main() {
  console.log('Address:', address)

  // 1) get the exact SIWE message from server
  const message = await prepare()
  console.log('\nSIWE message from server:\n', message, '\n')

  // 2) sign the message verbatim
  const signature = await wallet.signMessage(message)
  console.log('Signature:', signature)

  // 3) verify -> get JWT
  const ver = await fetch('https://api.didlab.org/v1/siwe/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  })
  const vdata = await ver.json().catch(() => ({}))
  if (!ver.ok || !vdata?.token) {
    throw new Error(`verify failed: ${ver.status} ${JSON.stringify(vdata)}`)
  }
  console.log('\n✅ JWT:', vdata.token)
}

main().catch((e) => { console.error(e); process.exit(1) })
