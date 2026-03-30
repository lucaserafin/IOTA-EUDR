# 🚀 EUDR Deforestation-Free Notarizer

**A blockchain-based tool that notarizes EUDR compliance claims for agricultural parcels on the IOTA network.**

## 📖 Overview

### The Use-Case

The **EU Deforestation Regulation (EUDR)** requires companies to prove that commodities like cocoa, coffee, palm oil, soy, wood, rubber, and cattle were not produced on deforested land after December 31, 2020. Businesses and farmers must submit **due diligence statements** backed by verifiable evidence — but today there is no tamper-proof, low-cost way to anchor these claims. Falsified or retroactively altered compliance documents remain a real risk, exposing operators and importers to legal and reputational harm.

### The Solution

EUDR Notarizer lets any operator submit a deforestation-free parcel claim and have it permanently anchored on the IOTA blockchain in seconds. The claim's SHA-256 hash is stored as a locked, immutable notarization object on-chain. Anyone — a regulator, auditor, or downstream buyer — can independently verify the integrity and timestamp of the claim using only the notarization ID or a scannable QR code. The blockchain acts as a neutral, tamper-evident notary: it does not validate the truth of the claim, but it proves the claim existed, in that exact form, at a specific point in time.

## ✨ Key Features

* **On-chain notarization:** Submits parcel compliance claims as SHA-256 hashed, locked notarization objects on IOTA — immutable and permanently timestamped.
* **Instant verification:** Anyone can verify a claim's integrity by querying its notarization ID; results include the original hash, description, and creation timestamp.
* **QR code sharing:** Each notarization generates a scannable QR code linking directly to the verification page, making compliance sharing frictionless.
* **Notarization history:** Full paginated view of all notarizations created by an address, with direct links to IOTA Explorer for each record.
* **Multi-commodity support:** Covers all EUDR-regulated commodities — cocoa, coffee, palm oil, soy, wood, rubber, and cattle.

## ⛓️ Use of IOTA Technology

* **IOTA Move Smart Contracts (`@iota/notarization`):** The `notarization::Notarization` Move module is used to create **locked notarization objects** on-chain. Each claim is hashed client-side and the hash is stored as an immutable on-chain record, making post-hoc alteration impossible.
* **IOTA SDK (`@iota/iota-sdk`):** Used for all blockchain interactions — connecting to the IOTA network via `IotaClient`, signing transactions with `Ed25519Keypair` / `Ed25519KeypairSigner`, and querying owned objects for history retrieval.
* **IOTA Devnet Faucet:** `requestIotaFromFaucetV0()` is used to fund gas fees automatically during development and demo, removing friction for first-time users who do not yet hold IOTA tokens.

## 🏗 System Architecture

### High-Level Design

The **frontend** (vanilla HTML/JS) collects parcel data from the user and calls the **Express backend** via JSON REST API. The backend validates the input, builds a canonical JSON claim, hashes it with SHA-256, and calls the **IOTA Notarization SDK** to create a locked on-chain object. The resulting notarization ID and QR code are returned to the frontend. For verification, the backend queries the IOTA network read-only to retrieve the stored hash and timestamp, confirming integrity without any write transaction.

```
Browser (HTML/JS)
      │  REST (JSON)
      ▼
Express Server (Node.js/TypeScript)
      │  @iota/notarization + @iota/iota-sdk
      ▼
IOTA Blockchain (Devnet)
  └── notarization::Notarization objects (locked, immutable)
```

### Technical Stack

* **Language:** TypeScript (backend), JavaScript (frontend)
* **Frameworks:** Express.js
* **IOTA SDKs:** `@iota/iota-sdk` v1.6.1, `@iota/notarization` v0.1.6, `@iota/iota-interaction-ts`, `@iota/bcs`
* **Other:** `qrcode` (QR code generation), Node.js built-in `crypto` (SHA-256 hashing)

## 🎬 Live Demo & Media

* **Live Demo** (Link)[https://drive.google.com/file/d/1gCre6nJQItGLDj3u0sliB0jaj9y1GWVU/view?usp=sharing]

## 🛠 Setup & Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/lucaserafin/IOTA-MasterZ.git
   cd IOTA-MasterZ/eudr-mvp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:** Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   ```env
   NETWORK_URL=https://api.devnet.iota.cafe
   IOTA_NOTARIZATION_PKG_ID=0x...   # deployed notarization package ID
   PORT=3000
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** On devnet the app automatically requests gas from the IOTA faucet, so no tokens are needed to try it out.
