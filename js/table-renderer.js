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
    // Get the values to compare, defaulting to empty string if undefined
    let valueA = String(a[field] || '').toLowerCase();
    let valueB = String(b[field] || '').toLowerCase();
    
    // For title field, remove leading articles for better sorting
    if (field === 'title') {
      valueA = valueA.replace(/^(the|a|an)\s+/i, '');
      valueB = valueB.replace(/^(the|a|an)\s+/i, '');
    }
    
    // Simple alphabetical comparison
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
    currentPage = Math.max(0, totalPages - 1);
  }
  
  // Create or update pagination container
  let paginationDiv = container.querySelector('.pagination');
  if (!paginationDiv) {
    paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    container.appendChild(paginationDiv);
  } else {
    paginationDiv.innerHTML = '';
  }
  
  // Add styles to pagination container
  paginationDiv.classList.add('flex', 'flex-col', 'gap-4', 'my-4');
  
  // Create structured pagination elements - only lower pagination
  const lowerPagination = document.createElement('div');
  lowerPagination.id = 'lower-pagination';
  lowerPagination.className = 'desktop-pagination';
  
  // Lower pagination info
  const lowerPageInfo = document.createElement('div');
  lowerPageInfo.id = 'desktop-page-info';
  lowerPageInfo.className = 'page-info';
  lowerPagination.appendChild(lowerPageInfo);
  
  // Lower pagination controls
  const lowerPageControls = document.createElement('div');
  lowerPageControls.className = 'page-controls';
  
  // Create lower pagination buttons
  const lowerFirstButton = document.createElement('button');
  lowerFirstButton.id = 'desktop-first-page';
  lowerFirstButton.className = 'btn btn-sm btn-navy pagination-button';
  lowerFirstButton.innerHTML = '&laquo;';
  lowerPageControls.appendChild(lowerFirstButton);
  
  const lowerPrevButton = document.createElement('button');
  lowerPrevButton.id = 'desktop-prev-page';
  lowerPrevButton.className = 'btn btn-sm btn-navy pagination-button';
  lowerPrevButton.innerHTML = '&lsaquo;';
  lowerPageControls.appendChild(lowerPrevButton);
  
  const lowerNextButton = document.createElement('button');
  lowerNextButton.id = 'desktop-next-page';
  lowerNextButton.className = 'btn btn-sm btn-navy pagination-button';
  lowerNextButton.innerHTML = '&rsaquo;';
  lowerPageControls.appendChild(lowerNextButton);
  
  const lowerLastButton = document.createElement('button');
  lowerLastButton.id = 'desktop-last-page';
  lowerLastButton.className = 'btn btn-sm btn-navy pagination-button';
  lowerLastButton.innerHTML = '&raquo;';
  lowerPageControls.appendChild(lowerLastButton);
  
  lowerPagination.appendChild(lowerPageControls);
  paginationDiv.appendChild(lowerPagination);
  
  // Create "rows per page" controls from the template
  const template = document.getElementById('rows-per-page-template');
  if (template) {
    // Get options from config
    const options = window.tbConfig?.pagination?.desktop?.rowsPerPageOptions || [10, 15, 20, 25, 40, 100];
    const defaultValue = window.tbConfig?.pagination?.desktop?.defaultRowsPerPage || 15;
    
    // Create option elements
    const createOptions = (select) => {
      options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        if (value === defaultValue) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    };
    
    // Lower pagination control
    const lowerControl = template.content.cloneNode(true);
    const lowerSelect = lowerControl.querySelector('select');
    lowerSelect.id = 'rows-per-page';
    lowerSelect.className = 'rows-per-page-select form-select ml-2 p-1 border border-gray-300 rounded';
    createOptions(lowerSelect);
    lowerPageInfo.appendChild(lowerControl);
  }
  
  // Set up pagination button event listeners
  // Lower pagination
  lowerFirstButton.addEventListener('click', () => {
    if (currentPage !== 0) {
      currentPage = 0;
      updateTableDisplay(songlist);
    }
  });
  
  lowerPrevButton.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updateTableDisplay(songlist);
    }
  });
  
  lowerNextButton.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateTableDisplay(songlist);
    }
  });
  
  lowerLastButton.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage = totalPages - 1;
      updateTableDisplay(songlist);
    }
  });
  
  // Initialize "rows per page" controls
  const rowsPerPageSelects = document.querySelectorAll('.rows-per-page-select');
  rowsPerPageSelects.forEach(select => {
    select.addEventListener('change', function() {
      itemsPerPage = parseInt(this.value, 10);
      currentPage = 0; // Reset to first page
      
      // Update all selectors to the same value
      rowsPerPageSelects.forEach(otherSelect => {
        if (otherSelect !== this) {
          otherSelect.value = this.value;
        }
      });
      
      updateTableDisplay(songlist);
    });
  });
  
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
    
    // Create page info text
    let pageInfoText;
    if (totalRows <= itemsPerPage) {
      pageInfoText = `Showing all ${totalRows} song${totalRows !== 1 ? 's' : ''}`;
    } else {
      pageInfoText = `Page ${currentPage + 1} of ${totalPages} (${start}-${end} of ${totalRows} songs)`;
    }
    
    // Update lower pagination info
    lowerPageInfo.textContent = pageInfoText;
    
    // Re-append the rows-per-page control after updating text
    const rowsPerPage = document.getElementById('rows-per-page');
    if (rowsPerPage && rowsPerPage.parentElement) {
      lowerPageInfo.appendChild(rowsPerPage.parentElement);
    }
    
    // Update button states
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1;
    
    // Lower pagination buttons
    lowerFirstButton.disabled = isFirstPage || totalRows <= itemsPerPage;
    lowerPrevButton.disabled = isFirstPage || totalRows <= itemsPerPage;
    lowerNextButton.disabled = isLastPage || totalRows <= itemsPerPage;
    lowerLastButton.disabled = isLastPage || totalRows <= itemsPerPage;
    
    // Visual indication of disabled state
    [lowerFirstButton, lowerPrevButton, lowerNextButton, lowerLastButton].forEach(btn => {
      if (btn.disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        btn.classList.remove('hover:bg-navy-light');
      } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.classList.add('hover:bg-navy-light');
      }
    });
  }
  
  // Initialize display
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