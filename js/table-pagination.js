/**
 * Table pagination compatibility module for Tepper & Bennett
 * 
 * This file is kept for backwards compatibility.
 * The actual pagination functionality is now handled by List.js in data-loader.js.
 */

// Export stub functions to prevent errors from older code still trying to call them
window.tablePagination = {
  initPagination: function() {
    console.log('Legacy initPagination called - functionality now handled by List.js');
  },
  updateDesktopPagination: function() {
    console.log('Legacy updateDesktopPagination called - functionality now handled by List.js');
  },
  updateMobilePagination: function() {
    console.log('Legacy updateMobilePagination called - functionality now handled by List.js');
  },
  resetPagination: function() {
    console.log('Legacy resetPagination called - functionality now handled by List.js');
  },
  updateFilteredData: function() {
    console.log('Legacy updateFilteredData called - functionality now handled by List.js');
  },
  getCurrentDesktopPage: function() { return 0; },
  getDesktopRowsPerPage: function() { return 15; },
  getCurrentMobilePage: function() { return 0; },
  getMobileRowsPerPage: function() { return 10; },
  initRowsPerPageControl: function() {
    console.log('Legacy initRowsPerPageControl called - functionality now handled by List.js');
  },
  changeRowsPerPage: function() {
    console.log('Legacy changeRowsPerPage called - functionality now handled by List.js');
  }
}; 