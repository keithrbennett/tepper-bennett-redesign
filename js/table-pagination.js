/**
 * Table pagination functionality for Tepper & Bennett
 * Manages pagination controls for song tables
 */

// Pagination configuration - get from global config or use defaults
let DESKTOP_ROWS_PER_PAGE = (window.tbConfig && window.tbConfig.pagination && window.tbConfig.pagination.desktop) 
  ? window.tbConfig.pagination.desktop.defaultRowsPerPage 
  : 15;
  
const MOBILE_ROWS_PER_PAGE = (window.tbConfig && window.tbConfig.pagination && window.tbConfig.pagination.mobile) 
  ? window.tbConfig.pagination.mobile.defaultRowsPerPage 
  : 10;

console.log('Table pagination initialized with:', { desktop: DESKTOP_ROWS_PER_PAGE, mobile: MOBILE_ROWS_PER_PAGE });

// Current page state
let currentDesktopPage = 0;
let currentMobilePage = 0;

// Store filtered data reference
let filteredSongData = null;

/**
 * Initialize pagination functionality
 * @param {Array} songData - The initial song data
 */
function initPagination(songData) {
  // Store reference to song data
  filteredSongData = songData;
  
  // Initialize pagination elements
  initDesktopPagination();
  initMobilePagination();
  
  // Initialize rows per page control
  initRowsPerPageControl();
}

/**
 * Initialize rows per page dropdown
 */
function initRowsPerPageControl() {
  console.log('Initializing rows per page controls, default value:', DESKTOP_ROWS_PER_PAGE);
  
  // Get all rows-per-page selectors using class
  const selectors = Array.from(document.querySelectorAll('.rows-per-page-select'));
  
  // If we have valid selectors, set them up
  if (selectors.length > 0) {
    console.log(`Found ${selectors.length} rows-per-page selectors`);
    
    // Get the default value from config
    const defaultValue = (window.tbConfig && window.tbConfig.pagination && window.tbConfig.pagination.desktop) 
      ? window.tbConfig.pagination.desktop.defaultRowsPerPage 
      : DESKTOP_ROWS_PER_PAGE;
    
    // Set initial values for all selectors
    selectors.forEach(selector => {
      console.log('Setting selector value to:', defaultValue);
      selector.value = defaultValue.toString();
    });
    
    // Add change event listener to each selector
    selectors.forEach(selector => {
      selector.addEventListener('change', function() {
        const newRowsPerPage = parseInt(this.value, 10);
        console.log('Rows per page changed to:', newRowsPerPage);
        
        // Update all other selectors to match
        selectors.forEach(otherSelector => {
          if (otherSelector !== this) {
            otherSelector.value = newRowsPerPage.toString();
          }
        });
        
        // Change the rows per page
        changeRowsPerPage(newRowsPerPage);
      });
    });
  } else {
    console.warn('No rows-per-page selectors found');
    
    // Try to create the selectors dynamically if they don't exist
    const paginationContainers = document.querySelectorAll('.pagination');
    
    if (paginationContainers.length > 0) {
      console.log('Found pagination containers, attempting to create rows-per-page controls');
      
      // Force the table-renderer to redraw the tables, which will create the selectors
      if (window.filteredSongData && typeof window.renderTable === 'function') {
        console.log('Triggering table redraw to create pagination controls');
        window.renderTable(window.filteredSongData);
        
        // Try again to find selectors after redraw
        setTimeout(() => {
          const newSelectors = Array.from(document.querySelectorAll('.rows-per-page-select'));
          if (newSelectors.length > 0) {
            console.log(`Created ${newSelectors.length} rows-per-page selectors successfully`);
            initRowsPerPageControl(); // Re-initialize with the new selectors
          }
        }, 100);
      }
    }
  }
}

/**
 * Change the number of rows per page
 * @param {number} newRowsPerPage - The new number of rows per page
 */
function changeRowsPerPage(newRowsPerPage) {
  if (!isNaN(newRowsPerPage) && newRowsPerPage > 0) {
    // Calculate current position to maintain approximate scroll position
    const currentPosition = currentDesktopPage * DESKTOP_ROWS_PER_PAGE;
    
    // Update rows per page
    DESKTOP_ROWS_PER_PAGE = newRowsPerPage;
    
    // Calculate new page based on current position
    currentDesktopPage = Math.floor(currentPosition / DESKTOP_ROWS_PER_PAGE);
    
    // Re-render the table with new pagination
    if (filteredSongData && window.renderTable) {
      window.renderTable(filteredSongData);
    }
  }
}

