# Blockchain Payments — Self-Study Program

A structured 4-stage learning program covering blockchain payment systems,
on-chain data analysis, and real-world payment protocols.
Built as part of a self-directed specialization in crypto and fintech analytics.

**Author:** Saki Cansev  
**Background:** BSc Economics, Ankara University | MSc Data Analytics, University for the Creative Arts  
**GitHub:** [github.com/sakicansev](https://github.com/sakicansev)

---

## Program Structure

| Stage | Topic | Status |
|-------|-------|--------|
| Stage 1 | Conceptual Foundation | ✅ Complete |
| Stage 2 | On-Chain Data Analysis with Dune Analytics | ✅ Complete |
| Stage 3 | Python Integration & Event Study Analysis | 🔵 In Progress |
| Stage 4 | Smart Contracts & Payment Protocols | ⏳ Upcoming |

---

## Stage 1 — Conceptual Foundation

A comprehensive study guide covering the five core concepts every
blockchain payment analyst must understand before touching data.

**Topics covered:**
- UTXO vs Account Model (Bitcoin vs Ethereum) — including economic implications and market manipulation analysis
- Gas fees, mempool, and transaction finality — including dynamic pricing mechanism and EIP-1559
- Geographic propagation analysis — original analytical framework for detecting urgency origin from node data
- Practical data acquisition — four methods from running your own node to indexed platforms
- Layer 2 payments — Lightning Network, Arbitrum, Optimism, and the blockchain trilemma
- Stablecoins as payment rails — USDC, USDT, DAI, EURC
- Real-world payment protocols — Request Network, Gnosis Pay, Flexa

**Files:**
- 📄 [`Blockchain_Payments_Stage1.pdf`](Blockchain_Payments_Stage1.pdf) — read in browser
- 📝 [`stage 1/Blockchain_Payments_Stage1.docx`](<stage 1/Blockchain_Payments_Stage1.docx>) — Word document
- 💻 [`stage 1/blockchain_doc.js`](<stage 1/blockchain_doc.js>) — Node.js script that generated the document

---

## Stage 2 — On-Chain Data Analysis with Dune Analytics

A practical guide to querying real blockchain data using SQL on Dune Analytics.
Built after completing Stage 1 self-assessment (April 2026).

**Topics covered:**
- What Dune Analytics is and which chains it covers
- Structure of on-chain data — transactions, event logs, and decoded Spell tables
- SQL on Dune — key differences from standard SQL (wei, decimals, hex addresses)
- Ten structured query exercises from basic retrieval to original payment analysis
- Building and publishing a public dashboard

**Ten Query Exercises:**
1. First on-chain query — recent Ethereum transactions
2. Daily transaction count — network activity over time
3. USDC transfer volume — stablecoin payment flows
4. Gas fee analysis — the scarce resource in action
5. Stablecoin comparison — USDC vs USDT vs DAI
6. Layer 2 vs mainnet — where are payments actually happening?
7. Large payment detection — whale transfers
8. Fee efficiency analysis — cost per dollar transferred
9. Payment velocity — transactions per hour
10. **Geopolitical impact on USDC payment flows** — original research query

**Key Findings from Stage 2:**
- Arbitrum processed **42% more USDC transfers** than Ethereum mainnet in April 2026 — Layer 2 has overtaken mainnet
- USDC payment volume **dropped 66%** on October 7, 2023 — the day of the Hamas attack on Israel
- The March 2026 USDC spike (>$600B/week) corresponds directly to US-Israel strikes on Iran
- Ethereum gas fees are a **fixed cost, not a percentage** — making mainnet economically irrational for small payments

**Live Dashboard:**
👉 [Ethereum Payment Analytics — Saki Cansev](https://dune.com/sakicansev/dashboard-structure-for-payment-analysis)

**Files:**
- 📄 [`Blockchain_Payments_Stage2.pdf`](Blockchain_Payments_Stage2.pdf) — read in browser
- 📝 [`stage 2/Blockchain_Payments_Stage2.docx`](<stage 2/Blockchain_Payments_Stage2.docx>) — Word document
- 💻 [`stage 2/blockchain_stage2.js`](<stage 2/blockchain_stage2.js>) — Node.js script that generated the document

---

## Stage 3 — Python Integration & Event Study Analysis *(In Progress)*

Python pipeline integrating the Dune Analytics API with the off-chain SQLite price database
from the companion [crypto-geopolitical-analysis](https://github.com/sakicansev/crypto-geopolitical-analysis) project.
Completes the full event study of geopolitical shocks on crypto payment flows across all nine conflict events.

**Topics covered:**
- Dune Analytics API — retrieving saved query results into Python using `get_latest_result_dataframe()`
- Data pipeline — merging on-chain USDC payment data with off-chain BTC/ETH price data
- Timezone handling — stripping UTC offset before merging datetime columns
- Event study methodology — D+1, D+3, D+7 percentage changes across all nine conflict events
- Three publication-quality charts — USDC volume timeline, event study heatmap, correlation scatter
- Economic interpretation — liquidity preference, desensitisation hypothesis, EMH applied to on-chain data

**Research question:**  
Did USDC payment volumes on Ethereum change during the Iran–Israel–USA conflict escalation events — and do those changes correlate with BTC and ETH price reactions?

**Key findings from Stage 3 data retrieval:**
- Dune Query 10 (ID: 7365284) returned **936 rows** — daily USDC data from October 2023 through April 2026
- Merged with **917 days** of BTC/ETH price data from the companion project SQLite database
- October 7, 2023 confirmed in Python: **38,209 transfers, $2.24B volume** — down from 54,835 transfers and $6.67B the previous day (**66% drop**)
- Price and payment behavior collapsed simultaneously: BTC at $27,968, ETH at $1,634 on the event day

**Dune Query 10:**
👉 [Geopolitical Impact on USDC Payment Flows](https://dune.com/queries/7365284)

**Files:**
- 📄 [`Blockchain_Payments_Stage3.pdf`](Blockchain_Payments_Stage3.pdf) — read in browser
- 📝 [`stage 3/Blockchain_Payments_Stage3.docx`](<stage 3/Blockchain_Payments_Stage3.docx>) — Word document
- 💻 [`stage 3/blockchain_stage3.js`](<stage 3/blockchain_stage3.js>) — Node.js script that generated the document
- 📓 `stage 3/notebooks/stage3_event_study.ipynb` — analysis notebook *(in progress)*

---

## Stage 4 — Smart Contracts & Payment Protocols *(Upcoming)*

Solidity basics via CryptoZombies, understanding how payment contracts work at the contract level,
decoding raw event logs on Dune, and deep dives into Request Network and Gnosis Pay infrastructure.

---

## How to Regenerate the Documents

All study guides are generated programmatically using Node.js and the `docx` library.

```bash
# Install the docx library
npm install -g docx

# Generate Stage 1
node "stage 1/blockchain_doc.js"

# Generate Stage 2
node "stage 2/blockchain_stage2.js"

# Generate Stage 3
node "stage 3/blockchain_stage3.js"
```

---

## Related Portfolio Projects

- [Crypto Geopolitical Impact Analysis](https://github.com/sakicansev/crypto-geopolitical-analysis) — Iran–Israel–USA conflict effect on BTC and ETH prices
- [Telecom Customer Churn Analysis](https://github.com/sakicansev/telecom-churn-analysis) — Python, Pandas, Seaborn
- [Housing Price Prediction — MLR](https://github.com/sakicansev/housing-price-prediction-mlr) — Scikit-learn, regression
- [Personalized Ad Prediction — ML](https://github.com/sakicansev/personalized-ad-prediction) — Random Forest, Decision Trees

---

## Tools & Technologies

Python · SQL · SQLite · JavaScript · Node.js · Dune Analytics · Jupyter · Pandas · Matplotlib · Seaborn · SciPy
