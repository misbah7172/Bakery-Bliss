const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

async function generatePDF() {
  try {
    console.log('📄 Starting PDF generation for SRS-Bakery-Bliss...');
    
    // Read the markdown file
    const markdownPath = path.join(__dirname, 'SRS-Bakery-Bliss.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    // Configure marked for better PDF output
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });
    
    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);
    
    // Create full HTML document with styling
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Software Requirements Specification - Bakery Bliss</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 2.2em;
            page-break-before: always;
        }
        
        h1:first-of-type {
            page-break-before: auto;
        }
        
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.8em;
        }
        
        h3 {
            color: #2c3e50;
            margin-top: 25px;
            margin-bottom: 12px;
            font-size: 1.4em;
        }
        
        h4 {
            color: #34495e;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin-left: 25px;
            margin-bottom: 15px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        code {
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e74c3c;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #3498db;
            margin: 15px 0;
            overflow-x: auto;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: #2c3e50;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 0.95em;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
        }
        
        th {
            background-color: #3498db;
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #f8f9fa;
            font-style: italic;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            border: 2px solid #3498db;
            border-radius: 10px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .document-header h1 {
            border: none;
            margin: 0;
            color: #2c3e50;
        }
        
        .document-header h2 {
            border: none;
            margin: 5px 0;
            color: #3498db;
            font-size: 1.3em;
        }
        
        .document-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            border-left: 4px solid #3498db;
        }
        
        .toc {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .toc ul {
            list-style-type: none;
            margin-left: 0;
        }
        
        .toc a {
            text-decoration: none;
            color: #3498db;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .diagram-space {
            border: 2px dashed #bdc3c7;
            padding: 40px;
            margin: 20px 0;
            text-align: center;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        
        .diagram-space em {
            color: #7f8c8d;
            font-style: normal;
            font-weight: 500;
        }
        
        .requirement {
            background-color: #f8f9fa;
            border-left: 4px solid #27ae60;
            padding: 10px 15px;
            margin: 10px 0;
            border-radius: 0 5px 5px 0;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        @page {
            size: A4;
            margin: 2cm;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15mm;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    
    // Launch Puppeteer
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for fonts to load
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    console.log('📄 Generating PDF...');
    
    // Generate PDF with professional settings
    const pdfPath = path.join(__dirname, 'SRS-Bakery-Bliss.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 5mm 0;">
          <span>Software Requirements Specification - Bakery Bliss</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; padding: 5mm 0;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> | Team Anonymous | ${new Date().toLocaleDateString()}</span>
        </div>
      `
    });
    
    await browser.close();
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 Location: ${pdfPath}`);
    console.log('📊 File size:', (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2), 'MB');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

// Run the PDF generation
generatePDF();