/**
 * Initialize desktop pagination controls
 */
function initDesktopPagination() {
  // Lower desktop pagination elements
  const desktopPrevButton = document.getElementById('desktop-prev-page');
  const desktopNextButton = document.getElementById('desktop-next-page');
  const desktopFirstButton = document.getElementById('desktop-first-page');
  const desktopLastButton = document.getElementById('desktop-last-page');
  
  // Upper desktop pagination elements
  const upperDesktopPrevButton = document.getElementById('upper-desktop-prev-page');
  const upperDesktopNextButton = document.getElementById('upper-desktop-next-page');
  const upperDesktopFirstButton = document.getElementById('upper-desktop-first-page');
  const upperDesktopLastButton = document.getElementById('upper-desktop-last-page');
  
  // Add event listeners for lower desktop pagination
  if (desktopPrevButton && desktopNextButton) {
    desktopPrevButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage--;
        window.renderTable(filteredSongData);
      }
    });
    
    desktopNextButton.addEventListener('click', () => {
      if (filteredSongData && (currentDesktopPage + 1) * DESKTOP_ROWS_PER_PAGE < filteredSongData.length) {
        currentDesktopPage++;
        window.renderTable(filteredSongData);
      }
    });
  }
  
  // Add event listeners for lower first and last page buttons
  if (desktopFirstButton && desktopLastButton) {
    desktopFirstButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage = 0;
        window.renderTable(filteredSongData);
      }
    });
    
    desktopLastButton.addEventListener('click', () => {
      if (filteredSongData) {
        const lastPage = Math.max(0, Math.ceil(filteredSongData.length / DESKTOP_ROWS_PER_PAGE) - 1);
        if (currentDesktopPage !== lastPage) {
          currentDesktopPage = lastPage;
          window.renderTable(filteredSongData);
        }
      }
    });
  }
  
  // Add event listeners for upper desktop pagination
  if (upperDesktopPrevButton && upperDesktopNextButton) {
    upperDesktopPrevButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage--;
        window.renderTable(filteredSongData);
      }
    });
    
    upperDesktopNextButton.addEventListener('click', () => {
      if (filteredSongData && (currentDesktopPage + 1) * DESKTOP_ROWS_PER_PAGE < filteredSongData.length) {
        currentDesktopPage++;
        window.renderTable(filteredSongData);
      }
    });
  }
  
  // Add event listeners for upper first and last page buttons
  if (upperDesktopFirstButton && upperDesktopLastButton) {
    upperDesktopFirstButton.addEventListener('click', () => {
      if (currentDesktopPage > 0 && filteredSongData) {
        currentDesktopPage = 0;
        window.renderTable(filteredSongData);
      }
    });
    
    upperDesktopLastButton.addEventListener('click', () => {
      if (filteredSongData) {
        const lastPage = Math.max(0, Math.ceil(filteredSongData.length / DESKTOP_ROWS_PER_PAGE) - 1);
        if (currentDesktopPage !== lastPage) {
          currentDesktopPage = lastPage;
          window.renderTable(filteredSongData);
        }
      }
    });
  }
}

/**
 * Initialize mobile pagination controls
 */
function initMobilePagination() {
  const prevButton = document.getElementById('mobile-prev-page');
  const nextButton = document.getElementById('mobile-next-page');
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      if (currentMobilePage > 0 && filteredSongData) {
        currentMobilePage--;
        window.renderMobileList(filteredSongData);
      }
    });
    
    nextButton.addEventListener('click', () => {
      if (filteredSongData && (currentMobilePage + 1) * MOBILE_ROWS_PER_PAGE < filteredSongData.length) {
        currentMobilePage++;
        window.renderMobileList(filteredSongData);
      }
    });
  }
}

/**
 * Update desktop pagination information and button states
 * @param {Array} songlist - Full array of songlist (filtered or not)
 * @param {number} start - Start index of current page
 * @param {number} end - End index of current page
 */
