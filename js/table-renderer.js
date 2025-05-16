/**
 * Table renderer functionality for Tepper & Bennett
 * Manages rendering of song tables and mobile lists
 */

// DOM element references
const songlistTable = document.getElementById('songlist-table');
const mobileList = document.getElementById('mobile-songlist-list');

// Current sort state
let currentSortField = 'title';
let currentSortDirection = 'asc';

/**
 * Sort songlist by the specified field and direction
 * @param {Array} songlist - Array of songlist objects
 * @param {string} field - Field to sort by (title, performers, administrator)
 * @param {string} direction - Sort direction (asc, desc)
 * @returns {Array} Sorted array of songlist
 */
function sortSonglist(songlist, field = currentSortField, direction = currentSortDirection) {
  console.log(`Sorting songlist by ${field} in ${direction} order`);
  
  // Update current sort state
  currentSortField = field;
  currentSortDirection = direction;
  
  // Create a copy of the array to avoid modifying the original
  const sortedSonglist = [...songlist];
  
  // Sort the array
  sortedSonglist.sort((a, b) => {
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
  
  return sortedSonglist;
}

// Pagination state variables
let currentPage = 0;
let itemsPerPage = 15;

/**
 * Render the table with the provided data
 * @param {Array} songlist - Array of songlist objects
 */
function renderTable(songlist) {
  if (!songlist || !Array.isArray(songlist) || !songlistTable) {
    console.error('Invalid songlist data or table element not found');
    return;
  }
  
  // Get or create tbody
  const tbody = songlistTable.querySelector('tbody');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Render all rows first (we'll handle pagination display separately)
  songlist.forEach(song => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="title">${song.title || 'Unknown Title'}</td>
      <td class="performers">${song.performers || 'Unknown Performer'}</td>
      <td class="administrator">${song.administrator || 'Unknown'}</td>
      <td class="youtubeUrl text-center">
        <a href="${song.youtubeUrl || '#'}" target="_blank" class="text-red-600 hover:text-red-800">▶</a>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Get the container for pagination
  const container = document.getElementById('songlist-listjs-container');
  
  // Check if we need to reset pagination when data changes
  const totalItems = songlist.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage >= totalPages && totalPages > 0) {
    currentPage = totalPages - 1;
  }
  
  // Create or update pagination
  let paginationDiv = container.querySelector('.pagination');
  if (!paginationDiv) {
    paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    container.appendChild(paginationDiv);
  } else {
    paginationDiv.innerHTML = '';
  }
  
  // Add styles to pagination container
  paginationDiv.classList.add('flex', 'justify-center', 'items-center', 'my-4', 'flex-wrap', 'gap-2');
  
  // Create pagination info element
  const paginationInfo = document.createElement('div');
  paginationInfo.className = 'pagination-info text-sm text-gray-600 mx-4';
  paginationDiv.appendChild(paginationInfo);
  
  // Create pagination buttons
  const paginationButtons = document.createElement('div');
  paginationButtons.className = 'pagination-buttons flex flex-wrap gap-1';
  paginationDiv.appendChild(paginationButtons);
  
  // First page button
  const firstButton = document.createElement('button');
  firstButton.innerHTML = '&laquo;';
  firstButton.className = 'pagination-button bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded';
  firstButton.addEventListener('click', () => {
    if (currentPage !== 0) {
      currentPage = 0;
      updateTableDisplay(songlist);
    }
  });
  paginationButtons.appendChild(firstButton);
  
  // Previous page button
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&lsaquo;';
  prevButton.className = 'pagination-button bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded';
  prevButton.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updateTableDisplay(songlist);
    }
  });
  paginationButtons.appendChild(prevButton);
  
  // Create function to generate page number buttons
  function createPageNumberButtons() {
    // Remove existing page number buttons
    const pageButtons = paginationButtons.querySelectorAll('.page-number');
    pageButtons.forEach(btn => btn.remove());
    
    // Calculate visible page range (show up to 5 pages)
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    
    // Adjust range if near the end
    if (endPage - startPage < 4 && startPage > 0) {
      startPage = Math.max(0, endPage - 4);
    }
    
    // Create page buttons
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i + 1;
      pageButton.className = `pagination-button page-number ${i === currentPage ? 'bg-navy text-white' : 'bg-gray-200 hover:bg-gray-300'} px-3 py-1 rounded`;
      pageButton.addEventListener('click', () => {
        currentPage = i;
        updateTableDisplay(songlist);
      });
      
      // Insert before next button
      paginationButtons.insertBefore(pageButton, nextButton);
    }
  }
  
  // Next page button
  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&rsaquo;';
  nextButton.className = 'pagination-button bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateTableDisplay(songlist);
    }
  });
  paginationButtons.appendChild(nextButton);
  
  // Last page button
  const lastButton = document.createElement('button');
  lastButton.innerHTML = '&raquo;';
  lastButton.className = 'pagination-button bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded';
  lastButton.addEventListener('click', () => {
    currentPage = totalPages - 1;
    updateTableDisplay(songlist);
  });
  paginationButtons.appendChild(lastButton);
  
  // Create page size selector
  const pageSizeSelector = document.createElement('div');
  pageSizeSelector.className = 'page-size-selector ml-4';
  pageSizeSelector.innerHTML = `
    <label for="page-size" class="text-sm text-gray-600 mr-2">Rows per page:</label>
    <select id="page-size" class="border rounded px-2 py-1 text-sm">
      <option value="10">10</option>
      <option value="15" selected>15</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  `;
  paginationDiv.appendChild(pageSizeSelector);
  
  // Ensure the correct option is selected based on current itemsPerPage
  const pageSizeSelect = pageSizeSelector.querySelector('select');
  if (pageSizeSelect) {
    const options = pageSizeSelect.querySelectorAll('option');
    options.forEach(option => {
      if (parseInt(option.value) === itemsPerPage) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
    
    pageSizeSelect.addEventListener('change', function() {
      itemsPerPage = parseInt(this.value, 10);
      currentPage = 0; // Reset to first page
      updateTableDisplay(songlist);
    });
  }
  
  // Function to update table display based on current page
  function updateTableDisplay(data) {
    if (!data || !Array.isArray(data)) return;
    
    const totalRows = data.length;
    const totalPages = Math.ceil(totalRows / itemsPerPage);
    
    // Ensure current page is valid
    if (currentPage >= totalPages) {
      currentPage = Math.max(0, totalPages - 1);
    }
    
    // Calculate visible rows for current page
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalRows);
    
    // Show/hide rows based on current page
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
    
    // Update pagination info
    const start = totalRows === 0 ? 0 : startIndex + 1;
    const end = Math.min(totalRows, endIndex);
    paginationInfo.textContent = `Showing ${start}-${end} of ${totalRows} songs`;
    
    // Update button states
    firstButton.disabled = currentPage === 0;
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= totalPages - 1;
    lastButton.disabled = currentPage >= totalPages - 1;
    
    // Visual indication of disabled state
    [firstButton, prevButton, nextButton, lastButton].forEach(btn => {
      if (btn.disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.classList.remove('hover:bg-gray-300');
      } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.classList.add('hover:bg-gray-300');
      }
    });
    
    // Update page number buttons
    createPageNumberButtons();
  }
  
  // Initialize display
  createPageNumberButtons();
  updateTableDisplay(songlist);
}

