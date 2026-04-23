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
const GREEN = "1A6B3A";
const LIGHT_GREEN = "E8F5EE";

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
  const fillColor = color === "green" ? LIGHT_GREEN : LIGHT_BLUE;
  const borderColor = color === "green" ? GREEN : TEAL;
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

function comparisonTable(header1, header2, rows) {
  const headerRow = new TableRow({
    children: [
      new TableCell({ borders: thinBorders, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 150, right: 150 }, width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: header1, bold: true, size: 20, font: "Arial", color: WHITE })] })] }),
      new TableCell({ borders: thinBorders, shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 150, right: 150 }, width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: header2, bold: true, size: 20, font: "Arial", color: WHITE })] })] }),
    ]
  });
  const dataRows = rows.map((row, i) => new TableRow({
    children: [
      new TableCell({ borders: thinBorders, shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: row[0], size: 18, font: "Arial", color: DARK })] })] }),
      new TableCell({ borders: thinBorders, shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 150, right: 150 }, width: { size: 4513, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 18, font: "Arial", color: DARK })] })] }),
    ]
  }));
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [4513, 4513], rows: [headerRow, ...dataRows] });
}

function link(text, url) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: "\u2192  ", size: 20, font: "Arial", color: TEAL, bold: true }),
      new ExternalHyperlink({ link: url, children: [new TextRun({ text, size: 20, font: "Arial", color: TEAL, underline: {} })] })
    ]
  });
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

      // ── TITLE ──
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "BLOCKCHAIN PAYMENTS", bold: true, size: 52, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 80 })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "On-Chain Data Analysis with Dune Analytics — Stage 2 of 4", size: 24, font: "Arial", color: TEAL, italics: true })]
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
        children: [new TextRun({ text: "Prerequisite:  ", bold: true, size: 20, font: "Arial", color: DARK }),
                   new TextRun({ text: "Stage 1 — Conceptual Foundation (completed April 2026)", size: 20, font: "Arial", color: DARK })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 1 } },
        children: [new TextRun({ text: "GitHub:  ", bold: true, size: 20, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://github.com/sakicansev",
            children: [new TextRun({ text: "github.com/sakicansev", size: 20, font: "Arial", color: TEAL, underline: {} })] })]
      }),
      spacer(),

      // ── FOREWORD ──
      h1("Foreword"),
      body("Stage 1 of this program established the conceptual foundation: how blockchain payment systems work at a mechanical level, " +
        "what UTXO and account models are, how gas fees function as a dynamic pricing mechanism for scarce block space, " +
        "how the mempool carries real-time economic signals, and why Layer 2 solutions emerged to solve the blockchain trilemma. " +
        "The questions I developed while reading — on replay attacks, market manipulation through UTXO mechanics, " +
        "geographic propagation of mempool urgency, and the practical data acquisition pipeline — " +
        "convinced me that the most valuable next step is not more theory but contact with real data."),
      spacer(),
      body("Stage 2 is therefore entirely practical. The goal is to write SQL queries against real on-chain data " +
        "using Dune Analytics — the industry-standard platform for blockchain data analysis. " +
        "By the end of this stage I will have built and published at least one original Dune dashboard " +
        "analyzing real payment flows on Ethereum and its Layer 2 networks, " +
        "and I will understand the structure of on-chain data well enough to formulate my own research questions."),
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
        "This document covers five topics: what Dune Analytics is and how it works, " +
        "the structure of on-chain data and how it differs from traditional databases, " +
        "the SQL dialect used on Dune and its key differences from standard SQL, " +
        "a progression of ten query exercises from basic to analytical, " +
        "and a framework for building and publishing an original dashboard. " +
        "All queries in this document are written to run against real Ethereum and Layer 2 data."),
      spacer(),

      // ── SECTION 1 ──
      h1("1. What is Dune Analytics?"),

      body("Dune Analytics is a web-based platform that allows anyone to write SQL queries against indexed blockchain data " +
        "and publish the results as interactive dashboards (Dune Analytics, 2025). " +
        "It was founded in 2018 and has become the standard tool for on-chain data analysis in the crypto industry. " +
        "Researchers, protocol teams, investors, and journalists all use it to understand what is actually happening on blockchains."),
      spacer(),
      body("The core insight behind Dune is that all blockchain transaction data is public — " +
        "every transaction, every address, every fee, every timestamp is visible to anyone. " +
        "But raw blockchain data is not organized for analysis. " +
        "Dune ingests raw data from multiple blockchains, processes it into relational tables, " +
        "and exposes those tables through a SQL interface. " +
        "The analyst writes a query, Dune runs it against the indexed data, and returns results in seconds."),
      spacer(),

      h3("What Blockchains Does Dune Cover?"),
      comparisonTable("Blockchain", "Type", [
        ["Ethereum", "Layer 1 — primary chain"],
        ["Arbitrum", "Layer 2 — Optimistic Rollup"],
        ["Optimism", "Layer 2 — Optimistic Rollup"],
        ["Base", "Layer 2 — built on Optimism Stack"],
        ["Polygon", "Layer 2 / Sidechain"],
        ["BNB Chain", "Layer 1 — Binance ecosystem"],
        ["Bitcoin", "Layer 1 — limited data available"],
        ["Solana", "Layer 1 — high-speed chain"],
      ]),
      spacer(),
      body("For payment analysis, the most relevant chains are Ethereum, Arbitrum, Optimism, and Base. " +
        "As established in Stage 1, the majority of real crypto payment volume has migrated to Layer 2 networks. " +
        "Querying only Ethereum mainnet would miss most of the picture."),
      spacer(),

      h3("The Free Tier"),
      body("Dune offers a generous free tier that is sufficient for all research and portfolio work in this program. " +
        "A free account allows unlimited public queries, dashboard creation, and access to all indexed blockchain data. " +
        "The only limitation is query execution speed and a cap on private queries — neither of which affects learning or portfolio projects."),
      spacer(),

      callout("Setup Required Before Continuing",
        "Before proceeding with this document, complete the following: " +
        "(1) Create a free account at dune.com using your real name or close to it — this account will be linked from your portfolio. " +
        "(2) Explore the interface: understand where to write queries, how to run them, and how to save them. " +
        "(3) Open the Dune documentation at dune.com/docs and read the Getting Started section. " +
        "The queries in this document assume you have a working Dune account."),
      spacer(),

      // ── SECTION 2 ──
      h1("2. The Structure of On-Chain Data"),

      body("On-chain data is fundamentally different from the datasets used in the previous portfolio projects in this program. " +
        "The telecom churn dataset, the California housing dataset, and the advertising dataset were all " +
        "structured, cleaned, and pre-organized for analysis. " +
        "On-chain data is raw event log data generated by a decentralized system — " +
        "it is complete, immutable, and public, but it requires understanding to interpret correctly."),
      spacer(),

      h3("The Three Core Tables on Dune"),
      body("Every blockchain analysis on Dune starts with one of three core data structures. " +
        "Understanding what each contains is essential before writing a single query."),
      spacer(),

      h4("1. Transactions Table"),
      body("The transactions table contains one row for every confirmed transaction on the blockchain. " +
        "Each row records the complete details of that transaction:"),
      spacer(),
      bullet("hash", " — the unique identifier of the transaction (like a receipt number)"),
      bullet("block_time", " — the timestamp when the transaction was confirmed"),
      bullet("from", " — the sending address"),
      bullet("to", " — the receiving address"),
      bullet("value", " — the amount of ETH transferred (in wei — the smallest unit)"),
      bullet("gas_price", " — the price paid per unit of gas"),
      bullet("gas_used", " — the actual gas consumed by the transaction"),
      bullet("success", " — whether the transaction succeeded or reverted"),
      spacer(),
      callout("Note on Wei",
        "ETH values in the transactions table are stored in wei, not ETH. " +
        "1 ETH = 1,000,000,000,000,000,000 wei (10^18). " +
        "Always divide by 1e18 when displaying ETH amounts in queries. " +
        "Forgetting this is the most common beginner mistake on Dune."),
      spacer(),

      h4("2. Logs / Event Logs Table"),
      body("Smart contracts emit events when something significant happens — " +
        "a token transfer, a swap, a liquidity deposit. " +
        "These events are recorded in the logs table. " +
        "For payment analysis, the most important events are ERC-20 token transfers — " +
        "this is where all USDC, USDT, DAI, and EURC payment flows are recorded."),
      spacer(),
      bullet("contract_address", " — the smart contract that emitted the event"),
      bullet("topic0", " — the event signature hash (identifies what type of event this is)"),
      bullet("data", " — the event payload (encoded — must be decoded to read)"),
      bullet("block_time", " — when the event was emitted"),
      spacer(),

      h4("3. Decoded / Spell Tables"),
      body("Raw log data is encoded and difficult to read directly. " +
        "Dune maintains a library of decoded tables — called Spells — " +
        "that have already been decoded and organized into human-readable columns. " +
        "For payment analysis, the most useful decoded tables are:"),
      spacer(),
      bullet("erc20.evt_Transfer", " — every ERC-20 token transfer on Ethereum and L2s"),
      bullet("uniswap_v3.evt_Swap", " — every swap on Uniswap V3"),
      bullet("tokens.erc20", " — metadata table mapping contract addresses to token names and decimals"),
      spacer(),
      callout("Key Principle",
        "For most payment analysis queries, you will use decoded Spell tables rather than raw logs. " +
        "The Spells library is the most valuable part of Dune — " +
        "it saves hours of decoding work and ensures your queries return readable results. " +
        "Always check whether a decoded table exists before working with raw logs."),
      spacer(),

      h3("How On-Chain Data Differs from Traditional Datasets"),
      comparisonTable("Traditional Dataset", "On-Chain Data", [
        ["Pre-cleaned, structured", "Raw event logs — requires interpretation"],
        ["Fixed schema designed for analysis", "Schema reflects blockchain architecture"],
        ["Rows represent observations", "Rows represent events — transfers, swaps, calls"],
        ["Values in human-readable units", "Values often encoded — wei, hex addresses, topics"],
        ["Bounded — fixed number of rows", "Continuously growing — new rows every block"],
        ["No concept of addresses", "Every actor identified by cryptographic address"],
        ["Trusted data provider", "Trustless — data verified by the blockchain itself"],
      ]),
      spacer(),

      // ── SECTION 3 ──
      h1("3. SQL on Dune: Key Differences"),

      body("Dune uses a SQL dialect based on Trino (formerly PrestoSQL) — a distributed query engine. " +
        "The syntax is close to standard SQL but with important differences that trip up analysts coming from PostgreSQL or MySQL. " +
        "This section covers the differences you will encounter most frequently in payment analysis queries."),
      spacer(),

      h3("Date and Time Functions"),
      body("Blockchain timestamps are stored as TIMESTAMP WITH TIME ZONE. " +
        "Standard SQL date functions work, but Dune adds blockchain-specific time functions. " +
        "Below are two complete working examples — not code snippets, but full queries you can run directly on Dune:"),
      spacer(),
      body("Example 1: Retrieve the 10 most recent transactions (also Query 1 in Section 4):"),
      spacer(),
      code("SELECT"),
      code("    hash,"),
      code("    block_time,"),
      code('    "from",'),
      code('    "to",'),
      code("    value / 1e18 AS eth_value,"),
      code("    gas_used,"),
      code("    gas_price / 1e9 AS gas_price_gwei"),
      code("FROM ethereum.transactions"),
      code("ORDER BY block_time DESC"),
      code("LIMIT 10"),
      spacer(),
      body("Example 2: Daily transaction count with average gas price (also Query 2 in Section 4):"),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', block_time) AS date,"),
      code("    COUNT(*) AS transaction_count,"),
      code("    AVG(gas_price / 1e9) AS avg_gas_price_gwei"),
      code("FROM ethereum.transactions"),
      code("WHERE block_time >= NOW() - INTERVAL '90' DAY"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),

      h3("Hex Addresses"),
      body("All blockchain addresses are stored as hex strings — for example 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48. " +
        "When filtering by address in a WHERE clause, always use lowercase and wrap in single quotes:"),
      spacer(),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      spacer(),

      h3("Converting Wei to ETH"),
      body("As noted above, ETH values are stored in wei. Always convert before displaying:"),
      spacer(),
      code("value / 1e18 AS eth_value"),
      spacer(),

      h3("Token Decimals"),
      body("Different ERC-20 tokens use different decimal precision. " +
        "USDC uses 6 decimals. DAI and WETH use 18 decimals. " +
        "Always join with the tokens.erc20 table to get the correct decimals, " +
        "then divide the raw value by 10^decimals:"),
      spacer(),
      code("value / POWER(10, decimals) AS token_amount"),
      spacer(),

      callout("Critical Reminder",
        "Forgetting to convert wei or token decimals is the most common source of errors in on-chain analysis. " +
        "A USDC transfer of 1,000,000 raw units is 1 USDC (6 decimals). " +
        "A DAI transfer of 1,000,000,000,000,000,000 raw units is 1 DAI (18 decimals). " +
        "Always verify your decimal conversion before interpreting results."),
      spacer(),

      // ── SECTION 4 ──
      h1("4. Ten Query Exercises"),

      body("The following ten queries form a structured progression from basic data retrieval to genuine payment analysis. " +
        "Each query is written to run on Dune Analytics against real Ethereum data. " +
        "For each query: read the explanation, understand what it is asking, then type it manually into Dune and run it. " +
        "Typing manually — not copy-pasting — is a deliberate learning requirement established in Stage 1 of this program."),
      spacer(),

      callout("Before You Start",
        "All queries below target Ethereum mainnet unless otherwise stated. " +
        "On Dune, make sure you select the correct chain when creating a new query. " +
        "The decoded tables (ethereum.transactions, erc20_ethereum.evt_Transfer, etc.) " +
        "are chain-specific — the same table on Arbitrum has a different prefix."),
      spacer(),

      // Query 1
      h3("Query 1: Your First On-Chain Query — Recent Transactions"),
      body("This query retrieves the 10 most recent Ethereum transactions. " +
        "It introduces the transactions table and its core columns. " +
        "The goal is simply to see real data and understand what each column means."),
      spacer(),
      code("SELECT"),
      code("    hash,"),
      code("    block_time,"),
      code("    \"from\","),
      code("    \"to\","),
      code("    value / 1e18 AS eth_value,"),
      code("    gas_used,"),
      code("    gas_price / 1e9 AS gas_price_gwei"),
      code("FROM ethereum.transactions"),
      code("ORDER BY block_time DESC"),
      code("LIMIT 10"),
      spacer(),
      body("Notice: value is divided by 1e18 to convert from wei to ETH. " +
        "gas_price is divided by 1e9 to convert from wei to gwei — the unit analysts use."),
      spacer(),

      // Query 2
      h3("Query 2: Daily Transaction Count — Network Activity Over Time"),
      body("This query counts how many transactions occurred per day over the last 90 days. " +
        "It introduces DATE_TRUNC for time-series aggregation — " +
        "a pattern you will use in almost every analytical query."),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', block_time) AS date,"),
      code("    COUNT(*) AS transaction_count,"),
      code("    AVG(gas_price / 1e9) AS avg_gas_price_gwei"),
      code("FROM ethereum.transactions"),
      code("WHERE block_time >= NOW() - INTERVAL '90' DAY"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Visualize this as a line chart on Dune. You will see the rhythm of Ethereum activity — " +
        "weekday peaks, weekend dips, and any spikes caused by major market events."),
      spacer(),

      // Query 3
      h3("Query 3: USDC Transfer Volume — Stablecoin Payment Flows"),
      body("This query measures daily USDC transfer volume on Ethereum mainnet. " +
        "USDC transfers are the most direct proxy for real crypto payment activity. " +
        "The USDC contract address on Ethereum is 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48."),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', evt_block_time) AS date,"),
      code("    COUNT(*) AS transfer_count,"),
      code("    SUM(value / 1e6) AS usdc_volume"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND evt_block_time >= NOW() - INTERVAL '90' DAY"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Note: USDC uses 6 decimals, so we divide by 1e6. " +
        "This query is your first genuine payment analytics query — " +
        "you are measuring real economic activity flowing through the USDC contract."),
      spacer(),

      h3("What Query 3 Results Tell You"),
      body("When I ran this query on April 23, 2026, the results showed approximately 425,000 to 650,000 USDC transfers per day " +
        "over the 90-day period, with daily volumes consistently in the range of USD 40 to 97 billion. " +
        "To put that in perspective: the entire GDP of the Netherlands is approximately USD 1.1 trillion per year. " +
        "Roughly 6% of Dutch annual GDP was moving through USDC on a single day in January 2026. " +
        "This is not test data or a simulation — this is real economic activity, verifiable by anyone on the public blockchain."),
      spacer(),
      body("A few specific observations from the results worth noting:"),
      spacer(),
      bullet("February 5, 2026", " showed the highest single-day volume in the dataset at approximately USD 97 billion — " +
        "notable because this coincides with the period of escalating US-Iran military tensions documented in the crypto geopolitical analysis project."),
      bullet("February 14, 2026", " showed an unusual dip to USD 37 billion — " +
        "significantly below the average. Identifying the cause of such anomalies is exactly the kind of analytical work that on-chain data enables."),
      bullet("Transfer counts", " ranged from 425,000 to over 640,000 per day — " +
        "demonstrating that USDC is not just used for large institutional transfers but for hundreds of thousands of individual transactions daily."),
      spacer(),
      callout("Analytical Habit to Build",
        "Every time you see an anomaly in your results — a spike, a dip, an unexpected pattern — " +
        "write down the date and ask: what happened that day? " +
        "Cross-reference with news, market events, and your other datasets. " +
        "This habit of connecting on-chain data to real-world events is what separates an analyst from someone who just runs queries."),
      spacer(),

      // Query 4
      h3("Query 4: Gas Fee Analysis — The Scarce Resource in Action"),
      body("This query calculates daily average, minimum, and maximum gas prices. " +
        "It makes the dynamic pricing mechanism from Stage 1 visible in real data. " +
        "Peaks correspond to periods of high demand — the price mechanism allocating scarce block space."),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('day', block_time) AS date,"),
      code("    AVG(gas_price / 1e9) AS avg_gwei,"),
      code("    MIN(gas_price / 1e9) AS min_gwei,"),
      code("    MAX(gas_price / 1e9) AS max_gwei,"),
      code("    APPROX_PERCENTILE(gas_price / 1e9, 0.5) AS median_gwei"),
      code("FROM ethereum.transactions"),
      code("WHERE block_time >= NOW() - INTERVAL '180' DAY"),
      code("    AND success = TRUE"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Visualize this as a line chart. Identify the spikes. " +
        "Cross-reference them with market events from your crypto geopolitical analysis project — " +
        "you may find fee spikes that correspond to the conflict escalation events you already studied."),
      spacer(),

      h3("What Query 4 Results Tell You"),
      body("When run over 180 days of Ethereum data, the results reveal the dynamic pricing mechanism " +
        "from Stage 1 in action. The average gas price (avg_gwei) typically hovers between 0.5 and 2 gwei " +
        "during normal market conditions — relatively cheap and stable."),
      spacer(),
      body("The most analytically interesting column is max_gwei. " +
        "On October 28, 2025, the average gas price was approximately 1.09 gwei — normal. " +
        "But the maximum gas price that same day reached 44,565 gwei. " +
        "That means one actor paid 44,000 times the average price to get their transaction processed immediately. " +
        "This is the mempool urgency concept from Stage 1 made visible in real data: " +
        "someone had a time-critical transaction and was willing to pay almost any price. " +
        "In financial economics this is equivalent to a market order — " +
        "price is irrelevant, only speed matters."),
      spacer(),
      bullet("Normal conditions", ": avg_gwei between 0.5 and 2 — cheap, stable, low demand"),
      bullet("Elevated conditions", ": avg_gwei between 2 and 10 — moderate congestion, something is happening"),
      bullet("Congested conditions", ": avg_gwei above 10 — high demand, major market event in progress"),
      bullet("max_gwei spikes", ": individual actors paying extreme premiums — time-critical transactions, liquidations, arbitrage"),
      spacer(),

      // Query 5
      h3("Query 5: Stablecoin Comparison — USDC vs USDT vs DAI"),
      body("This query compares daily transfer volume across the three major stablecoins. " +
        "It introduces UNION ALL to combine results from multiple token contracts into one result set. " +
        "The three contract addresses are: " +
        "USDC: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48, " +
        "USDT: 0xdac17f958d2ee523a2206206994597c13d831ec7, " +
        "DAI: 0x6b175474e89094c44da98b954eedeac495271d0f."),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('week', evt_block_time) AS week,"),
      code("    'USDC' AS token,"),
      code("    SUM(value / 1e6) AS volume"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND evt_block_time >= NOW() - INTERVAL '180' DAY"),
      code("GROUP BY 1, 2"),
      spacer(),
      code("UNION ALL"),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('week', evt_block_time) AS week,"),
      code("    'USDT' AS token,"),
      code("    SUM(value / 1e6) AS volume"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0xdac17f958d2ee523a2206206994597c13d831ec7"),
      code("    AND evt_block_time >= NOW() - INTERVAL '180' DAY"),
      code("GROUP BY 1, 2"),
      spacer(),
      code("UNION ALL"),
      spacer(),
      code("SELECT"),
      code("    DATE_TRUNC('week', evt_block_time) AS week,"),
      code("    'DAI' AS token,"),
      code("    SUM(value / 1e18) AS volume"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0x6b175474e89094c44da98b954eedeac495271d0f"),
      code("    AND evt_block_time >= NOW() - INTERVAL '180' DAY"),
      code("GROUP BY 1, 2"),
      spacer(),
      code("ORDER BY 1, 2"),
      spacer(),
      body("Note that DAI uses 18 decimals while USDC and USDT use 6. " +
        "Visualize as a stacked bar chart — you will see the relative dominance of each stablecoin in payment flows."),
      spacer(),

      h3("What Query 5 Results Tell You"),
      body("The bar chart produced by this query tells a clear and immediate story: " +
        "USDC dominates stablecoin payment flows on Ethereum mainnet throughout the entire 6-month period. " +
        "USDT is significant but consistently secondary. DAI is almost invisible at the bottom of the chart."),
      spacer(),
      body("The most striking feature is the spike in March 2026, where USDC volume shot above USD 600 billion in a single week. " +
        "This corresponds directly to the period following the US-Israel strikes on Iran on February 28, 2026 — " +
        "an event analyzed in the companion crypto geopolitical project in this portfolio. " +
        "Markets reacted, capital moved, and USDC payment volume exploded. " +
        "You can literally see a geopolitical shock in the stablecoin payment data."),
      spacer(),
      body("The near-invisibility of DAI throughout the chart is also analytically significant. " +
        "Despite DAI being a major stablecoin by market cap, its transfer volume is a fraction of USDC and USDT. " +
        "This confirms the Stage 1 observation: DAI is used primarily within DeFi protocols, " +
        "not as a mainstream payment instrument. The difference in use case is visible in the data."),
      spacer(),
      body("The secondary position of USDT on Ethereum is consistent with USDT's known geographic dominance on the Tron network, " +
        "which is the preferred chain for USDT transfers in Asia and emerging markets. " +
        "Querying only Ethereum gives an Ethereum-centric view — " +
        "a reminder that cross-chain analysis is necessary for a complete picture of global stablecoin flows."),
      spacer(),
      callout("Connection to Stage 1",
        "This chart directly validates the stablecoin analysis from Stage 1. " +
        "Every claim made there about USDC dominance on Ethereum, USDT's Tron preference, " +
        "and DAI's DeFi-native nature is now visible in real on-chain data. " +
        "Stage 1 was theory. This chart is evidence."),
      spacer(),

      // Query 6
      h3("Query 6: Layer 2 vs Mainnet — Where Are Payments Actually Happening?"),
      body("This query compares USDC transfer counts between Ethereum mainnet and Arbitrum. " +
        "It makes the Layer 2 migration from Stage 1 visible in real data. " +
        "On Dune, you query Arbitrum data using the arbitrum prefix instead of ethereum."),
      spacer(),
      body("Run these two queries separately and compare the results:"),
      spacer(),
      code("-- Ethereum Mainnet USDC transfers (last 30 days)"),
      code("SELECT COUNT(*) AS mainnet_transfers"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND evt_block_time >= NOW() - INTERVAL '30' DAY"),
      spacer(),
      code("-- Arbitrum USDC transfers (last 30 days)"),
      code("SELECT COUNT(*) AS arbitrum_transfers"),
      code("FROM erc20_arbitrum.evt_Transfer"),
      code("WHERE contract_address = 0xaf88d065e77c8cc2239327c5edb3a432268e5831"),
      code("    AND evt_block_time >= NOW() - INTERVAL '30' DAY"),
      spacer(),
      body("The USDC contract address is different on Arbitrum — each chain has its own deployed contract. " +
        "The result will likely show that Arbitrum processes significantly more transfers than mainnet, " +
        "confirming that Layer 2 has become the primary payment infrastructure."),
      spacer(),

      // Query 7
      h3("Query 7: Large Payment Detection — Whale Transfers"),
      body("This query identifies unusually large USDC transfers — transactions above 1 million USDC. " +
        "In financial economics, large trades by institutional actors are called whale transactions. " +
        "Monitoring whale activity is a standard on-chain analytics technique used to track institutional payment flows."),
      spacer(),
      code("SELECT"),
      code("    evt_block_time,"),
      code("    'from',"),
      code("    \"to\","),
      code("    value / 1e6 AS usdc_amount,"),
      code("    evt_tx_hash AS transaction_hash"),
      code("FROM erc20_ethereum.evt_Transfer"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    AND value / 1e6 > 1000000"),
      code("    AND evt_block_time >= NOW() - INTERVAL '30' DAY"),
      code("ORDER BY usdc_amount DESC"),
      code("LIMIT 50"),
      spacer(),
      body("Copy a transaction hash from the results and paste it into etherscan.io. " +
        "You will see the full details of that specific payment — " +
        "the sending and receiving addresses, the block it was included in, and the gas fee paid. " +
        "This is how on-chain forensics begins: a query identifies something interesting, " +
        "and you follow the chain of transactions manually to understand the context."),
      spacer(),

      // Query 8
      h3("Query 8: Fee Efficiency Analysis — Cost Per Dollar Transferred"),
      body("This query calculates the fee paid as a percentage of value transferred for ETH transactions. " +
        "It measures economic efficiency — how much of each transfer is consumed by network fees. " +
        "This is directly relevant to the payment viability question: " +
        "at what transaction size does Ethereum mainnet become economically irrational for payments?"),
      spacer(),
      code("SELECT"),
      code("    CASE"),
      code("        WHEN value / 1e18 < 0.01 THEN 'Micro (<0.01 ETH)'"),
      code("        WHEN value / 1e18 < 0.1 THEN 'Small (0.01-0.1 ETH)'"),
      code("        WHEN value / 1e18 < 1 THEN 'Medium (0.1-1 ETH)'"),
      code("        WHEN value / 1e18 < 10 THEN 'Large (1-10 ETH)'"),
      code("        ELSE 'Whale (>10 ETH)'"),
      code("    END AS transaction_size,"),
      code("    COUNT(*) AS count,"),
      code("    AVG((gas_used * gas_price / 1e18) / NULLIF(value / 1e18, 0) * 100) AS avg_fee_pct"),
      code("FROM ethereum.transactions"),
      code("WHERE block_time >= NOW() - INTERVAL '7' DAY"),
      code("    AND value > 0"),
      code("    AND success = TRUE"),
      code("GROUP BY 1"),
      code("ORDER BY 2 DESC"),
      spacer(),
      body("The result will show that small transactions pay a disproportionately high percentage of their value in fees. " +
        "This is the economic argument for Layer 2 payments made visible in real data."),
      spacer(),

      // Query 9
      h3("Query 9: Payment Velocity — Transactions Per Hour"),
      body("This query measures transaction counts by hour of day, averaged across the last 30 days. " +
        "It reveals the circadian rhythm of blockchain payment activity — " +
        "when during the day are most payments processed? " +
        "This connects to the geographic propagation analysis from Stage 1: " +
        "peaks during US and European business hours would suggest Western market dominance."),
      spacer(),
      code("SELECT"),
      code("    HOUR(block_time) AS hour_of_day,"),
      code("    COUNT(*) / 30.0 AS avg_daily_transactions"),
      code("FROM ethereum.transactions"),
      code("WHERE block_time >= NOW() - INTERVAL '30' DAY"),
      code("    AND success = TRUE"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("Visualize as a bar chart. The shape of this distribution is an empirical measurement " +
        "of the geographic concentration of Ethereum activity — " +
        "your first real data point for the geographic analysis framework developed in Stage 1."),
      spacer(),

      // Query 10
      h3("Query 10: Your Original Research Query"),
      body("Query 10 is not provided. It is yours to formulate."),
      spacer(),
      body("Using what you have learned from queries 1 through 9, formulate one original research question " +
        "about crypto payment flows that interests you — " +
        "ideally connected to your existing portfolio work. " +
        "Some starting points:"),
      spacer(),
      bullet("Geopolitical connection:", " Did USDC payment volumes on Ethereum change during the conflict escalation events you analyzed in the crypto geopolitical project?"),
      bullet("Netherlands relevance:", " Is there any on-chain evidence of EURC adoption relative to USDC on Ethereum?"),
      bullet("Layer 2 migration:", " At what point in 2024–2025 did Arbitrum USDC transfers first exceed Ethereum mainnet USDC transfers?"),
      bullet("Mempool urgency:", " Do gas fee spikes on Ethereum correlate with USDC transfer volume spikes on the same day?"),
      spacer(),
      callout("Requirement for Stage 3",
        "Query 10 must be completed and saved as a public query on your Dune account before progressing to Stage 3. " +
        "The research question, the query, and a brief interpretation of the results " +
        "must also be added to the blockchain-payments-learning repository on GitHub. " +
        "This is your first original on-chain research contribution.", "green"),
      spacer(),

      // ── SECTION 5 ──
      h1("5. Building Your First Dashboard"),

      body("A Dune dashboard is a collection of saved queries displayed together as an interactive page. " +
        "It is the standard output format for on-chain analysis — " +
        "what you share with employers, post on LinkedIn, and reference in job applications."),
      spacer(),

      h3("Dashboard Structure for Payment Analysis"),
      body("A well-structured payment analytics dashboard tells a coherent story. " +
        "The following structure is recommended for your first dashboard:"),
      spacer(),
      bullet("Panel 1:", " USDC + USDT daily transfer volume (Query 3 / Query 5) — the headline metric"),
      bullet("Panel 2:", " Layer 2 vs mainnet transfer count comparison (Query 6) — the structural trend"),
      bullet("Panel 3:", " Daily gas prices over time (Query 4) — the fee environment"),
      bullet("Panel 4:", " Transaction velocity by hour of day (Query 9) — the geographic pattern"),
      bullet("Panel 5:", " Your original Query 10 result — your contribution"),
      spacer(),

      h3("Publishing and Linking"),
      body("Once your dashboard is built and public on Dune, add the link to three places:"),
      spacer(),
      bullet("GitHub README", " of the blockchain-payments-learning repository"),
      bullet("LinkedIn profile", " under Projects or Featured"),
      bullet("CV", " under Projects alongside your existing portfolio entries"),
      spacer(),
      callout("What This Signals to Employers",
        "A public Dune dashboard is the most credible signal a crypto analytics candidate can present. " +
        "It demonstrates that you can write SQL against real blockchain data, " +
        "formulate analytical questions, and communicate findings visually. " +
        "It is direct evidence of capability — not a degree, not a course certificate, but actual work product.", "green"),
      spacer(),

      // ── SELF CHECK ──
      h1("Self-Check — Stage 2 Completion Criteria"),
      body("Before progressing to Stage 3, all of the following must be complete:"),
      spacer(),
      bullet("Account created", " at dune.com with your real name"),
      bullet("Queries 1–9 run", " successfully on Dune — you have seen real results for each"),
      bullet("Query 10 formulated", " and saved as a public query on your Dune account"),
      bullet("Dashboard published", " on Dune with at least 4 panels"),
      bullet("Dashboard linked", " from your GitHub blockchain-payments-learning repository"),
      bullet("One paragraph written", " in your own words interpreting your Query 10 results"),
      spacer(),
      callout("Stage 3 Preview",
        "Stage 3 covers Python integration with on-chain data: " +
        "pulling Dune query results into a Jupyter notebook via the Dune API, " +
        "combining on-chain data with off-chain data sources (news APIs, exchange data), " +
        "and building the geographic mempool analysis pipeline described in Stage 1. " +
        "It is the bridge between SQL analysis and the full Python analytics stack.", "green"),
      spacer(),

      // ── PAGE BREAK + REFERENCES ──
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "", break: 1 }), new PageBreak()]
      }),
      h1("References"),
      spacer(),
      ref("Buterin, V. (2014). ", "Ethereum: A next-generation smart contract and decentralized application platform. Ethereum Foundation. Available at: ", "https://ethereum.org/content/whitepaper/whitepaper-pdf/Ethereum_Whitepaper_-_Buterin_2014.pdf"),
      ref("Chainalysis. (2025). ", "Crypto market manipulation 2025: Suspected wash trading and pump-and-dump schemes. Chainalysis Research. Available at: ", "https://www.chainalysis.com/blog/crypto-market-manipulation-wash-trading-pump-and-dump-2025/"),
      ref("Circle Internet Financial. (2025). ", "USDC documentation. Circle Developer Portal. Available at: ", "https://developers.circle.com/stablecoins/docs/what-is-usdc"),
      ref("Dune Analytics. (2025). ", "Dune documentation: Getting started with on-chain data analysis. Available at: ", "https://dune.com/docs"),
      ref("Ethereum Foundation. (2025). ", "Ethereum developer documentation: Transactions, gas, and Layer 2. Available at: ", "https://ethereum.org/en/developers/docs"),
      ref("MakerDAO. (2025). ", "The Maker Protocol: MakerDAO\u2019s multi-collateral DAI system. Available at: ", "https://docs.makerdao.com"),
      ref("Nakamoto, S. (2008). ", "Bitcoin: A peer-to-peer electronic cash system. Available at: ", "https://bitcoin.org/bitcoin.pdf"),
      ref("O\u2019Hara, M. (1995). ", "Market microstructure theory. Blackwell Publishers. (Referenced in relation to geographic price discovery and information asymmetry applied analogically to blockchain transaction propagation analysis.)", null),
      ref("Poon, J., & Dryja, T. (2016). ", "The Bitcoin Lightning Network: Scalable off-chain instant payments. Available at: ", "https://lightning.network/lightning-network-paper.pdf"),
      spacer(),

      new Paragraph({
        spacing: { before: 200, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        children: [new TextRun({ text: "Blockchain Payments \u2014 Stage 2 Study Guide  |  Saki Cansev  |  April 2026  |  github.com/sakicansev", size: 16, font: "Arial", color: MID_GRAY, italics: true })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/Blockchain_Payments_Stage2.docx", buffer);
  console.log("Done!");
});
