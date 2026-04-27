const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, ExternalHyperlink,
  LevelFormat
} = require('docx');
const fs = require('fs');

const NAVY        = "2C3E6B";
const TEAL        = "1A7A8A";
const LIGHT_BLUE  = "E8F4F8";
const LIGHT_GRAY  = "F7F7F7";
const DARK        = "222222";
const MID_GRAY    = "555555";
const WHITE       = "FFFFFF";
const GREEN       = "1A6B3A";
const LIGHT_GREEN = "E8F5EE";
const AMBER       = "7F5700";
const LIGHT_AMBER = "FFF8E1";

const noBorder   = { style: BorderStyle.NONE, size: 0, color: WHITE };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function h1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 60 })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: NAVY })]
  });
}

function h4(text) {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: TEAL })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: DARK })]
  });
}

function bullet(bold_part, rest) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "\u25C6  ", size: 20, font: "Arial", color: TEAL }),
      new TextRun({ text: bold_part, bold: true, size: 20, font: "Arial", color: DARK }),
      new TextRun({ text: rest || "", size: 20, font: "Arial", color: DARK }),
    ]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [new TextRun({ text, size: 18, font: "Courier New", color: NAVY })]
  });
}

function callout(label, text, color) {
  const fillColor   = color === "green" ? LIGHT_GREEN : color === "amber" ? LIGHT_AMBER : LIGHT_BLUE;
  const borderColor = color === "green" ? GREEN       : color === "amber" ? AMBER       : TEAL;
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: borderColor }, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 24, color: borderColor }, right: noBorder },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [
          new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: label, bold: true, size: 18, font: "Arial", color: borderColor, allCaps: true })] }),
          new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text, size: 18, font: "Arial", color: DARK })] }),
        ]
      })]
    })]
  });
}

function comparisonTable(headers, rows) {
  const w = [3008, 3009, 3009];
  const headerRow = new TableRow({
    children: headers.map((h, j) => new TableCell({
      borders: thinBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      width: { size: w[j], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: "Arial", color: WHITE })] })]
    }))
  });
  const dataRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => new TableCell({
      borders: thinBorders,
      shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      width: { size: w[j], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, font: "Arial", color: DARK })] })]
    }))
  }));
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: w, rows: [headerRow, ...dataRows] });
}

function twoColTable(headers, rows) {
  const w = [3008, 6018];
  const headerRow = new TableRow({
    children: headers.map((h, j) => new TableCell({
      borders: thinBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      width: { size: w[j], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: "Arial", color: WHITE })] })]
    }))
  });
  const dataRows = rows.map((row, i) => new TableRow({
    children: row.map((cell, j) => new TableCell({
      borders: thinBorders,
      shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      width: { size: w[j], type: WidthType.DXA },
      children: [new Paragraph({ children: [new TextRun({ text: cell, size: 18, font: "Arial", color: DARK })] })]
    }))
  }));
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: w, rows: [headerRow, ...dataRows] });
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun("")] });
}