/**
 * Function to render the mobile list
 * @param {Array} songlist - Array of songlist objects
 */
function renderMobileList(songlist) {
  if (!mobileList) return;
  
  // Sort the songlist by title (default)
  const sortedSonglist = sortSonglist(songlist);
  
  mobileList.innerHTML = '';
  
  // Get pagination info from the pagination module
  const currentPage = window.tablePagination?.getCurrentMobilePage?.() || 0;
  const rowsPerPage = window.tablePagination?.getMobileRowsPerPage?.() || 10;
  
  // Calculate pagination
  const start = currentPage * rowsPerPage;
  const end = Math.min(start + rowsPerPage, sortedSonglist.length);
  const pageData = sortedSonglist.slice(start, end);
  
  // Add pagination info
  if (sortedSonglist.length > rowsPerPage) {
    const paginationInfo = document.createElement('li');
    paginationInfo.className = 'song-list-pagination-info text-center text-sm text-gray-600 mb-2';
    paginationInfo.textContent = `Showing ${start + 1}-${end} of ${sortedSonglist.length} songs`;
    mobileList.appendChild(paginationInfo);
  }
  
  // Update pagination buttons if function exists
  if (typeof window.tablePagination?.updateMobilePagination === 'function') {
    window.tablePagination.updateMobilePagination(sortedSonglist, start, end);
  }
  
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
      <div class="mobile-song-title"><a href="#songlist">${title}</a></div>
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
  const tbody = songlistTable?.querySelector('tbody');
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
window.sortSonglist = sortSonglist;

// Function to update sort indicators
function updateSortIndicators() {
  const thead = songlistTable.querySelector('thead');
  if (!thead) return;
  const ths = thead.querySelectorAll('th');
  ths.forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    const field = th.getAttribute('data-field');
    if (field === currentSortField) {
      th.classList.add(currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

// Function to initialize sortable headers
function initSortableHeaders() {
  const thead = songlistTable.querySelector('thead');
  if (!thead) return;
  const ths = thead.querySelectorAll('th[data-field]');
  ths.forEach(th => {
    th.style.cursor = 'pointer';
    // Remove any previous click event to avoid stacking
    const newTh = th.cloneNode(true);
    th.parentNode.replaceChild(newTh, th);
  });
  // Re-select after clone
  const newThs = thead.querySelectorAll('th[data-field]');
  newThs.forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', function () {
      const field = th.getAttribute('data-field');
      console.log('Header clicked:', field); // DEBUG LOG
      if (!field) return;
      let direction = 'asc';
      if (currentSortField === field) {
        direction = currentSortDirection === 'asc' ? 'desc' : 'asc';
      }
      if (window.filteredSongData) {
        currentSortField = field;
        currentSortDirection = direction;
        renderTable(sortSonglist(window.filteredSongData, field, direction));
      } else if (window.loadedSongData) {
        currentSortField = field;
        currentSortDirection = direction;
        renderTable(sortSonglist(window.loadedSongData, field, direction));
      }
      updateSortIndicators();
    });
  });
} 