/**
 * Table renderer compatibility module for Tepper & Bennett
 * 
 * This file is kept for backwards compatibility. 
 * The actual functionality is now handled by List.js in data-loader.js.
 */

// Export stub functions to prevent errors from older code still trying to call them
window.renderTable = function() {
  console.log('Legacy renderTable called - functionality now handled by List.js');
  // No-op - functionality handled by List.js
};

window.renderMobileList = function() {
  console.log('Legacy renderMobileList called - functionality now handled by List.js');
  // No-op - functionality handled by List.js
};

window.showTableError = function(message) {
  console.error('Table error:', message);
  // This could be forwarded to data-loader's error handler if needed
};

window.sortSonglist = function(songlist) {
  console.log('Legacy sortSonglist called - functionality now handled by List.js');
  return songlist; // Just return the data as-is
}; 