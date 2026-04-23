const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, ExternalHyperlink,
  LevelFormat, HeadingLevel, TabStopType, TabStopPosition, PageBreak
} = require('docx');
const fs = require('fs');

const NAVY = "2C3E6B";
const TEAL = "1A7A8A";
const LIGHT_BLUE = "E8F4F8";
const LIGHT_GRAY = "F7F7F7";
const DARK = "222222";
const MID_GRAY = "555555";
const WHITE = "FFFFFF";
const ACCENT = "E67E22";

const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function h1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 1 } },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 60 })]
  });
}

function h2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: TEAL })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: NAVY })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: DARK })]
  });
}

function bullet(text, bold_part, rest) {
  const children = bold_part
    ? [
        new TextRun({ text: "◆  ", size: 20, font: "Arial", color: TEAL }),
        new TextRun({ text: bold_part, bold: true, size: 20, font: "Arial", color: DARK }),
        new TextRun({ text: rest || "", size: 20, font: "Arial", color: DARK }),
      ]
    : [
        new TextRun({ text: "◆  ", size: 20, font: "Arial", color: TEAL }),
        new TextRun({ text, size: 20, font: "Arial", color: DARK }),
      ];
  return new Paragraph({ spacing: { before: 60, after: 60 }, indent: { left: 360 }, children });
}

function callout(label, text) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    margins: { top: 120, bottom: 120 },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL }, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 24, color: TEAL }, right: noBorder },
            shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: [
              new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: label, bold: true, size: 18, font: "Arial", color: TEAL, allCaps: true })] }),
              new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text, size: 18, font: "Arial", color: DARK })] }),
            ]
          })
        ]
      })
    ]
  });
}

function comparisonTable(header1, header2, rows) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders: thinBorders,
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: header1, bold: true, size: 20, font: "Arial", color: WHITE })] })]
      }),
      new TableCell({
        borders: thinBorders,
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: header2, bold: true, size: 20, font: "Arial", color: WHITE })] })]
      }),
    ]
  });

  const dataRows = rows.map((row, i) => new TableRow({
    children: [
      new TableCell({
        borders: thinBorders,
        shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 150, right: 150 },
        width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: row[0], size: 18, font: "Arial", color: DARK })] })]
      }),
      new TableCell({
        borders: thinBorders,
        shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 150, right: 150 },
        width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 18, font: "Arial", color: DARK })] })]
      }),
    ]
  }));

  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [4513, 4513],
    rows: [headerRow, ...dataRows]
  });
}

