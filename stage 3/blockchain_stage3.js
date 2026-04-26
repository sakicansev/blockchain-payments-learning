const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, ExternalHyperlink,
  LevelFormat, HeadingLevel
} = require('docx');
const fs = require('fs');

const NAVY      = "2C3E6B";
const TEAL      = "1A7A8A";
const LIGHT_BLUE = "E8F4F8";
const LIGHT_GRAY = "F7F7F7";
const DARK      = "222222";
const MID_GRAY  = "555555";
const WHITE     = "FFFFFF";
const GREEN     = "1A6B3A";
const LIGHT_GREEN = "E8F5EE";
const AMBER     = "7F5700";
const LIGHT_AMBER = "FFF8E1";

const noBorder   = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
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

function threeColTable(headers, rows) {
  const w = [2400, 3313, 3313];
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
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Python Integration & Event Study Analysis \u2014 Stage 3 of 4", size: 24, font: "Arial", color: TEAL, italics: true })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Self-Directed Specialization in Crypto & Fintech Analytics", size: 20, font: "Arial", color: MID_GRAY, italics: true })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Author:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "Saki Cansev", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Background:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "BSc Economics, Ankara University  |  MSc Data Analytics, University for the Creative Arts", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Prerequisite:  ", bold: true, size: 20, font: "Arial", color: DARK }), new TextRun({ text: "Stage 2 \u2014 On-Chain Data Analysis with Dune Analytics (completed April 2026)", size: 20, font: "Arial", color: DARK })] }),
      new Paragraph({
        spacing: { before: 0, after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 1 } },
        children: [new TextRun({ text: "GitHub:  ", bold: true, size: 20, font: "Arial", color: DARK }),
          new ExternalHyperlink({ link: "https://github.com/sakicansev", children: [new TextRun({ text: "github.com/sakicansev", size: 20, font: "Arial", color: TEAL, underline: {} })] })]
      }),
      spacer(),

      // FOREWORD
      h1("Foreword"),
      body("Stage 2 of this program moved from conceptual understanding to contact with real data. By the end of it I had written ten SQL queries against live Ethereum blockchain data on Dune Analytics, published a public dashboard, and completed Query 10 \u2014 an original research query connecting USDC payment volume to the Iran\u2013Israel\u2013USA conflict escalation events I had already analyzed in the crypto geopolitical project. The most immediate finding was stark: USDC payment volume on Ethereum dropped 66% on October 7, 2023 \u2014 the day of the Hamas attack on Israel. Markets froze. The shock was directly visible in the payment data."),
      spacer(),
      body("Stage 3 converts that preliminary finding into a complete, reproducible research pipeline: pulling Dune query results programmatically into Python, merging on-chain payment data with the off-chain price data from the geopolitical project, and running a full event study across all nine conflict escalation events. The output is a Jupyter notebook pushed to GitHub as a standalone portfolio project."),
      spacer(),
      body("Stage 3 is where the two strands of this portfolio converge. The geopolitical analysis project measured price reactions to conflict events. This stage measures payment behavior reactions. Together they constitute a multi-asset, multi-metric event study of geopolitical shocks on crypto markets \u2014 a research contribution with genuine academic and industry relevance."),
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
        "This document covers five topics: the full environment setup including Terminal commands, " +
        "the Dune Analytics API and how to retrieve query results into Python, " +
        "the data loading and merging pipeline, the event study methodology and Python implementation, " +
        "three publication-quality visualisations with full code and result interpretation, " +
        "and the economic interpretation framework. " +
        "All code reflects what was actually run and verified during the Stage 3 session. " +
        "A self-assessment section at the end defines the criteria for progression to Stage 4."),
      spacer(),

      // SECTION 1
      h1("1. Environment Setup"),
      body("Before opening Jupyter, all required libraries must be installed in Terminal and the API key must be configured. This section covers the complete setup sequence."),
      spacer(),

      h3("1.1  Install All Required Libraries"),
      body("Run this single command in Terminal. It installs everything Stage 3 needs in one step:"),
      spacer(),
      code("pip install dune-client pandas numpy matplotlib seaborn scipy python-dotenv"),
      spacer(),

      callout("Terminal vs Notebook",
        "pip install commands go in Terminal \u2014 not in the notebook. " +
        "The notebook is for Python analysis code only. " +
        "Everything in Section 1 runs in Terminal before you open Jupyter. " +
        "Everything from Section 2 onward runs inside the notebook, cell by cell."),

      spacer(),

      h3("1.2  Create the .env File"),
      body("The .env file stores your API key so it never appears in your notebook code. Create it in your stage 3 folder using Terminal:"),
      spacer(),
      code("# Step 1: Navigate to your stage 3 folder"),
      code("cd /Users/sakicansev/Documents/blockchain-payments-learning/stage\\ 3"),
      code(""),
      code("# Step 2: Create the file"),
      code("touch .env"),
      code(""),
      code("# Step 3: Open it in the nano text editor"),
      code("nano .env"),
      code(""),
      code("# Step 4: Type this inside (replace with your actual key):"),
      code("DUNE_API_KEY=your_api_key_here"),
      code(""),
      code("# Step 5: Save and exit"),
      code("# Press Control+X, then Y, then Enter"),
      code(""),
      code("# Step 6: Add to .gitignore so it is never committed"),
      code("echo \".env\" >> .gitignore"),
      code(""),
      code("# Verify it was created correctly:"),
      code("cat .env"),
      spacer(),

      h3("1.3  Finding Your API Key on Dune"),
      body("The API key is located under Connect \u2192 API keys in the left sidebar of dune.com \u2014 not under account settings or the avatar menu. Click Connect in the sidebar, then API keys. Your key named blockchain-payments-project is listed there. Click the copy icon to copy the full key."),
      spacer(),

      callout("Security Rule",
        "Never paste your API key directly into a notebook or Python file. " +
        "Always load it from the .env file as shown below. " +
        "A key committed to GitHub, even briefly, should be treated as compromised and regenerated immediately.", "amber"),

      spacer(),

      // SECTION 2
      h1("2. The Dune Analytics API"),
      body("Dune Analytics provides an API that allows saved queries to be retrieved programmatically. The dune-client Python library wraps this API, handling authentication and returning results as a pandas DataFrame."),
      spacer(),

      h3("2.1  Loading the API Key in the Notebook"),
      body("This goes in the first code cell of your notebook. It loads the key from the .env file using python-dotenv:"),
      spacer(),
      code("from dotenv import load_dotenv"),
      code("import os"),
      code(""),
      code("load_dotenv()"),
      code("DUNE_API_KEY = os.getenv('DUNE_API_KEY')"),
      code(""),
      code("# Verify the key loaded correctly"),
      code("print(repr(DUNE_API_KEY))"),
      code("# Expected: a long string like '0CdwzDVCwupQW4pnMSemLVqvgsg2r9Uu'"),
      code("# If it prints None, the .env file was not found"),
      spacer(),

      h3("2.2  Finding Your Query ID"),
      body("Every saved query on Dune has a numeric ID visible in the URL. Your Query 10 URL is dune.com/queries/7365284 \u2014 the Query ID is 7365284. You will use this number directly in the Python call below."),
      spacer(),

      h3("2.3  Retrieving Query Results"),
      body("Use get_latest_result_dataframe() to fetch the cached result from the last time you ran the query in the browser. This does not trigger a new execution and does not consume credits."),
      spacer(),

      callout("Important: Use get_latest_result_dataframe(), Not run_query_dataframe()",
        "run_query_dataframe() triggers a fresh query execution via the /execute endpoint " +
        "and returns a 400 Bad Request error on the free plan. " +
        "get_latest_result_dataframe() retrieves the existing cached result \u2014 " +
        "it works on the free plan and requires no credit consumption. " +
        "Make sure you have run the query at least once in the Dune browser before calling this.", "amber"),

      spacer(),
      code("from dune_client.client import DuneClient"),
      code("from dune_client.query import QueryBase"),
      code(""),
      code("client = DuneClient(api_key=DUNE_API_KEY)"),
      code(""),
      code("# Fetch cached results \u2014 Query 10, ID 7365284"),
      code("results = client.get_latest_result_dataframe(7365284)"),
      code(""),
      code("print(results.head())"),
      code("print(results.dtypes)"),
      spacer(),
      body("Expected output:"),
      spacer(),
      code("                          date  transfer_count   usdc_volume"),
      code("0  2023-10-01 00:00:00.000 UTC           42852  2.698518e+09"),
      code("1  2023-10-02 00:00:00.000 UTC           61516  7.903753e+09"),
      code("2  2023-10-03 00:00:00.000 UTC           50597  6.157389e+09"),
      code("3  2023-10-04 00:00:00.000 UTC           56845  5.877146e+09"),
      code("4  2023-10-05 00:00:00.000 UTC           54382  5.200415e+09"),
      code("date               object"),
      code("transfer_count      int64"),
      code("usdc_volume       float64"),
      spacer(),
      body("936 rows covering October 2023 through April 2026 \u2014 2.5 years of daily USDC transfer data on Ethereum mainnet. The date column is object at this stage and will be parsed in the next step."),
      spacer(),

      h3("2.4  Save to CSV Immediately"),
      body("Always save the API result to a local CSV right after retrieval. This means the API is only called once \u2014 all subsequent runs load from the saved file:"),
      spacer(),
      code("results.to_csv('usdc_daily_volumes.csv', index=False)"),
      code("print('Saved.')"),
      spacer(),

      // SECTION 3
      h1("3. Data Loading and Merging"),
      body("With the USDC CSV saved and the SQLite database available from the companion project, load both datasets and merge them into a single analysis-ready DataFrame."),
      spacer(),

      h3("3.1  Load USDC Volume Data"),
      code("import pandas as pd"),
      code(""),
      code("df = pd.read_csv('usdc_daily_volumes.csv', parse_dates=['date'])"),
      code("df = df.sort_values('date').reset_index(drop=True)"),
      code(""),
      code("print(f'USDC data: {df.shape[0]} rows, {df.shape[1]} columns')"),
      code("print(f'Date range: {df.date.min()} to {df.date.max()}')"),
      code("print(df.dtypes)"),
      code("print(df.head())"),
      spacer(),
      body("Expected output: 936 rows, date parsed as datetime64[ns, UTC], transfer_count as int64, usdc_volume as float64."),
      spacer(),

      h3("3.2  Load BTC and ETH Price Data from SQLite"),
      body("The price database is in the companion geopolitical analysis project folder. Connect to it directly at its original path \u2014 no need to copy the file:"),
      spacer(),
      code("import sqlite3"),
      code(""),
      code("conn = sqlite3.connect("),
      code("    '/Users/sakicansev/Documents/crypto-geopolitical-analysis/crypto_geopolitical.db'"),
      code(")"),
      code(""),
      code("# Verify available tables"),
      code("tables = conn.execute("),
      code("    \"SELECT name FROM sqlite_master WHERE type='table'\""),
      code(").fetchall()"),
      code("print(tables)"),
      code("# Expected: [('crypto_prices',), ('geopolitical_events',)]"),
      code(""),
      code("prices = pd.read_sql("),
      code("    'SELECT Date, BTC_Close, ETH_Close FROM crypto_prices ORDER BY Date',"),
      code("    conn,"),
      code("    parse_dates=['Date']"),
      code(")"),
      code("prices['date'] = prices['Date'].dt.normalize()"),
      code("conn.close()"),
      code(""),
      code("print(f'Price data: {prices.shape[0]} days')"),
      code("print(prices.head())"),
      spacer(),
      body("Expected output: 917 days, columns Date / BTC_Close / ETH_Close / date. BTC starts at $27,983 on 2023-10-01 \u2014 the pre-conflict baseline."),
      spacer(),

      h3("3.3  Merge Both Datasets"),
      body("Before merging, the USDC date column must have its UTC timezone stripped. The price date column has no timezone. Pandas raises a ValueError if you try to merge datetime columns with mismatched timezone awareness \u2014 strip it with dt.tz_localize(None):"),
      spacer(),
      code("# Strip UTC timezone from USDC date before merging"),
      code("df['date'] = df['date'].dt.tz_localize(None)"),
      code(""),
      code("merged = pd.merge("),
      code("    df,"),
      code("    prices[['date', 'BTC_Close', 'ETH_Close']],"),
      code("    on='date',"),
      code("    how='inner'"),
      code(")"),
      code(""),
      code("print(f'Merged dataset: {merged.shape[0]} rows, {merged.shape[1]} columns')"),
      code("print(f'Columns: {merged.columns.tolist()}')"),
      code("print(merged.isnull().sum())"),
      code("print(merged.head())"),
      spacer(),
      body("Expected output: 917 rows (inner join on price data), 5 columns: date / transfer_count / usdc_volume / BTC_Close / ETH_Close. Zero null values \u2014 clean merge."),
      spacer(),

      h3("3.4  Verify the October 7 Data Point"),
      body("Before building the event study, confirm the key finding from Stage 2 Query 10 is present in the merged dataset:"),
      spacer(),
      code("oct_window = merged["),
      code("    (merged['date'] >= '2023-10-05') &"),
      code("    (merged['date'] <= '2023-10-09')"),
      code("]"),
      code("print(oct_window.to_string())"),
      spacer(),
      body("Expected output: October 7 shows 38,209 transfers and $2.24B volume, down from 54,835 transfers and $6.67B the day before \u2014 the 66% drop confirmed in Python. BTC was at $27,968 and ETH at $1,634 on the event day."),
      spacer(),

      // SECTION 4
      h1("4. The Event Study"),
      body("An event study measures the effect of a discrete event on an economic variable. For each of the nine conflict events, calculate percentage changes in USDC volume, BTC price, and ETH price over D+1, D+3, and D+7 windows from the event date (Brown & Warner, 1985)."),
      spacer(),

      h3("4.1  Define the Nine Conflict Events"),
      code("events = ["),
      code("    {'date': '2023-10-07', 'label': 'Hamas attacks Israel'},"),
      code("    {'date': '2024-04-01', 'label': 'Israel strikes Iranian consulate, Damascus'},"),
      code("    {'date': '2024-04-13', 'label': 'Iran launches 300+ drones at Israel'},"),
      code("    {'date': '2024-04-19', 'label': 'Israel retaliates near Isfahan'},"),
      code("    {'date': '2024-07-31', 'label': 'Assassination of Haniyeh in Tehran'},"),
      code("    {'date': '2024-10-01', 'label': 'Iran: 180 ballistic missiles at Israel'},"),
      code("    {'date': '2024-10-26', 'label': 'Israel largest direct strike on Iran'},"),
      code("    {'date': '2025-06-13', 'label': 'Twelve-Day War begins'},"),
      code("    {'date': '2026-02-28', 'label': 'US-Israel launch major strikes on Iran'},"),
      code("]"),
      code(""),
      code("events_df = pd.DataFrame(events)"),
      code("events_df['date'] = pd.to_datetime(events_df['date'])"),
      spacer(),

      h3("4.2  Event Window Function"),
      code("def event_window(df, event_date, column, windows=[1, 3, 7]):"),
      code("    base_row = df[df['date'] == event_date]"),
      code("    if base_row.empty:"),
      code("        return {w: None for w in windows}"),
      code("    base_val = base_row[column].values[0]"),
      code("    results = {}"),
      code("    for w in windows:"),
      code("        target_date = event_date + pd.Timedelta(days=w)"),
      code("        target_row = df[df['date'] == target_date]"),
      code("        if target_row.empty:"),
      code("            results[w] = None"),
      code("        else:"),
      code("            target_val = target_row[column].values[0]"),
      code("            results[w] = round("),
      code("                (target_val - base_val) / base_val * 100, 2"),
      code("            )"),
      code("    return results"),
      spacer(),

      h3("4.3  Build the Full Event Study Table"),
      code("rows = []"),
      code("for _, event in events_df.iterrows():"),
      code("    edate = event['date']"),
      code("    row = {'date': edate, 'event': event['label']}"),
      code("    for col, prefix in [('usdc_volume', 'usdc'),"),
      code("                        ('BTC_Close',   'btc'),"),
      code("                        ('ETH_Close',   'eth')]:"),
      code("        changes = event_window(merged, edate, col)"),
      code("        for w, val in changes.items():"),
      code("            row[f'{prefix}_d{w}'] = val"),
      code("    rows.append(row)"),
      code(""),
      code("event_study = pd.DataFrame(rows)"),
      code("print(event_study["),
      code("    ['date','event','usdc_d1','btc_d1','eth_d1']"),
      code("].to_string())"),
      spacer(),

      callout("What to Look For in the Results",
        "The October 7, 2023 row should show a large negative usdc_d1 value (the 66% drop). " +
        "The Haniyeh assassination (July 31, 2024) is expected to show the largest BTC/ETH drops " +
        "per EMH \u2014 it was the most unanticipated event. " +
        "Later events may show smaller reactions, consistent with the desensitisation hypothesis. " +
        "The February 2026 row may show a positive USDC value (the >$600B/week spike) " +
        "rather than a drop \u2014 the opposite behavioral response from October 2023.", "green"),

      spacer(),

      // SECTION 5
      h1("5. Visualisation"),
      body("Three charts complete the analysis. Each is saved as a PNG file to be committed to the figures folder in the repository."),
      spacer(),

      h3("5.1  Chart 1 \u2014 USDC Volume Timeline with Event Markers"),
      code("fig, ax = plt.subplots(figsize=(14, 5))"),
      code(""),
      code("ax.fill_between(merged['date'],"),
      code("                merged['usdc_volume'] / 1e9,"),
      code("                alpha=0.3, color='steelblue')"),
      code("ax.plot(merged['date'],"),
      code("        merged['usdc_volume'] / 1e9,"),
      code("        color='steelblue', linewidth=0.8)"),
      code(""),
      code("for _, event in events_df.iterrows():"),
      code("    ax.axvline(event['date'], color='crimson',"),
      code("               linewidth=1.2, linestyle='--', alpha=0.7)"),
      code(""),
      code("ax.set_title("),
      code("    'Daily USDC Transfer Volume on Ethereum\\n'"),
      code("    'with Iran\u2013Israel\u2013USA Conflict Events (Oct 2023 \u2013 Apr 2026)',"),
      code("    fontsize=13, fontweight='bold')"),
      code("ax.set_xlabel('Date')"),
      code("ax.set_ylabel('Volume (USD billions)')"),
      code("ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))"),
      code("plt.xticks(rotation=45)"),
      code("plt.tight_layout()"),
      code("plt.savefig('chart1_usdc_timeline.png', dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      spacer(),
      body("Look for: immediate trough at the first red line (October 7, 2023), large spike near the last line (February 2026), and a general upward baseline trend consistent with growing USDC adoption."),
      spacer(),

      h3("5.2  Chart 2 \u2014 Event Study Heatmap"),
      code("cols = ['usdc_d1', 'usdc_d3', 'usdc_d7',"),
      code("        'btc_d1',  'btc_d3',  'btc_d7',"),
      code("        'eth_d1',  'eth_d3',  'eth_d7']"),
      code(""),
      code("heatmap_data = event_study.set_index('event')[cols]"),
      code("col_labels = ["),
      code("    'USDC\\nD+1', 'USDC\\nD+3', 'USDC\\nD+7',"),
      code("    'BTC\\nD+1',  'BTC\\nD+3',  'BTC\\nD+7',"),
      code("    'ETH\\nD+1',  'ETH\\nD+3',  'ETH\\nD+7'"),
      code("]"),
      code(""),
      code("fig, ax = plt.subplots(figsize=(12, 7))"),
      code("sns.heatmap(heatmap_data.astype(float),"),
      code("            annot=True, fmt='.1f', center=0,"),
      code("            cmap='RdYlGn', linewidths=0.5,"),
      code("            xticklabels=col_labels, ax=ax)"),
      code("ax.set_title("),
      code("    'Event Study: % Change in USDC Volume, BTC & ETH\\n'"),
      code("    'Following Iran\u2013Israel\u2013USA Conflict Escalation Events',"),
      code("    fontsize=13, fontweight='bold')"),
      code("plt.tight_layout()"),
      code("plt.savefig('chart2_event_heatmap.png', dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      spacer(),
      body("Look for: matching colour direction across USDC and price columns (correlated behavior), darkest red in the Haniyeh row (EMH: largest unanticipated shock), lighter colours in later events (desensitisation)."),
      spacer(),

      h3("5.3  Chart 3 \u2014 Correlation Scatter"),
      code("fig, ax = plt.subplots(figsize=(8, 6))"),
      code(""),
      code("x = event_study['btc_d1'].dropna()"),
      code("y = event_study.loc[x.index, 'usdc_d1']"),
      code("labels = event_study.loc[x.index, 'event']"),
      code(""),
      code("ax.scatter(x, y, s=100, color='steelblue', zorder=5)"),
      code("for i, label in enumerate(labels):"),
      code("    ax.annotate(label[:28], (x.iloc[i], y.iloc[i]),"),
      code("                textcoords='offset points',"),
      code("                xytext=(6, 4), fontsize=8)"),
      code(""),
      code("slope, intercept, r, p, _ = stats.linregress(x, y)"),
      code("x_line = np.linspace(x.min(), x.max(), 100)"),
      code("ax.plot(x_line, slope * x_line + intercept,"),
      code("        color='crimson', linewidth=1.5, linestyle='--',"),
      code("        label=f'r = {r:.2f}, p = {p:.3f}')"),
      code(""),
      code("ax.axhline(0, color='gray', linewidth=0.8)"),
      code("ax.axvline(0, color='gray', linewidth=0.8)"),
      code("ax.set_xlabel('BTC Price Change D+1 (%)')"),
      code("ax.set_ylabel('USDC Volume Change D+1 (%)')"),
      code("ax.set_title('BTC Price vs USDC Payment Volume\\n'"),
      code("             'On Day of Conflict Escalation Events',"),
      code("             fontweight='bold')"),
      code("ax.legend()"),
      code("plt.tight_layout()"),
      code("plt.savefig('chart3_correlation.png', dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      code(""),
      code("print(f'Pearson r = {r:.3f}')"),
      code("print(f'p-value   = {p:.3f}')"),
      spacer(),
      body("If p < 0.05, the correlation between USDC volume change and BTC price change is statistically significant. State the r and p-value in your notebook Interpretation section and in the README. Note the small sample size (9 events) as a limitation."),
      spacer(),

      // SECTION 6
      h1("6. Economic Interpretation"),
      body("Charts and statistics are only as valuable as the economic reasoning attached to them. The sections below provide the interpretive framework for each major finding."),
      spacer(),

      h3("6.1  USDC Volume as a Payment Metric"),
      body("USDC transfer volume on Ethereum measures real transactional economic activity. Unlike BTC or ETH prices \u2014 which measure speculative sentiment \u2014 USDC volume measures how much value is actually moving between addresses for payment purposes. When it drops sharply on an event day, it means transactional demand collapsed. In Keynesian terms, liquidity preference increased \u2014 holders chose to hold rather than transact (Keynes, 1936). This is flight-to-safety behavior: the same phenomenon documented in traditional financial markets when uncertainty spikes."),
      spacer(),

      h3("6.2  The Desensitisation Hypothesis"),
      body("Test whether absolute USDC volume reactions decrease over time \u2014 evidence of market desensitisation to repeated conflict shocks (Berkman, Jacobsen & Lee, 2011):"),
      spacer(),
      code("abs_usdc = event_study[['date', 'event', 'usdc_d1']].copy()"),
      code("abs_usdc['abs_usdc_d1'] = abs_usdc['usdc_d1'].abs()"),
      code("abs_usdc = abs_usdc.sort_values('date')"),
      code("print(abs_usdc[['event', 'usdc_d1', 'abs_usdc_d1']].to_string())"),
      spacer(),
      body("If the absolute values trend downward chronologically, that is evidence consistent with desensitisation. State it as \u2018consistent with\u2019 rather than \u2018proves\u2019 \u2014 nine data points is a small sample."),
      spacer(),

      h3("6.3  Anticipated vs Unanticipated Events and EMH"),
      body("The Efficient Markets Hypothesis predicts that unanticipated events produce larger market reactions than anticipated ones (Fama, 1970). The Haniyeh assassination was unanticipated \u2014 an assassination inside Tehran far outside the expected retaliation pattern. If this row shows the largest drops across all metrics, that constitutes evidence consistent with EMH applied to crypto payment flows. Compare it against the anticipated events: the Iranian drone attack (April 13) and the Iranian missile attack (October 1), where markets had weeks to price in the possibility of retaliation."),
      spacer(),

      // SECTION 7
      h1("7. Notebook Structure and GitHub Checklist"),

      h3("7.1  Notebook Structure"),
      threeColTable(
        ["Section", "Content", "Cell Type"],
        [
          ["1. Introduction", "Research question, data sources, methodology, connection to companion project", "Markdown"],
          ["2. Setup", "Imports, load API key, verify key prints correctly", "Code + Markdown"],
          ["3. Data Retrieval", "get_latest_result_dataframe(), save to CSV", "Code + Markdown"],
          ["4. Data Loading", "Load CSV with parse_dates, load SQLite, strip timezone, merge", "Code + Markdown"],
          ["5. Verification", "Check Oct 7 data point in merged dataset", "Code + Markdown"],
          ["6. Event Definitions", "Nine events as DataFrame", "Code + Markdown"],
          ["7. Event Study", "event_window() function, event_study DataFrame", "Code + Markdown"],
          ["8. Chart 1", "USDC timeline with event markers", "Code + Markdown"],
          ["9. Chart 2", "Event study heatmap", "Code + Markdown"],
          ["10. Chart 3", "Correlation scatter with r and p-value", "Code + Markdown"],
          ["11. Desensitisation", "Absolute change trend over time", "Code + Markdown"],
          ["12. Interpretation", "Liquidity preference, EMH, desensitisation, Feb 2026 spike", "Markdown only"],
          ["13. Conclusion", "Key findings, limitations, further research", "Markdown only"],
          ["14. References", "APA citations for all theory invoked", "Markdown only"],
        ]
      ),
      spacer(),

      h3("7.2  GitHub Commit Checklist"),
      bullet("stage3_event_study.ipynb", " \u2014 all cells run, outputs visible"),
      bullet("usdc_daily_volumes.csv", " \u2014 Dune API export"),
      bullet("merged_dataset.csv", " \u2014 merged on-chain and off-chain data"),
      bullet("chart1_usdc_timeline.png", ""),
      bullet("chart2_event_heatmap.png", ""),
      bullet("chart3_correlation.png", ""),
      bullet(".gitignore", " \u2014 includes .env"),
      bullet("README.md updated", " \u2014 Stage 3 status Complete, notebook link added"),
      spacer(),

      // SELF CHECK
      h1("Self-Check \u2014 Stage 3 Completion Criteria"),
      bullet("Dune API called using get_latest_result_dataframe()", " \u2014 results retrieved as DataFrame and saved to CSV"),
      bullet("Timezone mismatch handled", " \u2014 dt.tz_localize(None) applied before merge"),
      bullet("Merged dataset: 917 rows, 5 columns, zero nulls", ""),
      bullet("October 7 data point verified", " \u2014 66% drop confirmed in Python"),
      bullet("event_study DataFrame complete", " \u2014 D+1, D+3, D+7 for all three metrics across all nine events"),
      bullet("All three charts saved as PNG", ""),
      bullet("Pearson r and p-value reported", ""),
      bullet("Notebook Markdown cells written", " \u2014 every code section preceded by explanation"),
      bullet("Economic interpretation complete", " \u2014 liquidity preference, EMH, desensitisation discussed"),
      bullet("All files committed and pushed", ""),
      spacer(),

      callout("Stage 4 Preview",
        "Stage 4 covers smart contract payment protocols in depth: " +
        "how ERC-20 token transfers work at the contract level, " +
        "what the Transfer event log structure looks like in raw form, " +
        "how payment protocols such as Request Network encode invoice data on-chain, " +
        "and how to write Dune queries that decode contract-level data rather than relying on Spell tables. " +
        "It is the final stage and the deepest level of technical specialization in this program.", "green"),

      spacer(),

      // REFERENCES
      h1("References"),
      spacer(),
      ref("Berkman, H., Jacobsen, B., & Lee, J. B. (2011). ", "Time-varying rare disaster risk and stock returns. Journal of Financial Economics, 101(2), 313\u2013332. "),
      ref("Brown, S. J., & Warner, J. B. (1985). ", "Using daily stock returns: The case of event studies. Journal of Financial Economics, 14(1), 3\u201331. "),
      ref("Circle Internet Financial. (2025). ", "USDC documentation. Circle Developer Portal. ", "https://developers.circle.com/stablecoins/docs/what-is-usdc"),
      ref("Dune Analytics. (2025). ", "Dune Analytics API documentation. ", "https://dune.com/docs/api"),
      ref("Ethereum Foundation. (2025). ", "ERC-20 token standard. Ethereum Improvement Proposals. ", "https://eips.ethereum.org/EIPS/eip-20"),
      ref("Fama, E. F. (1970). ", "Efficient capital markets: A review of theory and empirical work. The Journal of Finance, 25(2), 383\u2013417. "),
      ref("Keynes, J. M. (1936). ", "The general theory of employment, interest, and money. Macmillan. "),
      ref("MacKinlay, A. C. (1997). ", "Event studies in economics and finance. Journal of Economic Literature, 35(1), 13\u201339. "),
      ref("Nakamoto, S. (2008). ", "Bitcoin: A peer-to-peer electronic cash system. ", "https://bitcoin.org/bitcoin.pdf"),
      spacer(),

      // FOOTER
      new Paragraph({
        spacing: { before: 360, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        children: [new TextRun({ text: "Blockchain Payments \u2014 Stage 3 Study Guide  |  Saki Cansev  |  April 2026  |  github.com/sakicansev", size: 16, font: "Arial", color: MID_GRAY })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/Blockchain_Payments_Stage3.docx', buffer);
  console.log('Done.');
});
