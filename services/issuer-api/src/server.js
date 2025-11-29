import express from 'express';
import dotenv from 'dotenv';
import { ethers, keccak256, toUtf8Bytes } from 'ethers';
import { create as createIpfsClient } from 'ipfs-http-client';

dotenv.config();

const app = express();
app.use(express.json());

// Environment
const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.RPC_URL;
const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;
const CREDENTIAL_ANCHOR_ADDRESS = process.env.CREDENTIAL_ANCHOR_ADDRESS;
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS;
const IPFS_URL = process.env.IPFS_URL || 'https://ipfs.infura.io:5001';

// Minimal ABI for CredentialAnchor
const credentialAnchorAbi = [
  'function anchorCredential(bytes32 _anchor) external',
  'function isAnchored(bytes32 _anchor) external view returns (bool)',
  'function isRevoked(bytes32 _anchor) external view returns (bool)',
  'function revokeCredential(bytes32 _anchor) external'
];

const issuerRegistryAbi = [
  'function registerIssuer(address _issuer, string _did) external',
  'function unregisterIssuer(address _issuer) external',
  'function isIssuer(address issuer) external view returns (bool)',
  'function getIssuerDid(address _issuer) external view returns (string)'
];

// Set up provider, wallet, contract
let provider, wallet, anchorContract, registryContract, ipfs;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required`);
  return v;
}

function initClients() {
  provider = new ethers.JsonRpcProvider(requireEnv('RPC_URL'));
  wallet = new ethers.Wallet(requireEnv('ISSUER_PRIVATE_KEY'), provider);
  anchorContract = new ethers.Contract(requireEnv('CREDENTIAL_ANCHOR_ADDRESS'), credentialAnchorAbi, wallet);
  if (REGISTRY_ADDRESS) {
    registryContract = new ethers.Contract(REGISTRY_ADDRESS, issuerRegistryAbi, wallet);
  }
  ipfs = createIpfsClient({ url: IPFS_URL });
}

// Issue VC endpoint
// Body: { subjectDid, degree, university, issueDate }
app.post('/issue', async (req, res) => {
  try {
    const { subjectDid, degree, university, issueDate } = req.body;
    if (!subjectDid || !degree || !university) {
      return res.status(400).json({ error: 'subjectDid, degree, university are required' });
    }

    // Minimal VC (JSON-LD-like) for prototype
    const vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'DegreeCredential'],
      issuer: process.env.ISSUER_DID || 'did:example:issuer',
      issuanceDate: issueDate || new Date().toISOString(),
      credentialSubject: {
        id: subjectDid,
        degree
      },
      university
    };

    // Pin to IPFS (optional for MVP)
    let cid = null;
    try {
      const { cid: ipfsCid } = await ipfs.add(JSON.stringify(vc));
      cid = ipfsCid.toString();
    } catch (e) {
      // Continue even if IPFS fails for local demo
      console.warn('IPFS add failed:', e.message);
    }

    // Compute anchor hash from VC content (or from CID)
    const payloadForHash = cid ? cid : JSON.stringify(vc);
    const anchorHash = keccak256(toUtf8Bytes(payloadForHash));

    // Anchor on-chain
    const tx = await anchorContract.anchorCredential(anchorHash);
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      vc,
      cid,
      anchorHash,
      txHash: receipt.hash
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Register issuer in IssuerRegistry (requires API wallet to be contract owner)
// Body: { issuerAddress, did }
app.post('/register-issuer', async (req, res) => {
  try {
    if (!registryContract) return res.status(400).json({ error: 'REGISTRY_ADDRESS not configured' });
    const { issuerAddress, did } = req.body;
    if (!issuerAddress || !did) return res.status(400).json({ error: 'issuerAddress and did are required' });
    const tx = await registryContract.registerIssuer(issuerAddress, did);
    const receipt = await tx.wait();
    return res.json({ ok: true, txHash: receipt.hash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Revoke an anchored credential
// Body: { anchorHash }
app.post('/revoke', async (req, res) => {
  try {
    const { anchorHash } = req.body;
    if (!anchorHash) return res.status(400).json({ error: 'anchorHash is required' });

    const tx = await anchorContract.revokeCredential(anchorHash);
    const receipt = await tx.wait();
    return res.json({ ok: true, txHash: receipt.hash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Status of a credential anchor
app.get('/status/:anchor', async (req, res) => {
  try {
    const anchor = req.params.anchor;
    const anchored = await anchorContract.isAnchored(anchor);
    const revoked = anchored ? await anchorContract.isRevoked(anchor) : false;
    return res.json({ ok: true, anchored, revoked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Start server
initClients();
app.listen(PORT, () => {
  console.log(`Issuer API listening on http://localhost:${PORT}`);
});