function link(text, url) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "→  ", size: 20, font: "Arial", color: TEAL, bold: true }),
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text, size: 20, font: "Arial", color: TEAL, underline: {} })]
      })
    ]
  });
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [new TextRun("")] });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
      }
    },
    children: [

      // ── TITLE PAGE BLOCK ──
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "BLOCKCHAIN PAYMENTS", bold: true, size: 52, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 80 })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Conceptual Foundation — Stage 1 of 4", size: 24, font: "Arial", color: TEAL, italics: true })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Self-Directed Specialization in Crypto & Fintech Analytics", size: 20, font: "Arial", color: MID_GRAY, italics: true })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Author:  ", bold: true, size: 20, font: "Arial", color: DARK }),
                   new TextRun({ text: "Saki Cansev", size: 20, font: "Arial", color: DARK })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Background:  ", bold: true, size: 20, font: "Arial", color: DARK }),
                   new TextRun({ text: "BSc Economics, Ankara University  |  MSc Data Analytics, University for the Creative Arts", size: 20, font: "Arial", color: DARK })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Date:  ", bold: true, size: 20, font: "Arial", color: DARK }),
                   new TextRun({ text: "April 2026", size: 20, font: "Arial", color: DARK })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 1 } },
        children: [new TextRun({ text: "GitHub:  ", bold: true, size: 20, font: "Arial", color: DARK }),
          new ExternalHyperlink({
            link: "https://github.com/sakicansev",
            children: [new TextRun({ text: "github.com/sakicansev", size: 20, font: "Arial", color: TEAL, underline: {} })]
          })]
      }),
      spacer(),

      h1("Foreword"),
      body("My academic background is in economics — I studied financial markets, econometrics, and monetary policy at Ankara University, " +
        "and completed an MSc in Data Analytics at the University for the Creative Arts, where my thesis examined machine learning applications in financial markets. " +
        "Throughout that work, I became increasingly interested in how decentralized payment systems are reshaping the financial infrastructure we studied in theory."),
      spacer(),
      body("This document series is my structured attempt to build a rigorous foundation in blockchain payment systems — " +
        "not as a developer, but as an economist and data analyst. My goal is to understand the mechanics deeply enough to analyze on-chain payment data meaningfully, " +
        "identify economic patterns in blockchain transaction flows, and contribute to the growing field of crypto analytics."),
      spacer(),
      body("Stage 1 covers the five conceptual pillars I identified as essential before touching any data. " +
        "Each section is written in my own words, informed by official documentation and primary sources. " +
        "I have deliberately avoided secondary summaries and YouTube explanations — the goal is depth, not speed."),
      spacer(),
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: "Saki Cansev", bold: true, size: 20, font: "Arial", color: NAVY, italics: true }),
          new TextRun({ text: "  —  Amersfoort, Netherlands, April 2026", size: 20, font: "Arial", color: MID_GRAY, italics: true }),
        ]
      }),
      spacer(),

      callout("Scope of This Document",
        "This document covers five core concepts that every blockchain payment analyst must understand before touching data: " +
        "the UTXO vs Account model, gas fees and the mempool, Layer 2 payment solutions, stablecoins as payment rails, and real-world payment protocols. " +
        "Each section references official primary sources. A self-assessment section at the end defines the criteria for progression to Stage 2."),

      spacer(),

      // ── SECTION 1 ──
      h1("1. UTXO vs Account Model"),

      body("Every blockchain payment system is built on one of two fundamental models for tracking who owns what. " +
        "Understanding the difference is essential — it affects how transactions are constructed, how fees are calculated, and how you query on-chain data."),

      spacer(),
      h3("The UTXO Model — Bitcoin"),
      body("UTXO stands for Unspent Transaction Output. As described in the original Bitcoin whitepaper, a wallet does not have a single balance — " +
        "instead it holds a collection of unspent outputs from previous transactions, like having a wallet full of banknotes of different values."),

      bullet("When you receive 0.5 BTC, that creates a UTXO of 0.5 BTC locked to your address (Nakamoto, 2008)"),
      bullet("When you spend it, that UTXO is consumed and new UTXOs are created as outputs"),
      bullet("Your wallet balance is simply the sum of all UTXOs you control"),
      bullet("There is no concept of an account — only inputs and outputs"),

      spacer(),
      callout("Analogy", "Think of UTXOs like physical cash. You cannot spend half a €50 note — you hand over the whole note and receive change back. Bitcoin works the same way."),
      spacer(),

      h3("The Account Model — Ethereum"),
      body("Ethereum uses a simpler account-based model, similar to a bank account. " +
        "Each address has a balance that is updated directly when transactions occur."),

      bullet("Your address has a single balance that increases and decreases"),
      bullet("Smart contracts also have accounts, enabling programmable payments"),
      bullet("Much simpler to reason about, but introduces replay attack risks (solved by nonces)"),
      bullet("Every account has a nonce — a counter that increments with each transaction to prevent replay attacks (Buterin, 2014)"),

      spacer(),
      comparisonTable("UTXO (Bitcoin)", "Account Model (Ethereum)", [
        ["Wallet = collection of unspent outputs", "Wallet = single balance per address"],
        ["More private — harder to trace history", "Easier to query and analyze"],
        ["Better for simple value transfer", "Better for programmable payments"],
        ["No concept of smart contracts", "Supports smart contracts natively"],
        ["Used by: Bitcoin, Litecoin, Cardano", "Used by: Ethereum, Solana, BNB Chain"],
      ]),
      spacer(),

      // ── NONCE & REPLAY ATTACK ──
      h3("A Closer Look: Replay Attacks and the Nonce"),
      body("While reading about the account model, I came across a term that needed unpacking: " +
        "‘introduces replay attack risks, solved by nonces.’ Here is what that actually means."),
      spacer(),
      body("A replay attack is straightforward once you see it. When you send a transaction on Ethereum — " +
        "say, send 1 ETH to someone — that instruction is broadcast to the network. " +
        "Without any protection, someone could intercept that exact transaction and submit it again. " +
        "The network would see a valid, signed instruction and process it a second time. " +
        "You would lose another 1 ETH without ever authorizing it."),
      spacer(),
      body("The nonce solves this cleanly. Nonce stands for number used once. " +
        "Every Ethereum account has a nonce that starts at zero and increments by one with every transaction. " +
        "Your first transaction carries nonce 0, your second carries nonce 1, and so on. " +
        "The network only accepts a transaction if the nonce matches what it expects next. " +
        "Once a transaction with nonce 5 is processed, any attempt to replay it is rejected immediately — " +
        "the network already expects nonce 6."),
      spacer(),
      body("Bitcoin does not need a nonce because the UTXO model solves the same problem structurally. " +
        "When you spend a UTXO it is destroyed. It literally no longer exists. " +
        "You cannot replay a transaction that consumed a UTXO because that UTXO is gone. " +
        "The account model needs the nonce precisely because balances persist — " +
        "without it, the same instruction could be replayed against the same balance indefinitely."),
      spacer(),

      // ── ECONOMIC IMPLICATIONS ──
      h3("Economic Implications of the UTXO Model: A Note on Market Perception"),
      body("While studying UTXO mechanics, I noticed something that raised an economic question worth examining carefully. " +
        "When you send 0.1 BTC but only hold a 0.5 BTC UTXO, the transaction does not look like this on-chain:"),
      spacer(),
      new Paragraph({
        spacing: { before: 40, after: 40 },
        indent: { left: 720 },
        children: [new TextRun({ text: "− 0.1 BTC", size: 20, font: "Courier New", color: "2C3E6B", bold: true })]
      }),
      body("It looks like this:"),
      spacer(),
      new Paragraph({
        spacing: { before: 40, after: 20 },
        indent: { left: 720 },
        children: [new TextRun({ text: "− 0.5 BTC  (UTXO consumed)", size: 20, font: "Courier New", color: "C0392B", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 20, after: 40 },
        indent: { left: 720 },
        children: [new TextRun({ text: "+ 0.4 BTC  (change returned)", size: 20, font: "Courier New", color: "27AE60", bold: true })]
      }),
      body("From a purely mechanical perspective, this looks like a 0.5 BTC sale followed by a 0.4 BTC purchase — " +
        "two separate on-chain movements. If someone were to measure raw transaction volume without understanding UTXO mechanics, " +
        "they would count 0.9 BTC of activity when the genuine economic transfer was only 0.1 BTC. " +
        "This raises a legitimate question: could this inflate perceived demand and affect price?"),
      spacer(),
      body("The direct answer is no — UTXO change outputs do not create new Bitcoin and do not represent new demand. " +
        "The total supply is unchanged. It is equivalent to breaking a €50 note into smaller denominations at a bank — " +
        "the total money in circulation has not changed, only its form."),
      spacer(),
      body("However, the underlying concern points to something economically real. " +
        "Raw on-chain transaction volume is a deeply misleading metric precisely because of this UTXO mechanics issue. " +
        "This is why serious blockchain analysts use a metric called adjusted transaction volume, " +
        "which strips out change outputs and self-transfers to measure only genuine economic transfers between different parties. " +
        "Chainalysis, Glassnode, and Coinmetrics all publish adjusted volume figures for exactly this reason (Chainalysis, 2025)."),
      spacer(),
      body("The manipulation concern I identified does exist in crypto markets — but it operates through different mechanisms. " +
        "Wash trading involves sending Bitcoin back and forth between wallets controlled by the same entity, " +
        "creating artificial transaction volume and the illusion of demand without any genuine economic activity. " +
        "This is a documented form of market manipulation, distinct from UTXO change outputs but related to the same " +
        "analytical problem: raw transaction data contains noise that must be filtered before drawing economic conclusions."),
      spacer(),
      callout("Analytical Implication",
        "When querying on-chain Bitcoin data — including on Dune Analytics in Stage 2 — always filter for genuine " +
        "economic transfers rather than raw transaction counts or volumes. " +
        "Change outputs, consolidation transactions, and self-transfers are internal plumbing, not economic signals. " +
        "Confusing the two leads to systematically wrong conclusions about market demand."),
      spacer(),

      // ── SECTION 2 ──
      h1("2. Gas Fees, Mempool & Transaction Finality"),

      body("These three concepts govern how transactions move through a blockchain network and when you can consider a payment truly settled."),

      spacer(),
      h3("Gas Fees"),

      body("To understand gas fees, I find it most useful to start from first principles — specifically, the foundational premise of economics: " +
        "resources are limited, but human wants are unlimited."),
      spacer(),
      body("Ethereum is a shared computational network. Thousands of users want to use it simultaneously — " +
        "sending payments, executing smart contracts, trading tokens. But the network can only process a limited number of " +
        "operations per second. This is a classic scarce resource allocation problem. " +
        "The question is: how do you decide who gets access to a limited resource when demand exceeds supply? " +
        "Ethereum's answer is the price mechanism — exactly as economic theory would predict (Ethereum Foundation, 2025)."),
      spacer(),

      h3("What Gas Actually Measures"),
      body("Gas is a unit that measures computational effort — like kilowatts measure electrical power. " +
        "Every operation on Ethereum has a fixed gas cost assigned to it:"),
      spacer(),
      bullet("A simple ETH transfer costs exactly", " 21,000 gas — always, regardless of the amount sent"),
      bullet("A complex smart contract interaction costs", " 100,000–500,000 gas depending on complexity"),
      bullet("Gas itself has no monetary value —", " it is only a unit of measurement"),
      bullet("The fee you pay =", " gas used × gas price (measured in gwei, a fraction of ETH)"),
      spacer(),
      body("A concrete example: a simple ETH transfer at a gas price of 20 gwei costs " +
        "21,000 × 20 gwei = 420,000 gwei = 0.00042 ETH. " +
        "At an ETH price of $3,000 that is approximately $1.26 in fees."),
      spacer(),

      h3("EIP-1559: A Dynamic Pricing Mechanism"),
      body("Before 2021, gas pricing was a simple auction: users bid whatever they wanted and validators picked the highest bidders. " +
        "This was economically inefficient — fees were unpredictable, volatile, and prone to manipulation."),
      spacer(),
      body("In 2021, Ethereum introduced EIP-1559, which replaced the simple auction with a dynamic pricing mechanism. " +
        "This is where the economics becomes genuinely interesting. The fee was split into two components:"),
      spacer(),
      bullet("Base fee", " — set automatically by the network protocol, burned (permanently destroyed)"),
      bullet("Priority tip", " — set by the user, paid to validators as an incentive for faster processing"),
      spacer(),
      body("The base fee is the key innovation. It adjusts automatically after every block using a simple rule:"),
      spacer(),
      bullet("If the previous block was more than 50% full", " → base fee increases by up to 12.5%"),
      bullet("If the previous block was less than 50% full", " → base fee decreases by up to 12.5%"),
      spacer(),
      body("This is automatic, protocol-level price discovery responding to real-time demand signals. " +
        "As an economist, this is recognizable immediately: it is the price mechanism solving the scarce resource allocation problem " +
        "without any central authority setting the price. The network itself determines the fair market price for block space " +
        "through supply and demand (Ethereum Foundation, 2025)."),
      spacer(),

      callout("Economic Interpretation",
        "The base fee burning mechanism has a secondary macroeconomic effect: it makes ETH deflationary during high-demand periods. " +
        "When network usage is high, more ETH is burned than is issued to validators, reducing the total supply. " +
        "This connects gas fee dynamics directly to ETH's monetary policy — a relationship that has significant implications " +
        "for price analysis and on-chain economic research."),
      spacer(),

      h3("What Gas Fees Tell an Analyst"),
      body("For a data analyst, gas fees are not just a cost — they are an economic signal. " +
        "A spike in gas fees tells you that demand for block space suddenly exceeded supply: " +
        "something significant was happening on the network. " +
        "During the May 2021 market crash, gas prices exceeded 1,000 gwei, making simple transfers cost $50 and " +
        "complex transactions cost $200–500. This level made small payments economically irrational — " +
        "precisely why Layer 2 solutions became essential infrastructure."),
      spacer(),
      bullet("Gas fee spikes", " signal high-urgency periods: market crashes, NFT launches, major protocol events"),
      bullet("Sustained high fees", " signal structural congestion — demand permanently exceeding mainnet capacity"),
      bullet("Very low fees", " signal low network utilization — useful for timing transactions cheaply"),
      bullet("Fee trends over time", " show the migration of activity from mainnet to Layer 2 networks"),

      spacer(),
      callout("Key Insight for Analysts",
        "Gas fees are a direct, real-time measure of demand for Ethereum block space. " +
        "When analyzing payment data, fee spikes are not noise — they are economically meaningful events. " +
        "The shift of transaction volume to Layer 2 networks, where fees are 10–50x lower, " +
        "is the most important structural trend in Ethereum payment infrastructure since 2022."),
      spacer(),

      h3("The Mempool"),
      body("Before a transaction is confirmed, it sits in the mempool — the memory pool of pending transactions. " +
        "Before explaining what can be learned from it, it is worth clarifying what a node actually is, " +
        "since the mempool cannot be understood without it."),
      spacer(),

      h3("What is a Node?"),
      body("A node is a computer running the blockchain software and participating in the network. " +
        "There is no central server behind Ethereum or Bitcoin — no company, no data centre, no authority running it. " +
        "Instead, thousands of individual computers around the world each run a full copy of the software " +
        "and maintain a complete record of all transactions. Each of these computers is a node."),
      spacer(),
      body("When you submit a transaction, it does not go to one central server. " +
        "It is broadcast to nearby nodes, which pass it to their neighbours, which pass it further — " +
        "propagating through the network like information spreading through a peer group — " +
        "until almost every node in the world has received it. " +
        "Each node independently validates the transaction before passing it on."),
      spacer(),
      bullet("Nodes store", " a complete copy of the blockchain history"),
      bullet("Nodes validate", " new transactions — checking signatures, balances, and nonces"),
      bullet("Nodes broadcast", " valid transactions to neighbouring nodes"),
      bullet("Nodes maintain", " their own mempool of transactions waiting for confirmation"),
      spacer(),
      body("Because there is no central authority, each node independently manages its own waiting room of " +
        "pending transactions. In practice, most nodes follow similar rules, " +
        "so mempools across the network look roughly similar — but they are never identical."),
      spacer(),

      h3("What the Mempool Tells an Analyst"),
      body("The mempool is observable in real time through tools such as mempool.space (Bitcoin), " +
        "Etherscan Gas Tracker (Ethereum), and professional APIs such as Blocknative. " +
        "Several analytically meaningful metrics can be extracted from mempool data:"),
      spacer(),
      comparisonTable("Metric", "What It Tells You", [
        ["Mempool size (MB)", "Total congestion — how backed up the network is"],
        ["Fee distribution", "What users are willing to pay — urgency signal"],
        ["Transaction count", "Volume of pending unconfirmed activity"],
        ["Time in mempool", "How long transactions are waiting"],
        ["Replacement transactions", "Users resubmitting with higher fees — extreme urgency signal"],
      ]),
      spacer(),
      body("A healthy network shows a mempool that clears regularly — transactions confirmed within a few blocks, " +
        "fees stable, no persistent backlogs. " +
        "An unhealthy network shows a mempool growing faster than it clears, " +
        "low-fee transactions stuck for hours, and fee volatility. " +
        "This is analytically analogous to how economists use queue length and waiting times " +
        "to measure capacity utilization in production systems. " +
        "The mempool is a real-time capacity utilization indicator for the blockchain."),
      spacer(),

      h3("An Original Analytical Extension: Geographic Propagation and the Origin of Urgency"),
      body("While studying mempool mechanics, I identified a further analytical possibility that I believe deserves formal consideration. " +
        "If every node maintains its own mempool, and nodes are geographically distributed around the world, " +
        "then the order in which different nodes first receive a transaction carries information about where that transaction originated."),
      spacer(),
      body("A transaction submitted from a wallet in New York will reach nearby US nodes first, " +
        "propagate to European nodes a few hundred milliseconds later, " +
        "and reach Asian nodes after that. " +
        "The timestamp differences between when different nodes first observe a transaction are measurable. " +
        "When a sudden surge of high-fee transactions first appears in US-connected nodes before spreading globally, " +
        "that pattern suggests the urgency originated from US-based actors — reacting to US market events, " +
        "US-based news, or US-domiciled institutions executing large trades."),
      spacer(),
      body("This is not purely theoretical. Academic research on market microstructure in traditional finance has long studied " +
        "which exchanges or geographic regions lead price discovery — meaning their trades move prices first " +
        "before other markets follow (O’Hara, 1995). " +
        "The equivalent question in blockchain analytics is: which nodes, regions, or actors " +
        "initiate on-chain activity that then propagates globally? " +
        "This field is sometimes referred to as transaction propagation analysis or mempool forensics."),
      spacer(),

      callout("Important Caveats",
        "Geographic attribution from mempool analysis is imperfect for four reasons. " +
        "First, many users route transactions through VPNs or Tor, obscuring true origin. " +
        "Second, validators run nodes in multiple locations to capture transactions early, " +
        "so the first node may reflect infrastructure rather than user geography. " +
        "Third, network topology is not purely geographic — nodes connect based on configuration, not proximity. " +
        "Fourth, sophisticated actors use private mempools such as Flashbots, bypassing public mempool analysis entirely. " +
        "These limitations do not invalidate the methodology — they define its boundaries."),
      spacer(),

      body("Despite these caveats, the core analytical framework is sound. " +
        "Blockchain intelligence firms including Chainalysis and Elliptic combine mempool propagation timestamps, " +
        "node geolocation data, exchange volume by region, and news event timing " +
        "to build attribution models for on-chain activity. " +
        "This connects mempool analysis to the broader economic concept of " +
        "information asymmetry — the study of which actors possess and act on information first, " +
        "before that information becomes publicly priced into the market."),
      spacer(),

      bullet("Mempool propagation analysis", " can suggest geographic origin of urgency events"),
      bullet("Fee surge timing by node region", " correlates with regional market events and news cycles"),
      bullet("Private mempools (Flashbots)", " represent a blind spot — sophisticated actors bypass public mempool entirely"),
      bullet("Combined with exchange data", " mempool signals build a picture of information asymmetry in crypto markets"),

      spacer(),
      callout("Key Insight for Analysts",
        "The mempool is not just a queue — it is a real-time signal of market psychology. " +
        "Fee urgency, transaction replacement rates, and propagation patterns all carry economic information " +
        "that precedes confirmed on-chain activity. " +
        "An analyst who understands the mempool can observe market stress forming before it appears in price data."),
      spacer(),

      h3("From Theory to Practice: How Analysts Work With Mempool Data"),
      body("The analytical concepts discussed above — fee urgency, geographic propagation, network health — " +
        "raise an immediate practical question: how does an analyst actually obtain and work with this data? " +
        "The mempool is not a static database. It is a continuous, high-velocity stream of live information. " +
        "At any given moment it contains tens of thousands of pending transactions, " +
        "each with timestamps, fee levels, sizes, and addresses — all changing every few seconds. " +
        "This is a genuine Big Data problem in the sense defined by Laney (2001): " +
        "high volume, high velocity, and high variety simultaneously."),
      spacer(),

      h3("The Four Methods of Data Acquisition"),
      body("There are four practical methods by which analysts access mempool and on-chain data, " +
        "each representing a different trade-off between data freshness, granularity, cost, and technical complexity."),
      spacer(),

      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: "Method 1: Run Your Own Node", bold: true, size: 20, font: "Arial", color: NAVY })]
      }),
      body("The most direct method. Installing the blockchain software on a server — " +
        "Bitcoin Core for Bitcoin, or Geth/Nethermind for Ethereum — " +
        "causes your machine to join the network, sync the full transaction history, " +
        "and begin receiving every transaction broadcast to the network in real time. " +
        "Your node maintains its own mempool, queryable via local API calls. " +
        "This is what institutional blockchain intelligence firms do. " +
        "Running nodes in multiple geographic locations is precisely what enables geographic propagation analysis — " +
        "each node records the timestamp at which it first observed a given transaction, " +
        "and comparing those timestamps across regions reveals propagation direction."),
      spacer(),
      body("The practical cost is significant: syncing takes several days, " +
        "full storage requires 1–2 terabytes, and the server must run continuously. " +
        "For individual analysts, this is rarely the starting point."),
      spacer(),

      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: "Method 2: Node Provider APIs", bold: true, size: 20, font: "Arial", color: NAVY })]
      }),
      body("Node providers run infrastructure on your behalf and expose blockchain data through APIs. " +
        "Infura and Alchemy are the most widely used for Ethereum. " +
        "You send a structured API request and receive transaction data in JSON format — " +
        "the same data as running your own node, without the infrastructure overhead. " +
        "Most professional analysts begin here. The free tiers are sufficient for research-scale queries."),
      spacer(),

      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: "Method 3: Indexed Blockchain Data Platforms", bold: true, size: 20, font: "Arial", color: NAVY })]
      }),
      body("Raw node data is difficult to query analytically — it is an unstructured stream, not a relational database. " +
        "Indexing platforms ingest raw blockchain data, process it, and store it in queryable form. " +
        "Dune Analytics is the most relevant platform for this learning program: " +
        "it provides a SQL interface to indexed data from Ethereum, Arbitrum, Optimism, Base, and other chains. " +
        "Flipside Crypto and Nansen offer similar capabilities. " +
        "Glassnode specializes in aggregated on-chain metrics for Bitcoin and Ethereum with professional dashboards. " +
        "These platforms handle the data engineering layer — the analyst writes SQL and interprets results."),
      spacer(),

      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [new TextRun({ text: "Method 4: Specialized Mempool Data Providers", bold: true, size: 20, font: "Arial", color: NAVY })]
      }),
      body("For real-time mempool analysis specifically — not just confirmed transactions — " +
        "dedicated providers capture and stream pending transaction data before it is confirmed. " +
        "Blocknative offers a real-time mempool API used by institutions. " +
        "mempool.space provides a free Bitcoin mempool explorer with downloadable historical data. " +
        "Etherscan exposes Ethereum pending transaction data via its public API. " +
        "These tools are the entry point for the geographic propagation analysis described in the previous section."),
      spacer(),

      callout("On Web Scraping",
        "Web scraping — writing code to extract data from websites without an official API — " +
        "is generally not necessary in blockchain analytics because the data is publicly available through APIs. " +
        "The blockchain is inherently open. However, scraping becomes relevant in specific edge cases: " +
        "collecting gas fee history from explorers without full API coverage, " +
        "gathering data from smaller chains not yet indexed on major platforms, " +
        "or correlating on-chain events with off-chain data such as news headlines or exchange announcements. " +
        "Python libraries such as BeautifulSoup and Scrapy handle scraping when needed."),
      spacer(),

      h3("A Practical Pipeline for Geographic Mempool Analysis"),
      body("Combining the methods above, the following pipeline describes how geographic propagation analysis " +
        "would be implemented in practice by an analyst:"),
      spacer(),

      bullet("Step 1 — Data ingestion", ": Connect to the Blocknative streaming API. Receive each transaction as it enters the mempool. Record: transaction hash, fee level, timestamp, first-seen node, and node IP address."),
      bullet("Step 2 — Geolocation", ": Run IP geolocation on each node IP address using a database such as MaxMind GeoIP. Map each node to approximate country and region."),
      bullet("Step 3 — Time-series storage", ": Store records in a time-series structure. Every 60 seconds, calculate average fee by region. Flag sudden spikes: fee increase exceeding 20% within 60 seconds."),
      bullet("Step 4 — Propagation detection", ": Identify which region showed the spike first and measure how many milliseconds elapsed before other regions followed."),
      bullet("Step 5 — External correlation", ": Cross-reference with US market open and close times, breaking financial news via a news API, and exchange volume data to identify which exchange saw volume spike first."),
      spacer(),

      body("This pipeline combines streaming data engineering, geolocation, statistical anomaly detection, " +
        "and economic interpretation. " +
        "The Python libraries already used in this learning program — Pandas and Matplotlib — " +
        "handle the analysis and visualization components. " +
        "The new technical layer is streaming data ingestion, which is covered in Stage 3 of this program."),
      spacer(),

      callout("Connection to Academic Literature",
        "What this pipeline implements is high-frequency market microstructure analysis applied to blockchain data. " +
        "In traditional finance, researchers use order book timestamps and trade data to study " +
        "how information propagates through markets and which actors trade on information first (O’Hara, 1995). " +
        "The equivalent methodology applied to blockchain mempool data is genuinely frontier research. " +
        "Most serious work in this area is currently conducted inside private firms such as Chainalysis and Elliptic " +
        "rather than in published academic literature — which means the field is open for original contribution."),
      spacer(),

      h3("Transaction Finality"),
      body("Finality means the point at which a transaction is irreversible. This differs significantly between blockchains."),

      comparisonTable("Blockchain", "Finality", [
        ["Bitcoin", "~60 minutes (6 block confirmations)"],
        ["Ethereum (PoS)", "~13 minutes (2 epochs)"],
        ["Arbitrum (L2)", "~1 second (soft), ~7 days (hard/L1)"],
        ["Solana", "~400 milliseconds"],
        ["Lightning Network", "Instant (off-chain)"],
      ]),
      spacer(),

      // ── SECTION 3 ──
      h1("3. Layer 2 Payments"),

      h3("What is a Layer?"),
      body("In technology, a layer is a level of abstraction built on top of another level. " +
        "Each layer uses the one below it as infrastructure without needing to modify it. " +
        "You already use layers every day without thinking about it: when you send an email, " +
        "you use the internet, which runs on physical cables and radio signals. " +
        "You do not need to understand the cables to send the email. " +
        "The email layer sits on top of the internet layer, using it as a foundation."),
      spacer(),
      body("Blockchain uses the same architectural principle:"),
      spacer(),
      bullet("Layer 0", " — the physical internet: cables, routers, and hardware"),
      bullet("Layer 1", " — the base blockchain itself: Bitcoin, Ethereum. The ultimate source of truth."),
      bullet("Layer 2", " — systems built on top of Layer 1 that inherit its security while adding speed and lower cost"),
      spacer(),

      h3("What is Layer 1 and Why is it Slow?"),
      body("Layer 1 is the base blockchain — the original, foundational network. " +
        "It has three defining properties: it is decentralized (thousands of independent nodes worldwide), " +
        "it is secure (attacking it requires controlling the majority of the network), " +
        "and it is the final settlement layer — all transactions ultimately derive their validity from it."),
      spacer(),
      body("The problem is that these properties come at a cost. " +
        "For a Layer 1 blockchain to be truly decentralized and secure, " +
        "every node in the network must independently verify every transaction. " +
        "With thousands of nodes around the world all needing to agree, " +
        "you cannot process millions of transactions per second."),
      spacer(),
      body("To put this in perspective, consider Visa — the traditional global payment network " +
        "operated by Visa Inc., which processes credit and debit card transactions for hundreds of millions of users worldwide. " +
        "Visa processes approximately 24,000 transactions per second. " +
        "Ethereum mainnet processes approximately 15 to 30 transactions per second. " +
        "That is a difference of roughly 1,000 times in throughput capacity. " +
        "That gap is the scalability problem — and it is not a bug. " +
        "It is the direct consequence of maximizing decentralization and security at Layer 1."),
      spacer(),

      h3("The Blockchain Trilemma"),
      body("The blockchain trilemma is a concept articulated by Vitalik Buterin (2014), stating that a blockchain system " +
        "can achieve at most two of the following three properties simultaneously, never all three:"),
      spacer(),
      comparisonTable("Property", "What It Means", [
        ["Decentralization", "No single entity controls the network. Thousands of independent nodes must agree."],
        ["Security", "The network resists attacks. Forging transactions or rewriting history is infeasible."],
        ["Scalability", "The network processes many transactions quickly and cheaply."],
      ]),
      spacer(),
      body("The trilemma forces a choice:"),
      spacer(),
      bullet("Decentralized + Secure (not scalable)", " → Bitcoin, Ethereum mainnet. Slow and expensive but maximally trustless."),
      bullet("Secure + Scalable (not decentralized)", " → A traditional bank database. Fast and secure but one company controls it."),
      bullet("Decentralized + Scalable (not secure)", " → Theoretically possible but practically dangerous — vulnerable to attack."),
      spacer(),
      body("Ethereum made a deliberate architectural choice: maximize decentralization and security at Layer 1, " +
        "and solve scalability at Layer 2. " +
        "Layer 2 exists not because Ethereum failed — but because it succeeded at exactly what it was designed to do."),
      spacer(),

      h3("How Layer 2 Works Around the Trilemma"),
      body("The key insight behind Layer 2 is that not every transaction needs to be verified by thousands of nodes worldwide. " +
        "Most transactions just need to eventually settle correctly. " +
        "Layer 2 systems process thousands of transactions among themselves cheaply and quickly, " +
        "then periodically submit a compressed summary to Layer 1 for final verification."),
      spacer(),
      body("A useful analogy from everyday economics: think of a bar tab. " +
        "Instead of every drink being a separate bank transaction, " +
        "you run a tab all evening and settle once at the end. " +
        "The bar and you both agree on the final amount, and only that one settlement goes through the payment system. " +
        "Layer 2 runs the tab. Layer 1 settles it."),
      spacer(),
      bullet("Layer 2 inherits", " Layer 1's security and decentralization"),
      bullet("Layer 2 adds", " transaction speed and dramatically lower fees"),
      bullet("The trilemma is not violated —", " it is worked around by splitting responsibilities across layers"),
      bullet("Final settlement", " always returns to Layer 1 — the ultimate source of truth"),
      spacer(),

      callout("Why This Matters for Payment Analysis",
        "The majority of real crypto payment activity has migrated to Layer 2 networks. " +
        "If you only analyze Ethereum mainnet data, you are looking at a fraction of actual transaction volume. " +
        "On Dune Analytics, Bitcoin, Ethereum mainnet, Arbitrum, Optimism, and Base must be queried separately. " +
        "Understanding layers is not optional for a payment analyst — it defines which datasets you need."),
      spacer(),

      h3("Lightning Network — Bitcoin L2"),
      body("The Lightning Network is not a company and does not issue its own currency. " +
        "It is an open protocol — a set of rules anyone can implement — " +
        "originally proposed by Poon and Dryja (2016) and built by open-source contributors. " +
        "You use it with the same Bitcoin you already own, just through a faster routing layer."),
      spacer(),
      body("The Lightning Network enables instant, near-free Bitcoin payments by opening payment channels between parties."),

      bullet("Two parties lock Bitcoin in a multi-signature channel on-chain"),
      bullet("They can transact unlimited times off-chain, instantly and for near-zero fees"),
      bullet("Only the opening and closing of the channel are recorded on the Bitcoin blockchain"),
      bullet("Payments can be routed through multiple channels to reach any node in the network"),
      bullet("Best for: micropayments, high-frequency transfers, point-of-sale payments"),

      spacer(),
      h3("Arbitrum — Ethereum L2 (Optimistic Rollup)"),
      body("Arbitrum is an open-source protocol built by a company called Offchain Labs, " +
        "but the protocol itself is not a product being sold. " +
        "You do not buy a separate Arbitrum coin — you use the same ETH you hold on Ethereum mainnet, " +
        "bridged across to a faster and cheaper environment that periodically settles back to Ethereum."),
      spacer(),
      body("Arbitrum bundles thousands of Ethereum transactions into a single batch and posts a compressed summary to Ethereum mainnet."),

      bullet("Transactions are assumed valid (optimistic) unless challenged within 7 days"),
      bullet("Gas fees are 10–50x cheaper than Ethereum mainnet"),
      bullet("Fully compatible with existing Ethereum smart contracts and wallets"),
      bullet("The 7-day withdrawal period to L1 is the main trade-off"),
      bullet("Consistently among the largest L2s by total value locked (TVL) — verifiable in real time at defillama.com"),

      spacer(),
      h3("Optimism — Ethereum L2 (Optimistic Rollup)"),
      body("Optimism is an open-source protocol maintained by the Optimism Foundation, a non-profit organization. " +
        "Like Arbitrum, it uses ETH — not a separate payment coin. " +
        "It does have a governance token called OP, but this is used for voting on protocol decisions, " +
        "not as a payment currency."),
      spacer(),
      body("Optimism works similarly to Arbitrum using the optimistic rollup model, but with a focus on simplicity and EVM equivalence."),

      bullet("Powers the Superchain — a network of connected L2s (Base, Mode, Zora)"),
      bullet("Base (by Coinbase) is built on Optimism — rapidly growing for payments"),
      bullet("OP Stack is open source — any team can launch their own L2"),

      spacer(),
      callout("Why L2 Matters for Payment Analysis",
        "The majority of crypto payment volume is now happening on L2s, not Ethereum mainnet. " +
        "If you analyze only mainnet data, you are missing most of the picture. " +
        "On Dune Analytics, you will need to query Arbitrum, Optimism, and Base separately."),
      spacer(),

      // ── SECTION 4 ──
      h1("4. Stablecoins as Payment Rails"),

      body("Stablecoins are cryptocurrencies pegged to a stable asset (usually USD). " +
        "They are the dominant medium for crypto payments because they eliminate price volatility — " +
        "the biggest practical barrier to using crypto for everyday transactions."),

      spacer(),
      h3("USDC — USD Coin"),
      bullet("Issued by Circle, regulated, fully backed by cash and US Treasuries"),
      bullet("Available on 15+ blockchains — the most widely used stablecoin for payments"),
      bullet("Preferred by institutions and payment platforms due to regulatory compliance"),
      bullet("One of the highest transaction volumes among stablecoins — Circle publishes monthly transaction reports at circle.com"),

      spacer(),
      h3("USDT — Tether"),
      bullet("Oldest stablecoin and historically the largest by market cap — current figures available at coinmarketcap.com"),
      bullet("Dominant on Tron network for cross-border payments in emerging markets"),
      bullet("More controversial reserve backing — periodically audited"),
      bullet("Preferred in Asia and for exchange-to-exchange transfers"),

      spacer(),
      h3("DAI — Decentralized Stablecoin"),
      bullet("Issued by MakerDAO — not backed by a company but by crypto collateral"),
      bullet("Maintains USD peg algorithmically through over-collateralization"),
      bullet("Fully decentralized — no company can freeze or seize your DAI"),
      bullet("Used heavily in DeFi protocols and Web3 payment applications"),

      spacer(),
      comparisonTable("Stablecoin", "Key Characteristic", [
        ["USDC", "Regulated, institutional grade, multi-chain"],
        ["USDT", "Largest volume, dominant in Asia/Tron"],
        ["DAI", "Decentralized, DeFi native, crypto-backed"],
        ["PYUSD (PayPal)", "Consumer payments, Ethereum + Solana"],
        ["EURC", "Euro-pegged USDC equivalent, growing in Europe"],
      ]),

      spacer(),
      callout("Relevant for the Netherlands",
        "EURC (Euro Coin) is Circle's Euro-pegged stablecoin and is gaining traction in European payment applications. " +
        "As a Netherlands-based analyst, understanding Euro stablecoins alongside USD stablecoins is a genuine differentiator."),
      spacer(),

      // ── SECTION 5 ──
      h1("5. Real-World Payment Protocols"),

      body("Beyond stablecoins, several protocols are building the infrastructure layer for blockchain payments. " +
        "These are the companies and projects you will encounter when analyzing real payment flows."),

      spacer(),
      h3("Request Network"),
      body("An open protocol for payment requests built on Ethereum. Think of it as a decentralized invoice system."),
      bullet("Allows anyone to create a payment request that can be paid in any currency"),
      bullet("Used by businesses for crypto invoicing, payroll, and accounts payable"),
      bullet("Founded in France with documented European adoption — see requestnetwork.com for current usage data"),
      bullet("Relevant to you: their data is queryable on Dune Analytics"),

      spacer(),
      h3("Gnosis Pay"),
      body("A Visa debit card connected directly to a self-custodial crypto wallet — bridging crypto payments with traditional card infrastructure."),
      bullet("Spend USDC and EURe (Euro stablecoin) anywhere Visa is accepted"),
      bullet("Transactions settle on Gnosis Chain (an Ethereum sidechain)"),
      bullet("First major example of a self-custodial crypto payment card"),

      spacer(),
      h3("Flexa"),
      body("A payments network enabling crypto payments at physical retail locations in the US and Canada."),
      bullet("Partners with major retailers across North America — acceptance figures subject to change, see flexa.network"),
      bullet("Uses AMP token as collateral to guarantee instant settlement"),
      bullet("Merchants receive local currency — crypto complexity is invisible to them"),

      spacer(),

      // ── OFFICIAL RESOURCES ──
      h1("Official Documentation — Your Reading List"),

      body("For each concept in this document, read the official source. Do not rely on secondary articles or YouTube videos for technical understanding. " +
        "These sources are authoritative, free, and regularly updated."),

      spacer(),
      h3("Ethereum Payments & Architecture"),
      link("Ethereum payments overview", "https://ethereum.org/en/payments"),
      link("How Ethereum transactions work", "https://ethereum.org/en/developers/docs/transactions"),
      link("Gas and fees explained", "https://ethereum.org/en/developers/docs/gas"),
      link("Layer 2 scaling overview", "https://ethereum.org/en/layer-2"),

      spacer(),
      h3("Bitcoin & UTXO Model"),
      link("Bitcoin developer guide — transactions", "https://developer.bitcoin.org/devguide/transactions.html"),
      link("UTXO model explained", "https://developer.bitcoin.org/devguide/transactions.html#transaction-outputs-and-utxos"),
      link("Lightning Network whitepaper", "https://lightning.network/lightning-network-paper.pdf"),

      spacer(),
      h3("DeFi & Stablecoins"),
      link("Uniswap documentation", "https://docs.uniswap.org"),
      link("Circle USDC documentation", "https://developers.circle.com/stablecoins/docs/what-is-usdc"),
      link("MakerDAO & DAI documentation", "https://docs.makerdao.com"),

      spacer(),
      h3("Layer 2 Networks"),
      link("Arbitrum documentation", "https://docs.arbitrum.io"),
      link("Optimism documentation", "https://docs.optimism.io"),
      link("Base documentation", "https://docs.base.org"),

      spacer(),

      // ── SELF CHECK ──
      h1("Self-Check — Can You Answer These?"),

      body("Before moving to Stage 2 (Dune Analytics), make sure you can answer all of these questions in your own words without looking at notes."),

      spacer(),
      bullet("What is a UTXO and how does it differ from an Ethereum account balance?"),
      bullet("If you send a Bitcoin transaction with a low fee during network congestion, what happens?"),
      bullet("What is the mempool and why does it matter for payment analysis?"),
      bullet("Why did Layer 2 solutions emerge and what problem do they solve?"),
      bullet("What is the 7-day withdrawal period in optimistic rollups and why does it exist?"),
      bullet("What is the difference between USDC and DAI as payment instruments?"),
      bullet("Why would a business in the Netherlands prefer EURC over USDC for payments?"),
      bullet("What does gas price tell you about network congestion?"),

      spacer(),
      callout("Next Step — Stage 2",
        "Once you can answer all questions above confidently, you are ready for Stage 2: On-Chain Data Analysis with Dune Analytics. " +
        "Go to dune.com, create a free account, and come back to start your first SQL query on real Ethereum payment data."),

      spacer(),
      // ── PAGE BREAK + REFERENCES ──
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "", break: 1 }), new PageBreak()]
      }),
      h1("References"),

      body("All sources cited in this document are primary sources — original whitepapers, official developer documentation, " +
        "and peer-reviewed academic research. Secondary summaries and general articles have been deliberately excluded in favour of authoritative primary references."),
      spacer(),

      // Bitcoin
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Nakamoto, S. (2008). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Bitcoin: A peer-to-peer electronic cash system. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://bitcoin.org/bitcoin.pdf",
            children: [new TextRun({ text: "https://bitcoin.org/bitcoin.pdf", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Ethereum whitepaper
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Buterin, V. (2014). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Ethereum: A next-generation smart contract and decentralized application platform. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Ethereum Foundation. Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://ethereum.org/content/whitepaper/whitepaper-pdf/Ethereum_Whitepaper_-_Buterin_2014.pdf",
            children: [new TextRun({ text: "ethereum.org/whitepaper", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Ethereum developer docs
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Ethereum Foundation. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Ethereum developer documentation: Transactions, gas, and Layer 2. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://ethereum.org/en/developers/docs",
            children: [new TextRun({ text: "https://ethereum.org/en/developers/docs", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Bitcoin developer guide
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Bitcoin Developer Community. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Bitcoin developer guide: Transactions and UTXO model. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://developer.bitcoin.org/devguide/transactions.html",
            children: [new TextRun({ text: "https://developer.bitcoin.org/devguide/transactions.html", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Chainalysis wash trading
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Chainalysis. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Crypto market manipulation 2025: Suspected wash trading and pump-and-dump schemes. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Chainalysis Research. Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://www.chainalysis.com/blog/crypto-market-manipulation-wash-trading-pump-and-dump-2025/",
            children: [new TextRun({ text: "chainalysis.com/blog/crypto-market-manipulation", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Cong et al wash trading peer-reviewed
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Cong, L. W., Li, X., Tang, K., & Yang, Y. (2023). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Crypto wash trading. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "National Bureau of Economic Research Working Paper No. 30783. Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://www.nber.org/papers/w30783",
            children: [new TextRun({ text: "https://www.nber.org/papers/w30783", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Arbitrum docs
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Offchain Labs. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Arbitrum documentation: A gentle introduction. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://docs.arbitrum.io",
            children: [new TextRun({ text: "https://docs.arbitrum.io", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Circle USDC
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Circle Internet Financial. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "USDC: A fully reserved stablecoin. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Circle Developer Documentation. Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://developers.circle.com/stablecoins/docs/what-is-usdc",
            children: [new TextRun({ text: "developers.circle.com/stablecoins", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // MakerDAO
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "MakerDAO. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "The Maker Protocol: MakerDAO's multi-collateral DAI system. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://docs.makerdao.com",
            children: [new TextRun({ text: "https://docs.makerdao.com", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // OHara market microstructure
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "O’Hara, M. (1995). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Market microstructure theory. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Blackwell Publishers. " +
            "(Referenced in relation to geographic price discovery and information asymmetry in financial markets — " +
            "framework applied analogically to blockchain transaction propagation analysis.)",
            size: 18, font: "Arial", color: DARK })
        ]
      }),

      // Blocknative mempool
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Blocknative. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Mempool explorer and transaction propagation data. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://www.blocknative.com",
            children: [new TextRun({ text: "https://www.blocknative.com", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Laney Big Data
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Laney, D. (2001). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "3D data management: Controlling data volume, velocity and variety. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "META Group Research Note, 6(70), 1. " +
            "(Original publication defining the three V's of Big Data — volume, velocity, variety — " +
            "applied in this document to characterise mempool data streams.)",
            size: 18, font: "Arial", color: DARK })
        ]
      }),

      // MaxMind GeoIP
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "MaxMind. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "GeoIP2 database: IP geolocation and network data. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://www.maxmind.com/en/geoip2-databases",
            children: [new TextRun({ text: "https://www.maxmind.com/en/geoip2-databases", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Poon & Dryja Lightning Network
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Poon, J., & Dryja, T. (2016). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "The Bitcoin Lightning Network: Scalable off-chain instant payments. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://lightning.network/lightning-network-paper.pdf",
            children: [new TextRun({ text: "lightning.network/lightning-network-paper.pdf", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      // Infura
      new Paragraph({
        spacing: { before: 80, after: 40 },
        indent: { left: 0, hanging: 720 },
        children: [
          new TextRun({ text: "Infura. (2025). ", bold: true, size: 18, font: "Arial", color: DARK }),
          new TextRun({ text: "Ethereum node API documentation. ", size: 18, font: "Arial", color: DARK, italics: true }),
          new TextRun({ text: "Available at: ", size: 18, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://docs.infura.io",
            children: [new TextRun({ text: "https://docs.infura.io", size: 18, font: "Arial", color: TEAL, underline: {} })] })
        ]
      }),

      spacer(),
      new Paragraph({
        spacing: { before: 200, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        children: [new TextRun({ text: "Blockchain Payments — Stage 1 Study Guide  |  Saki Cansev  |  April 2026  |  github.com/sakicansev", size: 16, font: "Arial", color: MID_GRAY, italics: true })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/Blockchain_Payments_Stage1.docx", buffer);
  console.log("Done!");
});
