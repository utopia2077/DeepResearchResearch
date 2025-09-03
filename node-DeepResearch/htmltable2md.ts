/**
 * Converts HTML tables in a markdown string to markdown tables
 * @param mdString The markdown string containing potential HTML tables
 * @returns The markdown string with HTML tables converted to markdown tables, or the original string if no conversions were made
 */
export function convertHtmlTablesToMd(mdString: string): string {
    try {
      let result = mdString;
  
      // First check for HTML tables with any attributes
      if (mdString.includes('<table')) {
        // Regular expression to find HTML tables with any attributes
        // This matches <table> as well as <table with-any-attributes>
        const tableRegex = /<table(?:\s+[^>]*)?>([\s\S]*?)<\/table>/g;
        let match;
  
        // Process each table found
        while ((match = tableRegex.exec(mdString)) !== null) {
          const htmlTable = match[0];
          const convertedTable = convertSingleHtmlTableToMd(htmlTable);
  
          if (convertedTable) {
            result = result.replace(htmlTable, convertedTable);
          }
        }
      }
  
      return result;
    } catch (error) {
      logError('Error converting HTML tables to Markdown:', { error });
      return mdString; // Return original string if conversion fails
    }
  }
  
  /**
   * Converts a single HTML table to a markdown table
   * @param htmlTable The HTML table string
   * @returns The markdown table string or null if conversion fails
   */
  function convertSingleHtmlTableToMd(htmlTable: string): string | null {
    try {
      // Create a DOM parser to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlTable, 'text/html');
      const table = doc.querySelector('table');
  
      if (!table) {
        return null;
      }
  
      // Extract headers
      const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => sanitizeCell(th.textContent || ''));
  
      // Check if headers were found
      if (headers.length === 0) {
        // Try to find headers in the first row of tbody
        const firstRow = table.querySelector('tbody tr');
        if (firstRow) {
          headers.push(...Array.from(firstRow.querySelectorAll('td, th'))
            .map(cell => sanitizeCell(cell.textContent || '')));
        }
      }
  
      if (headers.length === 0) {
        return null; // No headers found, can't create a valid markdown table
      }
  
      // Start building the markdown table
      let mdTable = '';
  
      // Add the header row
      mdTable += '| ' + headers.join(' | ') + ' |\n';
  
      // Add the separator row
      mdTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
      // Add the data rows
      const rows = Array.from(table.querySelectorAll('tbody tr'));
  
      for (const row of rows) {
        // Skip the first row if it was used for headers
        if (table.querySelector('thead') === null && row === rows[0]) {
          continue;
        }
  
        const cells = Array.from(row.querySelectorAll('td'))
          .map(td => {
            // Check for markdown content in the cell
            const cellContent = td.innerHTML;
            let processedContent = cellContent;
  
            // Detect if the cell contains markdown formatting
            const containsMarkdown =
              cellContent.includes('**') ||
              cellContent.includes('*   ') ||
              cellContent.includes('*  ') ||
              cellContent.includes('* ');
  
            if (containsMarkdown) {
              // Handle mixed HTML and Markdown
  
              // Handle lists inside cells (both ordered and unordered)
              if (cellContent.includes('* ') || cellContent.includes('*  ') || cellContent.includes('*   ')) {
                // Extract list items, handling both HTML list structures or markdown-style lists
                let listItems = [];
  
                if (td.querySelectorAll('li').length > 0) {
                  // Handle HTML lists
                  listItems = Array.from(td.querySelectorAll('li'))
                    .map(li => li.innerHTML.trim());
                } else {
                  // Handle markdown-style lists with asterisks
                  const lines = cellContent.split('\n');
                  for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.match(/^\s*\*\s+/)) {
                      listItems.push(trimmedLine.replace(/^\s*\*\s+/, ''));
                    }
                  }
                }
  
                // Format as bullet points with line breaks
                processedContent = listItems.map(item => `• ${item}`).join('<br>');
  
                // Preserve markdown formatting like bold and italic within list items
                processedContent = processedContent
                  .replace(/\*\*(.*?)\*\*/g, '**$1**')  // Preserve bold
                  .replace(/_(.*?)_/g, '_$1_');         // Preserve italic
              } else {
                // For cells without lists but with markdown, preserve the markdown formatting
                processedContent = cellContent
                  .replace(/<\/?strong>/g, '**')  // Convert HTML bold to markdown
                  .replace(/<\/?em>/g, '_')       // Convert HTML italic to markdown
                  .replace(/<\/?b>/g, '**')       // Convert HTML bold to markdown
                  .replace(/<\/?i>/g, '_')        // Convert HTML italic to markdown
                  .replace(/<br\s*\/?>/g, '<br>') // Preserve line breaks as <br> tags
                  .replace(/<p\s*\/?>/g, '')      // Remove opening paragraph tags
                  .replace(/<\/p>/g, '<br>');     // Convert closing paragraph tags to line breaks
              }
            } else {
              // For regular HTML cells without markdown
              processedContent = processedContent
                .replace(/<\/?strong>/g, '**')  // Bold
                .replace(/<\/?em>/g, '_')       // Italic
                .replace(/<\/?b>/g, '**')       // Bold
                .replace(/<\/?i>/g, '_')        // Italic
                .replace(/<br\s*\/?>/g, '<br>') // Preserve line breaks as <br> tags
                .replace(/<p\s*\/?>/g, '')      // Opening paragraph tags
                .replace(/<\/p>/g, '<br>');     // Convert closing paragraph tags to line breaks
            }
  
            // Strip any remaining HTML tags, but preserve markdown syntax and <br> tags
            processedContent = processedContent
              .replace(/<(?!\/?br\b)[^>]*>/g, '') // Remove all HTML tags except <br>
              .trim();
  
            return sanitizeCell(processedContent);
          });
  
        // Ensure each row has the same number of cells as headers
        while (cells.length < headers.length) {
          cells.push('');
        }
  
        mdTable += '| ' + cells.join(' | ') + ' |\n';
      }
  
      return mdTable;
    } catch (error) {
      logError('Error converting single HTML table:', { error });
      return null;
    }
  }
  
  /**
   * Sanitizes a cell's content for use in a markdown table
   * @param content The cell content
   * @returns Sanitized content
   */
  function sanitizeCell(content: string): string {
    // Trim whitespace
    let sanitized = content.trim();
  
    // Normalize pipe characters in content (escape them)
    sanitized = sanitized.replace(/\|/g, '\\|');
  
    // Preserve line breaks
    sanitized = sanitized.replace(/\n/g, '<br>');
  
    // Keep existing <br> tags intact (don't escape them)
    sanitized = sanitized.replace(/&lt;br&gt;/g, '<br>');
  
    // Preserve markdown formatting
    sanitized = sanitized
      .replace(/\\\*\\\*/g, '**')  // Fix escaped bold markers
      .replace(/\\\*/g, '*')       // Fix escaped list markers
      .replace(/\\_/g, '_');       // Fix escaped italic markers
  
    return sanitized;
  }
  