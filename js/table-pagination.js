/**
 * Table pagination functionality for Tepper & Bennett
 * Manages pagination controls for song tables
 */

// Pagination configuration
const DESKTOP_ROWS_PER_PAGE = 25;
const MOBILE_ROWS_PER_PAGE = 10;

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
 * @param {Array} songs - Full array of songs (filtered or not)
 * @param {number} start - Start index of current page
 * @param {number} end - End index of current page
 */
function updateDesktopPagination(songs, start, end) {
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
  
  const totalPages = Math.ceil(songs.length / DESKTOP_ROWS_PER_PAGE);
  const currentPageNumber = currentDesktopPage + 1;
  const isFirstPage = currentDesktopPage === 0;
  const isLastPage = end >= songs.length;
  
  // Create page info text
  let pageInfoText;
  if (songs.length <= DESKTOP_ROWS_PER_PAGE) {
    pageInfoText = `Showing all ${songs.length} song${songs.length !== 1 ? 's' : ''}`;
  } else {
    pageInfoText = `Page ${currentPageNumber} of ${totalPages} (${start + 1}-${end} of ${songs.length} songs)`;
  }
  
  // Update lower pagination controls
  if (desktopPageInfo) {
    desktopPageInfo.textContent = pageInfoText;
    
    // Update button states
    if (desktopFirstButton) desktopFirstButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopPrevButton) desktopPrevButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopNextButton) desktopNextButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (desktopLastButton) desktopLastButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
  }
  
  // Update upper pagination controls
  if (upperDesktopPageInfo) {
    upperDesktopPageInfo.textContent = pageInfoText;
    
    // Update button states
    if (upperDesktopFirstButton) upperDesktopFirstButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopPrevButton) upperDesktopPrevButton.disabled = isFirstPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopNextButton) upperDesktopNextButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
    if (upperDesktopLastButton) upperDesktopLastButton.disabled = isLastPage || songs.length <= DESKTOP_ROWS_PER_PAGE;
  }
}

/**
 * Update mobile pagination buttons
 * @param {Array} songs - Full array of songs
 * @param {number} start - Start index
 * @param {number} end - End index
 */
function updateMobilePagination(songs, start, end) {
  const prevButton = document.getElementById('mobile-prev-page');
  const nextButton = document.getElementById('mobile-next-page');
  
  if (prevButton && nextButton) {
    prevButton.disabled = currentMobilePage === 0;
    nextButton.disabled = (currentMobilePage + 1) * MOBILE_ROWS_PER_PAGE >= songs.length;
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
  getMobileRowsPerPage
}; 