function ref(authors, text, url) {
  return new Paragraph({
    spacing: { before: 80, after: 40 },
    indent: { left: 0, hanging: 720 },
    children: [
      new TextRun({ text: authors, bold: true, size: 18, font: "Arial", color: DARK }),
      new TextRun({ text, size: 18, font: "Arial", color: DARK }),
      ...(url ? [new ExternalHyperlink({ link: url, children: [new TextRun({ text: url.replace("https://", ""), size: 18, font: "Arial", color: TEAL, underline: {} })] })] : [])
    ]
  });
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
      }
    },
    children: [

      // TITLE
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "BLOCKCHAIN PAYMENTS", bold: true, size: 52, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 80 })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Smart Contracts & Payment Protocols \u2014 Stage 4 of 4", size: 24, font: "Arial", color: TEAL, italics: true })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Self-Directed Specialization in Crypto & Fintech Analytics", size: 20, font: "Arial", color: MID_GRAY, italics: true })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Author:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "Saki Cansev", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Background:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "BSc Economics, Ankara University  |  MSc Data Analytics, University for the Creative Arts", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Prerequisite:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "Stage 3 \u2014 Python Integration & Event Study Analysis (completed April 2026)", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 1 } },
        children: [new TextRun({ text: "GitHub:  ", bold: true, size: 20, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://github.com/sakicansev", children: [new TextRun({ text: "github.com/sakicansev", size: 20, font: "Arial", color: TEAL, underline: {} })] })]
      }),
      spacer(),

      // FOREWORD
      h1("Foreword"),
      body("The first three stages of this program built a complete analytical foundation. Stage 1 established the conceptual mechanics of blockchain payment systems. Stage 2 demonstrated that real on-chain data is queryable and economically informative. Stage 3 produced original empirical findings: a Python event study connecting USDC payment flows to nine geopolitical conflict events, revealing a two-phase behavioral response pattern, within-crypto flight-to-stability during the Haniyeh assassination, and a structural market regime change visible in the February 2026 data."),
      spacer(),
      body("Stage 4 goes one level deeper. Everything analyzed in Stages 2 and 3 \u2014 USDC transfers, token volumes, payment flows \u2014 was observed at the surface level through decoded Spell tables that Dune prepares in advance. This stage explains what is happening underneath those tables: how smart contracts actually execute payment logic, what the raw event log data looks like before decoding, how real payment protocols encode invoices and settlements on-chain, and how to write Dune queries that work directly with contract-level data."),
      spacer(),
      body("This is the level of understanding that distinguishes a blockchain data analyst from a general data analyst who happens to work with crypto data. It is also the foundation for the seismograph project \u2014 detecting pre-event on-chain anomalies requires understanding what normal contract-level behavior looks like so that deviations from it become visible."),
      spacer(),
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: "Saki Cansev", bold: true, size: 20, font: "Arial", color: NAVY, italics: true }),
          new TextRun({ text: "  \u2014  Amersfoort, Netherlands, April 2026", size: 20, font: "Arial", color: MID_GRAY, italics: true }),
        ]
      }),
      spacer(),

      callout("Scope of This Document",
        "This document covers five topics: how ERC-20 smart contracts work and what the Transfer event looks like in raw form; " +
        "how to decode raw log data on Dune without relying on Spell tables; " +
        "how Request Network encodes payment requests on-chain; " +
        "how Gnosis Pay bridges self-custodial crypto with Visa card infrastructure; " +
        "and a capstone Dune query exercise working directly with contract-level data. " +
        "A self-assessment section defines the criteria for program completion."),
      spacer(),

      // SECTION 1
      h1("1. How Smart Contracts Work"),
      body("Every USDC transfer analyzed in Stages 2 and 3 was executed by a smart contract. Understanding what that means at the code level transforms how you read on-chain data."),
      spacer(),

      h3("1.1  What a Smart Contract Is"),
      body("A smart contract is a program that lives at an Ethereum address. It has its own balance, its own storage, and its own code. When you send a transaction to a smart contract address, the network executes that contract's code. The execution is deterministic \u2014 given the same inputs, every node in the network produces the same output. There is no server, no company, and no human executing the logic. The code runs exactly as written, automatically, every time."),
      spacer(),
      body("The USDC contract at address 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 is a smart contract. When you call its transfer() function, the contract deducts tokens from one balance and adds them to another. It also emits a Transfer event \u2014 a structured log entry that records what happened. This is the event your Stage 2 Query 3 was reading from erc20_ethereum.evt_Transfer."),
      spacer(),

      h3("1.2  The ERC-20 Standard"),
      body("ERC-20 is a standard interface that all fungible tokens on Ethereum must implement (Ethereum Foundation, 2025). Fungible means each unit is identical and interchangeable \u2014 one USDC is always worth one USDC. The standard defines six functions and two events that every ERC-20 token contract must have:"),
      spacer(),
      twoColTable(["Function / Event", "What It Does"],
        [
          ["totalSupply()", "Returns the total number of tokens in existence"],
          ["balanceOf(address)", "Returns the token balance of a given address"],
          ["transfer(to, amount)", "Moves tokens from the caller to another address"],
          ["transferFrom(from, to, amount)", "Moves tokens on behalf of another address (requires approval)"],
          ["approve(spender, amount)", "Authorizes another address to spend tokens on your behalf"],
          ["allowance(owner, spender)", "Returns how much a spender is authorized to transfer"],
          ["EVENT: Transfer(from, to, value)", "Emitted every time tokens move between addresses"],
          ["EVENT: Approval(owner, spender, value)", "Emitted every time an approval is granted"],
        ]
      ),
      spacer(),
      body("The Transfer event is the most important for payment analysis. Every USDC transfer \u2014 every row in erc20_ethereum.evt_Transfer \u2014 is one emission of this event. Understanding its structure is the key to reading raw log data."),
      spacer(),

      h3("1.3  The Transfer Event in Raw Form"),
      body("When the USDC contract emits a Transfer event, Ethereum records it as a log entry with the following raw structure:"),
      spacer(),
      code("address:  0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48  (the USDC contract)"),
      code("topic0:   0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      code("topic1:   0x000000000000000000000000[from_address_padded_to_32_bytes]"),
      code("topic2:   0x000000000000000000000000[to_address_padded_to_32_bytes]"),
      code("data:     0x000000000000000000000000000000000000000000000000000000003b9ac9ff"),
      spacer(),
      body("Breaking this down:"),
      spacer(),
      bullet("topic0", " \u2014 the keccak256 hash of the event signature 'Transfer(address,address,uint256)'. This is how Ethereum identifies what type of event was emitted. Every Transfer event on every ERC-20 token has the same topic0."),
      bullet("topic1", " \u2014 the from address, zero-padded to 32 bytes. The actual address is the last 20 bytes."),
      bullet("topic2", " \u2014 the to address, zero-padded to 32 bytes."),
      bullet("data", " \u2014 the token amount in raw units (wei equivalent for the token). For USDC with 6 decimals, 0x3b9ac9ff = 999,999,999 raw units = 999.999999 USDC."),
      spacer(),

      callout("Why This Matters for Analysis",
        "Dune's Spell tables decode all of this automatically \u2014 you never had to think about topic0 or hex data in Stages 2 and 3. " +
        "But for tokens or protocols that Dune has not yet decoded, you must query the raw logs table and decode manually. " +
        "Understanding the raw structure means you can analyze any contract on any chain, not just the ones Dune has prepared tables for. " +
        "This is the difference between an analyst who can only use pre-built tools and one who can build their own."),
      spacer(),

      h3("1.4  Gas and Contract Execution"),
      body("Every function call to a smart contract consumes gas \u2014 exactly as established in Stage 1. But the gas cost is not fixed per function: it depends on what the function does. A simple ERC-20 transfer costs approximately 65,000 gas. A complex DeFi interaction involving multiple contract calls can cost 500,000 gas or more. The analyst implication: gas cost is a proxy for computational complexity. When you see a transaction with unusually high gas consumption, it likely involved multiple contract interactions \u2014 worth investigating."),
      spacer(),

      // SECTION 2
      h1("2. Decoding Raw Logs on Dune"),
      body("Stage 2 relied entirely on Dune's decoded Spell tables. This section teaches you to work one level below them \u2014 with the raw logs table \u2014 which gives you access to any contract on any chain, decoded or not."),
      spacer(),

      h3("2.1  The Raw Logs Table"),
      body("Every event emitted by every smart contract on Ethereum is stored in the logs table on Dune:"),
      spacer(),
      code("ethereum.logs"),
      spacer(),
      twoColTable(["Column", "What It Contains"],
        [
          ["block_time", "Timestamp of the block containing this log"],
          ["block_number", "Block number"],
          ["tx_hash", "Transaction hash that produced this log"],
          ["contract_address", "Address of the contract that emitted the event"],
          ["topic0", "Event signature hash (identifies event type)"],
          ["topic1", "First indexed parameter (often the 'from' address)"],
          ["topic2", "Second indexed parameter (often the 'to' address)"],
          ["topic3", "Third indexed parameter (if present)"],
          ["data", "Non-indexed parameters encoded as hex"],
        ]
      ),
      spacer(),

      h3("2.2  Reading a Transfer Event from Raw Logs"),
      body("This query reads USDC Transfer events directly from the raw logs table, without using the decoded Spell table. It demonstrates manual decoding:"),
      spacer(),
      code("SELECT"),
      code("    block_time,"),
      code("    tx_hash,"),
      code("    -- Extract 'from' address: last 20 bytes of topic1"),
      code("    CONCAT('0x', SUBSTR(topic1, 27, 40)) AS from_address,"),
      code("    -- Extract 'to' address: last 20 bytes of topic2"),
      code("    CONCAT('0x', SUBSTR(topic2, 27, 40)) AS to_address,"),
      code("    -- Decode amount from hex data field, divide by 1e6 for USDC"),
      code("    bytea2numeric(data) / 1e6 AS usdc_amount"),
      code("FROM ethereum.logs"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    -- Filter for Transfer events only using topic0 signature hash"),
      code("    AND topic0 = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      code("    AND block_time >= NOW() - INTERVAL '1' DAY"),
      code("ORDER BY block_time DESC"),
      code("LIMIT 10"),
      spacer(),
      body("Run this query on Dune and compare it against Query 3 from Stage 2. Both should return identical transfer data \u2014 one using the decoded Spell table, one decoding manually from raw logs. Seeing the same data produced two different ways solidifies your understanding of what Dune's Spell tables are actually doing."),
      spacer(),

      callout("Key Insight",
        "topic0 is the fingerprint of an event type. " +
        "The hash 0xddf252ad... always means Transfer(address,address,uint256) on any ERC-20 contract on any chain. " +
        "If you ever need to find all token transfers on a chain Dune has not decoded, " +
        "filter logs by this topic0 and you will find every ERC-20 transfer \u2014 regardless of the token.", "green"),
      spacer(),

      h3("2.3  Finding Events for Any Contract"),
      body("The power of raw log analysis is that it works for any contract, not just the ones Dune has decoded. The workflow for analyzing a new protocol:"),
      spacer(),
      bullet("Step 1", " \u2014 Find the contract address on Etherscan"),
      bullet("Step 2", " \u2014 Look at the contract's ABI (Application Binary Interface) to find event signatures"),
      bullet("Step 3", " \u2014 Compute keccak256 hash of the event signature to get topic0"),
      bullet("Step 4", " \u2014 Query ethereum.logs filtered by contract_address and topic0"),
      bullet("Step 5", " \u2014 Decode topic1, topic2, and data fields based on the event parameter types"),
      spacer(),
      body("This workflow is what blockchain forensics firms use for analyzing contracts that are too new, too obscure, or too specialized for Dune's automated decoding pipeline. Mastering it means you are not limited to what Dune has already prepared."),
      spacer(),

      // SECTION 3
      h1("3. Request Network"),
      body("Request Network is an open protocol for payment requests built on Ethereum. Understanding it at the contract level is directly relevant to payment analytics because it demonstrates how real-world invoicing logic is encoded on-chain."),
      spacer(),

      h3("3.1  What Request Network Does"),
      body("Request Network allows anyone to create a payment request \u2014 essentially a decentralized invoice. The requester specifies: who should pay, how much, in what currency, and by when. The payer can pay the request directly on-chain. The entire lifecycle \u2014 creation, payment, cancellation \u2014 is recorded as on-chain events."),
      spacer(),
      body("The economic significance: every business that uses Request Network for invoicing produces queryable on-chain payment data. You can measure payment velocity, invoice settlement rates, average payment times, and geographic payment flows \u2014 from public blockchain data, without any access to private business records."),
      spacer(),

      h3("3.2  The Request Network Data Model"),
      body("Request Network stores payment requests using a content-addressed storage system. The on-chain contract stores only a hash pointing to the full invoice data stored on IPFS. This is an important architectural pattern: the blockchain stores the proof of existence and payment, while the detailed data lives off-chain."),
      spacer(),
      twoColTable(["On-Chain (Ethereum)", "Off-Chain (IPFS)"],
        [
          ["Request ID (hash)", "Payer address"],
          ["Payment status", "Payee address"],
          ["Amount paid", "Invoice amount and currency"],
          ["Timestamp", "Payment terms and due date"],
          ["Payment event log", "Invoice metadata and description"],
        ]
      ),
      spacer(),

      h3("3.3  Querying Request Network on Dune"),
      body("Request Network data is available on Dune through the decoded tables. This query shows daily payment request volume on Ethereum:"),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', evt_block_time) AS date,"),
      code("    COUNT(*) AS requests_created,"),
      code("    SUM(TRY_CAST(expectedAmount AS DOUBLE))"),
      code("        / 1e18 AS total_requested_eth"),
      code("FROM requestnetwork_ethereum.RequestCore_evt_Created"),
      code("WHERE evt_block_time >= NOW() - INTERVAL '90' DAY"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Compare the output to your USDC volume chart from Stage 2. Request Network volume is a fraction of raw USDC transfer volume \u2014 it represents structured B2B invoicing rather than all stablecoin movement. This distinction is analytically important: not all USDC transfers are payments in the commercial sense. Request Network transfers are explicitly structured payment requests, making them a cleaner signal for business payment flow analysis."),
      spacer(),

      // SECTION 4
      h1("4. Gnosis Pay"),
      body("Gnosis Pay is the most important real-world payment protocol to understand for a European fintech analyst. It is the first production deployment of a self-custodial crypto payment card, and it is directly relevant to the Netherlands market."),
      spacer(),

      h3("4.1  What Gnosis Pay Is"),
      body("Gnosis Pay is a Visa debit card connected directly to a self-custodial smart contract wallet on Gnosis Chain. When you make a purchase with the card anywhere Visa is accepted \u2014 a supermarket, a petrol station, an online store \u2014 the payment is settled on-chain in EURe (a Euro-pegged stablecoin) or USDC. The merchant receives euros through the normal Visa settlement system. The crypto complexity is completely invisible to them."),
      spacer(),
      body("This is architecturally different from exchange-linked crypto debit cards (like those from Coinbase or Crypto.com), where the exchange holds custody of your funds and converts them at the point of sale. With Gnosis Pay, you hold your own keys. The smart contract wallet is yours. The card is an interface to your wallet, not a card linked to a company's custodial account."),
      spacer(),

      h3("4.2  The Technical Architecture"),
      bullet("Gnosis Chain", " \u2014 an Ethereum sidechain with ~5 second block times and very low fees. Transactions cost fractions of a cent, making card-level micropayments viable."),
      bullet("Safe smart wallet", " \u2014 Gnosis Pay uses Safe (formerly Gnosis Safe), the most widely used smart contract wallet standard. Your funds are controlled by a multi-signature contract, not a single private key."),
      bullet("EURe", " \u2014 a Euro-backed stablecoin issued by Monerium, the first company to receive an e-money license in Europe for blockchain-native payments. EURe is the primary payment currency for Gnosis Pay in Europe."),
      bullet("Visa connection", " \u2014 Gnosis Pay connects to Visa's network through a regulated card program. When you tap your card, Visa processes the payment and Gnosis Pay settles on-chain within seconds."),
      spacer(),

      callout("Relevance for the Netherlands",
        "EURe is a Euro-pegged stablecoin with full e-money licensing in Europe, including the Netherlands. " +
        "As Gnosis Pay expands, it represents the most credible current attempt at making crypto payments work at everyday retail scale in the EU. " +
        "An analyst in the Netherlands who understands Gnosis Pay's on-chain data structure \u2014 " +
        "spending patterns, wallet sizes, merchant categories \u2014 " +
        "has a genuine edge for any fintech role in the European market.", "green"),
      spacer(),

      h3("4.3  Querying Gnosis Pay Data"),
      body("Gnosis Pay transaction data is available on Dune on the Gnosis Chain. This query shows daily Gnosis Pay spending volume:"),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', block_time) AS date,"),
      code("    COUNT(*) AS transactions,"),
      code("    SUM(amount / 1e6) AS eure_volume"),
      code("FROM gnosis.transactions"),
      code("WHERE to = 0x[gnosis_pay_settlement_contract]"),
      code("    AND block_time >= NOW() - INTERVAL '90' DAY"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Note: the exact contract address should be verified at gnosispay.com/developers before running. Contract addresses can change with protocol upgrades. Always verify addresses against official documentation before using them in analysis \u2014 this is a professional standard that prevents silent errors."),
      spacer(),

      // SECTION 5
      h1("5. Capstone Query Exercise"),
      body("This section contains one original Dune query exercise that synthesizes everything from all four stages. It requires understanding of smart contract events (Stage 4), SQL on Dune (Stage 2), and the economic interpretation framework (Stages 1 and 3)."),
      spacer(),

      h3("5.1  Query: Contract-Level USDC Payment Analysis"),
      body("This query goes beyond the surface-level transfer volume queries of Stage 2. It identifies USDC transfers that originated from smart contract calls \u2014 as opposed to simple wallet-to-wallet transfers \u2014 by joining the transfer data with the transactions table to filter for transactions where the originating address is a contract."),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', t.evt_block_time) AS date,"),
      code("    COUNT(*) AS contract_initiated_transfers,"),
      code("    SUM(t.value / 1e6) AS usdc_volume,"),
      code("    AVG(tx.gas_used) AS avg_gas_used"),
      code("FROM erc20_ethereum.evt_Transfer t"),
      code("JOIN ethereum.transactions tx"),
      code("    ON t.evt_tx_hash = tx.hash"),
      code("WHERE t.contract_address"),
      code("    = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND t.evt_block_time >= NOW() - INTERVAL '30' DAY"),
      code("    -- Filter for contract-initiated transfers:"),
      code("    -- transactions where the 'to' is not the USDC contract"),
      code("    -- (meaning the USDC transfer was triggered by another contract)"),
      code("    AND tx.to != 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND tx.gas_used > 100000"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("What this query tells you: the proportion of USDC volume that flows through smart contracts \u2014 DeFi protocols, payment processors, automated market makers \u2014 versus simple person-to-person transfers. Higher average gas usage indicates more complex contract logic. This is a direct measure of how much of USDC's economic activity is automated versus manual."),
      spacer(),

      h3("5.2  Extending the Query for the Seismograph Project"),
      body("The future seismograph project \u2014 detecting pre-event on-chain anomalies as leading indicators of geopolitical action \u2014 will build directly on this type of contract-level analysis. The specific extension:"),
      spacer(),
      bullet("Pre-event window", " \u2014 run the same query for the 72-hour period before each of the nine conflict events"),
      bullet("Baseline comparison", " \u2014 compare contract-initiated transfer counts and volumes against the 30-day rolling average"),
      bullet("Anomaly detection", " \u2014 flag days where contract-initiated USDC volume exceeds 2 standard deviations above baseline"),
      bullet("Geographic attribution", " \u2014 cross-reference anomalous transactions with known institutional wallet addresses"),
      spacer(),
      body("This is the analytical pipeline that transforms the event study completed in Stage 3 into a forward-looking detection system. The contract-level view is essential because institutional actors move capital through smart contracts \u2014 not through simple wallet-to-wallet transfers that any retail user makes."),
      spacer(),

      // SECTION 6
      h1("6. Program Completion"),
      body("Completing Stage 4 marks the end of the Blockchain Payments Self-Study Program. The table below summarizes what has been built across all four stages:"),
      spacer(),
      comparisonTable(["Stage", "Output", "Original Contribution"],
        [
          ["Stage 1", "Conceptual Foundation document", "Geographic mempool propagation framework for detecting urgency origin from node timestamp data"],
          ["Stage 2", "10 Dune queries + public dashboard", "Query 10: USDC payment volume collapsed 66% on October 7, 2023 \u2014 first documented connection between this conflict event and on-chain payment behavior"],
          ["Stage 3", "Python event study notebook", "Four original findings: Isfahan threshold effect, two-phase surge pattern, Haniyeh divergence, February 2026 regime change"],
          ["Stage 4", "Contract-level query capability", "Capstone query framework linking contract-initiated USDC transfers to the seismograph anomaly detection pipeline"],
        ]
      ),
      spacer(),

      h3("Self-Check \u2014 Program Completion Criteria"),
      bullet("Can explain the Transfer event log structure", " without referring to notes"),
      bullet("Can write a Dune query against ethereum.logs", " using raw topic0 filtering"),
      bullet("Can explain the difference between Request Network and raw USDC transfers", " as payment signals"),
      bullet("Can explain what makes Gnosis Pay architecturally different", " from custodial crypto cards"),
      bullet("Capstone query run and results interpreted", " on Dune"),
      bullet("All four stage documents committed to GitHub", ""),
      bullet("Portfolio README updated with all findings", ""),
      spacer(),

      callout("What Comes Next \u2014 The Seismograph Project",
        "The next project builds on everything completed here: " +
        "a geopolitical early-warning system using on-chain crypto data. " +
        "The hypothesis: state actors and their financial networks move capital before military action becomes public, " +
        "creating detectable anomalies in on-chain data. " +
        "Using the nine conflict events already documented, analyze 72-hour pre-event windows " +
        "for anomalous patterns in whale transfers, USDC volume, gas fee urgency, and mempool fee distribution. " +
        "Cross-reference with the geographic mempool propagation framework from Stage 1. " +
        "The goal: a seismograph-style alert system that identifies pre-event on-chain signatures " +
        "that statistically precede geopolitical escalation. " +
        "Tools: Python, Dune Analytics, Blocknative API, SQLite, scipy anomaly detection.", "green"),
      spacer(),

      // READING LIST
      h1("Official Documentation \u2014 Reading List"),
      body("Read the official sources for each protocol covered in this stage. Do not rely on secondary summaries."),
      spacer(),
      h4("Smart Contracts & ERC-20"),
      bullet("ERC-20 token standard", " \u2014 eips.ethereum.org/EIPS/eip-20"),
      bullet("Ethereum smart contract documentation", " \u2014 ethereum.org/en/developers/docs/smart-contracts"),
      bullet("Ethereum event logs", " \u2014 ethereum.org/en/developers/docs/smart-contracts/anatomy"),
      spacer(),
      h4("Request Network"),
      bullet("Request Network documentation", " \u2014 docs.request.network"),
      bullet("Request Network on Dune", " \u2014 dune.com/docs/data-tables/decoded"),
      spacer(),
      h4("Gnosis Pay"),
      bullet("Gnosis Pay documentation", " \u2014 gnosispay.com"),
      bullet("Gnosis Chain documentation", " \u2014 docs.gnosischain.com"),
      bullet("EURe stablecoin", " \u2014 monerium.com"),
      bullet("Safe smart wallet", " \u2014 safe.global"),
      spacer(),

      // REFERENCES
      h1("References"),
      spacer(),
      ref("Buterin, V. (2014). ", "Ethereum: A next-generation smart contract and decentralized application platform. Ethereum Foundation. ", "https://ethereum.org/whitepaper"),
      ref("Circle Internet Financial. (2025). ", "USDC documentation. Circle Developer Portal. ", "https://developers.circle.com/stablecoins/docs/what-is-usdc"),
      ref("Ethereum Foundation. (2025). ", "ERC-20 token standard. Ethereum Improvement Proposals. ", "https://eips.ethereum.org/EIPS/eip-20"),
      ref("Ethereum Foundation. (2025). ", "Ethereum developer documentation: Smart contracts. ", "https://ethereum.org/en/developers/docs/smart-contracts"),
      ref("Gnosis. (2025). ", "Gnosis Pay documentation. ", "https://gnosispay.com"),
      ref("Gnosis. (2025). ", "Gnosis Chain documentation. ", "https://docs.gnosischain.com"),
      ref("Monerium. (2025). ", "EURe: Euro-backed stablecoin with e-money license. ", "https://monerium.com"),
      ref("Nakamoto, S. (2008). ", "Bitcoin: A peer-to-peer electronic cash system. ", "https://bitcoin.org/bitcoin.pdf"),
      ref("Request Network. (2025). ", "Request Network developer documentation. ", "https://docs.request.network"),
      ref("Safe. (2025). ", "Safe smart account documentation. ", "https://safe.global"),
      spacer(),

      // FOOTER
      new Paragraph({
        spacing: { before: 360, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        children: [new TextRun({ text: "Blockchain Payments \u2014 Stage 4 Study Guide  |  Saki Cansev  |  April 2026  |  github.com/sakicansev", size: 16, font: "Arial", color: MID_GRAY })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/Blockchain_Payments_Stage4.docx', buffer);
  console.log('Stage 4 done.');
});
