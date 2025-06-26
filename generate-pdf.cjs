const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

// Initialize markdown parser with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

// Custom CSS for professional PDF styling
const pdfStyles = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    font-size: 11px;
    background: white;
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm;
  }
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #d946ef;
    margin-bottom: 16px;
    text-align: center;
    border-bottom: 3px solid #d946ef;
    padding-bottom: 8px;
  }
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 20px 0 12px 0;
    border-left: 4px solid #d946ef;
    padding-left: 12px;
  }
  
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 16px 0 8px 0;
  }
  
  h4 {
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
    margin: 12px 0 6px 0;
  }
  
  p {
    margin-bottom: 8px;
    text-align: justify;
  }
  
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  code {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    padding: 2px 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #dc2626;
  }
  
  pre {
    background: #1f2937;
    color: #f9fafb;
    border-radius: 6px;
    padding: 12px;
    margin: 8px 0;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    line-height: 1.4;
  }
  
  pre code {
    background: none;
    border: none;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
  
  blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 12px;
    margin: 8px 0;
    font-style: italic;
    color: #6b7280;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 10px;
  }
  
  th, td {
    border: 1px solid #e5e7eb;
    padding: 6px 8px;
    text-align: left;
  }
  
  th {
    background: #f9fafb;
    font-weight: 600;
  }
  
  .badge {
    display: inline-block;
    background: #d946ef;
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 9px;
    font-weight: 500;
    margin: 2px;
  }
  
  .tech-stack {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
    margin: 8px 0;
  }
  
  .feature-box {
    background: linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%);
    border: 1px solid #e879f9;
    border-radius: 6px;
    padding: 8px;
    margin: 6px 0;
  }
  
  .warning-box {
    background: #fef3cd;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 8px;
    margin: 6px 0;
  }
  
  .info-box {
    background: #dbeafe;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    padding: 8px;
    margin: 6px 0;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .no-break {
    page-break-inside: avoid;
  }
  
  .center {
    text-align: center;
  }
  
  .footer {
    text-align: center;
    font-size: 9px;
    color: #6b7280;
    margin-top: 20px;
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
  }
  
  /* Remove emojis for cleaner PDF */
  .emoji {
    display: none;
  }
  
  /* Syntax highlighting for code blocks */
  .hljs-keyword { color: #c792ea; }
  .hljs-string { color: #c3e88d; }
  .hljs-number { color: #f78c6c; }
  .hljs-comment { color: #676e95; }
  .hljs-function { color: #82aaff; }
  .hljs-variable { color: #eeffff; }
  .hljs-type { color: #ffcb6b; }
  
  @media print {
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .no-break {
      page-break-inside: avoid;
    }
  }
</style>
`;

// Function to clean markdown content for PDF
function cleanMarkdownForPdf(content) {
  return content
    // Remove emoji patterns but keep text
    .replace(/🧁|🍰|⚛️|🔷|🎨|🧩|🔄|🛣️|📝|🎭|🚀|🗄️|🔧|🔐|📝|🌐|⚡|📦|🔄|🎨|📱|🌐|🔗|📁|👥|🛍️|👨‍🍳|🧑‍🍳|👑|🎂|💬|📊|🚀|🔒|🛡️|⚡|✅|🔍|🧪|🤝|🍴|🌿|💾|📤|🎯|📝|🌟|🔮|📱|🤖|🌍|💳|📦|🐛|📄|🙏|📞|📧|💬|📖/g, '')
    // Remove HTML align center divs
    .replace(/<div align="center">|<\/div>/g, '')
    // Remove shield badges
    .replace(/!\[.*?\]\(https:\/\/img\.shields\.io\/.*?\)/g, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove mermaid diagrams (not supported in PDF)
    .replace(/```mermaid[\s\S]*?```/g, '[System Architecture Diagram - See Digital Version]')
    // Clean up markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Function to generate cover page
function generateCoverPage() {
  return `
    <div class="page-break center">
      <div style="margin-top: 60px;">
        <h1 style="font-size: 36px; margin-bottom: 20px; border: none;">Bakery Bliss</h1>
        <h2 style="font-size: 24px; color: #6b7280; font-weight: 400; border: none; padding: 0;">Artisan Bakery Management System</h2>
        <h3 style="font-size: 18px; color: #9ca3af; font-weight: 300; margin-top: 30px;">Comprehensive Project Documentation</h3>
        
        <div style="margin: 40px 0;">
          <div class="tech-stack center">
            <h4>Technology Stack</h4>
            <p><span class="badge">React 18.2.0</span> <span class="badge">TypeScript 5.0</span> <span class="badge">Express.js 4.18</span></p>
            <p><span class="badge">PostgreSQL 15</span> <span class="badge">Tailwind CSS</span> <span class="badge">Drizzle ORM</span></p>
          </div>
        </div>
        
        <div style="margin-top: 80px;">
          <p style="font-size: 14px; color: #374151;"><strong>Project Duration:</strong> January 2025 - June 2025</p>
          <p style="font-size: 14px; color: #374151;"><strong>Development Type:</strong> Full-Stack Web Application</p>
          <p style="font-size: 14px; color: #374151;"><strong>Industry:</strong> Food Service & E-commerce</p>
        </div>
        
        <div style="margin-top: 60px;">
          <p style="font-size: 12px; color: #6b7280;">Prepared by: [Your Name]</p>
          <p style="font-size: 12px; color: #6b7280;">Date: June 27, 2025</p>
          <p style="font-size: 12px; color: #6b7280;">Institution: [Your University/College]</p>
        </div>
      </div>
    </div>
  `;
}

// Function to generate table of contents
function generateTableOfContents() {
  return `
    <div class="page-break">
      <h2>Table of Contents</h2>
      <div style="margin: 20px 0;">
        <p><strong>1. Executive Summary</strong> ......................................................... 3</p>
        <p><strong>2. Technology Stack Overview</strong> .................................................. 4</p>
        <p><strong>3. System Architecture</strong> ........................................................ 5</p>
        <p><strong>4. Key Features Implementation</strong> ................................................ 6</p>
        <p><strong>5. Development Process</strong> ........................................................ 8</p>
        <p><strong>6. Security Implementation</strong> ..................................................... 9</p>
        <p><strong>7. Database Design</strong> .......................................................... 10</p>
        <p><strong>8. Testing Strategy</strong> ......................................................... 11</p>
        <p><strong>9. Performance Metrics</strong> ...................................................... 12</p>
        <p><strong>10. Learning Outcomes</strong> ........................................................ 13</p>
        <p><strong>11. Future Scope & Enhancements</strong> .............................................. 14</p>
        <p><strong>12. Project Statistics</strong> ...................................................... 15</p>
        <p><strong>13. Installation & Setup Guide</strong> ............................................... 16</p>
        <p><strong>14. API Documentation</strong> ........................................................ 17</p>
        <p><strong>15. Conclusion</strong> ............................................................. 18</p>
      </div>
    </div>
  `;
}

async function generatePDF() {
  try {
    console.log('📄 Starting PDF generation...');
    
    // Install required packages
    console.log('📦 Installing required packages...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npm install --prefix . --package-lock-only puppeteer markdown-it highlight.js', { 
        stdio: 'inherit',
        cwd: __dirname 
      });
    } catch (error) {
      console.log('⚠️  Package installation failed, continuing with existing packages...');
    }
    
    // Read the markdown files
    const readmePath = path.join(__dirname, 'README.md');
    const reportPath = path.join(__dirname, 'PROJECT_REPORT.md');
    
    if (!fs.existsSync(readmePath) || !fs.existsSync(reportPath)) {
      throw new Error('README.md or PROJECT_REPORT.md not found!');
    }
    
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    
    console.log('📝 Processing markdown content...');
    
    // Clean and convert markdown to HTML
    const cleanedReadme = cleanMarkdownForPdf(readmeContent);
    const cleanedReport = cleanMarkdownForPdf(reportContent);
    
    const readmeHtml = md.render(cleanedReadme);
    const reportHtml = md.render(cleanedReport);
    
    // Generate complete HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bakery Bliss - Project Documentation</title>
        ${pdfStyles}
      </head>
      <body>
        ${generateCoverPage()}
        ${generateTableOfContents()}
        
        <div class="page-break">
          <h2>1. Project Overview (README)</h2>
          ${readmeHtml}
        </div>
        
        <div class="page-break">
          <h2>2. Comprehensive Project Report</h2>
          ${reportHtml}
        </div>
        
        <div class="footer">
          <p>Bakery Bliss - Artisan Bakery Management System | Generated on ${new Date().toLocaleDateString()}</p>
          <p>Confidential Project Documentation</p>
        </div>
      </body>
      </html>
    `;
    
    console.log('🚀 Launching Puppeteer...');
    
    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and generate PDF
    await page.setContent(fullHtml, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('📄 Generating PDF...');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #6b7280; width: 100%; text-align: center; margin-top: 10px;">
          Bakery Bliss - Project Documentation
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; color: #6b7280; width: 100%; text-align: center; margin-bottom: 10px;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });
    
    await browser.close();
    
    // Save PDF
    const outputPath = path.join(__dirname, 'Bakery_Bliss_Project_Documentation.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ PDF generated successfully!');
    console.log(`📁 File saved as: ${outputPath}`);
    console.log(`📊 File size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    throw error;
  }
}

// Run the PDF generation
if (require.main === module) {
  generatePDF()
    .then((outputPath) => {
      console.log('🎉 PDF generation completed successfully!');
      console.log(`📄 Your project documentation is ready: ${path.basename(outputPath)}`);
    })
    .catch((error) => {
      console.error('💥 PDF generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generatePDF };
