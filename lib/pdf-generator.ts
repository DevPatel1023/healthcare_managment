// Simple PDF generator using browser APIs
export function generatePDF(content: string, filename: string) {
  // Convert markdown-like content to HTML
  const htmlContent = convertMarkdownToHTML(content)

  // Create a blob with the HTML content
  const blob = new Blob(
    [
      `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 40px;
        }
        h1 {
          color: #2563eb;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        h2 {
          color: #4b5563;
          margin-top: 20px;
        }
        h3 {
          color: #6b7280;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `,
    ],
    { type: "text/html" },
  )

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Open the URL in a new tab
  const newWindow = window.open(url, "_blank")

  if (newWindow) {
    newWindow.document.title = filename

    // Add print button
    newWindow.onload = () => {
      const printButton = newWindow.document.createElement("button")
      printButton.innerText = "Print / Save as PDF"
      printButton.style.position = "fixed"
      printButton.style.top = "10px"
      printButton.style.right = "10px"
      printButton.style.padding = "8px 16px"
      printButton.style.backgroundColor = "#2563eb"
      printButton.style.color = "white"
      printButton.style.border = "none"
      printButton.style.borderRadius = "4px"
      printButton.style.cursor = "pointer"

      printButton.onclick = () => {
        printButton.style.display = "none"
        newWindow.print()
        printButton.style.display = "block"
      }

      newWindow.document.body.appendChild(printButton)
    }
  } else {
    alert("Please allow popups to view and download the PDF")
  }
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown: string): string {
  return (
    markdown
      // Headers
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      // Line breaks
      .replace(/\n/g, "<br>")
  )
}
