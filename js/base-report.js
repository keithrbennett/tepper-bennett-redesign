/**
 * Base Report Class for Tepper & Bennett website
 * JavaScript equivalent of Rails BaseReport
 */


class BaseReport {
  constructor(reportType) {
    this.reportType = reportType;
    this.records = [];
    this.data = null;
  }

  async populate() {
    throw new Error('populate() method must be implemented in subclass');
  }

  content(format) {
    const formatHandlers = {
      'html': () => this.toHTML(),
      'text': () => this.toText(),
      'json': () => this.toJSON(),
      'yaml': () => this.toYAML()
    };

    const handler = formatHandlers[format];
    if (!handler) {
      throw new Error(`Unsupported format: ${format}`);
    }

    return handler();
  }

  toHTML() {
    throw new Error('toHTML() method must be implemented in subclass');
  }

  toText() {
    throw new Error('toText() method must be implemented in subclass');
  }

  toJSON() {
    return `<pre><code>${JSON.stringify(this.records, null, 2)}</code></pre>`;
  }

  toYAML() {
    return `<pre><code>${this.convertToYAML(this.records)}</code></pre>`;
  }

  async loadDataFromYAML(fileName) {
    try {
      const response = await fetch(`data/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const yamlText = await response.text();
      return this.parseYAML(yamlText);
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      throw error;
    }
  }

  parseYAML(yamlText) {
    // Simple YAML parser for our specific format
    const lines = yamlText.split('\n');
    const result = [];
    let currentObject = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- code:')) {
        if (currentObject) {
          result.push(currentObject);
        }
        currentObject = {
          code: trimmedLine.split(':')[1].trim()
        };
      } else if (trimmedLine.startsWith('name:')) {
        if (currentObject) {
          currentObject.name = trimmedLine.split(':')[1].trim();
        }
      } else if (trimmedLine.startsWith('movie:')) {
        if (currentObject) {
          currentObject.movie = trimmedLine.split(':')[1].trim();
        }
      } else if (trimmedLine.startsWith('genres:')) {
        if (currentObject) {
          currentObject.genres = [];
        }
      } else if (trimmedLine.startsWith('- ') && currentObject && currentObject.genres) {
        currentObject.genres.push(trimmedLine.substring(2).trim());
      }
    }

    if (currentObject) {
      result.push(currentObject);
    }

    return result;
  }

  convertToYAML(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    
    if (Array.isArray(obj)) {
      return obj.map(item => `${spaces}- ${this.convertToYAML(item, indent + 1)}`).join('\n');
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${spaces}${key}:\n${this.convertToYAML(value, indent + 1)}`;
          } else {
            return `${spaces}${key}: ${value}`;
          }
        })
        .join('\n');
    } else {
      return obj.toString();
    }
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  createTable(data, columnHeaders, tableId = '') {
    const idAttr = tableId ? ` id="${tableId}"` : '';
    
    let html = `<table${idAttr} class="min-w-full divide-y divide-gray-200 border border-gray-200">`;
    
    // Header
    html += '<thead class="bg-gray-50"><tr>';
    columnHeaders.forEach(header => {
      html += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">${header}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody class="bg-white divide-y divide-gray-200">';
    data.forEach((row, index) => {
      html += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">`;
      if (Array.isArray(row)) {
        row.forEach(cell => {
          html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200">${this.escapeHTML(cell?.toString() || '')}</td>`;
        });
      } else {
        columnHeaders.forEach(header => {
          const cellValue = row[header.toLowerCase().replace(/\s+/g, '_')] || row[header.toLowerCase()] || '';
          html += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200">${this.escapeHTML(cellValue.toString())}</td>`;
        });
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  }
}