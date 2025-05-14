/**
 * Debug script for Tepper & Bennett
 * Provides tools to diagnose YAML loading issues
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('%c=== Starting diagnostics ===', 'font-weight: bold; color: blue;');
  
  // Check js-yaml availability
  if (window.jsyaml) {
    console.log('%c✓ js-yaml is loaded', 'color: green;', window.jsyaml.version ? `(version: ${window.jsyaml.version})` : '');
  } else {
    console.error('%c✗ js-yaml is not loaded', 'color: red; font-weight: bold;');
  }
  
  // Intercept fetch calls to monitor requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('.yml')) {
      console.log('%cFETCH YAML: ' + url, 'color: blue; font-weight: bold;');
    }
    
    // Call the original fetch
    return originalFetch.apply(this, arguments)
      .then(response => {
        // Log responses for YAML files
        if (typeof url === 'string' && url.includes('.yml')) {
          const status = response.status;
          const ok = response.ok;
          console.log(
            `%cYAML RESPONSE: ${url} - ${status} ${ok ? '✓' : '✗'}`,
            `color: ${ok ? 'green' : 'red'}; font-weight: bold;`
          );
          
          // Clone response because it can only be consumed once
          return response.clone();
        }
        return response;
      })
      .catch(error => {
        if (typeof url === 'string' && url.includes('.yml')) {
          console.error('%cYAML FETCH ERROR: ' + url, 'color: red; font-weight: bold;', error);
        }
        throw error;
      });
  };
  
  // Add a test button to the page
  const debugButton = document.createElement('button');
  debugButton.textContent = 'Test YAML';
  debugButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 z-50';
  debugButton.onclick = function() {
    // Test loading a YAML file directly
    fetch('./data/song-plays.yml')
      .then(response => {
        console.log('%cDirect test: Response received', 'color: blue;', response.status, response.ok);
        return response.text();
      })
      .then(text => {
        console.log('%cDirect test: Content received', 'color: blue;', `${text.length} characters`);
        try {
          const data = window.jsyaml.load(text);
          console.log('%cDirect test: Parsing successful', 'color: green;', data.length, 'items');
          
          // Show a success message
          alert(`YAML loading successful: ${data.length} songs`);
        } catch (e) {
          console.error('%cDirect test: Parsing error', 'color: red;', e);
          alert(`YAML parsing error: ${e.message}`);
        }
      })
      .catch(error => {
        console.error('%cDirect test: Error', 'color: red;', error);
        alert(`YAML loading error: ${error.message}`);
      });
  };
  document.body.appendChild(debugButton);
  
  console.log('%c=== Initial diagnostics complete ===', 'font-weight: bold; color: blue;');
});