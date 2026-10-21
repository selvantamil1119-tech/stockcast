import fs from 'fs';
import path from 'path';

const mdPath = path.resolve('/Users/_itzztamil_/fsd/PROJECT_REPORT.md');
const htmlPath = path.resolve('/Users/_itzztamil_/fsd/PROJECT_REPORT.html');

const mdContent = fs.readFileSync(mdPath, 'utf-8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Report - Tamil Selvan V (310624243196)</title>
  <!-- Marked.js for Markdown parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- Mermaid.js for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- MathJax for rendering LaTeX math formulas -->
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    @page {
      size: A4;
      margin: 25mm 25mm 25mm 25mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    h1, h2, h3, h4 {
      font-family: 'Times New Roman', Times, serif;
      font-weight: bold;
      color: #000;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h2 {
      font-size: 14pt;
      text-transform: uppercase;
      border-bottom: 1.5px solid #333;
      padding-bottom: 4px;
      margin-top: 32px;
    }
    h3 {
      font-size: 12pt;
    }
    p {
      text-align: justify;
      margin-bottom: 12px;
      text-indent: 2em;
    }
    .no-indent, .center-text p, blockquote p, table p {
      text-indent: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #444;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    pre, code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
    }
    pre {
      padding: 14px;
      overflow-x: auto;
      line-height: 1.4;
      margin: 16px 0;
    }
    code {
      padding: 2px 5px;
    }
    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 30px 0;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
      height: 0;
      display: block;
    }
    .center-text {
      text-align: center;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 20px;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .no-print {
        display: none;
      }
    }
    .print-btn-bar {
      position: fixed;
      top: 15px;
      right: 20px;
      background: #0284c7;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      border: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .print-btn-bar:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <button class="print-btn-bar no-print" onclick="window.print()">
    🖨️ Print / Save as PDF (Cmd + P)
  </button>
  <div id="content"></div>

  <script>
    const rawMd = ${JSON.stringify(mdContent)};
    
    // Replace markdown pagebreaks with HTML pagebreak elements
    const processedMd = rawMd.replace(/\\\\newpage/g, '<div class="page-break"></div>');
    
    document.getElementById('content').innerHTML = marked.parse(processedMd);
    
    // Initialize Mermaid diagrams
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
  </script>
</body>
</html>
`;

fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('Successfully generated HTML report at:', htmlPath);
