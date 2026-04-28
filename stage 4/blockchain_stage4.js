const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, ExternalHyperlink,
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

const noBorder    = { style: BorderStyle.NONE, size: 0, color: WHITE };
const thinBorder  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
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

function numbered(n, bold_part, rest) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `${n}.  `, bold: true, size: 20, font: "Arial", color: TEAL }),
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

function threeColTable(headers, rows) {
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
      body("Stage 4 goes one level deeper. Everything analyzed in Stages 2 and 3 \u2014 USDC transfers, token volumes, payment flows \u2014 was observed at the surface level through decoded Spell tables that Dune prepares in advance. This stage explains what is happening underneath those tables: how smart contracts actually execute payment logic, what the raw event log data looks like before decoding, how to decode it yourself in Python, how real payment protocols encode invoices and settlements on-chain, and how to write Dune queries that work directly with contract-level data."),
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
        "This document covers five topics: how ERC-20 smart contracts work and what the Transfer event looks like in raw form, including how to decode hex data yourself; " +
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

      h3("1.3  Understanding Hexadecimal"),
      body("Before reading raw event logs, you need to understand hexadecimal \u2014 the numbering system Ethereum uses to store all data. This section explains it intuitively, without requiring any mental arithmetic."),
      spacer(),

      h4("Why Hexadecimal Exists"),
      body("Computers store everything in binary \u2014 sequences of 0s and 1s. Eight binary digits grouped together is called a byte. One byte can hold any value from 0 to 255."),
      spacer(),
      body("The problem: binary is completely unreadable for humans. And decimal (base 10) doesn't map cleanly onto bytes either \u2014 one byte doesn't correspond to a neat number of decimal digits."),
      spacer(),
      body("Hexadecimal (base 16) solves this perfectly. The key insight is: one hex digit = exactly 4 bits, so two hex digits = exactly one byte. Always. Clean, exact, predictable. This is why hex was chosen \u2014 not base 20 or base 8 \u2014 because 16 = 2\u2074, which maps perfectly onto binary. Every byte becomes exactly two hex characters."),
      spacer(),
      body("Hex uses the digits 0\u20139 and the letters a\u2013f, giving 16 possible values per digit: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, a, b, c, d, e, f. The prefix 0x simply means 'what follows is written in hex' \u2014 like putting a \u20ac sign before a number to say 'this is euros.' The actual value starts after the 0x."),
      spacer(),

      h4("How to Read Hex \u2014 The Pair Rule"),
      body("You never need to calculate hex in your head. The only skill you need is reading in pairs. Every two hex characters is one byte. So a 40-character hex string is 20 bytes \u2014 just count the pairs:"),
      spacer(),
      code("1234567890abcdef1234567890abcdef12345678"),
      code(""),
      code("12  34  56  78  90  ab  cd  ef  12  34  56  78  90  ab  cd  ef  12  34  56  78"),
      code(" 1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20"),
      spacer(),
      body("20 pairs = 20 bytes. No arithmetic. Just counting pairs. Ethereum addresses are always 20 bytes = 40 hex characters. This is why."),
      spacer(),

      h4("Converting Hex Numbers \u2014 Use Python, Not Your Head"),
      body("When you see a hex value like 0x3b9ac9ff, you do not need to convert it manually. That is exactly what Python is for:"),
      spacer(),
      code("int('3b9ac9ff', 16)"),
      code("# Returns: 999999999"),
      code(""),
      code("# For USDC with 6 decimals:"),
      code("999999999 / 1e6"),
      code("# Returns: 999.999999 USDC"),
      spacer(),
      body("One line. Done. The real skill is not arithmetic \u2014 it is recognizing that something is hex-encoded and knowing which tool converts it. You will never calculate base-16 by hand in professional work."),
      spacer(),

      h3("1.4  The Transfer Event in Raw Form"),
      body("When the USDC contract emits a Transfer event, Ethereum records it as a log entry with the following raw structure:"),
      spacer(),
      code("address:  0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48  (the USDC contract)"),
      code("topic0:   0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      code("topic1:   0x000000000000000000000000a9d1e08c7793af67e9d92fe308d5697fb81d3e43"),
      code("topic2:   0x000000000000000000000000b5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511"),
      code("data:     0x000000000000000000000000000000000000000000000000000000003b9ac9ff"),
      spacer(),
      body("Breaking this down:"),
      spacer(),
      bullet("topic0", " \u2014 the keccak256 hash of the event signature 'Transfer(address,address,uint256)'. This is how Ethereum identifies what type of event was emitted. Every Transfer event on every ERC-20 token has the same topic0."),
      bullet("topic1", " \u2014 the from address, zero-padded to 32 bytes. The actual address is the last 40 hex characters (20 bytes)."),
      bullet("topic2", " \u2014 the to address, zero-padded to 32 bytes."),
      bullet("data", " \u2014 the token amount in raw hex. Decode with Python: int('3b9ac9ff', 16) = 999,999,999 raw units = 999.999999 USDC."),
      spacer(),

      h4("Why 32 Bytes?"),
      body("You may notice that addresses (20 bytes) are padded with zeros to fill a 32-byte slot. The reason is that the EVM reads memory in fixed chunks of exactly 32 bytes at a time \u2014 always. It never reads 'however many bytes this value needs.' It reads 32, moves forward 32, reads the next 32. Fixed grid. No exceptions."),
      spacer(),
      body("Think of it like a car park with fixed-size spaces. Every space is the same width \u2014 whether you park a Mini or a truck. The Mini (your 20-byte address) parks in the space but doesn't fill it. The empty space on the left is the padding. The car park doesn't care \u2014 it just knows every space starts exactly 32 bytes from the last one."),
      spacer(),
      code("The 32-byte slot (64 hex characters):"),
      code(""),
      code("[000000000000000000000000] [a9d1e08c7793af67e9d92fe308d5697fb81d3e43]"),
      code(" 24 hex chars of padding    40 hex chars = the actual 20-byte address"),
      spacer(),
      body("To extract the real address, skip the first 24 hex characters and take the last 40. That is what the Dune query in Section 2 does with SUBSTR(topic1, 27, 40)."),
      spacer(),

      h4("How to Decode This Yourself \u2014 Three Steps"),
      body("When Dune has not decoded a contract, you decode the raw log yourself. Here is the complete three-step process:"),
      spacer(),
      numbered("1", "Identify the event", " \u2014 go to Etherscan, search the contract address, click Contract \u2192 ABI. Find the event definition. It will say Transfer(address indexed from, address indexed to, uint256 value). Now you know: topic1 = from, topic2 = to, data = value."),
      numbered("2", "Extract the addresses", " \u2014 take the last 40 characters of topic1 and topic2:"),
      spacer(),
      code("topic1 = '0x000000000000000000000000a9d1e08c7793af67e9d92fe308d5697fb81d3e43'"),
      code("from_address = '0x' + topic1[-40:]"),
      code("# Result: 0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43"),
      spacer(),
      numbered("3", "Decode the value", " \u2014 convert the data field from hex to decimal, then divide by the token's decimals:"),
      spacer(),
      code("data = '0x000000000000000000000000000000000000000000000000000000003b9ac9ff'"),
      code("raw_value = int(data, 16)       # 999999999"),
      code("usdc_amount = raw_value / 1e6   # 999.999999 USDC"),
      spacer(),
      body("Three steps, five lines of Python. You just decoded a raw Ethereum event without any pre-built table, on any contract, on any chain. This is what the claim 'you can analyze any contract' actually means in practice."),
      spacer(),

      callout("The Real Skill",
        "Dune's Spell tables do these three steps automatically for popular contracts. " +
        "When Dune hasn't done it, you do it yourself. " +
        "The hex knowledge from Section 1.3 is exactly what makes Steps 2 and 3 possible. " +
        "You are not limited to what Dune has prepared \u2014 you can decode any contract on any chain.", "green"),
      spacer(),

      h3("1.5  Gas and Contract Execution"),
      body("Every function call to a smart contract consumes gas \u2014 exactly as established in Stage 1. But the gas cost is not fixed per function: it depends on what the function does."),
      spacer(),

      h4("What Does Complexity Actually Mean?"),
      body("Complexity has nothing to do with the amount of money being transferred. You can send $500 million in one simple transfer for 65,000 gas, and you can send $1 in a complex DeFi transaction for 500,000 gas. The amount is irrelevant. Complexity means how many instructions the computer had to execute."),
      spacer(),
      body("Think of it like a taxi fare. The fare is not based on how valuable your cargo is. It is based on distance travelled \u2014 how far the meter ran. Whether you are carrying a diamond or a sandwich, the meter runs the same. Gas is the meter. It counts computational steps, not value."),
      spacer(),
      body("To make this concrete: when you send USDC from your wallet to another wallet, the contract does three things \u2014 check the sender's balance, subtract from sender, add to receiver. Three steps. About 65,000 gas."),
      spacer(),
      body("But beyond sending money to a person, smart contracts let you interact with other contracts. Here is what actually happens when you swap USDC for ETH on Uniswap:"),
      spacer(),
      numbered("1", "You send a swap request", " to the Uniswap contract"),
      numbered("2", "Uniswap checks the current price", " \u2014 calls the price oracle contract \u2192 returns 'ETH is $2,000'"),
      numbered("3", "Uniswap takes your USDC", " \u2014 calls the USDC contract \u2192 transfers 1,000 USDC from you to the liquidity pool"),
      numbered("4", "Uniswap sends you ETH", " \u2014 calls the ETH contract \u2192 sends 0.5 ETH to your wallet"),
      numbered("5", "Done", ""),
      spacer(),
      body("That is four contract calls for one swap \u2014 each costs gas, adding up to roughly 150,000\u2013300,000 gas total. Beyond swaps, smart contracts enable borrowing against crypto collateral, earning yield in liquidity pools, paying invoices on-chain, buying NFTs, and voting on protocol governance decisions. Every one of these involves multiple contracts talking to each other, and gas is the bill for all those conversations."),
      spacer(),
      twoColTable(["Gas Used", "What It Suggests"],
        [
          ["< 65,000", "Simple ETH transfer (no contract interaction)"],
          ["65,000 \u2013 100,000", "Basic ERC-20 token transfer"],
          ["100,000 \u2013 300,000", "Single contract interaction (e.g. simple swap)"],
          ["300,000 \u2013 1,000,000", "Multi-contract DeFi operation"],
          ["> 1,000,000", "Extremely complex \u2014 worth investigating"],
        ]
      ),
      spacer(),
      body("On Etherscan, click the Internal Txns tab on any transaction. Each row is one contract calling another. A simple transfer has zero internal transactions. A complex DeFi swap might have 15. That is complexity made visible without any calculation."),
      spacer(),

      callout("Analyst Implication",
        "Gas cost is a proxy for computational complexity. " +
        "If you see a large USDC volume transfer with very high gas consumption in the pre-event window of a conflict, " +
        "that is not a simple payment between two people. " +
        "That is an institution executing complex automated logic across multiple contracts. " +
        "This is exactly the kind of signal the seismograph project would look for \u2014 " +
        "unusual complexity in an unusual time window.", "amber"),
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
          ["topic1", "First indexed parameter (often the from address)"],
          ["topic2", "Second indexed parameter (often the to address)"],
          ["topic3", "Third indexed parameter (if present)"],
          ["data", "Non-indexed parameters encoded as hex"],
        ]
      ),
      spacer(),

      h3("2.2  Reading a Transfer Event from Raw Logs"),
      body("This query reads USDC Transfer events directly from the raw logs table, without using the decoded Spell table. It demonstrates the three-step decoding process from Section 1.4 applied in SQL:"),
      spacer(),
      code("SELECT"),
      code("    block_time,"),
      code("    tx_hash,"),
      code("    -- Step 2: Extract 'from' address \u2014 last 40 chars of topic1"),
      code("    CONCAT('0x', SUBSTR(topic1, 27, 40)) AS from_address,"),
      code("    -- Step 2: Extract 'to' address \u2014 last 40 chars of topic2"),
      code("    CONCAT('0x', SUBSTR(topic2, 27, 40)) AS to_address,"),
      code("    -- Step 3: Decode amount from hex, divide by 1e6 for USDC"),
      code("    bytea2numeric(data) / 1e6 AS usdc_amount"),
      code("FROM ethereum.logs"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    -- Step 1: Filter for Transfer events using topic0 signature hash"),
      code("    AND topic0 = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      code("    AND block_time >= NOW() - INTERVAL '1' DAY"),
      code("ORDER BY block_time DESC"),
      code("LIMIT 10"),
      spacer(),
      body("Run this query on Dune and compare it against Query 3 from Stage 2. Both should return identical transfer data \u2014 one using the decoded Spell table, one decoding manually from raw logs. Seeing the same data produced two different ways solidifies your understanding of what Dune's Spell tables are actually doing under the hood."),
      spacer(),

      callout("Key Insight",
        "topic0 is the fingerprint of an event type. " +
        "The hash 0xddf252ad... always means Transfer(address,address,uint256) on any ERC-20 contract on any chain. " +
        "If you ever need to find all token transfers on a chain Dune has not decoded, " +
        "filter logs by this topic0 and you will find every ERC-20 transfer \u2014 regardless of the token.", "green"),
      spacer(),

      h3("2.3  Finding Events for Any Contract"),
      body("The power of raw log analysis is that it works for any contract. The workflow for analyzing a new protocol:"),
      spacer(),
      numbered("1", "Find the contract address", " on Etherscan"),
      numbered("2", "Look at the contract ABI", " (Application Binary Interface) to find event signatures"),
      numbered("3", "Compute keccak256 hash", " of the event signature to get topic0"),
      numbered("4", "Query ethereum.logs", " filtered by contract_address and topic0"),
      numbered("5", "Decode topic1, topic2, and data", " based on the event parameter types using the three-step method from Section 1.4"),
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
      body("Compare the output to your USDC volume chart from Stage 2. Request Network volume is a fraction of raw USDC transfer volume \u2014 it represents structured B2B invoicing rather than all stablecoin movement. Not all USDC transfers are payments in the commercial sense. Request Network transfers are explicitly structured payment requests, making them a cleaner signal for business payment flow analysis."),
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
      body("Always verify contract addresses against official documentation at gnosispay.com/developers before running. Contract addresses can change with protocol upgrades. Using the wrong address returns zero results without an error \u2014 a silent mistake that could invalidate an entire analysis."),
      spacer(),

      // SECTION 5
      h1("5. Capstone Query Exercise"),
      body("This section contains one original Dune query exercise that synthesizes everything from all four stages. It requires understanding of smart contract events (Stage 4), SQL on Dune (Stage 2), and the economic interpretation framework (Stages 1 and 3)."),
      spacer(),

      h3("5.1  Query: Contract-Level USDC Payment Analysis"),
      body("This query goes beyond the surface-level transfer volume queries of Stage 2. It identifies USDC transfers that originated from smart contract calls \u2014 as opposed to simple wallet-to-wallet transfers \u2014 by joining the transfer data with the transactions table to filter for transactions with high gas consumption indicating multi-contract execution:"),
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
      code("    -- gas_used > 100,000 indicates contract-initiated transfer"),
      code("    -- (simple wallet transfers use ~65,000 gas)"),
      code("    AND tx.gas_used > 100000"),
      code("GROUP BY 1"),
      code("ORDER BY 1"),
      spacer(),
      body("What this query tells you: the proportion of USDC volume that flows through smart contracts \u2014 DeFi protocols, payment processors, automated market makers \u2014 versus simple person-to-person transfers. Higher average gas usage indicates more complex contract logic involving multiple contract calls."),
      spacer(),

      h3("5.2  Extending the Query for the Seismograph Project"),
      body("The future seismograph project \u2014 detecting pre-event on-chain anomalies as leading indicators of geopolitical action \u2014 will build directly on this type of contract-level analysis. The specific extension:"),
      spacer(),
      bullet("Pre-event window", " \u2014 run the same query for the 72-hour period before each of the nine conflict events"),
      bullet("Baseline comparison", " \u2014 compare contract-initiated transfer counts and volumes against the 30-day rolling average"),
      bullet("Anomaly detection", " \u2014 flag days where contract-initiated USDC volume exceeds 2 standard deviations above baseline"),
      bullet("Geographic attribution", " \u2014 cross-reference anomalous transactions with known institutional wallet addresses"),
      spacer(),
      body("This pipeline transforms the event study completed in Stage 3 into a forward-looking detection system. The contract-level view is essential because institutional actors move capital through smart contracts \u2014 not through simple wallet-to-wallet transfers. High gas complexity in a pre-event window is a signal that automated institutional logic was executing. That is the seismograph reading."),
      spacer(),

      // SECTION 6
      h1("6. Program Completion"),
      body("Completing Stage 4 marks the end of the Blockchain Payments Self-Study Program. The table below summarizes what has been built across all four stages:"),
      spacer(),
      threeColTable(["Stage", "Output", "Original Contribution"],
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
      bullet("Can read hex addresses and values", " \u2014 understands the pair rule and uses Python for conversion"),
      bullet("Can explain why 32-byte padding exists", " \u2014 the fixed-grid EVM memory model"),
      bullet("Can write a Dune query against ethereum.logs", " using raw topic0 filtering"),
      bullet("Can explain the three-step decoding process", " from Section 1.4"),
      bullet("Can explain the difference between simple and complex transactions", " using the gas threshold guide"),
      bullet("Can explain the difference between Request Network and raw USDC transfers", " as payment signals"),
      bullet("Can explain what makes Gnosis Pay architecturally different", " from custodial crypto cards"),
      bullet("Capstone query run and results interpreted", " on Dune"),
      bullet("All four stage documents committed to GitHub", ""),
      spacer(),

      callout("What Comes Next \u2014 The Seismograph Project",
        "The next project builds on everything completed here: " +
        "a geopolitical early-warning system using on-chain crypto data. " +
        "The hypothesis: state actors and their financial networks move capital before military action becomes public, " +
        "creating detectable anomalies in on-chain data. " +
        "Using the nine conflict events already documented, analyze the 72-hour pre-event windows " +
        "for anomalous patterns: unusual whale transfers, USDC volume spikes, abnormal gas fee urgency, " +
        "mempool fee distribution shifts, and large wallet accumulation patterns. " +
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
  console.log('Stage 4 updated.');
});
