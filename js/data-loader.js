/**
 * Utility for loading data from YAML files
 */

// Import js-yaml if in Node.js environment
let yaml;
if (typeof window === 'undefined') {
  // Node.js environment
  yaml = require('js-yaml');
  fs = require('fs');
  path = require('path');
}

/**
 * Load data from YAML file
 * 
 * In browser environment:
 * - Uses fetch API to load YAML files
 * - Requires js-yaml to be included via <script> tag
 * 
 * In Node.js environment:
 * - Uses fs.readFileSync to load YAML files
 * - Requires js-yaml module
 * 
 * @param {string} filename - Name of YAML file in the data directory
 * @returns {Promise<any>} - Promise resolving to parsed YAML data
 */
async function loadData(filename) {
  // Browser environment
  if (typeof window !== 'undefined') {
    try {
      // Ensure filename ends with .yml
      const ymlFile = filename.endsWith('.yml') ? filename : filename.replace('.json', '.yml');
      
      // Fetch the YAML file
      const response = await fetch(`/data/${ymlFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${ymlFile}: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Parse YAML text using js-yaml
      return window.jsyaml.load(text);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  } 
  // Node.js environment
  else {
    try {
      // Ensure filename ends with .yml
      const ymlFile = filename.endsWith('.yml') ? filename : filename.replace('.json', '.yml');
      const filePath = path.join(__dirname, '..', 'data', ymlFile);
      
      // Read and parse the YAML file
      const content = fs.readFileSync(filePath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }
}

// Export as module in Node.js environment or attach to window in browser
if (typeof window === 'undefined') {
  module.exports = { loadData };
} else {
  window.dataLoader = { loadData };
} 