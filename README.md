# DIDLab Hackathon Badge (Solo)

## Contract & Network
- Network (chainId): **252501 (DIDLab)**
- Contract address: **0x9887D4f5549B84b07C93253c5Dd81BB4B2787b62**
- Mint tx hash: **0x4ccfc5d3547b4b283721d54d6f75aab686db710899e6b010b953989188fa371**
- Token ID: **1**
- tokenURI: **ipfs://QmVmFoDN3TR25UKzGwqKjiimDbxSKdTQQV365LTVRZBbLMw**

## IPFS
- Image CID: `QmUnEFCsqFFNQvthuUo6Kaj5ccddfL88rqXH12EWEDxSdJS`
- Metadata CID: `QmVmFoDN3TR25UKzGwqKjiimDbxSKdTQQV365LTVRZBbLMw`

## How to run
- npm i
- npx hardhat compile
- node scripts/sign.js

## Reflection (2–3 sentences)
- What worked: SIWE prepare/verify then upload to DIDLab IPFS; minting on chainId 252501 with legacy gas succeeded.
- What didn’t: DIDLab gateway had issues previewing CIDv0 over HTTP (used public gateways / CIDv1 as workaround).