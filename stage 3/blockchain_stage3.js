const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, ExternalHyperlink,
  LevelFormat, HeadingLevel, TabStopType, TabStopPosition, PageBreak
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

function threeColTable(headers, rows) {
  const w = [2400, 3313, 3313];
  const total = 9026;
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
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: w, rows: [headerRow, ...dataRows] });
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

      // ── TITLE ──
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "BLOCKCHAIN PAYMENTS", bold: true, size: 52, font: "Arial", color: NAVY, allCaps: true, characterSpacing: 80 })]
      }),
      new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [new TextRun({ text: "Python Integration & Event Study Analysis — Stage 3 of 4", size: 24, font: "Arial", color: TEAL, italics: true })]
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
                   new TextRun({ text: "Stage 2 — On-Chain Data Analysis with Dune Analytics (completed April 2026)", size: 20, font: "Arial", color: DARK })]
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
      body("Stage 2 of this program moved from conceptual understanding to contact with real data. By the end of it I had written ten SQL queries against live Ethereum blockchain data on Dune Analytics, published a public dashboard, and completed Query 10 — an original research query connecting USDC payment volume to the Iran\u2013Israel\u2013USA conflict escalation events I had already analyzed in the crypto geopolitical project. The most immediate finding was stark: USDC payment volume on Ethereum dropped 66% on October 7, 2023 — the day of the Hamas attack on Israel. Markets froze. The shock was directly visible in the payment data."),
      spacer(),
      body("That result is compelling, but it is a single data point from a single event. It was produced by running a query manually in a browser. Stage 3 converts that preliminary finding into a complete, reproducible research pipeline: pulling Dune query results programmatically into Python, merging on-chain payment data with the off-chain price data from the geopolitical project, and running a full event study across all nine conflict escalation events. The output is a Jupyter notebook pushed to GitHub as a standalone, citable portfolio project."),
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
        "This document covers five topics: the Dune Analytics API and how to pull query results into Python, " +
        "the project folder structure and data loading pipeline, the event study methodology and Python implementation, " +
        "three publication-quality visualisations with full code, and the economic interpretation framework. " +
        "All code is written to run against the data already collected in Stages 1 and 2. " +
        "A self-assessment section at the end defines the criteria for progression to Stage 4."),

      spacer(),

      // ── SECTION 1 ──
      h1("1. From Browser SQL to Python Pipeline"),

      body("Stage 2 demonstrated that on-chain data is queryable and economically informative. The Dune Analytics browser interface is an excellent tool for exploration and dashboard publication. But it has a fundamental limitation for research purposes: every result is generated on demand, in a browser, and cannot be easily combined with other data sources. The 66% USDC volume drop on October 7, 2023 lives in a Dune result table. The BTC and ETH price data for the same event lives in a SQLite database on your local machine. To connect them you need Python."),
      spacer(),
      body("The Dune Analytics API solves this. It exposes every saved query as a REST endpoint, returning results as JSON that Python can read directly into a pandas DataFrame. Combined with the SQLite price data already built in the geopolitical analysis project, this enables a single unified dataset covering both on-chain payment flows and off-chain price behavior across the entire conflict timeline."),
      spacer(),

      callout("Why this matters for employers",
        "On-chain data pipelines in Python \u2014 not just browser-based SQL \u2014 are what analytics roles at crypto firms actually require. " +
        "A Dune dashboard demonstrates that you can query blockchain data. " +
        "A Python notebook that calls the Dune API, merges datasets, runs statistical analysis, and produces publication-quality charts " +
        "demonstrates that you can build a data product. The difference matters.", "green"),

      spacer(),

      h3("What Stage 3 Builds"),
      body("By the end of this stage the blockchain-payments-learning repository will contain a complete research notebook. Specifically:"),
      spacer(),
      bullet("Dune API integration", " \u2014 Query 10 results pulled programmatically into Python as a DataFrame"),
      bullet("Merged dataset", " \u2014 On-chain USDC payment data joined with off-chain BTC and ETH price data"),
      bullet("Event study table", " \u2014 Percentage changes across D+1, D+3, and D+7 windows for all nine conflict events"),
      bullet("Three charts", " \u2014 USDC volume timeline, event study heatmap, and correlation scatter with regression"),
      bullet("Economic interpretation", " \u2014 Liquidity preference, desensitisation hypothesis, and EMH applied to the findings"),
      bullet("Full Jupyter notebook", " \u2014 With Markdown cells explaining every analytical decision, committed to GitHub"),

      spacer(),

      // ── SECTION 2 ──
      h1("2. The Dune Analytics API"),

      body("Dune Analytics provides a REST API that allows saved queries to be executed programmatically and results retrieved as JSON. This means any query saved on your Dune account can be called from Python without opening a browser. The dune-client Python library wraps this API cleanly, handling authentication, execution, and result parsing automatically."),
      spacer(),

      h3("Getting Your API Key"),
      body("Your API key authenticates your Python requests to Dune. It is generated once and must be stored securely."),
      spacer(),
      bullet("Log in", " at dune.com"),
      bullet("Click your avatar (top right)", " \u2192 Settings \u2192 API"),
      bullet("Click Create API Key", " and name it blockchain-payments-project"),
      bullet("Copy the key immediately", " \u2014 it is only shown once"),
      spacer(),

      callout("Security Rule",
        "Never put your API key directly in a notebook or Python file. " +
        "Always load it from an environment variable or a .env file. " +
        "Add .env to your .gitignore before the first commit. " +
        "A key committed to GitHub, even briefly, should be treated as compromised and regenerated immediately.", "amber"),

      spacer(),
      body("Create a file called .env in your project folder:"),
      spacer(),
      code("DUNE_API_KEY=your_api_key_here"),
      spacer(),
      body("Load it in Python:"),
      spacer(),
      code("pip install python-dotenv"),
      code(""),
      code("from dotenv import load_dotenv"),
      code("import os"),
      code(""),
      code("load_dotenv()"),
      code("DUNE_API_KEY = os.getenv('DUNE_API_KEY')"),
      spacer(),

      h3("Installing the Dune Python Client"),
      body("Dune provides an official Python package that wraps the REST API:"),
      spacer(),
      code("pip install dune-client"),
      spacer(),
      body("The dune-client library handles authentication, query execution, waiting for results, and returning a pandas DataFrame. You do not need to write raw HTTP requests or parse JSON manually."),
      spacer(),

      h3("Finding Your Query ID"),
      body("Every query saved on Dune has a numeric Query ID visible in the URL. If your Query 10 URL is dune.com/queries/3847291, the Query ID is 3847291. Open your saved Query 10 in the browser and note this number before proceeding."),
      spacer(),

      h3("Executing a Saved Query from Python"),
      body("Basic execution pattern \u2014 type this manually into a new cell in your notebook:"),
      spacer(),
      code("from dune_client.client import DuneClient"),
      code("from dune_client.query import QueryBase"),
      code(""),
      code("client = DuneClient(api_key=DUNE_API_KEY)"),
      code(""),
      code("query = QueryBase(query_id=3847291)   # replace with your Query 10 ID"),
      code("results = client.run_query_dataframe(query)"),
      code(""),
      code("print(results.head())"),
      code("print(results.dtypes)"),
      spacer(),
      body("The run_query_dataframe() method returns a pandas DataFrame directly. Column names match the aliases in your SQL SELECT statement \u2014 so date, transfer_count, and usdc_volume are immediately available."),
      spacer(),

      callout("Execution Time",
        "Dune queries against full historical tables can take 30 to 120 seconds to run. " +
        "The client waits automatically. Do not interrupt the process \u2014 " +
        "it is retrieving 2.5 years of USDC transfer data from indexed blockchain tables. " +
        "If execution times out, split the date range into two queries and concatenate the results."),

      spacer(),

      h3("Saving Results Locally"),
      body("Always save the API result to a local CSV immediately after retrieval. This means you only call the API once \u2014 all subsequent work reads from the saved file. This is good practice for reproducibility and avoids hitting API rate limits on repeated runs."),
      spacer(),
      code("import pandas as pd"),
      code(""),
      code("# Save after first retrieval"),
      code("results.to_csv('data/usdc_daily_volumes.csv', index=False)"),
      code(""),
      code("# All subsequent runs read locally"),
      code("df = pd.read_csv('data/usdc_daily_volumes.csv',"),
      code("                 parse_dates=['date'])"),
      spacer(),

      // ── SECTION 3 ──
      h1("3. Project Structure and Data Loading"),

      body("Before writing analysis code, set up the folder structure. A clean structure makes the project readable to employers who open the repository and makes future work easier to build on."),
      spacer(),

      h3("Folder Structure"),
      body("Create the following inside your blockchain-payments-learning repository:"),
      spacer(),
      code("blockchain-payments-learning/"),
      code("  stage3/"),
      code("    data/"),
      code("      usdc_daily_volumes.csv       <- from Dune API"),
      code("      crypto_prices.db             <- your existing SQLite database"),
      code("    figures/"),
      code("      chart1_usdc_timeline.png"),
      code("      chart2_event_heatmap.png"),
      code("      chart3_correlation.png"),
      code("    notebooks/"),
      code("      stage3_event_study.ipynb"),
      code("    .env                           <- API key (gitignored)"),
      code("    .gitignore"),
      code("    requirements.txt"),
      spacer(),
      body("requirements.txt content:"),
      spacer(),
      code("dune-client"),
      code("pandas"),
      code("numpy"),
      code("matplotlib"),
      code("seaborn"),
      code("python-dotenv"),
      code("scipy"),
      spacer(),
      body(".gitignore content:"),
      spacer(),
      code(".env"),
      code("*.db"),
      code("__pycache__/"),
      code(".ipynb_checkpoints/"),
      spacer(),

      h3("Notebook Cell 1 \u2014 Imports and Configuration"),
      code("import pandas as pd"),
      code("import numpy as np"),
      code("import sqlite3"),
      code("import matplotlib.pyplot as plt"),
      code("import matplotlib.dates as mdates"),
      code("import seaborn as sns"),
      code("from scipy import stats"),
      code("import warnings"),
      code("warnings.filterwarnings('ignore')"),
      code(""),
      code("plt.style.use('seaborn-v0_8-whitegrid')"),
      code("sns.set_palette('husl')"),
      spacer(),

      h3("Notebook Cell 2 \u2014 Load USDC Volume Data"),
      code("usdc = pd.read_csv("),
      code("    '../data/usdc_daily_volumes.csv',"),
      code("    parse_dates=['date']"),
      code(")"),
      code("usdc = usdc.sort_values('date').reset_index(drop=True)"),
      code("usdc['date'] = usdc['date'].dt.normalize()"),
      code(""),
      code("print(f'USDC data: {usdc.shape[0]} days')"),
      code("print(f'Range: {usdc.date.min()} to {usdc.date.max()}')"),
      code("print(usdc.head())"),
      spacer(),

      h3("Notebook Cell 3 \u2014 Load Price Data from SQLite"),
      code("conn = sqlite3.connect('../data/crypto_prices.db')"),
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

      h3("Notebook Cell 4 \u2014 Merge Both Datasets"),
      code("df = pd.merge("),
      code("    usdc,"),
      code("    prices[['date', 'BTC_Close', 'ETH_Close']],"),
      code("    on='date',"),
      code("    how='inner'"),
      code(")"),
      code(""),
      code("print(f'Merged dataset: {df.shape[0]} days')"),
      code("print(df.isnull().sum())"),
      spacer(),

      callout("What to Check",
        "After merging, verify that the date range covers October 2023 through April 2026. " +
        "Any dates present in one dataset but not the other will be dropped by the inner join. " +
        "If the merged row count is significantly lower than either source dataset, " +
        "check that date formats are consistent \u2014 a common source of silent data loss in merge operations."),

      spacer(),

      // ── SECTION 4 ──
      h1("4. The Event Study"),

      body("An event study is a standard methodology in financial economics for measuring the effect of a specific event on an economic variable. The methodology was formalized by Brown and Warner (1985) and is used extensively to measure how asset prices respond to news announcements, earnings releases, regulatory decisions, and other discrete events."),
      spacer(),
      body("The structure is straightforward: define the event dates, choose measurement windows (how many days before and after each event to observe), calculate the change in your variable of interest across those windows, and test whether the changes are statistically distinguishable from normal variation. Applied here, the event dates are the nine conflict escalation events from the geopolitical project, and the variables of interest are USDC payment volume, BTC price, and ETH price."),
      spacer(),

      h3("Notebook Cell 5 \u2014 Define the Nine Conflict Events"),
      code("events = ["),
      code("    {'date': '2023-10-07',"),
      code("     'label': 'Hamas attacks Israel'},"),
      code("    {'date': '2024-04-01',"),
      code("     'label': 'Israel strikes Iranian consulate, Damascus'},"),
      code("    {'date': '2024-04-13',"),
      code("     'label': 'Iran launches 300+ drones at Israel'},"),
      code("    {'date': '2024-04-19',"),
      code("     'label': 'Israel retaliates near Isfahan'},"),
      code("    {'date': '2024-07-31',"),
      code("     'label': 'Assassination of Haniyeh in Tehran'},"),
      code("    {'date': '2024-10-01',"),
      code("     'label': 'Iran: 180 ballistic missiles at Israel'},"),
      code("    {'date': '2024-10-26',"),
      code("     'label': 'Israel largest direct strike on Iran'},"),
      code("    {'date': '2025-06-13',"),
      code("     'label': 'Twelve-Day War begins'},"),
      code("    {'date': '2026-02-28',"),
      code("     'label': 'US-Israel launch major strikes on Iran'},"),
      code("]"),
      code(""),
      code("events_df = pd.DataFrame(events)"),
      code("events_df['date'] = pd.to_datetime(events_df['date'])"),
      spacer(),

      h3("Notebook Cell 6 \u2014 Event Window Function"),
      body("For each event, calculate how each variable changed over three windows: D+1 (the day of the event), D+3, and D+7. Using multiple windows allows you to distinguish immediate shock from sustained impact."),
      spacer(),
      code("def event_window(df, event_date, column, windows=[1, 3, 7]):"),
      code("    \"\"\""),
      code("    Percentage change from event_date over multiple windows."),
      code("    Returns dict of {window: pct_change}."),
      code("    \"\"\""),
      code("    base_row = df[df['date'] == event_date]"),
      code("    if base_row.empty:"),
      code("        return {w: None for w in windows}"),
      code("    base_val = base_row[column].values[0]"),
      code(""),
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

      h3("Notebook Cell 7 \u2014 Build the Full Event Study Table"),
      code("rows = []"),
      code("for _, event in events_df.iterrows():"),
      code("    edate = event['date']"),
      code("    row = {'date': edate, 'event': event['label']}"),
      code(""),
      code("    for col, prefix in [('usdc_volume', 'usdc'),"),
      code("                        ('BTC_Close',   'btc'),"),
      code("                        ('ETH_Close',   'eth')]:"),
      code("        changes = event_window(df, edate, col)"),
      code("        for w, val in changes.items():"),
      code("            row[f'{prefix}_d{w}'] = val"),
      code(""),
      code("    rows.append(row)"),
      code(""),
      code("event_study = pd.DataFrame(rows)"),
      code("print(event_study["),
      code("    ['date','event','usdc_d1','btc_d1','eth_d1']"),
      code("].to_string())"),
      spacer(),

      callout("Expected Output",
        "You should see nine rows with percentage changes for USDC volume, BTC price, and ETH price on the day of each event. " +
        "The October 7, 2023 row should show a large negative USDC value \u2014 " +
        "confirming in Python the same 66% drop you first observed in the Dune browser query. " +
        "Seeing the same result through two independent methods is methodological verification.", "green"),

      spacer(),

      // ── SECTION 5 ──
      h1("5. Visualisation"),

      body("Three charts complete the analysis. Each communicates a distinct aspect of the findings and together they constitute the visual evidence for the economic interpretation in Section 6. All three should be saved as PNG files in stage3/figures/ and committed to the repository."),
      spacer(),

      h3("Chart 1 \u2014 USDC Volume Timeline with Event Markers"),
      body("This chart shows the full 2.5-year USDC daily volume series with vertical dashed lines marking each of the nine conflict events. It gives any reader immediate visual context for how payment volume behaved across the entire conflict period and makes anomalies visible before any statistical analysis."),
      spacer(),
      code("fig, ax = plt.subplots(figsize=(14, 5))"),
      code(""),
      code("ax.fill_between(df['date'],"),
      code("                df['usdc_volume'] / 1e9,"),
      code("                alpha=0.3, color='steelblue')"),
      code("ax.plot(df['date'],"),
      code("        df['usdc_volume'] / 1e9,"),
      code("        color='steelblue', linewidth=0.8)"),
      code(""),
      code("for _, event in events_df.iterrows():"),
      code("    ax.axvline(event['date'], color='crimson',"),
      code("               linewidth=1.2, linestyle='--', alpha=0.7)"),
      code(""),
      code("ax.set_title("),
      code("    'Daily USDC Transfer Volume on Ethereum\\n'"),
      code("    'with Iran\u2013Israel\u2013USA Conflict Events (Oct 2023 \u2013 Apr 2026)',"),
      code("    fontsize=13, fontweight='bold'"),
      code(")"),
      code("ax.set_xlabel('Date')"),
      code("ax.set_ylabel('Volume (USD billions)')"),
      code("ax.xaxis.set_major_formatter("),
      code("    mdates.DateFormatter('%b %Y')"),
      code(")"),
      code("plt.xticks(rotation=45)"),
      code("plt.tight_layout()"),
      code("plt.savefig('../figures/chart1_usdc_timeline.png',"),
      code("            dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      spacer(),

      h3("What Chart 1 Shows"),
      body("Look for two features. First, the immediate dip at the October 7, 2023 line \u2014 the volume collapse your Query 10 first identified should be clearly visible as a trough in the time series. Second, the March 2026 spike corresponding to the US-Israel strikes on Iran, which your Query 5 stablecoin comparison already showed as above USD 600 billion in a single week. Both anomalies should stand out without any annotation."),
      spacer(),

      h3("Chart 2 \u2014 Event Study Heatmap"),
      body("This chart shows percentage changes for all three metrics (USDC volume, BTC price, ETH price) across all nine events and three time windows (D+1, D+3, D+7). Green cells indicate increases; red cells indicate decreases. It is the most information-dense chart in the study and the one most likely to be shared with or referenced by employers."),
      spacer(),
      code("cols = ['usdc_d1', 'usdc_d3', 'usdc_d7',"),
      code("        'btc_d1',  'btc_d3',  'btc_d7',"),
      code("        'eth_d1',  'eth_d3',  'eth_d7']"),
      code(""),
      code("heatmap_data = event_study.set_index('event')[cols]"),
      code(""),
      code("col_labels = ["),
      code("    'USDC\\nD+1', 'USDC\\nD+3', 'USDC\\nD+7',"),
      code("    'BTC\\nD+1',  'BTC\\nD+3',  'BTC\\nD+7',"),
      code("    'ETH\\nD+1',  'ETH\\nD+3',  'ETH\\nD+7'"),
      code("]"),
      code(""),
      code("fig, ax = plt.subplots(figsize=(12, 7))"),
      code("sns.heatmap("),
      code("    heatmap_data.astype(float),"),
      code("    annot=True, fmt='.1f', center=0,"),
      code("    cmap='RdYlGn', linewidths=0.5,"),
      code("    xticklabels=col_labels, ax=ax"),
      code(")"),
      code("ax.set_title("),
      code("    'Event Study: % Change in USDC Volume, BTC & ETH\\n'"),
      code("    'Following Iran\u2013Israel\u2013USA Conflict Escalation Events',"),
      code("    fontsize=13, fontweight='bold'"),
      code(")"),
      code("ax.set_ylabel('')"),
      code("plt.tight_layout()"),
      code("plt.savefig('../figures/chart2_event_heatmap.png',"),
      code("            dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      spacer(),

      h3("What Chart 2 Shows"),
      body("Read the heatmap event by event. You are looking for three patterns. First, whether USDC volume and price react in the same direction \u2014 confirming that payment behavior and speculative sentiment moved together. Second, whether the magnitude of reactions decreases as events progress chronologically \u2014 evidence of market desensitisation. Third, whether the Haniyeh assassination row shows the largest drops across all metrics \u2014 consistent with the surprise premium identified in the geopolitical project."),
      spacer(),

      h3("Chart 3 \u2014 Correlation Scatter: USDC Volume vs BTC Price Change"),
      body("This chart tests the core economic hypothesis: do on-chain payment flows and crypto prices move together during geopolitical shocks? Each point represents one of the nine events. The x-axis shows BTC price change on the event day (D+1); the y-axis shows USDC volume change. A regression line with r and p-value determines whether the relationship is statistically significant."),
      spacer(),
      code("fig, ax = plt.subplots(figsize=(8, 6))"),
      code(""),
      code("x = event_study['btc_d1'].dropna()"),
      code("y = event_study.loc[x.index, 'usdc_d1']"),
      code("labels = event_study.loc[x.index, 'event']"),
      code(""),
      code("ax.scatter(x, y, s=100, color='steelblue', zorder=5)"),
      code(""),
      code("for i, label in enumerate(labels):"),
      code("    ax.annotate("),
      code("        label[:28],"),
      code("        (x.iloc[i], y.iloc[i]),"),
      code("        textcoords='offset points',"),
      code("        xytext=(6, 4), fontsize=8"),
      code("    )"),
      code(""),
      code("slope, intercept, r, p, _ = stats.linregress(x, y)"),
      code("x_line = np.linspace(x.min(), x.max(), 100)"),
      code("ax.plot("),
      code("    x_line, slope * x_line + intercept,"),
      code("    color='crimson', linewidth=1.5,"),
      code("    linestyle='--',"),
      code("    label=f'r = {r:.2f}, p = {p:.3f}'"),
      code(")"),
      code(""),
      code("ax.axhline(0, color='gray', linewidth=0.8)"),
      code("ax.axvline(0, color='gray', linewidth=0.8)"),
      code("ax.set_xlabel('BTC Price Change D+1 (%)')"),
      code("ax.set_ylabel('USDC Volume Change D+1 (%)')"),
      code("ax.set_title("),
      code("    'BTC Price vs USDC Payment Volume\\n'"),
      code("    'On Day of Conflict Escalation Events',"),
      code("    fontweight='bold'"),
      code(")"),
      code("ax.legend()"),
      code("plt.tight_layout()"),
      code("plt.savefig('../figures/chart3_correlation.png',"),
      code("            dpi=150, bbox_inches='tight')"),
      code("plt.show()"),
      spacer(),
      body("The r value is the Pearson correlation coefficient. An r close to +1 means USDC volume and BTC price moved together strongly; close to -1 means they moved in opposite directions; close to 0 means no linear relationship. The p-value tells you whether the correlation is statistically significant. If p < 0.05, the relationship is unlikely to be due to chance. Report both values in your notebook and in the README."),
      spacer(),

      // ── SECTION 6 ──
      h1("6. Economic Interpretation"),

      body("Charts and statistics are only as valuable as the economic reasoning attached to them. Your background in economics is the differentiator here \u2014 most on-chain analysts can run a query and make a chart. Fewer can situate the findings within established economic theory and draw rigorous, qualified conclusions. The sections below provide the interpretive framework for each major finding."),
      spacer(),

      h3("6.1  What USDC Volume Actually Measures"),
      body("USDC transfer volume on Ethereum is a proxy for real transactional economic activity. Unlike BTC or ETH price \u2014 which measure speculative sentiment and investment demand \u2014 USDC volume measures how much value is actually moving between addresses for payment purposes. It is closer in concept to M1 money supply velocity than to an asset price."),
      spacer(),
      body("When USDC volume drops sharply on an event day, the interpretation is not simply that markets were frightened. It means that transactional demand collapsed: fewer actors were willing to initiate payments. In Keynesian terms, liquidity preference increased \u2014 holders chose to hold rather than transact (Keynes, 1936). This is flight-to-safety behavior: the same phenomenon documented in traditional financial markets when uncertainty spikes. Your data provides blockchain-native evidence of the same behavioral response."),
      spacer(),

      h3("6.2  The Desensitisation Hypothesis"),
      body("The geopolitical analysis project found progressive market desensitisation: later conflict events produced smaller price reactions than the initial shock. Test whether the same pattern holds for USDC volume. In your event_study DataFrame, take the absolute value of usdc_d1 for each event in chronological order:"),
      spacer(),
      code("abs_usdc = event_study[['date','event','usdc_d1']].copy()"),
      code("abs_usdc['abs_usdc_d1'] = abs_usdc['usdc_d1'].abs()"),
      code("abs_usdc = abs_usdc.sort_values('date')"),
      code("print(abs_usdc[['event','abs_usdc_d1']].to_string())"),
      spacer(),
      body("If the absolute values trend downward from October 2023 toward February 2026, that is evidence consistent with market desensitisation: repeated exposure to the same type of shock reduced the behavioral response over time. This phenomenon is documented in traditional finance literature on war and financial markets (Berkman, Jacobsen & Lee, 2011)."),
      spacer(),

      callout("Epistemic Precision",
        "Nine data points is a small sample. Do not overstate the conclusion. " +
        "Write 'consistent with the desensitisation hypothesis' rather than 'proves desensitisation.' " +
        "Note the small sample limitation explicitly in your notebook. " +
        "This qualification is not weakness \u2014 it is what distinguishes rigorous analysis from commentary, " +
        "and experienced readers will notice and respect it.", "amber"),

      spacer(),

      h3("6.3  Anticipated vs Unanticipated Events"),
      body("The geopolitical project found that the Haniyeh assassination (July 31, 2024) caused the largest price drops: BTC -6.10%, ETH -10.15%. The Efficient Markets Hypothesis predicts exactly this result. Markets had already priced in the possibility of Iranian retaliation after months of escalation \u2014 but an assassination of a senior Hamas political leader inside Tehran was unanticipated. Unanticipated information generates the largest market moves (Fama, 1970)."),
      spacer(),
      body("Does USDC volume show the same asymmetry? Compare the Haniyeh assassination row against the anticipated retaliation events: the Iranian drone attack on April 13 and the Iranian missile attack on October 1. If unanticipated events produce larger absolute volume changes than anticipated ones, that constitutes additional evidence consistent with EMH applied to crypto payment flows. This is a novel empirical contribution \u2014 the application of event study methodology with the anticipated/unanticipated distinction to on-chain payment data has not been systematically done in the published literature."),
      spacer(),

      h3("6.4  The March 2026 Spike"),
      body("Your Query 5 stablecoin comparison identified a USDC volume spike above USD 600 billion in the week following the US-Israel strikes on Iran in February 2026. This is the opposite reaction from October 7, 2023. Instead of a collapse, there was a surge. The economic interpretation requires more than just noting the direction: consider whether this reflects panic capital movement (holding USDC as a stable store of value during uncertainty), settlement of large positions, or institutional rebalancing following a geopolitical shock at a very different point in the market cycle than 2023. The data alone cannot resolve this \u2014 but framing the competing hypotheses is exactly the analytical work a senior reader expects."),
      spacer(),

      // ── SECTION 7 ──
      h1("7. Writing the Notebook"),

      body("A Jupyter notebook submitted as a portfolio project is a research document, not a code file with occasional comments. Every code cell should be preceded by a Markdown cell that explains what the cell does, why it does it, and what the reader should look for in the output. The code demonstrates that you can execute the analysis. The Markdown demonstrates that you understand it."),
      spacer(),

      h3("Notebook Structure"),
      threeColTable(
        ["Section", "Content", "Cell Type"],
        [
          ["1. Introduction", "Research question, dataset sources, methodology overview, connection to companion project", "Markdown"],
          ["2. Data Loading", "Import libraries, load USDC CSV and SQLite price data, merge datasets", "Code + Markdown"],
          ["3. Descriptive Statistics", "Summary stats for USDC volume and prices across the full period", "Code + Markdown"],
          ["4. Event Definitions", "Nine conflict events defined as DataFrame", "Code + Markdown"],
          ["5. Event Window Analysis", "event_window() function, event_study DataFrame, print results", "Code + Markdown"],
          ["6. Chart 1 \u2014 Timeline", "USDC volume with event markers", "Code + Markdown"],
          ["7. Chart 2 \u2014 Heatmap", "Event study across all metrics and windows", "Code + Markdown"],
          ["8. Chart 3 \u2014 Scatter", "Correlation with regression line and p-value", "Code + Markdown"],
          ["9. Economic Interpretation", "Liquidity preference, desensitisation, EMH, March 2026 spike", "Markdown only"],
          ["10. Conclusion", "Key findings, limitations, further research directions", "Markdown only"],
          ["11. References", "APA citations for all economic theory invoked", "Markdown only"],
        ]
      ),
      spacer(),

      h3("Writing the Introduction"),
      body("The Introduction Markdown cell should be three paragraphs. First: the research question \u2014 what does this study ask and why does it matter? Second: the data \u2014 where it comes from, what time period it covers, what its limitations are (single chain, mainnet only, no L2 USDC included). Third: the connection to the companion project \u2014 how this extends the crypto-geopolitical-analysis findings from price reactions to payment behavior reactions."),
      spacer(),

      h3("Tone and Audience"),
      body("Write as if the reader is a senior analyst at a crypto data firm who will evaluate both your technical execution and your analytical reasoning. Do not explain basic Python syntax \u2014 they know pandas. Do explain your analytical decisions: why D+1, D+3, D+7 windows; why Pearson correlation; what theory predicts before you show what the data shows. The Introduction and Economic Interpretation sections should read like the discussion section of a research paper, not like code comments."),
      spacer(),

      // ── SECTION 8 ──
      h1("8. GitHub Commit Checklist"),

      body("Before marking Stage 3 complete, all of the following must be committed and pushed to the blockchain-payments-learning repository:"),
      spacer(),
      bullet("stage3/notebooks/stage3_event_study.ipynb", " \u2014 complete notebook with all cells run and outputs visible"),
      bullet("stage3/data/usdc_daily_volumes.csv", " \u2014 the Dune API export"),
      bullet("stage3/figures/chart1_usdc_timeline.png", ""),
      bullet("stage3/figures/chart2_event_heatmap.png", ""),
      bullet("stage3/figures/chart3_correlation.png", ""),
      bullet("stage3/requirements.txt", ""),
      bullet(".gitignore", " \u2014 must include .env"),
      bullet("README.md updated", " \u2014 Stage 3 status changed to Complete, notebook link added"),
      spacer(),

      callout("Commit Message Convention",
        "Use descriptive commit messages: " +
        "'Add Stage 3 event study notebook with Dune API integration' " +
        "rather than 'update' or 'fix'. " +
        "Employers and technical interviewers frequently look at commit history. " +
        "A clean, descriptive history signals professional working practice."),

      spacer(),

      // ── SELF CHECK ──
      h1("Self-Check \u2014 Stage 3 Completion Criteria"),

      body("Before progressing to Stage 4, all of the following must be true:"),
      spacer(),
      bullet("Dune API called from Python", " \u2014 Query 10 results retrieved as a DataFrame and saved to CSV"),
      bullet("Merged dataset built", " \u2014 USDC volume and BTC/ETH price on the same dates"),
      bullet("event_study DataFrame complete", " \u2014 D+1, D+3, D+7 changes for all three metrics across all nine events"),
      bullet("All three charts saved as PNG", " \u2014 render correctly and tell a coherent visual story"),
      bullet("Pearson r and p-value stated", " \u2014 for USDC volume vs BTC price change correlation"),
      bullet("Notebook Markdown cells written", " \u2014 every code section preceded by explanation"),
      bullet("Economic interpretation section complete", " \u2014 liquidity preference, desensitisation, EMH discussed"),
      bullet("All files committed and pushed", " \u2014 notebook outputs visible on GitHub"),
      spacer(),

      callout("Stage 4 Preview",
        "Stage 4 covers smart contract payment protocols in depth: " +
        "how ERC-20 token transfers work at the contract level, " +
        "what the Transfer event log structure looks like in raw form, " +
        "how payment protocols such as Request Network encode invoice data on-chain, " +
        "and how to write Dune queries that decode contract-level data rather than relying on Spell tables. " +
        "It is the final stage and the deepest level of technical specialization in this program.", "green"),

      spacer(),

      // ── REFERENCES ──
      h1("References"),
      spacer(),
      ref("Berkman, H., Jacobsen, B., & Lee, J. B. (2011). ", "Time-varying rare disaster risk and stock returns. ", "https://doi.org/10.1016/j.jfineco.2011.02.015"),
      ref("Brown, S. J., & Warner, J. B. (1985). ", "Using daily stock returns: The case of event studies. Journal of Financial Economics, 14(1), 3\u201331. "),
      ref("Circle Internet Financial. (2025). ", "USDC documentation. Circle Developer Portal. ", "https://developers.circle.com/stablecoins/docs/what-is-usdc"),
      ref("Dune Analytics. (2025). ", "Dune Analytics API documentation. ", "https://dune.com/docs/api"),
      ref("Ethereum Foundation. (2025). ", "ERC-20 token standard. Ethereum Improvement Proposals. ", "https://eips.ethereum.org/EIPS/eip-20"),
      ref("Fama, E. F. (1970). ", "Efficient capital markets: A review of theory and empirical work. The Journal of Finance, 25(2), 383\u2013417. "),
      ref("Keynes, J. M. (1936). ", "The general theory of employment, interest, and money. Macmillan. "),
      ref("MacKinlay, A. C. (1997). ", "Event studies in economics and finance. Journal of Economic Literature, 35(1), 13\u201339. "),
      ref("Nakamoto, S. (2008). ", "Bitcoin: A peer-to-peer electronic cash system. ", "https://bitcoin.org/bitcoin.pdf"),
      spacer(),

      // ── FOOTER ──
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
  console.log('Stage 3 document created.');
});
