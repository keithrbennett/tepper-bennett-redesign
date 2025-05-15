/**
 * Table renderer functionality for Tepper & Bennett
 * Manages rendering of song tables and mobile lists
 */

// DOM element references
const songsTable = document.getElementById('songs-table');
const mobileList = document.getElementById('mobile-songs-list');

// Current sort state
let currentSortField = 'title';
let currentSortDirection = 'asc';

/**
 * Sort songs by the specified field and direction
 * @param {Array} songs - Array of song objects
 * @param {string} field - Field to sort by (title, performers, administrator)
 * @param {string} direction - Sort direction (asc, desc)
 * @returns {Array} Sorted array of songs
 */
function sortSongs(songs, field = currentSortField, direction = currentSortDirection) {
  console.log(`Sorting songs by ${field} in ${direction} order`);
  
  // Update current sort state
  currentSortField = field;
  currentSortDirection = direction;
  
  // Create a copy of the array to avoid modifying the original
  const sortedSongs = [...songs];
  
  // Sort the array
  sortedSongs.sort((a, b) => {
    let valueA = String(a[field] || '').toLowerCase();
    let valueB = String(b[field] || '').toLowerCase();
    
    // For title field, remove leading "A ", "An ", "The " for sorting
    if (field === 'title') {
      valueA = valueA.replace(/^(the|a|an)\s+/i, '');
      valueB = valueB.replace(/^(the|a|an)\s+/i, '');
    }
    
    // Compare the values
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  return sortedSongs;
}

/**
 * Render the table with the provided data
 * @param {Array} songs - Array of song objects
 */
function renderTable(songs) {
  console.log("Song count: " + songs.length);
  
  // Sort the songs by title (default)
  const sortedSongs = sortSongs(songs);
  
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
  const end = Math.min(start + rowsPerPage, sortedSongs.length);
  const pageData = sortedSongs.slice(start, end);
  
  // Update pagination info and buttons
  window.tablePagination.updateDesktopPagination(sortedSongs, start, end);
  
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
  
  console.log('Table rendered successfully');
}

/**
 * Function to render the mobile list
 * @param {Array} songs - Array of song objects
 */
function renderMobileList(songs) {
  if (!mobileList) return;
  
  // Sort the songs by title (default)
  const sortedSongs = sortSongs(songs);
  
  mobileList.innerHTML = '';
  
  // Get pagination info from the pagination module
  const currentPage = window.tablePagination.getCurrentMobilePage();
  const rowsPerPage = window.tablePagination.getMobileRowsPerPage();
  
  // Calculate pagination
  const start = currentPage * rowsPerPage;
  const end = Math.min(start + rowsPerPage, sortedSongs.length);
  const pageData = sortedSongs.slice(start, end);
  
  // Add pagination info
  if (sortedSongs.length > rowsPerPage) {
    const paginationInfo = document.createElement('li');
    paginationInfo.className = 'song-list-pagination-info text-center text-sm text-gray-600 mb-2';
    paginationInfo.textContent = `Showing ${start + 1}-${end} of ${sortedSongs.length} songs`;
    mobileList.appendChild(paginationInfo);
  }
  
  // Update pagination buttons
  window.tablePagination.updateMobilePagination(sortedSongs, start, end);
  
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

// Export functions to global scope
window.renderTable = renderTable;
window.renderMobileList = renderMobileList;
window.showTableError = showError;
window.sortSongs = sortSongs; 