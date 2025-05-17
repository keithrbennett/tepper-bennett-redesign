/**
 * Search handler compatibility module for Tepper & Bennett
 * 
 * This file is kept for backwards compatibility.
 * The actual search functionality is now handled by List.js in data-loader.js.
 */

// Export stub functions to prevent errors from older code still trying to call them
window.searchHandler = {
  initSearch: function() {
    console.log('Legacy initSearch called - functionality now handled by List.js');
  },
  performSearch: function() {
    console.log('Legacy performSearch called - functionality now handled by List.js');
  },
  resetSearch: function() {
    console.log('Legacy resetSearch called - functionality now handled by List.js');
    
    // Actually try to reset the search if List.js is available
    try {
      const searchInput = document.querySelector('#songlist-listjs-container .search');
      if (searchInput) {
        searchInput.value = '';
        // Trigger the search event
        searchInput.dispatchEvent(new Event('input'));
      }
    } catch (e) {
      console.error('Error resetting search:', e);
    }
  }
}; 