require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const CONTRACT_ABI = [
  "function addIssuer(address)",
  "function anchorCredential(bytes32, bytes32)",
  "function revokeAnchor(bytes32)",
  "function isAnchored(bytes32) view returns (bool)",
  "function isRevoked(bytes32) view returns (bool)",
  "function issuers(address) view returns (bool)",
  "function getAnchor(bytes32) view returns (address,uint256,bytes32,bool)"
];

if (!PRIVATE_KEY) console.warn('Warning: PRIVATE_KEY not set in env — signing disabled');
if (!CONTRACT_ADDRESS) console.warn('Warning: CONTRACT_ADDRESS not set in env — anchor calls will fail');

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;
const contract = CONTRACT_ADDRESS && provider ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet || provider) : null;

// Simple endpoint to "issue" a dummy credential (not a formal VC) and return payload
app.post('/issue', async (req, res) => {
  const subject = req.body.subject || 'did:example:student';
  const degree = req.body.degree || 'Bachelor of Science';

  const credential = {
    id: `urn:uuid:${uuidv4()}`,
    issuer: process.env.ISSUER_DID || 'did:example:university',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: subject,
      degree: degree
    }
  };

  // In production you'd sign this credential (JWT or Linked Data Proof)
  // For demo we return the JSON plus a simple anchor hash
  const canonical = JSON.stringify(credential);
  const anchorHash = ethers.keccak256(ethers.toUtf8Bytes(canonical));

  res.json({ credential, anchorHash });
});

// Endpoint to anchor a credential on-chain
app.post('/anchor', async (req, res) => {
  if (!contract) return res.status(500).json({ error: 'Contract not configured' });
  if (!wallet) return res.status(500).json({ error: 'PRIVATE_KEY not configured' });

  const anchorHex = req.body.anchorHash; // expected 0x-prefixed bytes32
  const credentialId = req.body.credentialId || ethers.formatBytes32String((req.body.id || '').slice(0, 31) || '');

  if (!anchorHex) return res.status(400).json({ error: 'anchorHash required' });

  try {
    // If issuer not registered, try to add it (best-effort)
    const issuerAddr = await wallet.getAddress();
    const isIssuer = await contract.issuers(issuerAddr);
    if (!isIssuer) {
      const tx = await contract.addIssuer(issuerAddr);
      await tx.wait();
    }

    const tx2 = await contract.anchorCredential(anchorHex, credentialId);
    const receipt = await tx2.wait();

    res.json({ txHash: receipt.transactionHash, blockNumber: receipt.blockNumber });
  } catch (err) {
    console.error('anchor error', err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/status/:anchor', async (req, res) => {
  const anchor = req.params.anchor;
  if (!contract) return res.status(500).json({ error: 'Contract not configured' });
  try {
    const anchored = await contract.isAnchored(anchor);
    const revoked = await contract.isRevoked(anchor);
    res.json({ anchored, revoked });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Issuer API listening on http://localhost:${PORT}`);
});
