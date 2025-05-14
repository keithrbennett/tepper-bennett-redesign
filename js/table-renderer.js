/**
 * Table renderer functionality for Tepper & Bennett
 * Manages rendering of song tables and mobile lists
 */

// DOM element references
const songsTable = document.getElementById('songs-table');
const mobileList = document.getElementById('mobile-songs-list');

/**
 * Render the table with the provided data
 * @param {Array} songs - Array of song objects
 */
function renderTable(songs) {
  console.log("Song count: " + songs.length);
  
  // Get or create the tbody element
  let tbody = songsTable.querySelector('tbody');
  if (!tbody) {
    tbody = document.createElement('tbody');
    songsTable.appendChild(tbody);
  } else {
    tbody.innerHTML = '';
  }
  
  // Get pagination info from the pagination module
  const currentPage = window.tablePagination.getCurrentDesktopPage();
  const rowsPerPage = window.tablePagination.getDesktopRowsPerPage();
  
  // Calculate pagination
  const start = currentPage * rowsPerPage;
  const end = Math.min(start + rowsPerPage, songs.length);
  const pageData = songs.slice(start, end);
  
  // Update pagination info and buttons
  window.tablePagination.updateDesktopPagination(songs, start, end);
  
  // Add each song to the table
  pageData.forEach(song => {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="py-3 px-4"><a href="#songs" class="site-link">${song.title || 'Unknown Title'}</a></td>
      <td class="py-3 px-4">${song.performers || 'Unknown Performer'}</td>
      <td class="py-3 px-4">${song.administrator || 'Unknown'}</td>
      <td class="py-3 px-4 text-center">
        <a href="${song.youtubeUrl || '#'}" target="_blank" class="text-red-600 hover:text-red-800">▶</a>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Scroll to the top of the search section
  scrollToSearchSection();
  
  console.log('Table rendered successfully');
}

/**
 * Function to render the mobile list
 * @param {Array} songs - Array of song objects
 */
function renderMobileList(songs) {
  if (!mobileList) return;
  
  mobileList.innerHTML = '';
  
  // Get pagination info from the pagination module
  const currentPage = window.tablePagination.getCurrentMobilePage();
  const rowsPerPage = window.tablePagination.getMobileRowsPerPage();
  
  // Calculate pagination
  const start = currentPage * rowsPerPage;
  const end = Math.min(start + rowsPerPage, songs.length);
  const pageData = songs.slice(start, end);
  
  // Add pagination info
  if (songs.length > rowsPerPage) {
    const paginationInfo = document.createElement('li');
    paginationInfo.className = 'song-list-pagination-info text-center text-sm text-gray-600 mb-2';
    paginationInfo.textContent = `Showing ${start + 1}-${end} of ${songs.length} songs`;
    mobileList.appendChild(paginationInfo);
  }
  
  // Update pagination buttons
  window.tablePagination.updateMobilePagination(songs, start, end);
  
  // Render each song in the mobile list
  pageData.forEach(song => {
    const listItem = document.createElement('li');
    listItem.className = 'song-list-entry';
    
    // Truncate long texts for mobile
    const truncateText = (text, maxLength = 20) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };
    
    const title = song.title;
    const performers = truncateText(song.performers, 25);
    const admin = song.administrator ? truncateText(song.administrator, 20) : '';
    
    listItem.innerHTML = `
      <div class="mobile-song-title"><a href="#songs">${title}</a></div>
      <div class="mobile-song-performers">${performers}</div>
      <div class="mobile-song-details">
        <div class="mobile-song-admin">${admin}</div>
        <a href="${song.youtubeUrl}" target="_blank" class="listen-button">▶</a>
      </div>
    `;
    
    mobileList.appendChild(listItem);
  });
  
  // Scroll to the top of the mobile list
  scrollToMobileList();
}

/**
 * Display an error message in the table
 * @param {string} message - Error message
 */
function showError(message) {
  // Show error in desktop table
  const tbody = songsTable?.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-4 text-center text-red-600">
          <div>
            <p class="font-bold">Error loading data</p>
            <p class="text-sm">${message}</p>
            <p class="text-sm mt-2">Please make sure you're accessing this site through a web server (http://localhost:8000) and not directly from a file.</p>
          </div>
        </td>
      </tr>
    `;
  }
  
  // Show error in mobile view
  if (mobileList) {
    mobileList.innerHTML = `
      <li class="song-list-entry text-center py-4 text-red-600">
        <div>
          <p class="font-bold">Error loading data</p>
          <p class="text-sm">${message}</p>
        </div>
      </li>
    `;
  }
}

/**
 * Scrolls the window to the search section
 */
function scrollToSearchSection() {
  const searchSection = document.querySelector('.search-container');
  if (searchSection) {
    // Scroll to show the search bar and upper pagination controls
    setTimeout(() => {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

/**
 * Scrolls the window to the top of the mobile list
 */
function scrollToMobileList() {
  if (mobileList) {
    // Use a slight delay to ensure the DOM has updated
    setTimeout(() => {
      mobileList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
}

// Export functions to global scope
window.renderTable = renderTable;
window.renderMobileList = renderMobileList;
window.showTableError = showError; 