const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

async function generatePDF() {
  try {
    // Read the markdown file
    const markdownPath = path.join(__dirname, 'BAKERY_BLISS_PROJECT_DOCUMENTATION.md');
    const markdownContent = fs.readFileSync(markdownPath, 'utf8');
    
    // Convert markdown to HTML
    const htmlContent = marked(markdownContent);
    
    // Create full HTML document with styling
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bakery Bliss - Project Documentation</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
            margin-top: 25px;
        }
        
        h3 {
            color: #2c3e50;
            margin-top: 20px;
        }
        
        h4 {
            color: #7f8c8d;
            margin-top: 15px;
        }
        
        code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e74c3c;
        }
        
        pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            margin: 15px 0;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
            color: #2c3e50;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            margin: 15px 0;
            padding-left: 20px;
            background-color: #f8f9fa;
            padding: 10px 20px;
        }
        
        ul, ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 5px 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .highlight {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 10px;
            margin: 10px 0;
        }
        
        strong {
            color: #2c3e50;
        }
        
        em {
            color: #7f8c8d;
        }
        
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 25px 0;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15mm;
            }
            
            h1, h2 {
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
</html>
    `;
    
    // Launch Puppeteer
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666;">
          Bakery Bliss - Project Documentation
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; margin: 0 auto; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      printBackground: true
    });
    
    // Save PDF
    const outputPath = path.join(__dirname, 'BAKERY_BLISS_PROJECT_DOCUMENTATION.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    await browser.close();
    
    console.log(`PDF generated successfully: ${outputPath}`);
    console.log(`File size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Run the function
generatePDF();
