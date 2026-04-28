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
      body("Stage 4 goes one level deeper. Everything analyzed in Stages 2 and 3 \u2014 USDC transfers, token volumes, payment flows \u2014 was observed at the surface level through decoded Spell tables that Dune prepares in advance. This stage explains what is happening underneath those tables: how smart contracts actually execute payment logic, what the raw event log data looks like before decoding, how to decode it yourself in Python and SQL, how real payment protocols encode invoices and settlements on-chain, and how to write Dune queries that work directly with contract-level data."),
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
        "how to decode raw log data on Dune without relying on Spell tables, including the correct Dune-specific functions; " +
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

      h3("1.3  Understanding Hexadecimal"),
      body("Before reading raw event logs, you need to understand hexadecimal \u2014 the numbering system Ethereum uses to store all data. This section explains it intuitively, without requiring any mental arithmetic."),
      spacer(),

      h4("What is a Hashing Function?"),
      body("A hashing function is a machine that takes any input \u2014 a word, a sentence, a whole book \u2014 and produces a fixed-length fingerprint. Always the same length, regardless of how long the input was."),
      spacer(),
      body("The fingerprint has three properties. First, the same input always produces the same output \u2014 feed it the same text twice and you get the identical result. Second, a tiny change produces a completely different output \u2014 changing one letter changes everything, which makes tampering immediately detectable. Third, you cannot go backwards \u2014 given the fingerprint, there is no mathematical way to recover the original input."),
      spacer(),
      body("Think of a meat grinder. You put in a steak, you get mince. The mince is always the same if you use the same steak. Change one ingredient and the mince looks completely different. And you can never reconstruct the original steak from the mince. Hashing works the same way."),
      spacer(),
      body("Blockchain uses hashing everywhere:"),
      spacer(),
      bullet("Transaction hashes", " \u2014 the tx_hash you have been using is a hash of the entire transaction data. Tamper with one byte and the hash changes, so the network rejects it."),
      bullet("Block hashes", " \u2014 each block contains the hash of the previous block. Change anything in an old block and every hash after it breaks. This is what makes the blockchain immutable."),
      bullet("topic0", " \u2014 the hash of the event signature name, as explained below."),
      bullet("Ethereum addresses", " \u2014 your wallet address is derived from a hash of your public key."),
      spacer(),

      h4("What is keccak256?"),
      body("keccak256 is the specific hashing function Ethereum uses. You feed it any text, it produces a fixed 32-byte output. For event signatures, Ethereum takes the text Transfer(address,address,uint256), runs it through keccak256, and always gets:"),
      spacer(),
      code("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      spacer(),
      body("That hash is topic0. Every Transfer event on every ERC-20 token everywhere uses this exact same topic0 because the input text is always the same. It is the fingerprint of the event type."),
      spacer(),
      body("In practice, you never calculate this yourself. You either look it up on Etherscan or use Python:"),
      spacer(),
      code("from web3 import Web3"),
      code("Web3.keccak(text='Transfer(address,address,uint256)').hex()"),
      code("# Returns: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      spacer(),
      body("The concept to internalize: topic0 is a tamper-proof fingerprint of the event name. Same event name, same fingerprint, always. This is how you filter for specific event types in raw log queries."),
      spacer(),

      h4("Why Hexadecimal Exists"),
      body("Computers store everything in binary \u2014 sequences of 0s and 1s. Eight binary digits grouped together is called a byte. One byte can hold any value from 0 to 255."),
      spacer(),
      body("Binary is completely unreadable for humans. And decimal (base 10) does not map cleanly onto bytes either. Hexadecimal (base 16) solves this perfectly: one hex digit = exactly 4 bits, so two hex digits = exactly one byte. Always. Clean, exact, predictable. This is why hex was chosen \u2014 because 16 = 2\u2074, which maps perfectly onto binary. Every byte becomes exactly two hex characters."),
      spacer(),
      body("Hex uses the digits 0\u20139 and the letters a\u2013f, giving 16 possible values per digit. The prefix 0x simply means 'what follows is written in hex' \u2014 like putting a \u20ac sign before a number to say 'this is euros.'"),
      spacer(),

      h4("How to Read Hex \u2014 The Pair Rule"),
      body("You never need to calculate hex in your head. The only skill you need is reading in pairs. Every two hex characters is one byte:"),
      spacer(),
      code("1234567890abcdef1234567890abcdef12345678"),
      code(""),
      code("12  34  56  78  90  ab  cd  ef  12  34  56  78  90  ab  cd  ef  12  34  56  78"),
      code(" 1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20"),
      spacer(),
      body("20 pairs = 20 bytes. No arithmetic. Just counting pairs. Ethereum addresses are always 20 bytes = 40 hex characters."),
      spacer(),

      h4("Converting Hex Numbers \u2014 Use Python, Not Your Head"),
      body("When you see a hex value like 0x3b9ac9ff, you do not need to convert it manually. That is exactly what Python is for:"),
      spacer(),
      code("int('3b9ac9ff', 16)"),
      code("# Returns: 999999999"),
      code(""),
      code("999999999 / 1e6"),
      code("# Returns: 999.999999 USDC"),
      spacer(),
      body("One line. Done. The real skill is recognizing that something is hex-encoded and knowing which tool converts it. You will never calculate base-16 by hand in professional work."),
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
      bullet("topic0", " \u2014 the keccak256 hash of 'Transfer(address,address,uint256)'. The fingerprint of the event type. Every Transfer event on every ERC-20 token has the same topic0."),
      bullet("topic1", " \u2014 the from address, zero-padded to 32 bytes. The actual address is the last 40 hex characters (20 bytes)."),
      bullet("topic2", " \u2014 the to address, zero-padded to 32 bytes."),
      bullet("data", " \u2014 the token amount in raw hex. Decode with Python: int('3b9ac9ff', 16) = 999,999,999 raw units = 999.999999 USDC."),
      spacer(),

      h4("Why 32 Bytes?"),
      body("The EVM reads memory in fixed chunks of exactly 32 bytes at a time \u2014 always. It never reads 'however many bytes this value needs.' It reads 32, moves forward 32, reads the next 32. Fixed grid. No exceptions."),
      spacer(),
      body("Think of it like a car park with fixed-size spaces. Every space is the same width \u2014 whether you park a Mini or a truck. The Mini (your 20-byte address) parks in the space but does not fill it. The empty space on the left is the padding. The car park does not care \u2014 it just knows every space starts exactly 32 bytes from the last one."),
      spacer(),
      code("The 32-byte slot (64 hex characters):"),
      code(""),
      code("[000000000000000000000000] [a9d1e08c7793af67e9d92fe308d5697fb81d3e43]"),
      code(" 24 hex chars of padding    40 hex chars = the actual 20-byte address"),
      spacer(),
      body("To extract the real address, skip the first 24 hex characters and take the last 40. That is what the Dune query in Section 2 does."),
      spacer(),

      h4("How to Decode This Yourself \u2014 Three Steps"),
      body("When Dune has not decoded a contract, you decode the raw log yourself in three steps:"),
      spacer(),
      numbered("1", "Identify the event", " \u2014 go to Etherscan, search the contract address, click Contract \u2192 ABI. Find the event definition: Transfer(address indexed from, address indexed to, uint256 value). Now you know: topic1 = from, topic2 = to, data = value."),
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
      body("Three steps, five lines of Python. You just decoded a raw Ethereum event without any pre-built table, on any contract, on any chain."),
      spacer(),

      callout("The Real Skill",
        "Dune's Spell tables do these three steps automatically for popular contracts. " +
        "When Dune has not done it, you do it yourself. " +
        "You are not limited to what Dune has prepared \u2014 you can decode any contract on any chain.", "green"),
      spacer(),

      h3("1.5  Gas and Contract Execution"),
      body("Every function call to a smart contract consumes gas. But the gas cost is not fixed per function \u2014 it depends on what the function does."),
      spacer(),

      h4("What Does Complexity Actually Mean?"),
      body("Complexity has nothing to do with the amount of money being transferred. You can send $500 million in one simple transfer for 65,000 gas, and you can send $1 in a complex DeFi transaction for 500,000 gas. The amount is irrelevant. Complexity means how many instructions the computer had to execute."),
      spacer(),
      body("Think of it like a taxi fare. The fare is not based on how valuable your cargo is \u2014 it is based on distance travelled. Whether you are carrying a diamond or a sandwich, the meter runs the same. Gas is the meter. It counts computational steps, not value."),
      spacer(),
      body("When you send USDC from your wallet to another wallet, the contract does three things: check the balance, subtract, add. Three steps. About 65,000 gas. But beyond sending money to a person, smart contracts let you interact with other contracts. Here is what actually happens when you swap USDC for ETH on Uniswap:"),
      spacer(),
      numbered("1", "You send a swap request", " to the Uniswap contract"),
      numbered("2", "Uniswap checks the current price", " \u2014 calls the price oracle contract \u2192 returns 'ETH is $2,000'"),
      numbered("3", "Uniswap takes your USDC", " \u2014 calls the USDC contract \u2192 transfers 1,000 USDC to the liquidity pool"),
      numbered("4", "Uniswap sends you ETH", " \u2014 calls the ETH contract \u2192 sends 0.5 ETH to your wallet"),
      spacer(),
      body("That is four contract calls for one swap, adding up to 150,000\u2013300,000 gas total. Beyond swaps, smart contracts enable borrowing against collateral, earning yield in liquidity pools, paying invoices on-chain, buying NFTs, and voting on governance decisions. Every one of these involves multiple contracts talking to each other, and gas is the bill for all those conversations."),
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
      body("On Etherscan, click the Internal Txns tab on any transaction. Each row is one contract calling another. A simple transfer has zero internal transactions. A complex DeFi swap might have 15. That is complexity made visible."),
      spacer(),

      callout("Analyst Implication",
        "Gas cost is a proxy for computational complexity. " +
        "If you see a large USDC volume transfer with very high gas consumption in the pre-event window of a conflict, " +
        "that is not a simple payment between two people. " +
        "That is an institution executing complex automated logic across multiple contracts. " +
        "This is exactly the kind of signal the seismograph project would look for.", "amber"),
      spacer(),

      // SECTION 2
      h1("2. Decoding Raw Logs on Dune"),
      body("Stage 2 relied entirely on Dune's decoded Spell tables. This section teaches you to work one level below them \u2014 with the raw logs table \u2014 which gives you access to any contract on any chain."),
      spacer(),

      h3("2.1  The Raw Logs Table"),
      code("ethereum.logs"),
      spacer(),
      twoColTable(["Column", "What It Contains"],
        [
          ["block_time", "Timestamp of the block"],
          ["tx_hash", "Transaction hash that produced this log"],
          ["contract_address", "Address of the contract that emitted the event"],
          ["topic0", "Event signature hash \u2014 identifies event type"],
          ["topic1", "First indexed parameter (varbinary \u2014 raw bytes)"],
          ["topic2", "Second indexed parameter (varbinary \u2014 raw bytes)"],
          ["topic3", "Third indexed parameter (if present)"],
          ["data", "Non-indexed parameters (varbinary \u2014 raw bytes)"],
        ]
      ),
      spacer(),

      callout("Important: Dune Stores Topics as Varbinary",
        "On Dune, topic1, topic2, and the data field are stored as varbinary \u2014 raw bytes, not text strings. " +
        "This means you cannot use SUBSTR or CONCAT directly on them. " +
        "You must first convert topics to a hex string using TO_HEX(), and use varbinary_to_uint256() for numeric values. " +
        "Attempting to use bytea2numeric() on a 32-byte data field will fail because bytea2numeric only handles up to 8 bytes. " +
        "Always use the Dune-specific functions shown in the query below.", "amber"),
      spacer(),

      h3("2.2  Reading a Transfer Event from Raw Logs"),
      body("This query reads USDC Transfer events directly from the raw logs table without using the decoded Spell table. It was verified on Dune and returns real results. The comments explain each of the three decoding steps from Section 1.4:"),
      spacer(),
      code("SELECT"),
      code("    block_time,"),
      code("    tx_hash,"),
      code("    -- Step 2: Convert topic1 to hex string, extract last 40 chars (the address)"),
      code("    CONCAT('0x', SUBSTR(TO_HEX(topic1), 25, 40)) AS from_address,"),
      code("    -- Step 2: Same for topic2"),
      code("    CONCAT('0x', SUBSTR(TO_HEX(topic2), 25, 40)) AS to_address,"),
      code("    -- Step 3: Decode 32-byte data field to uint256, divide by 1e6 for USDC"),
      code("    varbinary_to_uint256(data) / 1e6 AS usdc_amount"),
      code("FROM ethereum.logs"),
      code("WHERE contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
      code("    -- Step 1: Filter for Transfer events using topic0 signature hash"),
      code("    AND topic0 = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"),
      code("    AND block_time >= NOW() - INTERVAL '1' DAY"),
      code("ORDER BY block_time DESC"),
      code("LIMIT 10"),
      spacer(),
      body("Three technical notes on the Dune-specific functions:"),
      spacer(),
      bullet("TO_HEX(topic1)", " \u2014 converts varbinary to a hex string without the 0x prefix. This is why the SUBSTR position is 25 (not 27) \u2014 we skip only the 24 padding characters, since 0x is not present."),
      bullet("varbinary_to_uint256(data)", " \u2014 converts a 32-byte varbinary value to a number. Use this instead of bytea2numeric(), which only handles values up to 8 bytes and will throw an overflow error on the 32-byte data field."),
      bullet("The result", " \u2014 compare against Query 3 from Stage 2. Both return identical USDC transfer data \u2014 one decoded by Dune automatically, one decoded by you manually. This confirms you understand what Dune's Spell tables are doing underneath."),
      spacer(),

      h3("2.3  Finding Events for Any Contract"),
      numbered("1", "Find the contract address", " on Etherscan"),
      numbered("2", "Look at the contract ABI", " to find event signatures"),
      numbered("3", "Get topic0", " \u2014 either read it from Etherscan's Logs tab or compute it with Web3.keccak()"),
      numbered("4", "Query ethereum.logs", " filtered by contract_address and topic0"),
      numbered("5", "Decode with TO_HEX() and varbinary_to_uint256()", " based on the event parameter types"),
      spacer(),

      // SECTION 3
      h1("3. Request Network"),
      body("Request Network is an open protocol for payment requests built on Ethereum. It demonstrates how real-world invoicing logic is encoded on-chain."),
      spacer(),

      h3("3.1  What Request Network Does"),
      body("Request Network allows anyone to create a payment request \u2014 essentially a decentralized invoice. The requester specifies who should pay, how much, in what currency, and by when. The entire lifecycle \u2014 creation, payment, cancellation \u2014 is recorded as on-chain events."),
      spacer(),
      body("The economic significance: every business that uses Request Network for invoicing produces queryable on-chain payment data. You can measure payment velocity, invoice settlement rates, and average payment times from public blockchain data, without any access to private business records."),
      spacer(),

      h3("3.2  The Request Network Data Model"),
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
      body("Compare this output to your USDC volume chart from Stage 2. Request Network volume is a fraction of raw USDC transfer volume \u2014 it represents structured B2B invoicing. Not all USDC transfers are payments in the commercial sense. Request Network transfers are explicitly structured payment requests, making them a cleaner signal for business payment flow analysis."),
      spacer(),

      // SECTION 4
      h1("4. Gnosis Pay"),
      body("Gnosis Pay is the most important real-world payment protocol to understand for a European fintech analyst. It is the first production deployment of a self-custodial crypto payment card."),
      spacer(),

      h3("4.1  What Gnosis Pay Is"),
      body("Gnosis Pay is a Visa debit card connected directly to a self-custodial smart contract wallet on Gnosis Chain. When you make a purchase anywhere Visa is accepted, the payment is settled on-chain in EURe (a Euro-pegged stablecoin) or USDC. The merchant receives euros through the normal Visa settlement system. The crypto complexity is completely invisible to them."),
      spacer(),
      body("This is architecturally different from exchange-linked crypto debit cards where the exchange holds custody of your funds. With Gnosis Pay, you hold your own keys. The smart contract wallet is yours. The card is an interface to your wallet, not a card linked to a company's custodial account."),
      spacer(),

      h3("4.2  The Technical Architecture"),
      bullet("Gnosis Chain", " \u2014 an Ethereum sidechain with ~5 second block times and very low fees. Transactions cost fractions of a cent, making card-level micropayments viable."),
      bullet("Safe smart wallet", " \u2014 Gnosis Pay uses Safe (formerly Gnosis Safe), the most widely used smart contract wallet standard. Your funds are controlled by a multi-signature contract, not a single private key."),
      bullet("EURe", " \u2014 a Euro-backed stablecoin issued by Monerium, the first company to receive an e-money license in Europe for blockchain-native payments."),
      bullet("Visa connection", " \u2014 when you tap your card, Visa processes the payment and Gnosis Pay settles on-chain within seconds."),
      spacer(),

      callout("Relevance for the Netherlands",
        "EURe is a Euro-pegged stablecoin with full e-money licensing in Europe, including the Netherlands. " +
        "An analyst who understands Gnosis Pay's on-chain data structure \u2014 " +
        "spending patterns, wallet sizes, merchant categories \u2014 " +
        "has a genuine edge for any fintech role in the European market.", "green"),
      spacer(),

      // SECTION 5
      h1("5. Capstone Query Exercise"),

      h3("5.1  Contract-Level USDC Payment Analysis"),
      body("This query identifies USDC transfers that originated from smart contract calls by filtering for transactions with gas consumption above the simple transfer threshold:"),
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

      h3("5.2  Extending the Query for the Seismograph Project"),
      bullet("Pre-event window", " \u2014 run the same query for the 72-hour period before each of the nine conflict events"),
      bullet("Baseline comparison", " \u2014 compare contract-initiated transfer counts against the 30-day rolling average"),
      bullet("Anomaly detection", " \u2014 flag days where contract-initiated USDC volume exceeds 2 standard deviations above baseline"),
      bullet("Geographic attribution", " \u2014 cross-reference anomalous transactions with known institutional wallet addresses"),
      spacer(),
      body("High gas complexity in a pre-event window is a signal that automated institutional logic was executing. That is the seismograph reading."),
      spacer(),

      // SECTION 6
      h1("6. Program Completion"),
      threeColTable(["Stage", "Output", "Original Contribution"],
        [
          ["Stage 1", "Conceptual Foundation document", "Geographic mempool propagation framework for detecting urgency origin from node timestamp data"],
          ["Stage 2", "10 Dune queries + public dashboard", "Query 10: USDC payment volume collapsed 66% on October 7, 2023"],
          ["Stage 3", "Python event study notebook", "Four original findings: Isfahan threshold effect, two-phase surge pattern, Haniyeh divergence, February 2026 regime change"],
          ["Stage 4", "Contract-level query capability", "Capstone query framework linking contract-initiated USDC transfers to the seismograph anomaly detection pipeline"],
        ]
      ),
      spacer(),

      h3("Self-Check \u2014 Program Completion Criteria"),
      bullet("Can explain the Transfer event log structure", " without referring to notes"),
      bullet("Can explain what a hashing function is", " and why blockchain uses it everywhere"),
      bullet("Can explain what keccak256 does", " and how topic0 is derived from it"),
      bullet("Can read hex addresses using the pair rule", " and convert values with Python"),
      bullet("Can explain why 32-byte padding exists", " \u2014 the fixed-grid EVM memory model"),
      bullet("Can apply the three-step decoding process", " from Section 1.4"),
      bullet("Can write a raw log query on Dune", " using TO_HEX(), varbinary_to_uint256(), and topic0 filtering"),
      bullet("Can explain the difference between simple and complex transactions", " using the gas threshold guide"),
      bullet("Can explain the difference between Request Network and raw USDC transfers", ""),
      bullet("Can explain what makes Gnosis Pay architecturally different", " from custodial crypto cards"),
      bullet("Capstone query run and results verified", " on Dune"),
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
        "Tools: Python, Dune Analytics, Blocknative API, SQLite, scipy anomaly detection.", "green"),
      spacer(),

      // READING LIST
      h1("Official Documentation \u2014 Reading List"),
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
  console.log('Stage 4 final done.');
});