function updateDesktopPagination(songlist, start, end) {
  const desktopPageInfo = document.getElementById('desktop-page-info');
  const upperDesktopPageInfo = document.getElementById('upper-desktop-page-info');
  
  const desktopFirstButton = document.getElementById('desktop-first-page');
  const desktopPrevButton = document.getElementById('desktop-prev-page');
  const desktopNextButton = document.getElementById('desktop-next-page');
  const desktopLastButton = document.getElementById('desktop-last-page');
  
  const upperDesktopFirstButton = document.getElementById('upper-desktop-first-page');
  const upperDesktopPrevButton = document.getElementById('upper-desktop-prev-page');
  const upperDesktopNextButton = document.getElementById('upper-desktop-next-page');
  const upperDesktopLastButton = document.getElementById('upper-desktop-last-page');
  
  const totalPages = Math.ceil(songlist.length / DESKTOP_ROWS_PER_PAGE);
  const currentPageNumber = currentDesktopPage + 1;
  const isFirstPage = currentDesktopPage === 0;
  const isLastPage = end >= songlist.length;
  
  // Create page info text
  let pageInfoText;
  if (songlist.length <= DESKTOP_ROWS_PER_PAGE) {
    pageInfoText = `Showing all ${songlist.length} song${songlist.length !== 1 ? 's' : ''}`;
  } else {
    pageInfoText = `Page ${currentPageNumber} of ${totalPages} (${start + 1}-${end} of ${songlist.length} songs)`;
  }
  
  // Update lower pagination controls
  if (desktopPageInfo) {
    desktopPageInfo.textContent = pageInfoText;
    
    // Update button states
    if (desktopFirstButton) desktopFirstButton.disabled = isFirstPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopPrevButton) desktopPrevButton.disabled = isFirstPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopNextButton) desktopNextButton.disabled = isLastPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopLastButton) desktopLastButton.disabled = isLastPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
  }
  
  // Update upper pagination controls
  if (upperDesktopPageInfo) {
    upperDesktopPageInfo.textContent = pageInfoText;
    
    // Update button states
    if (upperDesktopFirstButton) upperDesktopFirstButton.disabled = isFirstPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopPrevButton) upperDesktopPrevButton.disabled = isFirstPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopNextButton) upperDesktopNextButton.disabled = isLastPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopLastButton) upperDesktopLastButton.disabled = isLastPage || songlist.length <= DESKTOP_ROWS_PER_PAGE;
  }
}

/**
 * Update mobile pagination buttons
 * @param {Array} songlist - Full array of songlist
 * @param {number} start - Start index
 * @param {number} end - End index
 */
function updateMobilePagination(songlist, start, end) {
  const prevButton = document.getElementById('mobile-prev-page');
  const nextButton = document.getElementById('mobile-next-page');
  
  if (prevButton && nextButton) {
    prevButton.disabled = currentMobilePage === 0;
    nextButton.disabled = (currentMobilePage + 1) * MOBILE_ROWS_PER_PAGE >= songlist.length;
  }
}

/**
 * Reset pagination to first page
 */
function resetPagination() {
  currentDesktopPage = 0;
  currentMobilePage = 0;
}

/**
 * Update filtered data reference
 * @param {Array} data - New filtered data
 */
function updateFilteredData(data) {
  filteredSongData = data;
}

/**
 * Get current desktop page
 * @returns {number} Current desktop page
 */
function getCurrentDesktopPage() {
  return currentDesktopPage;
}

/**
 * Get desktop rows per page
 * @returns {number} Rows per page
 */
function getDesktopRowsPerPage() {
  return DESKTOP_ROWS_PER_PAGE;
}

/**
 * Get current mobile page
 * @returns {number} Current mobile page
 */
function getCurrentMobilePage() {
  return currentMobilePage;
}

/**
 * Get mobile rows per page
 * @returns {number} Rows per page
 */
function getMobileRowsPerPage() {
  return MOBILE_ROWS_PER_PAGE;
}

// Export functions to global scope
window.tablePagination = {
  initPagination,
  updateDesktopPagination,
  updateMobilePagination,
  resetPagination,
  updateFilteredData,
  getCurrentDesktopPage,
  getDesktopRowsPerPage,
  getCurrentMobilePage,
  getMobileRowsPerPage,
  initRowsPerPageControl,
  changeRowsPerPage
}; 