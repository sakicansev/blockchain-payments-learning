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
| Stage 3 | Python Integration & Event Study Analysis | ✅ Complete |
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

## Stage 3 — Python Integration & Event Study Analysis ✅

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

**Key findings:**
- The largest single-day USDC payment freeze was **-74.7%** on April 19, 2024 (Israeli strike near Isfahan) — larger than the October 7, 2023 Hamas attack (+10.2% D+1)
- Two events show a **delayed surge pattern**: Israel's largest direct strike on Iran (+246.4% D+3) and the Hamas attack (+163.4% D+3) — consistent with a two-phase behavioral response: immediate freeze followed by capital repositioning
- The Haniyeh assassination produced **divergent behavior**: USDC volume rose (+5.8% D+1) while BTC fell -6.1% at D+3 and ETH fell -27.7% at D+7 — consistent with within-crypto flight-to-stability
- The February 2026 US-Israel strikes produced a **~$370B single-day spike** — qualitatively different from all prior events, suggesting a structural market regime change between 2023 and 2026
- Pearson **r = -0.41, p = 0.276** between BTC price change and USDC volume change — negative but not statistically significant at n=9; consistent with flight-to-stability behavior

**Dune Query 10:**
👉 [Geopolitical Impact on USDC Payment Flows](https://dune.com/queries/7365284)

**Note on data files:**  
The analysis notebook connects to the SQLite database from the companion project at:  
`/Users/sakicansev/Documents/crypto-geopolitical-analysis/crypto_geopolitical.db`  
To run this notebook, clone both repositories and update the database path in Cell 6 to match your local path. The USDC volume CSV (`usdc_daily_volumes.csv`) is included in this repository and requires no additional setup.

**Files:**
- 📄 [`Blockchain_Payments_Stage3.pdf`](Blockchain_Payments_Stage3.pdf) — read in browser
- 📝 [`stage 3/Blockchain_Payments_Stage3.docx`](<stage 3/Blockchain_Payments_Stage3.docx>) — Word document
- 💻 [`stage 3/blockchain_stage3.js`](<stage 3/blockchain_stage3.js>) — Node.js script that generated the document
- 📓 [`stage 3/stage3_event_study.ipynb`](<stage 3/stage3_event_study.ipynb>) — completed analysis notebook

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
